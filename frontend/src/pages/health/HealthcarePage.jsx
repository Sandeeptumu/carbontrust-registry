import { useAuth } from '../../context/AuthContext'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import { RoleBadge } from '../../components/ui/Avatar'
export default function HealthcarePage() {
  const { user } = useAuth()
  return <><PageHeader eyebrow="Healthcare Assistant" title={`Welcome, ${user.username}`} subtitle="Your account and assigned access." />
    <Card className="card--pad"><h2>Account details</h2><p>{user.email}</p><RoleBadge role={user.role} /></Card>
    <Card className="card--pad mt-4"><h2>Healthcare workflows need a specification</h2><p className="muted">The supplied project requirements do not define healthcare records, consent, access rules or clinical workflows. These features cannot be enabled until those requirements are approved. Contact your administrator for the next steps.</p></Card>
  </>
}
