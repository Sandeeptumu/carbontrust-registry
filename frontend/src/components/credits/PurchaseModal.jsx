import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, CreditCard, Landmark, Wallet, Minus, Plus, MapPin } from 'lucide-react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import { ecosystemMeta } from '../../utils/status'
import EcosystemGlyph from '../EcosystemGlyph'
import { formatCurrency, formatNumber, clamp } from '../../utils/format'
import { purchaseCredits } from '../../api/purchases'

const PAYMENT_METHODS = [
  { value: 'CARD', label: 'Credit / debit card', icon: CreditCard },
  { value: 'BANK_TRANSFER', label: 'Bank transfer', icon: Landmark },
  { value: 'WALLET', label: 'Carbon wallet', icon: Wallet },
]

export default function PurchaseModal({ batch, open, onClose, onPurchased }) {
  const [quantity, setQuantity] = useState(1)
  const [method, setMethod] = useState('CARD')
  const [phase, setPhase] = useState('review') // review | processing | success
  const [error, setError] = useState(null)

  const max = Math.floor(Number(batch?.availableQuantity || 0))
  const price = useMemo(
    () => quantity * Number(batch?.pricePerCredit || 0),
    [quantity, batch],
  )
  const eco = ecosystemMeta(batch?.ecosystemType)

  const startPurchase = async () => {
    if (quantity < 1 || quantity > max) return
    setError(null)
    setPhase('processing')
    try {
      const purchase = await purchaseCredits(batch.ccbId, {
        quantity,
        paymentMethod: method,
      })
      setPhase('success')
      onPurchased?.(purchase)
    } catch (err) {
      setPhase('review')
      setError(err?.message || 'Purchase failed. Please try again.')
    }
  }

  const adjust = (delta) =>
    setQuantity((current) => clamp(current + delta, 1, Math.max(1, max)))

  const reset = () => {
    setQuantity(1)
    setMethod('CARD')
    setPhase('review')
    setError(null)
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={() => (phase === 'processing' ? undefined : reset())}
      title={phase === 'success' ? 'Purchase complete' : 'Purchase carbon credits'}
      subtitle={
        phase === 'success'
          ? 'Thank you for supporting verified climate action.'
          : `Batch #${batch?.ccbId} · ${batch?.projectName}`
      }
      size="md"
    >
      {phase === 'success' ? (
        <div style={{ textAlign: 'center', padding: '12px 0 18px' }}>
          <motion.div
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.1 }}
            style={{ width: 84, height: 84, borderRadius: '50%', background: 'var(--success-bg)', color: 'var(--success)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <CheckCircle2 size={44} strokeWidth={2} />
          </motion.div>
          <h3 style={{ fontSize: 21, marginTop: 16 }}>
            You now own {formatNumber(quantity)} verified credit{quantity > 1 ? 's' : ''} 🌱
          </h3>
          <p className="muted" style={{ fontSize: 13.5, marginTop: 8, maxWidth: 380, marginInline: 'auto' }}>
            They&apos;ve been added to your portfolio. You can retire them anytime to offset
            emissions and receive a certificate.
          </p>
          <div
            className="card"
            style={{ maxWidth: 360, margin: '18px auto 0', background: 'var(--surface-2)', border: 0, padding: '16px 18px', display: 'grid', gap: 8, textAlign: 'left' }}
          >
            <div className="row row--between"><span className="muted text-sm">Project</span><span className="bold text-sm">{batch?.projectName}</span></div>
            <div className="row row--between"><span className="muted text-sm">Credits</span><span className="bold text-sm">{formatNumber(quantity)} tCO₂e</span></div>
            <div className="row row--between"><span className="muted text-sm">Amount paid</span><span className="bold text-sm">{formatCurrency(price)}</span></div>
            <div className="row row--between"><span className="muted text-sm">Payment</span><span className="bold text-sm">{PAYMENT_METHODS.find((m) => m.value === method)?.label}</span></div>
          </div>
          <div className="row" style={{ justifyContent: 'center', marginTop: 22 }}>
            <Button variant="primary" to="/buyer/credits">
              View my credits
            </Button>
            <Button variant="secondary" onClick={reset}>Keep browsing</Button>
          </div>
        </div>
      ) : (
        <>
          <div className="card" style={{ background: 'var(--surface-2)', border: 0, padding: 16 }}>
            <div className="row" style={{ gap: 12 }}>
              <EcosystemGlyph ecosystem={batch?.ecosystemType} size={24} />
              <div className="flex-1">
                <div className="bold" style={{ fontSize: 14.5 }}>{batch?.projectName}</div>
                <div className="row muted text-sm" style={{ gap: 5, marginTop: 2 }}>
                  <MapPin size={12} /> {batch?.location} · {eco.label}
                </div>
              </div>
              <div className="text-right">
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 16, color: 'var(--green-700)' }}>
                  {formatCurrency(batch?.pricePerCredit)}
                </div>
                <div className="muted text-xs">per credit</div>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <label className="field__label" htmlFor="qty">Quantity to purchase</label>
            <div className="row mt-2" style={{ gap: 12 }}>
              <button type="button" className="btn btn--secondary btn--icon" onClick={() => adjust(-1)} aria-label="Decrease quantity" disabled={quantity <= 1}>
                <Minus size={16} />
              </button>
              <div style={{ flex: 1 }}>
                <input
                  id="qty"
                  type="number"
                  className="input"
                  min={1}
                  max={max}
                  value={quantity}
                  onChange={(event) => setQuantity(clamp(Number(event.target.value) || 1, 1, Math.max(1, max)))}
                  aria-label="Quantity"
                />
              </div>
              <button type="button" className="btn btn--secondary btn--icon" onClick={() => adjust(1)} aria-label="Increase quantity" disabled={quantity >= max}>
                <Plus size={16} />
              </button>
            </div>
            <div className="muted text-xs mt-2">
              {formatNumber(max)} credits available · each credit = 1 tonne CO₂e
            </div>
          </div>

          <div className="mt-4">
            <span className="field__label">Payment method</span>
            <div className="col mt-2" style={{ gap: 8 }}>
              {PAYMENT_METHODS.map(({ value, label, icon: Icon }) => (
                <label
                  key={value}
                  className="card row"
                  style={{
                    padding: '12px 14px',
                    cursor: 'pointer',
                    borderColor: method === value ? 'var(--green-500)' : 'var(--border)',
                    boxShadow: method === value ? 'var(--ring)' : undefined,
                    transition: 'border-color .15s, box-shadow .15s',
                  }}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={value}
                    checked={method === value}
                    onChange={() => setMethod(value)}
                    style={{ accentColor: 'var(--green-600)' }}
                  />
                  <Icon size={17} style={{ color: 'var(--green-700)' }} />
                  <span style={{ fontSize: 13.5, fontWeight: 600 }}>{label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="card mt-4" style={{ background: 'linear-gradient(135deg, var(--green-900), var(--teal-700))', color: '#fff', padding: '16px 18px' }}>
            <div className="row row--between"><span style={{ color: 'rgba(255,255,255,0.8)' }}>Subtotal ({formatNumber(quantity)} × {formatCurrency(batch?.pricePerCredit)})</span><span>{formatCurrency(price)}</span></div>
            <div className="row row--between mt-2"><span style={{ color: 'rgba(255,255,255,0.8)' }}>Registry fee</span><span>{formatCurrency(0)}</span></div>
            <div className="divider" style={{ background: 'rgba(255,255,255,0.18)', margin: '12px 0' }} />
            <div className="row row--between"><span className="bold" style={{ fontSize: 16 }}>Total</span><span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20 }}>{formatCurrency(price)}</span></div>
          </div>

          {error && (
            <div className="alert alert--danger mt-4" role="alert">
              {error}
            </div>
          )}

          <div className="row mt-5" style={{ justifyContent: 'flex-end' }}>
            <Button variant="secondary" onClick={reset} disabled={phase === 'processing'}>
              Cancel
            </Button>
            <Button onClick={startPurchase} disabled={phase === 'processing' || quantity < 1 || quantity > max} loading={phase === 'processing'}>
              {phase === 'processing' ? 'Processing payment…' : 'Confirm purchase'}
            </Button>
          </div>
        </>
      )}
    </Modal>
  )
}
