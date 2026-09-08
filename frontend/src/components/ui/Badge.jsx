import { metaFor } from '../../utils/status'

export default function Badge({ tone = 'neutral', dot = false, children }) {
  return (
    <span className={`badge badge--${tone}`}>
      {dot && <span className="badge__dot" aria-hidden="true" />}
      {children}
    </span>
  )
}

/** Renders a colored badge from a status meta map, e.g. PROJECT_STATUS. */
export function StatusBadge({ map, value }) {
  const meta = metaFor(map, value)
  return (
    <span className={`badge ${meta.badge}`}>
      <span className="badge__dot" aria-hidden="true" />
      {meta.label}
    </span>
  )
}
