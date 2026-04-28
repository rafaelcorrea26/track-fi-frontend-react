const BASE_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:8080').replace(/\/$/, '')

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

interface ApiOptions<B = unknown> {
  method?: string
  body?: B
}

export async function api<T, B = unknown>(
  path: string,
  options: ApiOptions<B> = {},
): Promise<T> {
  const { method = 'GET', body } = options
  const token = localStorage.getItem('token')

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({ error: 'erro desconhecido' }))
    throw new ApiError(res.status, data.error ?? 'erro na requisição')
  }

  return res.json() as Promise<T>
}
