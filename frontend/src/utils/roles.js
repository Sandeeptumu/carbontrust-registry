export const ROLES = {
  ADMIN: 'ADMIN',
  NGO: 'NGO',
  VERIFIER: 'VERIFIER',
  USER: 'USER',
  HEALTHCARE_ASSISTANT: 'HEALTHCARE_ASSISTANT',
}

export const ROLE_META = {
  ADMIN: { label: 'Administrator', short: 'Admin', home: '/admin', badge: 'violet', icon: 'shield' },
  NGO: { label: 'Non-Governmental Org.', short: 'NGO', home: '/ngo', badge: 'teal', icon: 'sprout' },
  VERIFIER: { label: 'Verifier', short: 'Verifier', home: '/verifier', badge: 'blue', icon: 'check' },
  USER: { label: 'User', short: 'User', home: '/buyer', badge: 'green', icon: 'user' },
  HEALTHCARE_ASSISTANT: {
    label: 'Healthcare Assistant',
    short: 'Assistant',
    home: '/health',
    badge: 'red',
    icon: 'heart',
  },
}

export function getRoleMeta(role) {
  return ROLE_META[role] || {
    label: role || 'Unknown',
    short: role || 'Unknown',
    home: '/dashboard',
    badge: 'neutral',
    icon: 'user',
  }
}

export function roleHome(role) {
  return getRoleMeta(role).home
}

/** Roles that may land on the authenticated app shell. */
export function isKnownRole(role) {
  return Boolean(ROLE_META[role])
}

export const ROLE_BADGE_CLASS = {
  ADMIN: 'badge--violet',
  NGO: 'badge--teal',
  VERIFIER: 'badge--blue',
  USER: 'badge--amber',
  HEALTHCARE_ASSISTANT: 'badge--red',
}

export function roleBadgeClass(role) {
  return ROLE_BADGE_CLASS[role] || 'badge--neutral'
}
