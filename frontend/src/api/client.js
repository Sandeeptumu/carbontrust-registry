import { getToken } from '../utils/storage'

/**
 * Base URL for the Spring Boot backend.
 * In development the Vite dev server proxies the known API prefixes to
 * http://localhost:8080, so an empty base works. When the frontend is served
 * from another origin, set VITE_API_URL (e.g. http://localhost:8080).
 */
export const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')

export class ApiError extends Error {
  constructor(message, { status = 0, data = null, fieldErrors = null } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
    this.fieldErrors = fieldErrors
  }
}

function extractMessage(data, status, fallback) {
  if (typeof data === 'string' && data) return data
  if (data && typeof data.message === 'string' && data.message) return data.message
  if (data && data.error === 'Validation Failed' && data.errors) {
    const first = Object.values(data.errors)[0]
    if (first) return first
  }
  return fallback
}

async function parseBody(response) {
  const text = await response.text()
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

async function request(path, options = {}) {
  const {
    method = 'GET',
    body,
    headers = {},
    auth = true,
    signal,
  } = options

  const finalHeaders = { Accept: 'application/json', ...headers }
  const token = getToken()
  if (auth && token) {
    finalHeaders.Authorization = `Bearer ${token}`
  }
  if (body !== undefined) {
    finalHeaders['Content-Type'] = 'application/json'
  }

  let response
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method,
      headers: finalHeaders,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    })
  } catch (error) {
    if (error?.name === 'AbortError') throw error
    throw new ApiError(
      'Cannot reach the server. Check your connection and make sure the backend is running.',
      { status: 0 },
    )
  }

  const data = await parseBody(response)

  if (!response.ok) {
    const status = response.status

    // This backend returns 403 both for an invalid/expired token and for a
    // role restriction. Since the UI already gates every route by role, a
    // 401/403 on an authenticated call means the session is no longer valid.
    if ((status === 401 || status === 403) && auth && token) {
      window.dispatchEvent(new CustomEvent('carbontrust:session-expired'))
    }

    const message = extractMessage(
      data,
      status,
      status === 0
        ? 'Network request failed'
        : status === 500
          ? 'Something went wrong on the server. Please try again later.'
          : 'The request could not be completed.',
    )

    throw new ApiError(message, {
      status,
      data,
      fieldErrors: data?.errors || null,
    })
  }

  return data
}

export const api = {
  get: (path, options) => request(path, { ...options, method: 'GET' }),
  post: (path, body, options) =>
    request(path, { ...options, method: 'POST', body }),
  put: (path, body, options) =>
    request(path, { ...options, method: 'PUT', body }),
  delete: (path, options) => request(path, { ...options, method: 'DELETE' }),
}

export default request
