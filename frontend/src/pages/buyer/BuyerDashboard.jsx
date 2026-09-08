import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  Wallet,
  Recycle,
  TrendingUp,
  Globe2,
  ShoppingCart,
  ArrowRight,
  Leaf,
} from 'lucide-react'
import PageTransition from '../../components/PageTransition'
import PageHeader from '../../components/ui/PageHeader'
import StatCard from '../../components/dashboard/StatCard'
import ChartTooltip from '../../components/dashboard/ChartTooltip'
import EmptyState, { ErrorState } from '../../components/ui/EmptyState'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import { SkeletonStats, SkeletonList } from '../../components/ui/Loaders'
import { useAsync } from '../../hooks/useAsync'
import { useAuth } from '../../context/AuthContext'
import { myPurchases, myRetirements } from '../../api/purchases'
import { formatCurrency, formatNumber, formatDate } from '../../utils/format'

const PIE_COLORS = ['#157345', '#0f766e', '#b26a16', '#6d5bd0', '#0e7490', '#1c9a58']

function buildCumulative(purchases, retirements) {
  const events = [
    ...purchases.map((p) => ({ date: p.purchaseDate, type: 'purchase', value: Number(p.quantity || 0) })),
    ...retirements.map((r) => ({ date: r.retirementDate, type: 'retire', value: Number(r.quantity || 0) })),
  ]
    .filter((e) => e.date)
    .sort((a, b) => new Date(a.date) - new Date(b.date))

  let purchased = 0
  let retired = 0
  const seen = new Set()
  const points = []
  for (const event of events) {
    if (event.type === 'purchase') purchased += event.value
    else retired += event.value
    const key = event.date.slice(0, 10)
    if (!seen.has(key)) {
      seen.add(key)
      points.push({
        date: key,
        purchased: purchased,
        retired: retired,
      })
    } else {
      const last = points[points.length - 1]
      last.purchased = purchased
      last.retired = retired
    }
  }
  return points
}

export default function BuyerDashboard() {
  const { user } = useAuth()
  const purchases = useAsync(useMemo(() => () => myPurchases(), []))
  const retirements = useAsync(useMemo(() => () => myRetirements(), []))

  const loading = purchases.loading || retirements.loading
  const error = purchases.error || retirements.error

  const totals = useMemo(() => {
    const purchased = (purchases.data || []).reduce((sum, p) => sum + Number(p.quantity || 0), 0)
    const retired = (retirements.data || []).reduce((sum, r) => sum + Number(r.quantity || 0), 0)
    const spent = (purchases.data || []).reduce((sum, p) => sum + Number(p.price || 0), 0)
    const projects = new Set((purchases.data || []).map((p) => p.projectId).filter(Boolean))
    return { purchased, retired, held: Math.max(0, purchased - retired), spent, projects: projects.size }
  }, [purchases.data, retirements.data])

  const series = useMemo(
    () => buildCumulative(purchases.data || [], retirements.data || []),
    [purchases.data, retirements.data],
  )

  const byProject = useMemo(() => {
    const map = new Map()
    for (const p of purchases.data || []) {
      const name = p.projectName || `Project #${p.projectId}`
      map.set(name, (map.get(name) || 0) + Number(p.quantity || 0))
    }
    return [...map.entries()]
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }, [purchases.data])

  const recent = useMemo(
    () => [...(purchases.data || [])].sort((a, b) => new Date(b.purchaseDate) - new Date(a.purchaseDate)).slice(0, 6),
    [purchases.data],
  )

  return (
    <PageTransition>
      <PageHeader
        eyebrow="Buyer overview"
        title={`Welcome back, ${user?.username}`}
        subtitle="Track your portfolio of verified carbon credits — from purchase to permanent retirement."
        actions={
          <Button to="/buyer/marketplace" icon={ShoppingCart}>
            Browse marketplace
          </Button>
        }
      />

      {loading ? (
        <>
          <SkeletonStats count={4} />
          <div className="mt-4">
            <SkeletonList rows={3} card />
          </div>
        </>
      ) : error ? (
        <Card>
          <ErrorState error={error} onRetry={() => { purchases.run(); retirements.run() }} />
        </Card>
      ) : (purchases.data || []).length === 0 ? (
        <Card>
          <EmptyState
            icon={Wallet}
            title="Your carbon portfolio is empty"
            description="When you purchase verified credits from the marketplace they'll appear here with full history, portfolio charts and retirement tools."
            action={
              <Button to="/buyer/marketplace" icon={ShoppingCart}>
                Explore the marketplace
              </Button>
            }
          />
        </Card>
      ) : (
        <>
          <div className="grid grid--stats">
            <StatCard icon={Wallet} label="Credits held" value={totals.held} sub="in your portfolio" tone="green" delay={0} />
            <StatCard icon={TrendingUp} label="Total purchased" value={totals.purchased} sub={`${formatCurrency(totals.spent)} invested`} tone="teal" delay={0.06} />
            <StatCard icon={Recycle} label="Credits retired" value={totals.retired} sub="permanently removed" tone="violet" delay={0.12} />
            <StatCard icon={Globe2} label="Projects supported" value={totals.projects} sub="blue carbon projects" tone="amber" delay={0.18} />
          </div>

          <div className="grid grid--2 mt-4">
            <Card pad className="chart-card">
              <div className="chart-card__head">
                <div>
                  <h3 className="chart-card__title">Portfolio over time</h3>
                  <p className="chart-card__sub">Cumulative credits purchased vs retired (tCO₂e)</p>
                </div>
              </div>
              <div className="chart-box">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={series} margin={{ top: 8, right: 8, left: -14, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gPurchased" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#1c9a58" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="#1c9a58" stopOpacity={0.02} />
                      </linearGradient>
                      <linearGradient id="gRetired" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6d5bd0" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#6d5bd0" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--muted)' }} tickLine={false} axisLine={false} tickFormatter={(v) => formatDate(v)} minTickGap={28} />
                    <YAxis tick={{ fontSize: 11, fill: 'var(--muted)' }} tickLine={false} axisLine={false} width={52} />
                    <Tooltip content={<ChartTooltip labelFormatter={(l) => formatDate(l)} />} />
                    <Area type="monotone" dataKey="purchased" name="Purchased" stroke="#158a4e" strokeWidth={2.4} fill="url(#gPurchased)" />
                    <Area type="monotone" dataKey="retired" name="Retired" stroke="#6d5bd0" strokeWidth={2.4} fill="url(#gRetired)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card pad className="chart-card">
              <div className="chart-card__head">
                <div>
                  <h3 className="chart-card__title">Portfolio by project</h3>
                  <p className="chart-card__sub">Distribution of credits you hold (tCO₂e)</p>
                </div>
              </div>
              <div className="chart-box">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={byProject} dataKey="value" nameKey="name" innerRadius={52} outerRadius={84} paddingAngle={3} stroke="none">
                      {byProject.map((entry, index) => (
                        <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTooltip valueFormatter={(v) => formatNumber(v)} />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="row row--wrap" style={{ justifyContent: 'center', marginTop: 6 }}>
                  {byProject.slice(0, 5).map((entry, index) => (
                    <span key={entry.name} className="row text-sm" style={{ gap: 6, marginRight: 12 }}>
                      <span style={{ width: 9, height: 9, borderRadius: 3, background: PIE_COLORS[index % PIE_COLORS.length], display: 'inline-block' }} />
                      <span className="muted">{entry.name}</span>
                    </span>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          <div className="grid grid--2 mt-4" style={{ alignItems: 'start' }}>
            <Card className="card--pad">
              <div className="row row--between mb-4">
                <h3 className="chart-card__title" style={{ fontSize: 16 }}>Recent purchases</h3>
                <Link to="/buyer/credits" className="row text-sm" style={{ color: 'var(--green-700)', fontWeight: 700, textDecoration: 'none' }}>
                  View all <ArrowRight size={14} />
                </Link>
              </div>
              {recent.length ? (
                <div className="col" style={{ gap: 0 }}>
                  {recent.map((purchase) => (
                    <div key={purchase.purchaseId} className="row row--between" style={{ padding: '13px 2px', borderBottom: '1px solid var(--border)' }}>
                      <div className="row" style={{ gap: 11 }}>
                        <span className="stat__icon" style={{ width: 36, height: 36, background: 'var(--green-100)', color: 'var(--green-700)', margin: 0, borderRadius: 10 }}>
                          <Leaf size={16} />
                        </span>
                        <div>
                          <div className="bold text-sm">{purchase.projectName}</div>
                          <div className="muted text-xs">{formatDate(purchase.purchaseDate)} · {formatNumber(purchase.quantity)} credits</div>
                        </div>
                      </div>
                      <span className="bold text-sm">{formatCurrency(purchase.price)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="muted text-sm">No purchases yet.</p>
              )}
            </Card>

            <Card className="card--pad">
              <h3 className="chart-card__title" style={{ fontSize: 16 }}>Your impact</h3>
              <div className="mt-4">
                <div className="row" style={{ gap: 14 }}>
                  <span className="stat__icon" style={{ width: 52, height: 52, background: 'linear-gradient(135deg, var(--green-500), var(--teal-600))', color: '#fff', margin: 0 }}>
                    <Globe2 size={24} />
                  </span>
                  <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, color: 'var(--green-800)' }}>
                      {formatNumber(totals.retired)} tCO₂e
                    </div>
                    <div className="muted text-sm">permanently retired</div>
                  </div>
                </div>
                <div className="divider" />
                <p className="text-sm ink-soft">
                  Retiring {formatNumber(Math.max(1, totals.retired))} credit{Math.max(1, totals.retired) > 1 ? 's' : ''} keeps roughly{' '}
                  <strong>{formatNumber(Math.round(totals.retired * 24))} kg</strong> of CO₂e out of the
                  atmosphere — equivalent to the annual sequestration of about{' '}
                  <strong>{formatNumber(Math.round(totals.retired * 1.7))} mature trees</strong>.
                </p>
                <Button to="/buyer/retirements" variant="secondary" icon={Recycle} className="mt-4" style={{ marginTop: 16 }}>
                  View retirement certificates
                </Button>
              </div>
            </Card>
          </div>
        </>
      )}
    </PageTransition>
  )
}
