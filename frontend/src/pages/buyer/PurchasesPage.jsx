import { useMemo, useState } from 'react'
import { Wallet, Recycle, CreditCard, Landmark, ArrowRight } from 'lucide-react'
import PageTransition from '../../components/PageTransition'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import EmptyState, { ErrorState } from '../../components/ui/EmptyState'
import { SkeletonList } from '../../components/ui/Loaders'
import { StatusBadge } from '../../components/ui/Badge'
import { useAsync } from '../../hooks/useAsync'
import { myPurchases, myRetirements } from '../../api/purchases'
import { PAYMENT_STATUS } from '../../utils/status'
import RetireModal from '../../components/credits/RetireModal'
import { formatCurrency, formatNumber, formatDate } from '../../utils/format'

const METHOD_ICONS = {
  CARD: CreditCard,
  BANK_TRANSFER: Landmark,
  WALLET: Wallet,
}

export default function PurchasesPage() {
  const [retiring, setRetiring] = useState(null)
  const purchases = useAsync(useMemo(() => () => myPurchases(), []))
  const retirements = useAsync(useMemo(() => () => myRetirements(), []))

  const loading = purchases.loading || retirements.loading
  const error = purchases.error || retirements.error

  const retiredByPurchase = useMemo(() => {
    const map = new Map()
    for (const r of retirements.data || []) {
      map.set(r.purchaseId, (map.get(r.purchaseId) || 0) + Number(r.quantity || 0))
    }
    return map
  }, [retirements.data])

  const rows = useMemo(() => {
    const list = [...(purchases.data || [])].sort((a, b) => new Date(b.purchaseDate) - new Date(a.purchaseDate))
    return list.map((purchase) => {
      const retired = retiredByPurchase.get(purchase.purchaseId) || 0
      return { ...purchase, retired, remaining: Math.max(0, Number(purchase.quantity) - retired) }
    })
  }, [purchases.data, retiredByPurchase])

  const totals = useMemo(() => {
    const held = rows.reduce((sum, r) => sum + r.remaining, 0)
    const spent = rows.reduce((sum, r) => sum + Number(r.price || 0), 0)
    return { held, spent, count: rows.length }
  }, [rows])

  const refresh = () => {
    purchases.run()
    retirements.run()
  }

  return (
    <PageTransition>
      <PageHeader
        eyebrow="Buyer portfolio"
        title="My credits"
        subtitle="Every verified credit you've purchased, and how many remain available to retire."
        actions={
          <Button to="/buyer/marketplace" variant="secondary" icon={ArrowRight}>
            Buy more credits
          </Button>
        }
      />

      {loading ? (
        <SkeletonList rows={4} card />
      ) : error ? (
        <Card>
          <ErrorState error={error} onRetry={refresh} />
        </Card>
      ) : rows.length === 0 ? (
        <Card>
          <EmptyState
            icon={Wallet}
            title="No credits purchased yet"
            description="Explore the marketplace to buy your first verified blue carbon credits."
            action={
              <Button to="/buyer/marketplace">
                Browse the marketplace
              </Button>
            }
          />
        </Card>
      ) : (
        <>
          <div className="grid grid--stats" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))' }}>
            <Card pad className="row" style={{ gap: 14 }}>
              <span className="stat__icon" style={{ background: 'var(--success-bg)', color: 'var(--success)', margin: 0 }}>
                <Wallet size={20} />
              </span>
              <div>
                <div className="stat__label">Credits held</div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 24 }}>{formatNumber(totals.held)}</div>
              </div>
            </Card>
            <Card pad className="row" style={{ gap: 14 }}>
              <span className="stat__icon" style={{ background: 'var(--violet-bg)', color: 'var(--violet)', margin: 0 }}>
                <Recycle size={20} />
              </span>
              <div>
                <div className="stat__label">Retired</div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 24 }}>
                  {formatNumber(rows.reduce((sum, r) => sum + r.retired, 0))}
                </div>
              </div>
            </Card>
            <Card pad className="row" style={{ gap: 14 }}>
              <span className="stat__icon" style={{ background: 'var(--teal-100)', color: 'var(--teal-700)', margin: 0 }}>
                <Landmark size={20} />
              </span>
              <div>
                <div className="stat__label">Total invested</div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 24 }}>{formatCurrency(totals.spent)}</div>
              </div>
            </Card>
          </div>

          <Card className="table-wrap mt-4" style={{ overflow: 'hidden' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Project</th>
                  <th>Credits</th>
                  <th>Amount</th>
                  <th>Payment</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((purchase) => {
                  const MethodIcon = METHOD_ICONS[purchase.paymentMethod] || CreditCard
                  return (
                    <tr key={purchase.purchaseId}>
                      <td>
                        <div className="bold text-sm">{purchase.projectName}</div>
                        <div className="muted text-xs">Batch #{purchase.ccbId} · {formatNumber(purchase.quantity)} tCO₂e</div>
                      </td>
                      <td className="nowrap">
                        <div className="bold text-sm">{formatNumber(purchase.remaining)}</div>
                        <div className="muted text-xs">{purchase.retired > 0 ? `${formatNumber(purchase.retired)} retired` : 'available to retire'}</div>
                      </td>
                      <td className="bold nowrap">{formatCurrency(purchase.price)}</td>
                      <td>
                        <div className="row" style={{ gap: 6 }}>
                          <MethodIcon size={14} className="muted" />
                          <span className="text-sm">{purchase.paymentMethod?.toLowerCase().replace(/_/g, ' ')}</span>
                        </div>
                      </td>
                      <td className="muted nowrap text-sm">{formatDate(purchase.purchaseDate)}</td>
                      <td><StatusBadge map={PAYMENT_STATUS} value={purchase.paymentStatus} /></td>
                      <td style={{ textAlign: 'right' }}>
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={Recycle}
                          disabled={purchase.remaining < 1 || purchase.paymentStatus !== 'COMPLETED'}
                          onClick={() => setRetiring(purchase)}
                          title={purchase.remaining < 1 ? 'All credits on this purchase are already retired' : 'Retire credits'}
                        >
                          Retire
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </Card>
        </>
      )}

      {retiring && (
        <RetireModal
          purchase={retiring}
          retired={retiring.retired}
          open={Boolean(retiring)}
          onClose={() => setRetiring(null)}
          onRetired={refresh}
        />
      )}
    </PageTransition>
  )
}
