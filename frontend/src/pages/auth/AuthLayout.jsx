import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Leaf, ShieldCheck, FileCheck2, ShoppingCart } from 'lucide-react'

const FEATURES = [
  { icon: FileCheck2, title: 'Transparent MRV', text: 'Evidence-based verification you can audit.' },
  { icon: ShieldCheck, title: 'Verifier-approved', text: 'Only independently verified credits are listed.' },
  { icon: ShoppingCart, title: 'Retirement-ready', text: 'Buy credits and retire them with a certificate.' },
]

export default function AuthLayout({ children }) {
  return (
    <div className="auth-wrap">
      <aside className="auth-aside">
        <Link to="/" className="row" style={{ gap: 11, color: '#fff', textDecoration: 'none', width: 'fit-content' }}>
          <span className="sidebar__logo" style={{ width: 38, height: 38, borderRadius: 11 }}>
            <Leaf size={20} />
          </span>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 17 }}>
            CarbonTrust
            <span style={{ display: 'block', fontSize: 9.5, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--on-dark-muted)', fontWeight: 700 }}>
              Registry
            </span>
          </span>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          style={{ margin: 'auto 0' }}
        >
          <h2 style={{ color: '#fff', fontSize: 34, maxWidth: 460, lineHeight: 1.15 }}>
            Where coastal restoration becomes <span style={{ color: 'var(--green-300)' }}>verified climate impact</span>
          </h2>
          <p style={{ color: 'var(--on-dark-muted)', marginTop: 16, maxWidth: 430, fontSize: 15 }}>
            The end-to-end registry for blue carbon projects — mangroves, seagrass and salt marshes —
            from MRV submission to credit retirement.
          </p>
          <div className="col mt-6" style={{ gap: 20, maxWidth: 400 }}>
            {FEATURES.map(({ icon: Icon, title, text }, index) => (
              <motion.div
                key={title}
                className="row"
                style={{ gap: 14, alignItems: 'flex-start' }}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 + index * 0.15, duration: 0.5 }}
              >
                <span className="stat__icon" style={{ background: 'rgba(47,191,116,0.16)', color: 'var(--green-300)', marginBottom: 0 }}>
                  <Icon size={18} />
                </span>
                <div>
                  <div style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>{title}</div>
                  <div style={{ color: 'var(--on-dark-muted)', fontSize: 13 }}>{text}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <div style={{ fontSize: 12, color: 'rgba(169,195,179,0.6)' }}>
          © {new Date().getFullYear()} CarbonTrust Registry
        </div>
      </aside>
      <main className="auth-main">{children}</main>
    </div>
  )
}
