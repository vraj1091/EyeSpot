import { createServer } from 'node:http';
import { appendFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';

const PORT = Number(process.env.PORT || 8000);
const DATA_DIR = process.env.DATA_DIR || '/data';
const CONTENT_FILE = `${DATA_DIR}/portfolio-content.json`;
const LEADS_FILE = `${DATA_DIR}/portfolio-leads.jsonl`;

const DEFAULT_CONTENT_RECORD = {
  content: {},
  version: 1,
  updated_at: new Date().toISOString(),
};

const BASE_HEADERS = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,PUT,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const sendJson = (res, status, payload) => {
  res.writeHead(status, BASE_HEADERS);
  res.end(JSON.stringify(payload));
};

const ensureDataFiles = async () => {
  await mkdir(DATA_DIR, { recursive: true });
  if (!existsSync(CONTENT_FILE)) {
    await writeFile(CONTENT_FILE, JSON.stringify(DEFAULT_CONTENT_RECORD, null, 2), 'utf8');
  }
};

const readContentRecord = async () => {
  await ensureDataFiles();
  const raw = await readFile(CONTENT_FILE, 'utf8');
  const parsed = JSON.parse(raw);
  return {
    content: parsed?.content ?? {},
    version: Number(parsed?.version) > 0 ? Number(parsed.version) : 1,
    updated_at: typeof parsed?.updated_at === 'string' ? parsed.updated_at : new Date().toISOString(),
  };
};

const writeContentRecord = async (record) => {
  await ensureDataFiles();
  await writeFile(CONTENT_FILE, JSON.stringify(record, null, 2), 'utf8');
};

const readBody = async (req, maxBytes = 2 * 1024 * 1024) =>
  new Promise((resolve, reject) => {
    let total = 0;
    let body = '';

    req.setEncoding('utf8');
    req.on('data', (chunk) => {
      total += chunk.length;
      if (total > maxBytes) {
        reject(new Error('Payload too large'));
        req.destroy();
        return;
      }
      body += chunk;
    });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
    const path = url.pathname;
    const method = (req.method || 'GET').toUpperCase();

    if (method === 'OPTIONS') {
      res.writeHead(204, BASE_HEADERS);
      res.end();
      return;
    }

    if (method === 'GET' && path === '/health') {
      sendJson(res, 200, { ok: true });
      return;
    }

    if (method === 'GET' && path === '/api/portfolio/content') {
      const record = await readContentRecord();
      sendJson(res, 200, record);
      return;
    }

    if (method === 'PUT' && path === '/api/portfolio/content') {
      const raw = await readBody(req);
      const parsed = raw ? JSON.parse(raw) : {};
      const incoming = parsed?.content;
      if (!incoming || typeof incoming !== 'object' || Array.isArray(incoming)) {
        sendJson(res, 400, { detail: "Request body must be JSON with an object field 'content'." });
        return;
      }

      const current = await readContentRecord();
      const next = {
        content: incoming,
        version: (Number(current.version) || 0) + 1,
        updated_at: new Date().toISOString(),
      };

      await writeContentRecord(next);
      sendJson(res, 200, next);
      return;
    }

    if (method === 'POST' && path === '/api/portfolio/leads') {
      const raw = await readBody(req);
      const parsed = raw ? JSON.parse(raw) : {};
      const submittedAt = new Date().toISOString();
      const leadId = Date.now();

      await ensureDataFiles();
      await appendFile(
        LEADS_FILE,
        `${JSON.stringify({
          lead_id: leadId,
          submitted_at: submittedAt,
          payload: parsed,
        })}\n`,
        'utf8'
      );

      sendJson(res, 201, {
        success: true,
        lead_id: leadId,
        submitted_at: submittedAt,
        email_sent: false,
        detail: 'Saved successfully.',
      });
      return;
    }

    sendJson(res, 404, { detail: 'Not Found' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected server error';
    sendJson(res, 500, { detail: message });
  }
});

server.listen(PORT, '0.0.0.0', () => {
  // eslint-disable-next-line no-console
  console.log(`portfolio-api listening on ${PORT}`);
});
