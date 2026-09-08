import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { ClipboardList, History, ShieldCheck, XCircle, ArrowRight, FileCheck2, Clock } from 'lucide-react'
import PageTransition from '../../components/PageTransition'
import PageHeader from '../../components/ui/PageHeader'
import StatCard from '../../components/dashboard/StatCard'
import ChartTooltip from '../../components/dashboard/ChartTooltip'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import EmptyState, { ErrorState } from '../../components/ui/EmptyState'
import { SkeletonStats, SkeletonList } from '../../components/ui/Loaders'
import { useAsync } from '../../hooks/useAsync'
import { useAuth } from '../../context/AuthContext'
import { verifierSubmissions, verifierHistory } from '../../api/mrv'
import { formatNumber, formatDateTime } from '../../utils/format'

export default function VerifierDashboard() {
  const { user } = useAuth()
  const submissions = useAsync(useMemo(() => () => verifierSubmissions(), []))
  const history = useAsync(useMemo(() => () => verifierHistory(), []))

  const loading = submissions.loading || history.loading
  const error = submissions.error || history.error

  const all = submissions.data || []
  const pending = all.filter((s) => s.mrvStatus === 'PENDING')
  const approved = all.filter((s) => s.mrvStatus === 'APPROVED')
  const rejected = all.filter((s) => s.mrvStatus === 'REJECTED')
  const mine = history.data || []

  const chartData = useMemo(() => {
    const list = submissions.data || []
    const counts = {
      Pending: list.filter((item) => item.mrvStatus === 'PENDING').length,
      Approved: list.filter((item) => item.mrvStatus === 'APPROVED').length,
      Rejected: list.filter((item) => item.mrvStatus === 'REJECTED').length,
    }
    return Object.entries(counts)
      .filter(([, value]) => value > 0)
      .map(([name, value]) => ({ name, value }))
  }, [submissions.data])

  return (
    <PageTransition>
      <PageHeader
        eyebrow="Verifier workspace"
        title={`Good day, ${user?.username}`}
        subtitle="Review MRV submissions with full context and keep the registry trustworthy — every decision is recorded with comments."
        actions={
          pending.length > 0 ? (
            <Button to="/verifier/mrv" icon={ClipboardList}>
              Review queue ({pending.length})
            </Button>
          ) : null
        }
      />

      {loading ? (
        <>
          <SkeletonStats count={4} />
          <div className="mt-4"><SkeletonList rows={3} card /></div>
        </>
      ) : error ? (
        <Card>
          <ErrorState error={error} />
        </Card>
      ) : (
        <>
          <div className="grid grid--stats">
            <StatCard icon={Clock} label="Awaiting review" value={pending.length} tone="amber" sub="in queue" />
            <StatCard icon={ShieldCheck} label="Approved" value={approved.length} tone="green" delay={0.06} sub="across registry" />
            <StatCard icon={XCircle} label="Rejected" value={rejected.length} tone="red" delay={0.12} sub="with comments" />
            <StatCard icon={History} label="My decisions" value={mine.length} tone="blue" delay={0.18} sub="recorded" />
          </div>

          <div className="grid grid--2 mt-4" style={{ alignItems: 'stretch' }}>
            <Card pad className="chart-card">
              <div className="chart-card__head">
                <div>
                  <h3 className="chart-card__title">Registry review status</h3>
                  <p className="chart-card__sub">All MRV submissions across projects</p>
                </div>
              </div>
              {all.length === 0 ? (
                <EmptyState icon={FileCheck2} title="Nothing in the registry yet" description="MRV submissions appear here once NGOs upload evidence." />
              ) : (
                <div className="chart-box chart-box--sm">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={48} outerRadius={82} paddingAngle={3} stroke="none">
                        {chartData.map((entry) => (
                          <Cell key={entry.name} fill={entry.name === 'Pending' ? '#b26a16' : entry.name === 'Approved' ? '#158a4e' : '#c2412c'} />
                        ))}
                      </Pie>
                      <Tooltip content={<ChartTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="row row--wrap" style={{ justifyContent: 'center', marginTop: 4 }}>
                    {chartData.map((entry) => (
                      <span key={entry.name} className="row text-sm" style={{ gap: 6, marginRight: 12 }}>
                        <span style={{ width: 9, height: 9, borderRadius: 3, background: entry.name === 'Pending' ? '#b26a16' : entry.name === 'Approved' ? '#158a4e' : '#c2412c', display: 'inline-block' }} />
                        <span className="muted">{entry.name} · {formatNumber(entry.value)}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </Card>

            <Card className="card--pad">
              <div className="row row--between mb-4">
                <h3 style={{ fontSize: 16 }}>My recent decisions</h3>
                <Link to="/verifier/history" className="row text-sm" style={{ color: 'var(--green-700)', fontWeight: 700, textDecoration: 'none' }}>
                  Full history <ArrowRight size={14} />
                </Link>
              </div>
              {mine.length === 0 ? (
                <p className="muted text-sm">You haven&apos;t made any verification decisions yet.</p>
              ) : (
                <div className="col" style={{ gap: 0 }}>
                  {mine.slice(0, 5).map((item) => (
                    <div key={item.verificationId} className="row row--between" style={{ padding: '13px 2px', borderBottom: '1px solid var(--border)' }}>
                      <div className="row" style={{ gap: 11 }}>
                        <span className="stat__icon" style={{ width: 38, height: 38, margin: 0, background: item.verificationStatus === 'APPROVED' ? 'var(--success-bg)' : 'var(--danger-bg)', color: item.verificationStatus === 'APPROVED' ? 'var(--success)' : 'var(--danger)' }}>
                          {item.verificationStatus === 'APPROVED' ? <ShieldCheck size={17} /> : <XCircle size={17} />}
                        </span>
                        <div>
                          <div className="bold text-sm">{item.projectName}</div>
                          <div className="muted text-xs">{formatDateTime(item.verificationDate)}</div>
                        </div>
                      </div>
                      <span className={`badge ${item.verificationStatus === 'APPROVED' ? 'badge--green' : 'badge--red'}`}>
                        {item.verificationStatus}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {pending.length > 0 && (
            <Card pad className="row row--between row--wrap mt-4" style={{ background: 'linear-gradient(135deg, #7c4a0d, #b26a16)', border: 0, color: '#fff', gap: 14 }}>
              <div className="row" style={{ gap: 14 }}>
                <span style={{ background: 'rgba(255,255,255,0.18)', width: 42, height: 42, borderRadius: 12, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ClipboardList size={20} />
                </span>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 15, color: '#fff' }}>{pending.length} submission{pending.length > 1 ? 's' : ''} awaiting your review</div>
                  <div style={{ fontSize: 12.5, opacity: 0.85 }}>The registry rewards thorough, evidence-based decisions.</div>
                </div>
              </div>
              <Button to="/verifier/mrv" variant="light" size="sm">Open queue</Button>
            </Card>
          )}
        </>
      )}
    </PageTransition>
  )
}
