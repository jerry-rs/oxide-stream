const BEARER_TOKEN = 'oxide_stream_token'

function createAuthHeaders(options?: RequestInit): RequestInit {
  const headers = new Headers(options?.headers)
  if (BEARER_TOKEN) {
    headers.set('Authorization', `Bearer ${BEARER_TOKEN}`)
  }
  return {
    ...options,
    headers,
  }
}

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export function encodePath(path: string): string {
  return path.split('/').map(encodeURIComponent).join('/')
}

export async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, createAuthHeaders(options))
  if (!response.ok) {
    throw new ApiError(response.status, `Request failed: ${response.statusText}`)
  }
  // Handle 204 No Content
  if (response.status === 204) {
    return undefined as T
  }
  // Handle empty body (e.g. DELETE returning 200 with no content)
  const text = await response.text()
  if (!text) {
    return undefined as T
  }
  return JSON.parse(text) as T
}

export async function apiFetchText(url: string): Promise<string> {
  const response = await fetch(url, createAuthHeaders())
  if (!response.ok) {
    throw new ApiError(response.status, `Request failed: ${response.statusText}`)
  }
  return response.text()
}