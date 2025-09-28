import Constants from 'expo-constants';

export class ApiError<T = unknown> extends Error {
  status: number;
  data: T | undefined;

  constructor(message: string, status: number, data?: T) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

type Primitive = string | number | boolean;

type SearchParams = Record<string, Primitive | null | undefined>;

type ApiRequestInit = Omit<RequestInit, 'body'> & {
  body?: unknown;
  searchParams?: SearchParams;
};

const envBaseUrl = 
  process.env.EXPO_PUBLIC_API_URL ||
  (Constants.expoConfig?.extra as { apiUrl?: string } | undefined)?.apiUrl || "";

const normalizedBaseUrl = envBaseUrl.endsWith('/') ? envBaseUrl : `${envBaseUrl}/`;

export async function apiFetch<T>(path: string, init: ApiRequestInit = {}): Promise<T> {
  const { searchParams, body, headers, method = 'GET', ...rest } = init;
  const url = new URL(path.replace(/^\//, ''), normalizedBaseUrl);

  if (searchParams) {
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value === null || typeof value === 'undefined') {
        return;
      }
      url.searchParams.set(key, String(value));
    });
  }

  const preparedHeaders: HeadersInit = {
    Accept: 'application/json',
    ...(headers || {}),
  };

  let preparedBody: BodyInit | undefined;

  if (body instanceof FormData || typeof body === 'string' || body instanceof Blob) {
    preparedBody = body as BodyInit;
  } else if (typeof body !== 'undefined') {
    preparedBody = JSON.stringify(body);
    (preparedHeaders as Record<string, string>)['Content-Type'] = 'application/json';
  }

  const response = await fetch(url.toString(), {
    method,
    headers: preparedHeaders,
    body: preparedBody,
    ...rest,
  });

  const text = await response.text();
  const hasText = text.length > 0;
  const data = hasText ? (JSON.parse(text) as T) : undefined;

  if (!response.ok) {
    throw new ApiError(
      data && typeof data === 'object' && 'detail' in (data as Record<string, unknown>)
        ? String((data as Record<string, unknown>).detail)
        : response.statusText || 'Request failed',
      response.status,
      data
    );
  }

  return (data as T) ?? (undefined as T);
}

export const apiClient = {
  get: <T>(path: string, init?: ApiRequestInit) => apiFetch<T>(path, { ...init, method: 'GET' }),
  post: <T>(path: string, init?: ApiRequestInit) => apiFetch<T>(path, { ...init, method: 'POST' }),
  put: <T>(path: string, init?: ApiRequestInit) => apiFetch<T>(path, { ...init, method: 'PUT' }),
  patch: <T>(path: string, init?: ApiRequestInit) =>
    apiFetch<T>(path, { ...init, method: 'PATCH' }),
  delete: <T>(path: string, init?: ApiRequestInit) =>
    apiFetch<T>(path, { ...init, method: 'DELETE' }),
};
