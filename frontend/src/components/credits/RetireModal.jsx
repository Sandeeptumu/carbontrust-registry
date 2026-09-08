import { useMemo, useState } from 'react'
import { CheckCircle2, Recycle } from 'lucide-react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import Certificate from './Certificate'
import { Select, Input } from '../ui/Fields'
import { RETIREMENT_REASONS } from '../../utils/status'
import { formatNumber, clamp } from '../../utils/format'
import { retireCredits } from '../../api/purchases'

/**
 * purchase  : a PurchaseResponse row
 * retired   : quantity already retired for this purchase (computed by parent)
 */
export default function RetireModal({ purchase, retired = 0, open, onClose, onRetired }) {
  const [quantity, setQuantity] = useState(1)
  const [reason, setReason] = useState(RETIREMENT_REASONS[0])
  const [customReason, setCustomReason] = useState('')
  const [phase, setPhase] = useState('review') // review | processing | success
  const [successRetirement, setSuccessRetirement] = useState(null)
  const [error, setError] = useState(null)

  const remaining = Math.max(0, Number(purchase?.quantity || 0) - Number(retired || 0))
  const max = Math.floor(remaining)
  const finalReason = reason === '__custom__' ? customReason : reason

  const effectiveQuantity = useMemo(
    () => clamp(quantity, 1, Math.max(1, max)),
    [quantity, max],
  )

  const submit = async () => {
    if (effectiveQuantity < 1) return
    setError(null)
    setPhase('processing')
    try {
      const retirement = await retireCredits(purchase.purchaseId, {
        quantity: effectiveQuantity,
        reason: finalReason,
      })
      setSuccessRetirement(retirement)
      setPhase('success')
      onRetired?.(retirement)
    } catch (err) {
      setPhase('review')
      setError(err?.message || 'Retirement failed. Please try again.')
    }
  }

  const reset = () => {
    setQuantity(1)
    setReason(RETIREMENT_REASONS[0])
    setCustomReason('')
    setPhase('review')
    setSuccessRetirement(null)
    setError(null)
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={() => (phase === 'processing' ? undefined : reset())}
      title={phase === 'success' ? 'Credits retired 🌍' : 'Retire carbon credits'}
      subtitle={
        phase === 'success'
          ? 'Your climate contribution is now permanent and verifiable.'
          : `${purchase?.projectName} · ${formatNumber(remaining)} credits remaining on this purchase`
      }
      size={phase === 'success' ? 'md' : 'md'}
    >
      {phase === 'success' ? (
        <Certificate retirement={{ ...successRetirement, buyerUsername: successRetirement?.buyerUsername }} />
      ) : (
        <>
          <div
            className="card row"
            style={{ background: 'linear-gradient(135deg, var(--teal-700), var(--green-800))', color: '#fff', border: 0, padding: '16px 18px', gap: 12 }}
          >
            <span style={{ background: 'rgba(255,255,255,0.16)', width: 40, height: 40, borderRadius: 12, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
              <Recycle size={20} />
            </span>
            <div className="flex-1">
              <div className="bold" style={{ fontSize: 14 }}>{purchase?.projectName}</div>
              <div style={{ fontSize: 12.5, opacity: 0.85 }}>
                Purchased {formatNumber(purchase?.quantity)} credits · {formatNumber(remaining)} available to retire
              </div>
            </div>
          </div>

          <div className="mt-4">
            <label className="field__label" htmlFor="retire-qty">Quantity to retire</label>
            <div className="row mt-2" style={{ gap: 12 }}>
              <button type="button" className="btn btn--secondary btn--icon" onClick={() => setQuantity((q) => Math.max(1, q - 1))} disabled={quantity <= 1} aria-label="Decrease quantity">
                −
              </button>
              <input
                id="retire-qty"
                type="number"
                min={1}
                max={max}
                className="input"
                style={{ flex: 1, textAlign: 'right' }}
                value={effectiveQuantity}
                onChange={(event) => setQuantity(Number(event.target.value) || 1)}
                aria-label="Retirement quantity"
              />
              <button type="button" className="btn btn--secondary btn--icon" onClick={() => setQuantity((q) => Math.min(max, q + 1))} disabled={quantity >= max} aria-label="Increase quantity">
                +
              </button>
            </div>
            {max > 0 && (
              <button type="button" className="btn btn--ghost btn--sm mt-2" onClick={() => setQuantity(max)} style={{ color: 'var(--green-700)' }}>
                Retire all {formatNumber(max)} remaining credits
              </button>
            )}
          </div>

          <div className="mt-3">
            <Select label="Retirement reason" value={reason} onChange={(event) => setReason(event.target.value)}>
              {RETIREMENT_REASONS.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
              <option value="__custom__">Other (write your own)…</option>
            </Select>
            {reason === '__custom__' && (
              <Input
                label="Custom reason"
                value={customReason}
                onChange={(event) => setCustomReason(event.target.value)}
                placeholder="e.g. Offsetting my family's annual footprint"
                required
              />
            )}
          </div>

          {error && (
            <div className="alert alert--danger mt-3" role="alert">{error}</div>
          )}

          <div
            className="card mt-4"
            style={{ background: 'var(--surface-2)', border: 0, padding: '14px 16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}
          >
            <div><span className="muted text-sm">Retiring now</span><div className="bold">{formatNumber(effectiveQuantity)} credits</div></div>
            <div><span className="muted text-sm">After retirement</span><div className="bold">{formatNumber(Math.max(0, max - effectiveQuantity))} credits left</div></div>
          </div>

          <div className="row mt-5" style={{ justifyContent: 'flex-end' }}>
            <Button variant="secondary" onClick={reset} disabled={phase === 'processing'}>Cancel</Button>
            <Button
              onClick={submit}
              disabled={phase === 'processing' || effectiveQuantity < 1 || max < 1 || (reason === '__custom__' && !customReason.trim())}
              loading={phase === 'processing'}
              icon={CheckCircle2}
            >
              Retire {formatNumber(effectiveQuantity)} credit{effectiveQuantity > 1 ? 's' : ''}
            </Button>
          </div>
        </>
      )}
    </Modal>
  )
}
