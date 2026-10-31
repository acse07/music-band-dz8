const API_URL = 'https://inai-col2.fishrungames.com/api';

export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

// Cookie с сессией отправляется вместе с каждым запросом.
export async function request<T>(path: string, method = 'GET', body?: object): Promise<T> {
  let response: Response;

  try {
    response = await fetch(API_URL + path, {
      method,
      credentials: 'include',
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(15000),
    });
  } catch {
    throw new Error('Не удалось связаться с сервером. Проверьте интернет и попробуйте ещё раз.');
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    let message = 'Не удалось выполнить запрос. Попробуйте ещё раз.';

    if (data && typeof data === 'object') {
      const errors: string[] = [];
      const names: Record<string, string> = {
        username: 'Логин', password: 'Пароль', first_name: 'Имя',
        specialization: 'Инструмент', bio: 'О себе', fee: 'Гонорар',
      };

      for (const [field, value] of Object.entries(data)) {
        const text = Array.isArray(value) ? value.join(' ') : String(value);
        errors.push(names[field] ? names[field] + ': ' + text : text);
      }

      if (errors.length > 0) message = errors.join(' ');
    }

    throw new ApiError(message, response.status);
  }

  return data as T;
}
