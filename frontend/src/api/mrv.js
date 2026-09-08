import { api } from './client'

export function listProjectMRV(projectId) {
  return api.get(`/projects/${projectId}/mrv`)
}

export function createMRVSubmission(projectId, payload) {
  return api.post(`/projects/${projectId}/mrv`, payload)
}

export function verifierSubmissions(status) {
  const query = status ? `?status=${encodeURIComponent(status)}` : ''
  return api.get(`/verifier/mrv${query}`)
}

export function verifyMRV(mrvId, payload) {
  return api.post(`/verifier/mrv/${mrvId}/verify`, payload)
}

export function mrvVerifications(mrvId) {
  return api.get(`/verifier/mrv/${mrvId}/verifications`)
}

export function verifierHistory() {
  return api.get('/verifier/verifications')
}
