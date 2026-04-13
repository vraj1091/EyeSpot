import type { SiteContentPayload } from '../store/useStore';

export interface PortfolioContentApiResponse {
  content: Partial<SiteContentPayload>;
  version: number;
  updated_at?: string | null;
}

export interface LeadRequestPayload {
  request_type: 'demo' | 'quote' | 'contact';
  full_name: string;
  work_email: string;
  phone?: string;
  company?: string;
  job_title?: string;
  company_size?: string;
  cameras_count?: string;
  selected_plan?: string;
  deployment_timeline?: string;
  source_page?: string;
  message?: string;
}

export interface LeadRequestResponse {
  success: boolean;
  lead_id: number;
  submitted_at: string;
  email_sent: boolean;
  detail: string;
}

const DEFAULT_API_ROOT = '/api';
const DEFAULT_REMOTE_SYNC_ENABLED = false;

const stripTrailingSlash = (value: string) => value.replace(/\/+$/, '');

const isFalseLike = (value: string) => ['0', 'false', 'no', 'off'].includes(value.trim().toLowerCase());

export const isPortfolioRemoteSyncEnabled = () => {
  const flag = import.meta.env.VITE_ENABLE_PORTFOLIO_REMOTE_SYNC;
  if (typeof flag !== 'string') return DEFAULT_REMOTE_SYNC_ENABLED;
  return !isFalseLike(flag);
};

const readApiRoot = () => {
  const envRoot = import.meta.env.VITE_PORTFOLIO_API_BASE || import.meta.env.VITE_API_URL;
  return stripTrailingSlash(envRoot || DEFAULT_API_ROOT);
};

const apiUrl = (path: string) => `${readApiRoot()}${path}`;

const defaultHeaders: HeadersInit = {
  'Content-Type': 'application/json',
  'Cache-Control': 'no-store',
  Pragma: 'no-cache',
};

export class RemoteSyncUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RemoteSyncUnavailableError';
  }
}

const parseJsonResponse = async <T>(response: Response, context: string): Promise<T> => {
  const contentType = response.headers.get('content-type')?.toLowerCase() ?? '';
  const text = await response.text();
  if (!response.ok) {
    throw new Error(text || `${context} failed with status ${response.status}`);
  }
  if (!contentType.includes('application/json')) {
    throw new RemoteSyncUnavailableError(`${context} endpoint is unavailable for this deployment.`);
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new RemoteSyncUnavailableError(`${context} endpoint returned an invalid response.`);
  }
};

export const fetchPortfolioContent = async (): Promise<PortfolioContentApiResponse> => {
  if (!isPortfolioRemoteSyncEnabled()) {
    throw new RemoteSyncUnavailableError('Remote sync is disabled.');
  }
  const response = await fetch(`${apiUrl('/portfolio/content')}?t=${Date.now()}`, {
    method: 'GET',
    headers: defaultHeaders,
    cache: 'no-store',
  });
  return parseJsonResponse<PortfolioContentApiResponse>(response, 'Content sync');
};

export const savePortfolioContent = async (
  content: SiteContentPayload
): Promise<PortfolioContentApiResponse> => {
  if (!isPortfolioRemoteSyncEnabled()) {
    throw new RemoteSyncUnavailableError('Remote sync is disabled.');
  }
  const response = await fetch(apiUrl('/portfolio/content'), {
    method: 'PUT',
    headers: defaultHeaders,
    cache: 'no-store',
    body: JSON.stringify({ content }),
  });
  return parseJsonResponse<PortfolioContentApiResponse>(response, 'Content save');
};

export const submitLeadRequest = async (
  payload: LeadRequestPayload
): Promise<LeadRequestResponse> => {
  const response = await fetch(apiUrl('/portfolio/leads'), {
    method: 'POST',
    headers: defaultHeaders,
    cache: 'no-store',
    body: JSON.stringify(payload),
  });
  return parseJsonResponse<LeadRequestResponse>(response, 'Lead submit');
};

export const clearLegacyPortfolioCaches = () => {
  try {
    localStorage.removeItem('eyespot-storage-v8');
    localStorage.removeItem('eyespot-storage-v7');
  } catch {
    // Ignore browser storage errors.
  }
};
