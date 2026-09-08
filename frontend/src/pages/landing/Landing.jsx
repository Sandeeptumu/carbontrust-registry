import { motion } from 'framer-motion'
import {
  Leaf,
  ArrowRight,
  ShieldCheck,
  FileCheck2,
  Layers,
  ShoppingCart,
  Recycle,
  Trees,
  Waves,
  Sprout,
  Users,
  Globe2,
  TrendingUp,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { roleHome } from '../../utils/roles'
import Button from '../../components/ui/Button'

const fadeUp = {
  hidden: { opacity: 0, y: 26 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] },
  }),
}

function HeroScene() {
  return (
    <svg
      viewBox="0 0 1200 400"
      preserveAspectRatio="xMidYMax slice"
      role="img"
      aria-label="Illustration of a blue carbon coastline with mangroves, seagrass and wind turbines"
      style={{ width: '100%', display: 'block' }}
    >
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0a3324" />
          <stop offset="1" stopColor="#11523a" />
        </linearGradient>
        <linearGradient id="water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0f5f47" />
          <stop offset="1" stopColor="#0b4a37" />
        </linearGradient>
        <radialGradient id="sun" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fef3c7" stopOpacity="0.9" />
          <stop offset="1" stopColor="#fef3c7" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="sandGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1a6a4c" />
          <stop offset="1" stopColor="#14563e" />
        </linearGradient>
      </defs>

      {/* Sky */}
      <rect width="1200" height="400" fill="url(#sky)" />

      {/* Sun glow */}
      <circle cx="980" cy="120" r="220" fill="url(#sun)" />
      <circle cx="980" cy="120" r="34" fill="#fde68a" opacity="0.9">
        <animate attributeName="r" values="32;36;32" dur="5s" repeatCount="indefinite" />
      </circle>

      {/* Distant hills */}
      <path d="M0 210 Q 150 160 300 200 T 620 195 T 900 205 T 1200 180 L 1200 400 L 0 400 Z" fill="#0d4632" opacity="0.8" />
      <path d="M0 245 Q 220 205 440 235 T 900 230 T 1200 245 L 1200 400 L 0 400 Z" fill="#115238" opacity="0.95" />

      {/* Coastline */}
      <path d="M0 300 Q 200 268 380 288 T 760 282 T 1200 296 L 1200 400 L 0 400 Z" fill="url(#sandGrad)" />

      {/* Water */}
      <path d="M0 330 Q 240 310 480 326 T 960 320 T 1200 332 L 1200 400 L 0 400 Z" fill="url(#water)" opacity="0.92" />

      {/* Seagrass / seaweed strokes */}
      {[60, 130, 260, 420, 560, 700, 850, 990, 1120].map((x, i) => (
        <g key={i} opacity="0.5">
          <path d={`M${x} 400 q 6 -14 -4 -24 q -2 12 4 24`} fill="none" stroke="#6cd6a1" strokeWidth="2.4" strokeLinecap="round" />
          <path d={`M${x + 14} 400 q 8 -20 -2 -34 q -4 16 2 34`} fill="none" stroke="#34d399" strokeWidth="2" strokeLinecap="round" />
        </g>
      ))}

      {/* Mangrove silhouettes */}
      <g fill="#082d1f">
        {[
          { x: 40, s: 1 },
          { x: 150, s: 1.3 },
          { x: 300, s: 0.9 },
          { x: 430, s: 1.2 },
          { x: 760, s: 1.1 },
          { x: 900, s: 0.85 },
          { x: 1030, s: 1.35 },
          { x: 1130, s: 0.95 },
        ].map(({ x, s }, i) => (
          <g key={i} transform={`translate(${x} 300) scale(${s})`}>
            <path d="M0 0 L-16 34 Q-4 26 0 40 Q4 26 16 34 Z" />
            <path d="M-4 18 L-30 30 Q-12 30 -4 34" />
            <path d="M4 16 L26 30 Q10 30 4 32" />
            <rect x="-3" y="22" width="6" height="16" rx="3" />
          </g>
        ))}
      </g>

      {/* Wind turbines */}
      {[
        { x: 620, h: 190 },
        { x: 700, h: 150 },
        { x: 780, h: 210 },
      ].map(({ x, h }, i) => {
        const top = 400 - h
        return (
          <g key={i}>
            <line x1={x} y1={400} x2={x} y2={top} stroke="#cbd5cf" strokeWidth="6" strokeLinecap="round" opacity="0.9" />
            <g transform={`translate(${x} ${top})`}>
              <circle r="6" fill="#e2e8e6" />
              <g stroke="#dfe8e3" strokeWidth="4" strokeLinecap="round" fill="none">
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  from="0 0 0"
                  to="360 0 0"
                  dur={`${9 + i * 2}s`}
                  repeatCount="indefinite"
                />
                <line x1="0" y1="0" x2="0" y2="-52" />
                <line x1="0" y1="0" x2="45" y2="26" />
                <line x1="0" y1="0" x2="-45" y2="26" />
              </g>
              <circle r="4.5" fill="#f1f5f2" />
            </g>
          </g>
        )
      })}

      {/* Drifting particles */}
      <g fill="#b8e6cd" opacity="0.8">
        <circle cx="200" cy="90" r="3">
          <animate attributeName="cy" values="90;150;90" dur="9s" repeatCount="indefinite" />
          <animate attributeName="cx" values="200;260;200" dur="9s" repeatCount="indefinite" />
        </circle>
        <circle cx="420" cy="150" r="2.4">
          <animate attributeName="cy" values="150;90;150" dur="7s" repeatCount="indefinite" />
          <animate attributeName="cx" values="420;380;420" dur="7s" repeatCount="indefinite" />
        </circle>
        <circle cx="860" cy="70" r="2.8">
          <animate attributeName="cy" values="70;130;70" dur="11s" repeatCount="indefinite" />
        </circle>
      </g>
    </svg>
  )
}

const WORKFLOW = [
  { icon: Leaf, title: 'Register projects', text: 'NGOs register blue carbon restoration projects — mangroves, seagrass and salt marshes.' },
  { icon: FileCheck2, title: 'Submit MRV evidence', text: 'Measurement, reporting & verification data is uploaded for each restoration site.' },
  { icon: ShieldCheck, title: 'Independent verification', text: 'Certified verifiers review the evidence and approve or reject with full transparency.' },
  { icon: Layers, title: 'Credits are issued', text: 'Verified projects receive a carbon credit batch, tracked immutably on the registry.' },
  { icon: ShoppingCart, title: 'Buyers purchase', text: 'Organisations and individuals buy verified credits from the marketplace.' },
  { icon: Recycle, title: 'Retire with proof', text: 'Credits are retired permanently with a certificate for your climate claims.' },
]

const ECOSYSTEMS = [
  { icon: Trees, name: 'Mangrove forests', text: 'Among the most carbon-rich forests in the tropics, guarding coastlines and biodiversity.' },
  { icon: Waves, name: 'Seagrass meadows', text: 'Oceans’ hidden meadows that capture and store carbon for centuries.' },
  { icon: Sprout, name: 'Salt marshes', text: 'Coastal wetlands that buffer storms and lock away carbon in their soils.' },
]

const STATS = [
  { icon: Globe2, value: '3', suffix: '', label: 'blue carbon ecosystems' },
  { icon: ShieldCheck, value: '100', suffix: '%', label: 'verification transparency' },
  { icon: TrendingUp, value: '10', suffix: ' tCO₂e', label: 'per verified credit' },
]

function LandingHeader() {
  return (
    <header
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 5,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '22px 40px',
      }}
    >
      <div className="row" style={{ color: '#fff', gap: 11 }}>
        <span className="sidebar__logo" style={{ width: 36, height: 36, borderRadius: 11 }}>
          <Leaf size={19} />
        </span>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 17, letterSpacing: '-0.01em' }}>
          CarbonTrust
          <span style={{ display: 'block', fontSize: 9.5, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--on-dark-muted)', fontWeight: 700 }}>
            Registry
          </span>
        </span>
      </div>
      <nav className="row" aria-label="Public navigation">
        <Button to="/login" variant="light" size="sm">
          Sign in
        </Button>
        <Button to="/register" variant="primary" size="sm">
          Get started
        </Button>
      </nav>
    </header>
  )
}

export default function Landing() {
  const { user } = useAuth()

  return (
    <div className="landing">
      <section className="landing__hero">
        <LandingHeader />

        <div className="landing__hero-inner">
          <div style={{ paddingTop: 90 }}>
            <motion.span className="landing__eyebrow" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
              <span className="badge__dot" style={{ background: 'var(--green-400)' }} />
              Trusted registry for blue carbon
            </motion.span>
            <motion.h1 className="landing__title mt-4" variants={fadeUp} initial="hidden" animate="show" custom={0}>
              Turn coastal restoration into <em>verified carbon credits</em>
            </motion.h1>
            <motion.p className="landing__lead" variants={fadeUp} initial="hidden" animate="show" custom={1}>
              CarbonTrust connects NGOs, verifiers, administrators and buyers in one transparent
              workflow — from registering a mangrove project to retiring verified credits with a
              certificate you can stand behind.
            </motion.p>
            <motion.div className="landing__cta" variants={fadeUp} initial="hidden" animate="show" custom={2}>
              {user ? (
                <Button to={roleHome(user.role)} variant="primary" size="lg" icon={ArrowRight}>
                  Go to my dashboard
                </Button>
              ) : (
                <>
                  <Button to="/register" variant="primary" size="lg" icon={ArrowRight}>
                    Create an account
                  </Button>
                  <Button to="/login" variant="light" size="lg">
                    Sign in
                  </Button>
                </>
              )}
            </motion.div>

            <motion.div
              className="row row--wrap mt-6"
              style={{ gap: 30 }}
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={3}
            >
              {STATS.map((stat) => (
                <div className="row" key={stat.label} style={{ gap: 10 }}>
                  <span style={{ color: 'var(--green-300)' }}>
                    <stat.icon size={20} />
                  </span>
                  <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, color: '#fff', lineHeight: 1.1 }}>
                      {stat.value}
                      {stat.suffix}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--on-dark-muted)' }}>{stat.label}</div>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          <motion.div
            className="landing__scene"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <HeroScene />
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section className="landing-section landing-section--tint" style={{ marginTop: -40, position: 'relative' }}>
        <div style={{ padding: '14px 0 6px' }}>
          <h2 className="landing-section__title">One transparent carbon lifecycle</h2>
          <p className="landing-section__lead">
            Every credit on CarbonTrust can be traced from a restoration site to its final retirement.
          </p>
          <div className="grid grid--cards mt-6">
            {WORKFLOW.map(({ icon: Icon, title, text }, index) => (
              <motion.div
                key={title}
                className="card card--pad feature-card card--hover"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.45, delay: (index % 3) * 0.08 }}
              >
                <span className="stat__icon" style={{ background: 'var(--green-100)', color: 'var(--green-700)' }}>
                  <Icon size={21} />
                </span>
                <h3>{title}</h3>
                <p className="muted text-sm">{text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Ecosystems */}
      <section className="landing-section">
        <h2 className="landing-section__title">Restoring the coast’s greatest carbon sinks</h2>
        <p className="landing-section__lead">
          Blue carbon ecosystems store carbon up to 40× faster than tropical forests.
        </p>
        <div className="grid grid--cards mt-6">
          {ECOSYSTEMS.map(({ icon: Icon, name, text }, index) => (
            <motion.div
              key={name}
              className="card card--pad feature-card card--hover"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.45, delay: index * 0.1 }}
            >
              <span className="stat__icon" style={{ background: 'var(--teal-100)', color: 'var(--teal-700)' }}>
                <Icon size={21} />
              </span>
              <h3>{name}</h3>
              <p className="muted text-sm">{text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Audience */}
      <section className="landing-section landing-section--tint">
        <h2 className="landing-section__title">Built for every stakeholder</h2>
        <div className="grid grid--2 mt-6" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))' }}>
          {[
            { icon: Leaf, name: 'NGOs', text: 'Register projects, upload MRV and track status at every step.' },
            { icon: ShieldCheck, name: 'Verifiers', text: 'A clear review queue with approval and rejection workflows.' },
            { icon: Users, name: 'Administrators', text: 'Platform-wide oversight with analytics and management.' },
            { icon: ShoppingCart, name: 'Buyers', text: 'A premium marketplace to purchase and retire verified credits.' },
          ].map(({ icon: Icon, name, text }, index) => (
            <motion.div
              key={name}
              className="card card--pad feature-card card--hover"
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
            >
              <Icon size={22} style={{ color: 'var(--green-600)' }} />
              <h3 className="mt-3">{name}</h3>
              <p className="muted text-sm">{text}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-6" style={{ textAlign: 'center' }}>
          {user ? (
            <Button to={roleHome(user.role)} variant="primary" size="lg">
              Open my dashboard <ArrowRight size={17} />
            </Button>
          ) : (
            <Button to="/register" variant="primary" size="lg">
              Join the registry <ArrowRight size={17} />
            </Button>
          )}
        </div>
      </section>

      <footer className="landing__foot">
        <div className="row" style={{ gap: 10, color: 'var(--ink-soft)' }}>
          <Leaf size={16} style={{ color: 'var(--green-600)' }} />
          <span style={{ fontWeight: 800, color: 'var(--ink)' }}>CarbonTrust Registry</span>
        </div>
        <div>
          © {new Date().getFullYear()} CarbonTrust · Blue carbon · MRV · Verified carbon credits
        </div>
      </footer>
    </div>
  )
}
