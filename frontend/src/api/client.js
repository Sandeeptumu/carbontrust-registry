
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

function extractMessage(data, fallback) {
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
    responseType,
  } = options

  const finalHeaders = { Accept: 'application/json', ...headers }
  const isForm = body instanceof FormData
  if (body !== undefined && !isForm) finalHeaders['Content-Type'] = 'application/json'
  // Obtain a fresh token so login/logout session rotation never leaves a stale CSRF token.
  if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    const csrf = await request('/users/csrf', { auth: false, signal })
    if (!csrf?.token || !csrf?.headerName) throw new ApiError('Could not secure this request. Please try again.')
    finalHeaders[csrf.headerName] = csrf.token
  }

  let response
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method,
      credentials: 'include',
      headers: finalHeaders,
      body: isForm ? body : body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    })
  } catch (error) {
    if (error?.name === 'AbortError') throw error
    throw new ApiError(
      'Cannot reach the server. Check your connection and make sure the backend is running.',
      { status: 0 },
    )
  }

  if (response.ok && responseType === 'blob') return response.blob()
  const data = await parseBody(response)

  if (!response.ok) {
    const status = response.status

    if (status === 401 && auth) {
      window.dispatchEvent(new CustomEvent('carbontrust:session-expired'))
    } else if (status === 403 && auth && path !== '/users/me') {
      window.dispatchEvent(new CustomEvent('carbontrust:permissions-changed'))
    }

    const message = extractMessage(
      data,
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
