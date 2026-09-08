import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { PageLoader } from '../ui/Loaders'
import { isKnownRole, roleHome } from '../../utils/roles'
import UnknownRolePage from '../../pages/common/UnknownRolePage'

/** Blocks unauthenticated visitors. */
export function ProtectedRoute() {
  const { user, ready } = useAuth()
  const location = useLocation()

  if (!ready) {
    return <PageLoader label="Restoring your session…" />
  }
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }
  return <Outlet />
}

/** Restricts an area to a set of roles. */
export function RoleRoute({ roles }) {
  const { user } = useAuth()

  if (!user) return null
  if (!isKnownRole(user.role)) {
    return <UnknownRolePage />
  }
  if (!roles.includes(user.role)) {
    // Signed in but on the wrong area — send them to their own home.
    return <Navigate to={roleHome(user.role)} replace />
  }
  return <Outlet />
}
