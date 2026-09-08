export default function Tabs({ tabs, value, onChange, ariaLabel }) {
  return (
    <div className="tabs" role="tablist" aria-label={ariaLabel}>
      {tabs.map((tab) => {
        const key = typeof tab === 'string' ? tab : tab.value
        const label = typeof tab === 'string' ? tab : tab.label
        const count = typeof tab === 'object' && tab.count !== undefined ? tab.count : null
        const active = value === key
        return (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={active}
            className={`tab ${active ? 'is-active' : ''}`}
            onClick={() => onChange(key)}
          >
            {label}
            {count !== null && <span className="badge badge--neutral">{count}</span>}
          </button>
        )
      })}
    </div>
  )
}
