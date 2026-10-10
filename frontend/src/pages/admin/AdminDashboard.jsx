import { useMemo } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Users, FolderKanban, Layers, Recycle, DollarSign, ShoppingCart } from 'lucide-react'
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
import { adminStats, adminPurchases, adminRetirements } from '../../api/admin'
import { formatCurrency, formatNumber, formatDate } from '../../utils/format'

const ROLE_COLORS = { ADMIN: '#6d5bd0', NGO: '#0f766e', VERIFIER: '#0e7490', USER: '#158a4e', HEALTHCARE_ASSISTANT: '#b45309' }
const STATUS_COLORS = { DRAFT: '#b26a16', VERIFIED: '#158a4e', REJECTED: '#c2412c', PENDING: '#0e7490', SUBMITTED: '#6d5bd0' }

function revenueSeries(purchases) {
  const map = new Map()
  for (const purchase of purchases || []) {
    const key = (purchase.purchaseDate || '').slice(0, 7)
    if (!key) continue
    map.set(key, (map.get(key) || 0) + Number(purchase.price || 0))
  }
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, revenue]) => ({
      month,
      revenue: Math.round(revenue * 100) / 100,
      credits: 0,
    }))
}

export default function AdminDashboard() {
  const { user } = useAuth()
  const stats = useAsync(useMemo(() => () => adminStats(), []))
  const purchases = useAsync(useMemo(() => () => adminPurchases(), []))
  const retirements = useAsync(useMemo(() => () => adminRetirements(), []))

  const loading = stats.loading || purchases.loading || retirements.loading
  const error = stats.error || purchases.error || retirements.error

  const s = stats.data || {}

  const usersByRole = useMemo(
    () => Object.entries((stats.data || {}).usersByRole || {}).map(([name, value]) => ({ name, value })),
    [stats.data],
  )
  const projectsByStatus = useMemo(
    () => Object.entries((stats.data || {}).projectsByStatus || {}).map(([name, value]) => ({ name, value })),
    [stats.data],
  )
  const revenue = useMemo(() => revenueSeries(purchases.data), [purchases.data])
  const creditFlow = useMemo(
    () => {
      const current = stats.data || {}
      return [
        { name: 'Issued', value: current.totalCreditsIssued || 0 },
        { name: 'Available', value: current.totalCreditsAvailable || 0 },
        { name: 'Sold', value: current.totalCreditsSold || 0 },
        { name: 'Retired', value: current.totalCreditsRetired || 0 },
      ]
    },
    [stats.data],
  )

  const recentPurchases = useMemo(
    () => [...(purchases.data || [])].sort((a, b) => new Date(b.purchaseDate) - new Date(a.purchaseDate)).slice(0, 6),
    [purchases.data],
  )
  const recentRetirements = useMemo(
    () => [...(retirements.data || [])].sort((a, b) => new Date(b.retirementDate) - new Date(a.retirementDate)).slice(0, 4),
    [retirements.data],
  )

  return (
    <PageTransition>
      <PageHeader
        eyebrow="Administration"
        title={`Platform overview, ${user?.username}`}
        subtitle="Registry-wide analytics across users, projects, carbon credits and market activity."
        actions={
          <Button to="/admin/users" variant="secondary" icon={Users}>
            Manage users
          </Button>
        }
      />

      {loading ? (
        <>
          <SkeletonStats count={6} />
          <div className="mt-4"><SkeletonList rows={3} card /></div>
        </>
      ) : error ? (
        <Card>
          <ErrorState error={error} />
        </Card>
      ) : (
        <>
          <div className="grid grid--stats">
            <StatCard icon={Users} label="Total users" value={s.totalUsers || 0} tone="violet" link />
            <StatCard icon={FolderKanban} label="Projects" value={s.totalProjects || 0} tone="teal" delay={0.04} link />
            <StatCard icon={Layers} label="Credits issued" value={s.totalCreditsIssued || 0} tone="green" delay={0.08} sub="tCO₂e" link />
            <StatCard icon={ShoppingCart} label="Credits sold" value={s.totalCreditsSold || 0} tone="blue" delay={0.12} sub={`${s.totalPurchases || 0} purchases`} link />
            <StatCard icon={Recycle} label="Credits retired" value={s.totalCreditsRetired || 0} tone="amber" delay={0.16} sub={`${s.totalRetirements || 0} retirements`} link />
            <StatCard icon={DollarSign} label="Market revenue" value={s.totalRevenue || 0} format={formatCurrency} tone="red" delay={0.2} link />
          </div>

          <div className="grid grid--2 mt-4" style={{ gridTemplateColumns: 'minmax(0,1.4fr) minmax(0,1fr)' }}>
            <Card pad className="chart-card">
              <div className="chart-card__head">
                <div>
                  <h3 className="chart-card__title">Market revenue over time</h3>
                  <p className="chart-card__sub">Credit purchase revenue by month</p>
                </div>
              </div>
              {revenue.length ? (
                <div className="chart-box">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenue} margin={{ top: 8, right: 8, left: -6, bottom: 0 }}>
                      <defs>
                        <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#1c9a58" stopOpacity={0.4} />
                          <stop offset="100%" stopColor="#1c9a58" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                      <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--muted)' }} tickLine={false} axisLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: 'var(--muted)' }} tickLine={false} axisLine={false} width={54} tickFormatter={(v) => `$${v >= 1000 ? `${Math.round(v / 1000)}k` : v}`} />
                      <Tooltip content={<ChartTooltip valueFormatter={(v) => formatCurrency(v)} />} />
                      <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#158a4e" strokeWidth={2.6} fill="url(#rev)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <EmptyState icon={DollarSign} title="No purchases yet" description="Revenue trends appear once buyers start purchasing credits." />
              )}
            </Card>

            <div style={{ display: 'grid', gap: 18 }}>
              <Card pad className="chart-card">
                <div className="chart-card__head">
                  <h3 className="chart-card__title">Users by role</h3>
                </div>
                {usersByRole.length ? (
                  <div className="chart-box chart-box--sm">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={usersByRole} dataKey="value" nameKey="name" innerRadius={40} outerRadius={70} paddingAngle={3} stroke="none">
                          {usersByRole.map((entry) => (
                            <Cell key={entry.name} fill={ROLE_COLORS[entry.name] || '#1c9a58'} />
                          ))}
                        </Pie>
                        <Tooltip content={<ChartTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="row row--wrap" style={{ justifyContent: 'center', marginTop: 2 }}>
                      {usersByRole.map((entry) => (
                        <span key={entry.name} className="row text-sm" style={{ gap: 6, marginRight: 10 }}>
                          <span style={{ width: 8, height: 8, borderRadius: 3, background: ROLE_COLORS[entry.name] || '#1c9a58', display: 'inline-block' }} />
                          <span className="muted">{entry.name} · {entry.value}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="muted text-sm">No users yet.</p>
                )}
              </Card>

              <Card pad className="chart-card">
                <div className="chart-card__head">
                  <h3 className="chart-card__title">Project lifecycle</h3>
                  <p className="chart-card__sub">Credit flow (tCO₂e)</p>
                </div>
                {creditFlow.some((c) => c.value > 0) ? (
                  <div className="chart-box chart-box--sm">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={creditFlow} layout="vertical" margin={{ top: 0, right: 14, left: 10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                        <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--muted)' }} tickLine={false} axisLine={false} />
                        <YAxis type="category" dataKey="name" tick={{ fontSize: 11.5, fill: 'var(--ink-soft)' }} tickLine={false} axisLine={false} width={76} />
                        <Tooltip content={<ChartTooltip valueFormatter={(v) => formatNumber(v)} />} cursor={{ fill: 'var(--surface-sunken)' }} />
                        <Bar dataKey="value" name="tCO₂e" radius={[0, 6, 6, 0]} barSize={16}>
                          {creditFlow.map((entry) => (
                            <Cell key={entry.name} fill={entry.name === 'Issued' ? '#1c9a58' : entry.name === 'Available' ? '#0f766e' : entry.name === 'Sold' ? '#0e7490' : '#b26a16'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="muted text-sm">No credits in the registry yet.</p>
                )}
              </Card>
            </div>
          </div>

          <div className="grid grid--2 mt-4" style={{ gridTemplateColumns: 'minmax(0,1.4fr) minmax(0,1fr)', alignItems: 'start' }}>
            <Card className="card--pad">
              <div className="row row--between mb-3">
                <h3 style={{ fontSize: 16 }}>Recent purchases</h3>
                <Button to="/admin/purchases" variant="ghost" size="sm">View all</Button>
              </div>
              {recentPurchases.length ? (
                <div className="table-wrap" style={{ borderRadius: 10 }}>
                  <table className="table" style={{ minWidth: 420 }}>
                    <thead>
                      <tr>
                        <th>Buyer</th>
                        <th>Project</th>
                        <th>Credits</th>
                        <th>Value</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentPurchases.map((p) => (
                        <tr key={p.purchaseId}>
                          <td className="bold text-sm">{p.buyerUsername}</td>
                          <td className="text-sm">{p.projectName}</td>
                          <td>{formatNumber(p.quantity)}</td>
                          <td className="bold">{formatCurrency(p.price)}</td>
                          <td className="muted nowrap text-sm">{formatDate(p.purchaseDate)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="muted text-sm">No purchases recorded yet.</p>
              )}
            </Card>

            <Card className="card--pad">
              <h3 style={{ fontSize: 16 }}>Recent retirements</h3>
              {recentRetirements.length ? (
                <div className="col mt-3" style={{ gap: 0 }}>
                  {recentRetirements.map((r) => (
                    <div key={r.retirementId} className="row row--between" style={{ padding: '12px 2px', borderBottom: '1px solid var(--border)' }}>
                      <div>
                        <div className="bold text-sm">{r.buyerUsername}</div>
                        <div className="muted text-xs">{r.projectName} · {formatDate(r.retirementDate)}</div>
                      </div>
                      <span className="badge badge--green">{formatNumber(r.quantity)} t</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="muted text-sm mt-3">No retirements recorded yet.</p>
              )}
            </Card>
          </div>

          {projectsByStatus.length > 0 && (
            <div className="row row--wrap mt-4" style={{ gap: 10 }}>
              <span className="section-title">Projects by status:</span>
              {projectsByStatus.map((entry) => (
                <span key={entry.name} className="badge" style={{ background: STATUS_COLORS[entry.name] || 'var(--surface-sunken)', color: STATUS_COLORS[entry.name] ? '#fff' : 'var(--muted)' }}>
                  {entry.name} · {entry.value}
                </span>
              ))}
            </div>
          )}
        </>
      )}
    </PageTransition>
  )
}
