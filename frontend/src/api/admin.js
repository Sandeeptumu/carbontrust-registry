import { api } from './client'

export function adminStats() {
  return api.get('/admin/stats')
}

export function adminUsers() {
  return api.get('/admin/users')
}

export function adminProjects() {
  return api.get('/admin/projects')
}

export function adminCredits() {
  return api.get('/admin/credits')
}

export function adminPurchases() {
  return api.get('/admin/purchases')
}

export function adminRetirements() {
  return api.get('/admin/retirements')
}

export function updateUserRole(userId, role, expectedRole) {
  return api.put(`/admin/users/${userId}/role`, { role, expectedRole })
}

export const updateUserStatus = (id, status) => api.put(`/admin/users/${id}/status`, { status })
export const updateUserEmail = (id, email) => api.put(`/admin/users/${id}/email`, { email })
export const userAudit = (id) => api.get(`/admin/users/${id}/audit`)
export const adminMRV = () => api.get('/admin/mrv')
export const assignMRV = (id, verifierId) => api.put(`/admin/mrv/${id}/assignment`, { verifierId })
