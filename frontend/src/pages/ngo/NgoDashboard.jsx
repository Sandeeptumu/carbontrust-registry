import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import {
  FolderKanban,
  FileCheck2,
  ShieldCheck,
  XCircle,
  PlusCircle,
  ArrowRight,
  Layers,
  MapPin,
} from 'lucide-react'
import PageTransition from '../../components/PageTransition'
import PageHeader from '../../components/ui/PageHeader'
import StatCard from '../../components/dashboard/StatCard'
import ChartTooltip from '../../components/dashboard/ChartTooltip'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import { StatusBadge } from '../../components/ui/Badge'
import EcosystemGlyph from '../../components/EcosystemGlyph'
import EmptyState, { ErrorState } from '../../components/ui/EmptyState'
import { SkeletonStats, SkeletonList } from '../../components/ui/Loaders'
import { useAsync } from '../../hooks/useAsync'
import { useAuth } from '../../context/AuthContext'
import { listProjects } from '../../api/projects'
import { PROJECT_STATUS } from '../../utils/status'
import { formatNumber, formatDate } from '../../utils/format'

const STATUS_COLORS = {
  DRAFT: '#b26a16',
  VERIFIED: '#158a4e',
  REJECTED: '#c2412c',
  PENDING: '#0e7490',
}

export default function NgoDashboard() {
  const { user } = useAuth()
  const projects = useAsync(useMemo(() => () => listProjects(), []))

  const mine = useMemo(() => {
    const list = (projects.data || []).filter((p) => Number(p.ownerId) === Number(user?.userId))
    return list.sort((a, b) => new Date(b.createdAt || b.startDate) - new Date(a.createdAt || a.startDate))
  }, [projects.data, user?.userId])

  const counts = useMemo(() => {
    const byStatus = {
      DRAFT: 0,
      PENDING: 0,
      VERIFIED: 0,
      REJECTED: 0,
    }
    for (const project of mine) {
      byStatus[project.projectStatus] = (byStatus[project.projectStatus] || 0) + 1
    }
    return byStatus
  }, [mine])

  const chartData = useMemo(
    () =>
      Object.entries(counts)
        .filter(([, value]) => value > 0)
        .map(([name, value]) => ({ name: PROJECT_STATUS[name]?.label || name, value, key: name })),
    [counts],
  )

  return (
    <PageTransition>
      <PageHeader
        eyebrow="NGO workspace"
        title={`Hello, ${user?.username}`}
        subtitle="Register blue carbon restoration projects, submit MRV evidence and watch them move through verification to credit issuance."
        actions={
          <Button to="/ngo/projects/new" icon={PlusCircle}>
            Register a project
          </Button>
        }
      />

      {projects.loading ? (
        <>
          <SkeletonStats count={4} />
          <div className="mt-4"><SkeletonList rows={3} card /></div>
        </>
      ) : projects.error ? (
        <Card>
          <ErrorState error={projects.error} onRetry={projects.run} />
        </Card>
      ) : mine.length === 0 ? (
        <Card>
          <EmptyState
            icon={FolderKanban}
            title="No projects yet"
            description="Register your first blue carbon restoration project to begin the verification and credit journey."
            action={
              <Button to="/ngo/projects/new" icon={PlusCircle}>
                Create your first project
              </Button>
            }
          />
        </Card>
      ) : (
        <>
          <div className="grid grid--stats">
            <StatCard icon={FolderKanban} label="Total projects" value={mine.length} tone="green" />
            <StatCard icon={FileCheck2} label="Draft" value={counts.DRAFT} tone="amber" delay={0.05} sub="awaiting MRV submission" />
            <StatCard icon={ShieldCheck} label="Verified" value={counts.VERIFIED} tone="teal" delay={0.1} sub="credits eligible" />
            <StatCard icon={XCircle} label="Rejected" value={counts.REJECTED} tone="red" delay={0.15} sub="requires revision" />
          </div>

          <div className="grid grid--2 mt-4" style={{ alignItems: 'stretch' }}>
            <Card pad className="chart-card">
              <div className="chart-card__head">
                <div>
                  <h3 className="chart-card__title">Projects by status</h3>
                  <p className="chart-card__sub">Lifecycle of your registered projects</p>
                </div>
              </div>
              {chartData.length === 0 ? (
                <p className="muted text-sm">No data to chart yet.</p>
              ) : (
                <div className="chart-box chart-box--sm">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={46} outerRadius={80} paddingAngle={3} stroke="none">
                        {chartData.map((entry) => (
                          <Cell key={entry.key} fill={STATUS_COLORS[entry.key] || '#1c9a58'} />
                        ))}
                      </Pie>
                      <Tooltip content={<ChartTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="row row--wrap" style={{ justifyContent: 'center', marginTop: 4 }}>
                    {chartData.map((entry) => (
                      <span key={entry.key} className="row text-sm" style={{ gap: 6, marginRight: 12 }}>
                        <span style={{ width: 9, height: 9, borderRadius: 3, background: STATUS_COLORS[entry.key] || '#1c9a58', display: 'inline-block' }} />
                        <span className="muted">{entry.name}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </Card>

            <Card className="card--pad">
              <div className="row row--between mb-4">
                <h3 style={{ fontSize: 16 }}>Recent projects</h3>
                <Link to="/ngo/projects" className="row text-sm" style={{ color: 'var(--green-700)', fontWeight: 700, textDecoration: 'none' }}>
                  View all <ArrowRight size={14} />
                </Link>
              </div>
              <div className="col" style={{ gap: 0 }}>
                {mine.slice(0, 4).map((project) => (
                  <Link
                    key={project.projectId}
                    to={`/ngo/projects/${project.projectId}`}
                    className="row row--between"
                    style={{ padding: '13px 2px', borderBottom: '1px solid var(--border)', textDecoration: 'none' }}
                  >
                    <div className="row" style={{ gap: 12 }}>
                      <span className="stat__icon" style={{ width: 40, height: 40, background: 'var(--green-100)', margin: 0 }}>
                        <EcosystemGlyph ecosystem={project.ecosystemType} size={19} />
                      </span>
                      <div style={{ minWidth: 0 }}>
                        <div className="bold text-sm" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 240 }}>{project.projectName}</div>
                        <div className="row muted text-xs" style={{ gap: 4, marginTop: 2 }}>
                          <MapPin size={11} /> {project.location} · {formatNumber(project.area)} ha
                        </div>
                      </div>
                    </div>
                    <StatusBadge map={PROJECT_STATUS} value={project.projectStatus} />
                  </Link>
                ))}
              </div>
            </Card>
          </div>

          <Card className="row row--between row--wrap mt-4" pad style={{ background: 'linear-gradient(135deg, var(--green-900), var(--teal-700))', border: 0, color: '#fff', gap: 16 }}>
            <div className="row" style={{ gap: 14 }}>
              <span style={{ background: 'rgba(255,255,255,0.16)', width: 44, height: 44, borderRadius: 13, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                <Layers size={22} />
              </span>
              <div>
                <div style={{ fontWeight: 800, fontSize: 16, color: '#fff' }}>
                  {counts.VERIFIED} verified project{counts.VERIFIED === 1 ? '' : 's'} ready for carbon credits
                </div>
                <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13 }}>
                  Issue carbon credit batches to make them available on the buyer marketplace.
                </div>
              </div>
            </div>
            <div className="row" style={{ gap: 10 }}>
              <Button to="/ngo/projects" variant="light" size="sm">
                Open projects
              </Button>
            </div>
          </Card>

          <div className="mt-4 text-xs muted" style={{ textAlign: 'right' }}>
            Last updated {formatDate(new Date().toISOString())}
          </div>
        </>
      )}
    </PageTransition>
  )
}
