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

const stripTrailingSlash = (value: string) => value.replace(/\/+$/, '');

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

const ensureOk = async (response: Response) => {
  if (response.ok) {
    return;
  }
  const text = await response.text();
  throw new Error(text || `Request failed with status ${response.status}`);
};

export const fetchPortfolioContent = async (): Promise<PortfolioContentApiResponse> => {
  const response = await fetch(`${apiUrl('/portfolio/content')}?t=${Date.now()}`, {
    method: 'GET',
    headers: defaultHeaders,
    cache: 'no-store',
  });
  await ensureOk(response);
  return (await response.json()) as PortfolioContentApiResponse;
};

export const savePortfolioContent = async (
  content: SiteContentPayload
): Promise<PortfolioContentApiResponse> => {
  const response = await fetch(apiUrl('/portfolio/content'), {
    method: 'PUT',
    headers: defaultHeaders,
    cache: 'no-store',
    body: JSON.stringify({ content }),
  });
  await ensureOk(response);
  return (await response.json()) as PortfolioContentApiResponse;
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
  await ensureOk(response);
  return (await response.json()) as LeadRequestResponse;
};

export const clearLegacyPortfolioCaches = () => {
  try {
    localStorage.removeItem('eyespot-storage-v8');
    localStorage.removeItem('eyespot-storage-v7');
  } catch {
    // Ignore browser storage errors.
  }
};
