import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { LogOut, Menu, UserRound, KeyRound } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useClickOutside } from '../../hooks/useClickOutside'
import { Avatar, RoleBadge } from '../ui/Avatar'
import { getRoleMeta, roleHome } from '../../utils/roles'

export default function Topbar({ onOpenMenu, title }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [profileOpen, setProfileOpen] = useState(false)
  const profileRef = useRef(null)
  const roleMeta = getRoleMeta(user?.role)

  useClickOutside(profileRef, () => setProfileOpen(false), profileOpen)

  const handleLogout = () => {
    setProfileOpen(false)
    logout('You have been signed out.').catch(() => {})
  }

  const initials = String(user?.username || '?').charAt(0).toUpperCase()

  return (
    <header className="topbar">
      <button type="button" className="icon-btn hide-on-desktop" onClick={onOpenMenu} aria-label="Open menu">
        <Menu size={20} />
      </button>
      <div className="section-title hide-mobile" style={{ textTransform: 'none', letterSpacing: '0.01em' }}>
        {title}
      </div>

      <div className="topbar__spacer" />

      <div className="profile-menu" ref={profileRef}>
        <button
          type="button"
          className="profile-menu__btn"
          onClick={() => setProfileOpen((open) => !open)}
          aria-expanded={profileOpen}
          aria-label="Account menu"
        >
          <Avatar name={initials} size="md" />
          <span className="profile-menu__meta">
            <span className="profile-menu__name">{user?.username}</span>
            <br />
            <span className="profile-menu__role">{roleMeta.short}</span>
          </span>
        </button>
        <AnimatePresence>
          {profileOpen && (
            <motion.div
              className="profile-menu__panel"
              initial={{ opacity: 0, y: -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.98 }}
              transition={{ duration: 0.16 }}
            >
              <div className="profile-menu__head">
                <Avatar name={initials} size="lg" />
                <div style={{ minWidth: 0 }}>
                  <div className="bold" style={{ fontSize: 14, wordBreak: 'break-word' }}>{user?.username}</div>
                  <div className="profile-menu__email">{user?.email}</div>
                  <div className="mt-2">
                    <RoleBadge role={user?.role} />
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="profile-menu__item"
                onClick={() => {
                  setProfileOpen(false)
                  navigate(roleHome(user?.role))
                }}
              >
                <UserRound size={16} />
                My dashboard
              </button>
              <button type="button" className="profile-menu__item" onClick={() => { setProfileOpen(false); navigate('/account/sign-in') }}>
                <KeyRound size={16} /> Account security
              </button>
              <button type="button" className="profile-menu__item profile-menu__item--danger" onClick={handleLogout}>
                <LogOut size={16} />
                Sign out
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  )
}
