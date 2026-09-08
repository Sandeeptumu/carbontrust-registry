import { api } from './client'

export function marketplaceCredits() {
  return api.get('/marketplace/credits')
}

export function marketplaceProject(projectId) {
  return api.get(`/marketplace/projects/${projectId}`)
}

export function projectCredits(projectId) {
  return api.get(`/projects/${projectId}/carbon-credits`)
}

export function issueCredits(projectId, quantity) {
  return api.post(`/projects/${projectId}/carbon-credits`, { quantity })
}
