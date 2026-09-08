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
