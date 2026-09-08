export function Spinner({ dark = false, size = 20, label = 'Loading…' }) {
  return (
    <span
      className={`spinner ${dark ? 'spinner--dark' : ''}`}
      style={{ width: size, height: size }}
      role="status"
      aria-label={label}
    />
  )
}

export function PageLoader({ label = 'Loading…' }) {
  return (
    <div className="page-loading" role="status">
      <Spinner dark size={26} label={label} />
      <span className="muted text-sm" style={{ marginLeft: 10 }}>
        {label}
      </span>
    </div>
  )
}

export function Skeleton({ variant = 'line', width, height, className = '', style }) {
  return (
    <div
      className={`skeleton ${variant === 'card' ? 'skel-card' : `skel-line ${className}`}`}
      style={{ width, height, ...style }}
      aria-hidden="true"
    />
  )
}

export function SkeletonList({ rows = 3, card = false }) {
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{ display: 'grid', gap: 8 }}>
          <Skeleton variant={card ? 'card' : 'line'} width="100%" height={card ? 120 : 13} />
          {!card && (
            <>
              <Skeleton variant="line" width="80%" height={11} />
              <Skeleton variant="line" width="45%" height={11} />
            </>
          )}
        </div>
      ))}
    </div>
  )
}

export function SkeletonStats({ count = 4 }) {
  return (
    <div className="grid grid--stats">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} variant="card" height={132} />
      ))}
    </div>
  )
}
