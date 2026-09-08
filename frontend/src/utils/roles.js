export const ROLES = {
  ADMIN: 'ADMIN',
  NGO: 'NGO',
  VERIFIER: 'VERIFIER',
  BUYER: 'BUYER',
  USER: 'USER',
  HEALTHCARE_ADVISOR: 'HEALTHCARE_ADVISOR',
}

export const ROLE_META = {
  ADMIN: { label: 'Administrator', short: 'Admin', home: '/admin', badge: 'violet', icon: 'shield' },
  NGO: { label: 'Non-Governmental Org.', short: 'NGO', home: '/ngo', badge: 'teal', icon: 'sprout' },
  VERIFIER: { label: 'Verifier', short: 'Verifier', home: '/verifier', badge: 'blue', icon: 'check' },
  BUYER: { label: 'Carbon Buyer', short: 'Buyer', home: '/buyer', badge: 'green', icon: 'cart' },
  USER: { label: 'Member', short: 'Member', home: '/personal-health', badge: 'amber', icon: 'user' },
  HEALTHCARE_ADVISOR: {
    label: 'Healthcare Advisor',
    short: 'Advisor',
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
  BUYER: 'badge--green',
  USER: 'badge--amber',
  HEALTHCARE_ADVISOR: 'badge--red',
}

export function roleBadgeClass(role) {
  return ROLE_BADGE_CLASS[role] || 'badge--neutral'
}
