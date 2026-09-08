import { useMemo, useState } from 'react'
import { Recycle, Award } from 'lucide-react'
import PageTransition from '../../components/PageTransition'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import Certificate from '../../components/credits/Certificate'
import EmptyState, { ErrorState } from '../../components/ui/EmptyState'
import { SkeletonList } from '../../components/ui/Loaders'
import { useAsync } from '../../hooks/useAsync'
import { myRetirements } from '../../api/purchases'
import { formatNumber, formatDate } from '../../utils/format'

export default function RetirementsPage() {
  const [viewing, setViewing] = useState(null)
  const { data, loading, error, run } = useAsync(useMemo(() => () => myRetirements(), []))

  const retirements = useMemo(
    () => [...(data || [])].sort((a, b) => new Date(b.retirementDate) - new Date(a.retirementDate)),
    [data],
  )

  const totalRetired = useMemo(
    () => retirements.reduce((sum, r) => sum + Number(r.quantity || 0), 0),
    [retirements],
  )

  return (
    <PageTransition>
      <PageHeader
        eyebrow="Buyer portfolio"
        title="Retirements & certificates"
        subtitle="Credits you have permanently retired. Each retirement is locked forever and backed by a verifiable certificate."
        actions={
          retirements.length ? (
            <span className="badge badge--violet" style={{ fontSize: 12.5, padding: '9px 14px' }}>
              <Award size={14} /> {formatNumber(totalRetired)} tCO₂e retired
            </span>
          ) : null
        }
      />

      {loading ? (
        <SkeletonList rows={4} card />
      ) : error ? (
        <Card>
          <ErrorState error={error} onRetry={run} />
        </Card>
      ) : retirements.length === 0 ? (
        <Card>
          <EmptyState
            icon={Recycle}
            title="No retirements yet"
            description="Retire credits from your portfolio to permanently offset emissions and receive a CarbonTrust retirement certificate."
          />
        </Card>
      ) : (
        <div className="grid grid--cards">
          {retirements.map((retirement) => (
            <Card key={retirement.retirementId} pad hover style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="row row--between">
                <span className="badge badge--green"><Award size={12} /> Permanent</span>
                <span className="muted text-xs">{formatDate(retirement.retirementDate)}</span>
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 26, color: 'var(--green-700)' }}>
                  {formatNumber(retirement.quantity)} <span style={{ fontSize: 14, color: 'var(--muted)' }}>credits</span>
                </div>
                <div className="bold text-sm mt-2">{retirement.projectName}</div>
                <div className="muted text-xs mt-1">“{retirement.reason || 'Voluntary offset'}”</div>
              </div>
              <div className="divider" style={{ margin: '2px 0' }} />
              <div className="row row--between">
                <span className="muted text-xs mono">#{String(retirement.retirementId).padStart(4, '0')}</span>
                <Button size="sm" variant="secondary" icon={Award} onClick={() => setViewing(retirement)}>
                  View certificate
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={Boolean(viewing)}
        onClose={() => setViewing(null)}
        title="Retirement certificate"
        subtitle={`${viewing?.projectName} · retired ${viewing ? formatNumber(viewing.quantity) : ''} credits`}
        size="md"
      >
        {viewing && <Certificate retirement={viewing} />}
      </Modal>
    </PageTransition>
  )
}
