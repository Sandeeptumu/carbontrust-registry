import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import { RoleBadge } from '../../components/ui/Avatar'
export default function SignInMethodsPage() {
  const { user } = useAuth()
  return <><PageHeader eyebrow="Account" title="Account security" subtitle="Manage your email and password access." />
    <Card className="card--pad" style={{ maxWidth: 640 }}>
      <h2>{user.username}</h2><p>{user.email}</p><RoleBadge role={user.role} />
      <p className="muted mt-4">To change your password, request a secure reset link. Contact an administrator to request an email address change; the new address must be verified.</p>
      <Link className="btn btn--primary mt-4" to="/forgot-password">Request password reset</Link>
    </Card></>
}
