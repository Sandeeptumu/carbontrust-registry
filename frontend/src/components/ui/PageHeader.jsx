import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'

export default function PageHeader({ title, subtitle, actions, backTo, eyebrow }) {
  return (
    <motion.div
      className="page-head"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div>
        {eyebrow && <div className="section-title mb-2">{eyebrow}</div>}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {backTo && (
            <Link
              to={backTo}
              className="icon-btn"
              aria-label="Go back"
              style={{ border: '1px solid var(--border)', background: 'var(--surface)' }}
            >
              <ArrowLeft size={18} />
            </Link>
          )}
          <h1 className="page-head__title">{title}</h1>
        </div>
        {subtitle && <p className="page-head__sub">{subtitle}</p>}
      </div>
      {actions && <div className="page-head__actions">{actions}</div>}
    </motion.div>
  )
}
