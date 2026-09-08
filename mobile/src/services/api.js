import { Platform } from 'react-native';
import { BASE_URL, API_TIMEOUT_MS } from '../constants/config';

/**
 * Centralized HTTP client for the existing Spring Boot API.
 * - Attaches `Authorization: Bearer <token>` automatically
 * - Normalizes errors with friendly messages + HTTP status
 * - Never logs tokens or passwords
 */

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

let authToken = null;

export const setAuthToken = (token) => {
  authToken = token || null;
};

export const getAuthToken = () => authToken;

const friendlyError = (status) => {
  switch (status) {
    case 400:
      return 'The request was invalid. Please check your input.';
    case 401:
    case 403:
      return 'Your session has expired. Please sign in again.';
    case 404:
      return 'The requested resource was not found.';
    case 500:
    case 502:
    case 503:
      return 'Something went wrong on our servers. Please try again.';
    default:
      return 'Unable to connect to CarbonTrust Registry.';
  }
};

async function request(path, { method = 'GET', body, headers, timeout = API_TIMEOUT_MS } = {}) {
  const url = `${BASE_URL}${path}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      method,
      headers: {
        Accept: 'application/json',
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        ...(headers || {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    const text = await response.text();
    let data = null;
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }
    }

    if (!response.ok) {
      const backendMessage =
        data && typeof data === 'object'
          ? data.message || data.error || (typeof data === 'string' ? data : null)
          : typeof data === 'string' && data.length < 200
            ? data
            : null;
      throw new ApiError(backendMessage || friendlyError(response.status), response.status, data);
    }

    return data;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    if (err && err.name === 'AbortError') {
      throw new ApiError('The request timed out. Please check your connection and try again.', 0);
    }
    throw new ApiError('Unable to connect to CarbonTrust Registry. Check that the backend is running.', 0);
  } finally {
    clearTimeout(timer);
  }
}

export const api = {
  get: (path, opts) => request(path, { ...opts, method: 'GET' }),
  post: (path, body, opts) => request(path, { ...opts, method: 'POST', body }),
  put: (path, body, opts) => request(path, { ...opts, method: 'PUT', body }),
  delete: (path, opts) => request(path, { ...opts, method: 'DELETE' }),
};

export default api;
