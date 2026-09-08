import { Link } from 'react-router-dom'
import { Compass } from 'lucide-react'
import PageTransition from '../../components/PageTransition'

export default function NotFoundPage() {
  return (
    <PageTransition>
      <div className="empty" style={{ minHeight: '60vh' }}>
        <div className="empty__icon" style={{ background: 'var(--sand-100)', color: 'var(--earth-700)' }}>
          <Compass size={28} />
        </div>
        <h4 className="empty__title">Page not found</h4>
        <p className="empty__desc">
          The page you&apos;re looking for doesn&apos;t exist or may have moved.
        </p>
        <div className="empty__action">
          <Link to="/" className="btn btn--primary">
            Back to home
          </Link>
        </div>
      </div>
    </PageTransition>
  )
}
