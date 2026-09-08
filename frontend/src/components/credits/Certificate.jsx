import { Leaf, Award, Printer, Globe2 } from 'lucide-react'
import { formatDate, formatNumber } from '../../utils/format'

/**
 * Premium certificate shown after a successful retirement.
 * `className="print-area"` lets the print stylesheet isolate it.
 */
export default function Certificate({ retirement }) {
  const serial =
    retirement.serialNumber ||
    `CT-${String(retirement.retirementId || '').padStart(4, '0')}`

  return (
    <div className="certificate print-area">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <div className="row" style={{ gap: 10 }}>
          <span className="sidebar__logo" style={{ width: 40, height: 40, borderRadius: 11 }}>
            <Leaf size={20} />
          </span>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 15, color: 'var(--ink)' }}>
              CarbonTrust Registry
            </div>
            <div className="text-xs muted" style={{ letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Verified carbon credit retirement
            </div>
          </div>
        </div>
        <span className="badge badge--green">
          <Award size={12} /> Permanent
        </span>
      </div>

      <div style={{ textAlign: 'center', padding: '18px 0 6px' }}>
        <div className="text-xs muted" style={{ letterSpacing: '0.14em', textTransform: 'uppercase' }}>
          This certifies that
        </div>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, color: 'var(--green-800)', margin: '6px 0 2px' }}>
          {retirement.buyerUsername || 'CarbonTrust member'}
        </div>
        <div className="text-xs muted">has permanently retired</div>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 34, color: 'var(--ink)', margin: '6px 0' }}>
          {formatNumber(retirement.quantity)} <span style={{ fontSize: 17, color: 'var(--muted)' }}>verified carbon credits</span>
        </div>
        <div className="text-sm ink-soft" style={{ fontWeight: 600 }}>
          from the project “{retirement.projectName}”
        </div>
      </div>

      <div className="row row--between row--wrap" style={{ marginTop: 18, padding: '14px 16px', background: 'var(--surface-sunken)', borderRadius: 12, gap: 10 }}>
        <div>
          <div className="text-xs muted" style={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}>Serial number</div>
          <div className="mono bold">{serial}</div>
        </div>
        <div>
          <div className="text-xs muted" style={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}>Retirement date</div>
          <div className="bold">{formatDate(retirement.retirementDate)}</div>
        </div>
        <div>
          <div className="text-xs muted" style={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}>Reason</div>
          <div className="bold" style={{ maxWidth: 220 }}>{retirement.reason || 'Voluntary offset'}</div>
        </div>
      </div>

      <div className="row mt-4" style={{ gap: 8, justifyContent: 'center' }}>
        <Globe2 size={15} style={{ color: 'var(--green-600)' }} />
        <span className="text-xs muted">
          1 verified credit = 1 tonne of CO₂e kept out of the atmosphere, tracked on the CarbonTrust registry.
        </span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 20 }}>
        <button
          type="button"
          className="btn btn--secondary btn--sm no-print"
          onClick={() => window.print()}
        >
          <Printer size={15} /> Print / save certificate
        </button>
      </div>
    </div>
  )
}
