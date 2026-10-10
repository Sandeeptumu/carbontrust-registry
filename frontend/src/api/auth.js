import { api } from './client'
export const registerUser = (payload) => api.post('/users/register', payload, { auth: false })
export const loginUser = (payload) => api.post('/users/login', payload, { auth: false })
export const fetchCurrentUser = () => api.get('/users/me', { auth: false })
export const logoutUser = () => api.post('/users/logout', {})
export const forgotPassword = (email) => api.post('/users/forgot-password', { email }, { auth: false })
export const resendVerification = (email) => api.post('/users/resend-verification', { email }, { auth: false })
export const resetPassword = (payload) => api.post('/users/reset-password', payload, { auth: false })
export const verifyEmail = (token) => api.post('/users/verify-email', { token }, { auth: false })
