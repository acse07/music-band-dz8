const API_URL = 'https://inai-col3.fishrungames.com/api';

let accessToken: string | null = null;
let refreshRequest: Promise<string | null> | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
    this.name = 'ApiError';
  }
}

function getErrorMessage(data: unknown): string {
  if (!data || typeof data !== 'object') return 'Не удалось выполнить запрос. Попробуйте ещё раз.';
  const names: Record<string, string> = {
    username: 'Логин', password: 'Пароль', first_name: 'Имя',
    specialization: 'Инструмент', bio: 'О себе', fee: 'Гонорар', detail: 'Ошибка',
  };
  const errors = Object.entries(data).map(([field, value]) => {
    const text = Array.isArray(value) ? value.join(' ') : String(value);
    return names[field] ? names[field] + ': ' + text : text;
  });
  return errors.length ? errors.join(' ') : 'Не удалось выполнить запрос. Попробуйте ещё раз.';
}

async function send<T>(path: string, method: string, body: object | undefined, retry: boolean): Promise<T> {
  let response: Response;
  try {
    response = await fetch(API_URL + path, {
      method,
      credentials: 'include',
      headers: {
        ...(body ? { 'Content-Type': 'application/json' } : {}),
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(15000),
    });
  } catch {
    throw new Error('Не удалось связаться с сервером. Проверьте интернет и попробуйте ещё раз.');
  }

  if (response.status === 401 && retry && path !== '/login/' && path !== '/register/' && path !== '/token/refresh/') {
    if (!refreshRequest) {
      refreshRequest = (async () => {
        try {
          const refreshResponse = await fetch(API_URL + '/token/refresh/', {
            method: 'POST',
            credentials: 'include',
            signal: AbortSignal.timeout(15000),
          });
          const refreshed = await refreshResponse.json().catch(() => null) as { access?: string } | null;
          return refreshResponse.ok && refreshed?.access ? refreshed.access : null;
        } catch {
          return null;
        }
      })();
    }
    const refreshedToken = await refreshRequest;
    refreshRequest = null;
    if (refreshedToken) {
      accessToken = refreshedToken;
      return send<T>(path, method, body, false);
    }
    accessToken = null;
  }

  const data: unknown = await response.json().catch(() => null);
  if (!response.ok) throw new ApiError(getErrorMessage(data), response.status);
  return data as T;
}

export function request<T>(path: string, method = 'GET', body?: object): Promise<T> {
  return send<T>(path, method, body, true);
}


