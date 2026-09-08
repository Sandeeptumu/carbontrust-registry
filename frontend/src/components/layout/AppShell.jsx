import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import { useAuth } from '../../context/AuthContext'
import { getRoleMeta } from '../../utils/roles'

export default function AppShell() {
  const { user } = useAuth()
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  // Close the mobile drawer on navigation and scroll to top on route change.
  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [location.pathname])

  const meta = getRoleMeta(user?.role)

  return (
    <div className={`shell ${collapsed ? 'shell--collapsed' : ''}`}>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <Sidebar
        role={user?.role}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((value) => !value)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />
      <div className="shell__main">
        <Topbar onOpenMenu={() => setMobileOpen(true)} title={meta.label} />
        <main id="main-content" className="page page--wide">
          <Outlet />
        </main>
        <footer
          className="muted text-xs"
          style={{ padding: '14px 26px', borderTop: '1px solid var(--border)', textAlign: 'center' }}
        >
          CarbonTrust Registry · Blue carbon credit platform for transparent climate action
        </footer>
      </div>
    </div>
  )
}
