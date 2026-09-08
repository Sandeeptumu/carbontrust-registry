import { useMemo, useState } from 'react'
import { Search, ShoppingCart } from 'lucide-react'
import PageTransition from '../../components/PageTransition'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import { StatusBadge } from '../../components/ui/Badge'
import EmptyState, { ErrorState } from '../../components/ui/EmptyState'
import { SkeletonList } from '../../components/ui/Loaders'
import { useAsync } from '../../hooks/useAsync'
import { adminPurchases } from '../../api/admin'
import { PAYMENT_STATUS } from '../../utils/status'
import { formatCurrency, formatNumber, formatDate } from '../../utils/format'

export default function AdminPurchasesPage() {
  const [query, setQuery] = useState('')
  const { data, loading, error, run } = useAsync(useMemo(() => () => adminPurchases(), []))

  const rows = useMemo(() => {
    let list = data || []
    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter(
        (p) =>
          (p.buyerUsername || '').toLowerCase().includes(q) ||
          (p.projectName || '').toLowerCase().includes(q) ||
          (p.paymentMethod || '').toLowerCase().includes(q),
      )
    }
    return [...list].sort((a, b) => new Date(b.purchaseDate) - new Date(a.purchaseDate))
  }, [data, query])

  const totals = useMemo(() => {
    let revenue = 0
    let credits = 0
    for (const p of data || []) {
      revenue += Number(p.price || 0)
      credits += Number(p.quantity || 0)
    }
    return { revenue, credits, count: data?.length || 0 }
  }, [data])

  return (
    <PageTransition>
      <PageHeader
        eyebrow="Administration"
        title="Purchase & transaction history"
        subtitle="Every carbon credit purchase recorded on the registry."
        actions={
          <span className="badge badge--green" style={{ fontSize: 12.5, padding: '9px 14px' }}>
            <ShoppingCart size={14} /> {formatCurrency(totals.revenue)} · {formatNumber(totals.credits)} credits
          </span>
        }
      />

      <Card style={{ padding: '14px 18px', marginBottom: 18 }}>
        <div className="row" style={{ position: 'relative' }}>
          <Search size={17} style={{ position: 'absolute', left: 12, color: 'var(--muted)' }} aria-hidden="true" />
          <input
            className="input"
            style={{ paddingLeft: 38, maxWidth: 420 }}
            placeholder="Search buyer, project or payment method…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label="Search purchases"
          />
        </div>
      </Card>

      {loading ? (
        <SkeletonList rows={5} />
      ) : error ? (
        <Card><ErrorState error={error} onRetry={run} /></Card>
      ) : rows.length === 0 ? (
        <Card>
          <EmptyState
            icon={ShoppingCart}
            title="No purchases yet"
            description="Buyer transactions will appear here as credits are purchased from the marketplace."
          />
        </Card>
      ) : (
        <Card className="table-wrap" style={{ overflow: 'hidden' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Transaction</th>
                <th>Buyer</th>
                <th>Project</th>
                <th>Credits</th>
                <th>Amount</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((purchase) => (
                <tr key={purchase.purchaseId}>
                  <td><span className="mono text-sm bold">TX-{String(purchase.purchaseId).padStart(5, '0')}</span></td>
                  <td className="bold text-sm">{purchase.buyerUsername}</td>
                  <td className="text-sm">{purchase.projectName}</td>
                  <td>{formatNumber(purchase.quantity)}</td>
                  <td className="bold nowrap">{formatCurrency(purchase.price)}</td>
                  <td className="text-sm">{purchase.paymentMethod?.toLowerCase().replace(/_/g, ' ')}</td>
                  <td><StatusBadge map={PAYMENT_STATUS} value={purchase.paymentStatus} /></td>
                  <td className="muted nowrap text-sm">{formatDate(purchase.purchaseDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </PageTransition>
  )
}
