import { api } from './client'

/** POST /users/register — always creates a BUYER account. */
export function registerUser(payload) {
  return api.post('/users/register', payload, { auth: false })
}

/** POST /users/login -> { userId, username, email, role, token } */
export function loginUser(payload) {
  return api.post('/users/login', payload, { auth: false })
}

/** GET /users/me -> { userId, username, email, role } */
export function fetchCurrentUser() {
  return api.get('/users/me')
}
