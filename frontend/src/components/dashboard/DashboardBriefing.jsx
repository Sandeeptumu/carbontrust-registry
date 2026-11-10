import { ArrowRight, BookOpen, CheckCircle2, ClipboardCheck, ExternalLink, Leaf, Newspaper, ScanSearch, ShoppingCart, Sprout, UsersRound, Waves } from 'lucide-react'
import { Link } from 'react-router-dom'

const WORKSPACES = {
  buyer: {
    title: 'Build a climate portfolio with clarity',
    description: 'Choose projects, track every purchase and retire credits when you are ready to make a claim.',
    steps: [
      { icon: ShoppingCart, title: 'Explore verified projects', text: 'Compare available credit batches and the projects behind them.', to: '/buyer/marketplace', action: 'Open marketplace' },
      { icon: Leaf, title: 'Hold credits in one place', text: 'Purchases appear here with their project and transaction history.', to: '/buyer/credits', action: 'View my credits' },
      { icon: CheckCircle2, title: 'Retire with proof', text: 'Permanently retire credits and keep the registry record.', to: '/buyer/retirements', action: 'View retirements' },
    ],
  },
  ngo: {
    title: 'Move a project from fieldwork to evidence',
    description: 'Keep each restoration project complete, traceable and ready for independent review.',
    steps: [
      { icon: Sprout, title: 'Register the project', text: 'Record the location, ecosystem, area and restoration start date.', to: '/ngo/projects/new', action: 'Register project' },
      { icon: ClipboardCheck, title: 'Submit MRV evidence', text: 'Upload monitoring evidence with clear field notes and photographs.', to: '/ngo/projects', action: 'Open projects' },
      { icon: ScanSearch, title: 'Follow the review', text: 'Track verification status and resolve any feedback in your workspace.', to: '/ngo/projects', action: 'Check status' },
    ],
  },
  verifier: {
    title: 'Keep decisions evidence-led',
    description: 'Review each submission consistently and leave a clear record for the registry.',
    steps: [
      { icon: ClipboardCheck, title: 'Open the review queue', text: 'Start with submissions assigned to your verification workspace.', to: '/verifier/mrv', action: 'Review queue' },
      { icon: ScanSearch, title: 'Check field evidence', text: 'Review project details, evidence files and monitoring notes before deciding.', to: '/verifier/mrv', action: 'Open evidence' },
      { icon: BookOpen, title: 'Keep an audit trail', text: 'Your decisions and comments remain available in the registry history.', to: '/verifier/history', action: 'View history' },
    ],
  },
  admin: {
    title: 'Keep the registry healthy',
    description: 'Use the workspace to oversee access, evidence flow and activity across every role.',
    steps: [
      { icon: UsersRound, title: 'Review access', text: 'Manage roles and account status before users enter restricted workspaces.', to: '/admin/users', action: 'Manage users' },
      { icon: ClipboardCheck, title: 'Monitor evidence', text: 'Check MRV submissions and assign the right verifier for each review.', to: '/admin/mrv', action: 'Open MRV' },
      { icon: Leaf, title: 'Track credit activity', text: 'Review issued credit batches, purchase history and retirement records.', to: '/admin/credits', action: 'View credits' },
    ],
  },
}

const SOURCES = [
  { icon: Newspaper, source: 'UN Environment Programme', title: 'Environment news and stories', href: 'https://www.unep.org/news-and-stories', tone: 'green' },
  { icon: Waves, source: 'World Meteorological Organization', title: 'Climate and weather updates', href: 'https://wmo.int/news', tone: 'teal' },
  { icon: Leaf, source: 'Global Forest Watch', title: 'Forest and restoration insights', href: 'https://www.globalforestwatch.org/blog/', tone: 'earth' },
]

export default function DashboardBriefing({ role }) {
  const workspace = WORKSPACES[role]
  if (!workspace) return null

  return (
    <section className="dashboard-briefing" aria-label="Workspace guidance and climate briefing">
      <div className="dashboard-briefing__head">
        <div>
          <span className="section-title">Your workspace guide</span>
          <h2>{workspace.title}</h2>
          <p>{workspace.description}</p>
        </div>
      </div>

      <div className="dashboard-briefing__steps">
        {workspace.steps.map(({ icon: Icon, title, text, to, action }, index) => (
          <Link key={title} className="brief-step" to={to}>
            <span className="brief-step__number">0{index + 1}</span>
            <span className="brief-step__icon"><Icon size={19} /></span>
            <span className="brief-step__body">
              <strong>{title}</strong>
              <small>{text}</small>
              <em>{action} <ArrowRight size={13} /></em>
            </span>
          </Link>
        ))}
      </div>

      <div className="climate-briefing">
        <div className="climate-briefing__intro">
          <span className="section-title">Climate briefing</span>
          <h2>Stay close to the wider picture</h2>
          <p>Live updates from organisations that publish climate, ecosystem and restoration reporting.</p>
        </div>
        <div className="climate-briefing__sources">
          {SOURCES.map(({ icon: Icon, source, title, href, tone }) => (
            <a key={source} className={`brief-source brief-source--${tone}`} href={href} target="_blank" rel="noreferrer">
              <span className="brief-source__icon"><Icon size={18} /></span>
              <span>
                <small>{source}</small>
                <strong>{title}</strong>
              </span>
              <ExternalLink size={15} aria-hidden="true" />
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
