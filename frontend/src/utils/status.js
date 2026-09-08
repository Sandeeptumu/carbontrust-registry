/** Maps backend status strings to badge classes + labels. */

export const PROJECT_STATUS = {
  DRAFT: { label: 'Draft', badge: 'badge--neutral' },
  SUBMITTED: { label: 'Submitted', badge: 'badge--blue' },
  PENDING: { label: 'Under review', badge: 'badge--amber' },
  VERIFIED: { label: 'Verified', badge: 'badge--green' },
  REJECTED: { label: 'Rejected', badge: 'badge--red' },
}

export const MRV_STATUS = {
  PENDING: { label: 'Pending review', badge: 'badge--amber' },
  APPROVED: { label: 'Approved', badge: 'badge--green' },
  REJECTED: { label: 'Rejected', badge: 'badge--red' },
}

export const BATCH_STATUS = {
  ACTIVE: { label: 'Active', badge: 'badge--green' },
  SOLD_OUT: { label: 'Sold out', badge: 'badge--neutral' },
}

export const PAYMENT_STATUS = {
  COMPLETED: { label: 'Completed', badge: 'badge--green' },
  PENDING: { label: 'Pending', badge: 'badge--amber' },
  FAILED: { label: 'Failed', badge: 'badge--red' },
}

export const USER_STATUS = {
  true: { label: 'Active', badge: 'badge--green' },
  false: { label: 'Inactive', badge: 'badge--red' },
}

export function metaFor(map, value) {
  return map[value] || { label: value || '—', badge: 'badge--neutral' }
}

export const ECOSYSTEM_META = {
  MANGROVE: { label: 'Mangrove restoration', color: '#157345' },
  SEAGRASS: { label: 'Seagrass meadow', color: '#0f766e' },
  'SALT MARSH': { label: 'Salt marsh', color: '#9a6a2f' },
  SALT_MARSH: { label: 'Salt marsh', color: '#9a6a2f' },
  WETLAND: { label: 'Wetland', color: '#0e7490' },
  FOREST: { label: 'Forest', color: '#158a4e' },
}

export function ecosystemMeta(value) {
  if (!value) return { label: 'Blue carbon', color: '#157345' }
  const normalized = value.trim().toUpperCase().replace(/\s+/g, '_')
  return (
    ECOSYSTEM_META[value] ||
    ECOSYSTEM_META[normalized] || {
      label: value,
      color: '#157345',
    }
  )
}

export const RETIREMENT_REASONS = [
  'Offset my personal carbon footprint',
  'Corporate net-zero commitment',
  'Compensate travel emissions',
  'Product carbon neutral claim',
  'Event / conference offset',
  'Climate contribution',
]
