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
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { roleHome } from '../../utils/roles'
import Button from '../../components/ui/Button'
import { ParallaxHero } from '../../components/ui/wilderness'

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

function LandingHeader() {
  return (
    <header
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '22px clamp(16px, 4vw, 56px)',
      }}
    >
      <div className="row" style={{ color: '#fff', gap: 11 }}>
        <span className="sidebar__logo" style={{ width: 36, height: 36, borderRadius: 11 }}>
          <Leaf size={19} />
        </span>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 17, letterSpacing: '-0.01em' }}>
          CarbonTrust
          <span style={{ display: 'block', fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--on-dark-muted)', fontWeight: 700 }}>
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
      <div style={{ position: 'relative', isolation: 'isolate' }}>
        <LandingHeader />
        <ParallaxHero>
          <div className="wilderness__actions">
            <Button to={user ? roleHome(user.role) : '/register'} size="lg" icon={ArrowRight}>
              {user ? 'Go to my dashboard' : 'Join the registry'}
            </Button>
            <a className="btn btn--light btn--lg" href="#how-it-works">Explore the process</a>
          </div>
        </ParallaxHero>
      </div>

      {/* How it works */}
      <section id="how-it-works" className="landing-section landing-section--tint">
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
