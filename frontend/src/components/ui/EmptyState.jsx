import { Sprout } from 'lucide-react'

export default function EmptyState({
  icon: Icon = Sprout,
  title,
  description,
  action,
}) {
  return (
    <div className="empty">
      <div className="empty__icon">
        <Icon size={28} strokeWidth={1.8} />
      </div>
      <div>
        <h4 className="empty__title">{title}</h4>
        {description && <p className="empty__desc mt-2">{description}</p>}
      </div>
      {action && <div className="empty__action">{action}</div>}
    </div>
  )
}

export function ErrorState({ error, onRetry, title = 'Something went wrong' }) {
  return (
    <div className="empty">
      <div className="empty__icon" style={{ background: 'var(--danger-bg)', color: 'var(--danger)' }}>
        <Sprout size={28} />
      </div>
      <h4 className="empty__title">{title}</h4>
      <p className="empty__desc">{error?.message || 'An unexpected error occurred.'}</p>
      {onRetry && (
        <div className="empty__action">
          <button type="button" className="btn btn--secondary btn--sm" onClick={onRetry}>
            Try again
          </button>
        </div>
      )}
    </div>
  )
}
