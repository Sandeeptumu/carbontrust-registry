import { ShieldAlert } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { Avatar, RoleBadge } from '../../components/ui/Avatar'
import Button from '../../components/ui/Button'
import PageTransition from '../../components/PageTransition'

export default function UnknownRolePage() {
  const { user, logout } = useAuth()

  return (
    <PageTransition>
      <div className="card" style={{ maxWidth: 560, margin: '10vh auto' }}>
        <div className="card--pad" style={{ padding: 36 }}>
          <div className="empty__icon" style={{ background: 'var(--warning-bg)', color: 'var(--warning)' }}>
            <ShieldAlert size={28} />
          </div>
          <h4 className="empty__title mt-4">Role not recognized</h4>
          <p className="empty__desc mt-2">
            Your account is signed in with the role “{user?.role}”, which this platform does not
            recognize yet. Please contact an administrator if you believe this is a mistake.
          </p>
          <div className="row mt-4" style={{ justifyContent: 'center' }}>
            <Avatar name={(user?.username || '?').charAt(0)} size="md" />
            <div>
              <div className="bold">{user?.username}</div>
              <div className="muted text-sm">{user?.email}</div>
            </div>
            <RoleBadge role={user?.role} />
          </div>
          <div className="mt-5" style={{ display: 'flex', justifyContent: 'center', gap: 10 }}>
            <Button variant="secondary" onClick={() => logout()}>
              Sign out
            </Button>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
