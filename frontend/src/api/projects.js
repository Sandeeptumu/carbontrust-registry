import { api } from './client'

export function listProjects() {
  return api.get('/projects')
}

export function getProject(projectId) {
  return api.get(`/projects/${projectId}`)
}

export function createProject(payload) {
  return api.post('/projects', payload)
}

export function updateProject(projectId, payload) {
  return api.put(`/projects/${projectId}`, payload)
}

export function deleteProject(projectId) {
  return api.delete(`/projects/${projectId}`)
}
