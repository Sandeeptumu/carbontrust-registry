import { NavLink } from 'react-router-dom'
import { Leaf, PanelLeftClose, PanelLeftOpen, X } from 'lucide-react'
import { navForRole } from './nav'
import { getRoleMeta } from '../../utils/roles'

export default function Sidebar({
  role,
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}) {
  const nav = navForRole(role)
  const meta = getRoleMeta(role)

  return (
    <>
      {mobileOpen && (
        <div
          className="modal-backdrop"
          style={{ zIndex: 55, background: 'rgba(9,26,19,0.4)' }}
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}
      <aside
        className={`sidebar ${collapsed ? 'is-collapsed' : ''} ${mobileOpen ? 'is-mobile-open' : ''}`}
        aria-label="Primary navigation"
      >
        <div className="sidebar__brand">
          <span className="sidebar__logo">
            <Leaf size={20} strokeWidth={2.4} />
          </span>
          <div>
            <div className="sidebar__brand-name">CarbonTrust</div>
            <div className="sidebar__brand-sub">Registry · {meta.short}</div>
          </div>
          {mobileOpen && (
            <button
              type="button"
              className="icon-btn icon-btn--dark"
              onClick={onCloseMobile}
              aria-label="Close menu"
              style={{ marginLeft: 'auto' }}
            >
              <X size={18} />
            </button>
          )}
        </div>

        <nav className="sidebar__nav">
          {nav.map((section, index) => (
            <div key={index}>
              {section.label && <div className="sidebar__section">{section.label}</div>}
              {section.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) => `nav-item ${isActive ? 'is-active' : ''}`}
                  onClick={onCloseMobile}
                  title={item.label}
                >
                  <item.icon size={19} strokeWidth={2} />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar__foot">
          <button
            type="button"
            className="nav-item"
            style={{ width: '100%', border: 0, background: 'transparent', cursor: 'pointer' }}
            onClick={onToggleCollapse}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? (
              <PanelLeftOpen size={19} />
            ) : (
              <>
                <PanelLeftClose size={19} />
                <span>Collapse</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  )
}
