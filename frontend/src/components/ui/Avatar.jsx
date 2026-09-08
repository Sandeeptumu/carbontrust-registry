import { getRoleMeta, roleBadgeClass } from '../../utils/roles'

export function Avatar({ name = '', size = 'md' }) {
  const first = String(name || '?').trim().charAt(0).toUpperCase() || '?'
  return (
    <span className={`avatar avatar--${size}`} aria-hidden="true">
      {first}
    </span>
  )
}

export function RoleBadge({ role }) {
  const meta = getRoleMeta(role)
  return (
    <span className={`role-badge ${roleBadgeClass(role)}`}>
      {meta.short}
    </span>
  )
}
