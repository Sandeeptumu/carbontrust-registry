import { api } from './client'

export function listProjectMRV(projectId) {
  return api.get(`/projects/${projectId}/mrv`)
}

export function createMRVSubmission(projectId, payload) {
  const data = new FormData()
  data.append("file", payload.file)
  data.append("remarks", payload.remarks)
  data.append("photoVerification", String(payload.photoVerification))
  return api.post(`/projects/${projectId}/mrv`, data)
}

export function verifierSubmissions(status) {
  const query = status ? `?status=${encodeURIComponent(status)}` : ''
  return api.get(`/verifier/mrv${query}`)
}

export function verifyMRV(mrvId, payload) {
  return api.post(`/verifier/mrv/${mrvId}/verify`, payload)
}

export function mrvVerifications(mrvId) {
  return api.get(`/mrv/${mrvId}/verifications`)
}

export function verifierHistory() {
  return api.get('/verifier/verifications')
}

export async function downloadEvidence(submission) {
  const blob = await api.get(`/mrv/${submission.mrvId}/evidence`, { responseType: 'blob' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = submission.fileName || 'evidence'
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
