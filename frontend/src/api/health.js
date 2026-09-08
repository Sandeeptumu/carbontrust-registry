/**
 * Personal Health service.
 *
 * NOTE: the Spring Boot backend does not yet expose a Personal Health API
 * (no entity, table or controller exists), so this module is a self-contained
 * demo service persisted in localStorage. It is intentionally shaped like an
 * API client:
 *
 *   listHealthRecords()        -> GET  /health/records              (advisor)
 *   getHealthRecord(email)     -> GET  /health/records/{email}      (owner)
 *   saveHealthRecord(payload)  -> POST /health/records              (owner)
 *
 * To wire up a real backend later, keep the signatures and the record shape
 * below and replace each body with a call to the matching endpoint.
 */

import { getStoredUser } from '../utils/storage'

const STORAGE_KEY = 'carbontrust.health.records'
const USE_MOCK = true

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

function readAll() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeAll(records) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
}

function normalize(input = {}) {
  const splitTags = (value) =>
    (Array.isArray(value) ? value : String(value || ''))
      .map((item) => String(item).trim())
      .filter(Boolean)

  return {
    id: input.id || null,
    ownerEmail: (input.ownerEmail || '').toLowerCase(),
    ownerName: input.ownerName || '',
    bloodGroup: input.bloodGroup || '',
    allergies: splitTags(input.allergies),
    conditions: splitTags(input.conditions),
    medications: splitTags(input.medications),
    emergencyName: input.emergencyName || '',
    emergencyPhone: input.emergencyPhone || '',
    emergencyRelation: input.emergencyRelation || '',
    notes: input.notes || '',
    updatedAt: input.updatedAt || null,
  }
}

export function listHealthRecords() {
  if (!USE_MOCK) return Promise.resolve([])
  // Advisor view: every record currently stored in the browser.
  return Promise.resolve(readAll())
}

export function getHealthRecord(email) {
  if (!USE_MOCK) return Promise.resolve(null)
  if (!email) return Promise.resolve(null)
  const record = readAll().find(
    (r) => r.ownerEmail === String(email).toLowerCase(),
  )
  return Promise.resolve(record || null)
}

export function getMyHealthRecord() {
  const user = getStoredUser()
  return getHealthRecord(user?.email)
}

/** Upsert the authenticated user's record. */
export function saveHealthRecord(payload) {
  if (!USE_MOCK) return Promise.resolve(null)

  const user = getStoredUser()
  const email = String(user?.email || payload.ownerEmail || '').toLowerCase()
  const normalized = normalize({ ...payload, ownerEmail: email })
  const all = readAll()
  const existing = all.find((r) => r.ownerEmail === email)

  normalized.id = existing?.id || `health-${email.replace(/[^a-z0-9]/gi, '')}`
  normalized.ownerEmail = email
  normalized.ownerName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : normalized.ownerName
  normalized.updatedAt = new Date().toISOString()

  const next = existing
    ? all.map((r) => (r.ownerEmail === email ? normalized : r))
    : [...all, normalized]

  writeAll(next)
  return Promise.resolve(normalized)
}

export const HEALTH_CONSTANTS = { BLOOD_GROUPS }
