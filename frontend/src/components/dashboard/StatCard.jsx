import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, ArrowUpRight } from 'lucide-react'
import { useCountUp } from '../../hooks/useCountUp'

const ICON_BG = {
  green: 'var(--success-bg)',
  teal: 'var(--teal-100)',
  amber: 'var(--warning-bg)',
  red: 'var(--danger-bg)',
  blue: 'var(--info-bg)',
  violet: 'var(--violet-bg)',
}

const ICON_COLOR = {
  green: 'var(--success)',
  teal: 'var(--teal-700)',
  amber: 'var(--warning)',
  red: 'var(--danger)',
  blue: 'var(--info)',
  violet: 'var(--violet)',
}

const GLOW = {
  green: 'var(--green-400)',
  teal: 'var(--teal-600)',
  amber: '#f59e0b',
  red: 'var(--danger)',
  blue: '#38bdf8',
  violet: '#a78bfa',
}

const defaultFormat = (value) => Math.round(value).toLocaleString()

export default function StatCard({
  icon: Icon,
  label,
  value,
  format,
  tone = 'green',
  sub,
  trend,
  trendUp = true,
  delay = 0,
  link,
}) {
  const isNumber = typeof value === 'number'
  const animated = useCountUp(isNumber ? value : 0, { delay })
  const fmt = format || defaultFormat

  return (
    <motion.div
      className="card stat card--hover"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="stat__glow" style={{ background: GLOW[tone] || GLOW.green }} />
      <div
        className="stat__icon"
        style={{ background: ICON_BG[tone] || ICON_BG.green, color: ICON_COLOR[tone] || ICON_COLOR.green }}
      >
        <Icon size={20} strokeWidth={2} />
      </div>
      <span className="stat__label">{label}</span>
      <span className="stat__value">
        {isNumber ? fmt(animated) : value}
      </span>
      {(sub || trend) && (
        <div className="stat__foot">
          {trend && (
            <span className={trendUp ? 'stat__trend-up' : 'stat__trend-down'}>
              {trendUp ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
              {trend}
            </span>
          )}
          {sub && <span>{sub}</span>}
        </div>
      )}
      {link && (
        <span
          className="icon-btn"
          style={{ position: 'absolute', right: 14, top: 14, color: 'var(--muted)' }}
          aria-hidden="true"
        >
          <ArrowUpRight size={16} />
        </span>
      )}
    </motion.div>
  )
}
