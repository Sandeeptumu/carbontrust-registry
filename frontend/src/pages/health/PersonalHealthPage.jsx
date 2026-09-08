import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { HeartPulse, FilePlus2, Pencil, ShieldCheck } from 'lucide-react'
import PageTransition from '../../components/PageTransition'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import { SkeletonList } from '../../components/ui/Loaders'
import { useAsync } from '../../hooks/useAsync'
import { useAuth } from '../../context/AuthContext'
import { getMyHealthRecord } from '../../api/health'
import HealthRecordView from '../../components/health/HealthRecordView'

export default function PersonalHealthPage() {
  const { user } = useAuth()
  const record = useAsync(useMemo(() => () => getMyHealthRecord(), []))

  return (
    <PageTransition>
      <PageHeader
        eyebrow="Personal health"
        title="My health record"
        subtitle="Keep your medical essentials current so healthcare advisors can support you when it matters."
      />

      <div className="health-hero mb-4">
        <span style={{ background: 'rgba(255,255,255,0.16)', width: 52, height: 52, borderRadius: 15, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <HeartPulse size={26} />
        </span>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, color: '#fff' }}>
            Your record is private &amp; consent-based
          </div>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 3 }}>
            Only you and authorised healthcare advisors can view this information. This demo stores
            data locally in your browser.
          </p>
        </div>
      </div>

      {record.loading ? (
        <SkeletonList rows={3} card />
      ) : record.error ? (
        <Card><p className="text-sm" style={{ color: 'var(--danger)' }}>{record.error?.message}</p></Card>
      ) : !record.data ? (
        <Card>
          <EmptyState
            icon={HeartPulse}
            title="No health record available yet"
            description="Add your blood group, allergies, conditions and emergency contact — it only takes a minute and helps advisors give you better support."
            action={
              <Link to="/personal-health/edit" className="btn btn--primary btn--lg" style={{ textDecoration: 'none' }}>
                <FilePlus2 size={17} /> Add health information
              </Link>
            }
          />
        </Card>
      ) : (
        <Card pad>
          <div className="row row--between mb-4" style={{ alignItems: 'flex-start' }}>
            <div>
              <h3 style={{ fontSize: 17 }}>Health details for {user?.username}</h3>
              <p className="muted text-sm">Reviewed on {new Date().toLocaleDateString()} · verified in the demo registry</p>
            </div>
            <Button to="/personal-health/edit" variant="secondary" icon={Pencil}>
              Edit record
            </Button>
          </div>
          <HealthRecordView record={record.data} />
          <div className="row mt-5" style={{ gap: 8, color: 'var(--muted)', fontSize: 12.5 }}>
            <ShieldCheck size={15} style={{ color: 'var(--green-600)' }} />
            Protected by your CarbonTrust account — never shared without your consent.
          </div>
        </Card>
      )}
    </PageTransition>
  )
}
