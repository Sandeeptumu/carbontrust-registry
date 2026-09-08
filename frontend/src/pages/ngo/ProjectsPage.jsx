import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FolderKanban, MapPin, PlusCircle, ArrowUpRight, Trash2, Pencil, Ruler, CalendarDays } from 'lucide-react'
import PageTransition from '../../components/PageTransition'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import { StatusBadge } from '../../components/ui/Badge'
import EmptyState, { ErrorState } from '../../components/ui/EmptyState'
import { SkeletonList } from '../../components/ui/Loaders'
import { useAsync } from '../../hooks/useAsync'
import { useAuth } from '../../context/AuthContext'
import { listProjects, deleteProject } from '../../api/projects'
import { useToast } from '../../context/ToastContext'
import { PROJECT_STATUS, ecosystemMeta } from '../../utils/status'
import { formatNumber, formatDate } from '../../utils/format'

function ProjectCardView({ project, index, onDelete }) {
  const eco = ecosystemMeta(project.ecosystemType)
  return (
    <motion.article
      className="card card--hover"
      style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.35) }}
    >
      <Link to={`/ngo/projects/${project.projectId}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <div
          className="credit-card__visual"
          style={{
            height: 96,
            background: `linear-gradient(135deg, ${eco.color}, ${eco.color}99), radial-gradient(80% 160% at 90% 0%, rgba(255,255,255,0.25), transparent 50%)`,
            alignItems: 'flex-end',
          }}
        >
          <div className="row" style={{ gap: 8, justifyContent: 'space-between', width: '100%' }}>
            <span className="badge" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}>
              {project.projectStatus === 'VERIFIED' ? 'Verified' : eco.label}
            </span>
            <StatusBadge map={PROJECT_STATUS} value={project.projectStatus} />
          </div>
        </div>
      </Link>
      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
        <div>
          <Link to={`/ngo/projects/${project.projectId}`} style={{ textDecoration: 'none' }}>
            <h3 style={{ fontSize: 16, transition: 'color .15s' }} className="link-hover">{project.projectName}</h3>
          </Link>
          <div className="row muted text-sm" style={{ gap: 5, marginTop: 4 }}>
            <MapPin size={13} /> {project.location}
          </div>
        </div>
        <p className="muted text-sm" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', minHeight: 40 }}>
          {project.description || 'No description provided.'}
        </p>
        <div className="row row--between" style={{ borderTop: '1px solid var(--border)', paddingTop: 12, marginTop: 'auto' }}>
          <span className="row text-xs muted" style={{ gap: 4 }}><Ruler size={12} /> {formatNumber(project.area)} ha</span>
          <span className="row text-xs muted" style={{ gap: 4 }}><CalendarDays size={12} /> {formatDate(project.startDate)}</span>
        </div>
        <div className="row" style={{ gap: 8 }}>
          <Button to={`/ngo/projects/${project.projectId}`} block size="sm" variant="secondary" icon={ArrowUpRight} style={{ flex: 1 }}>
            View project
          </Button>
          <Button to={`/ngo/projects/${project.projectId}/edit`} size="sm" variant="ghost" icon={Pencil} aria-label={`Edit ${project.projectName}`} />
          <Button size="sm" variant="ghost" style={{ color: 'var(--danger)' }} icon={Trash2} aria-label={`Delete ${project.projectName}`} onClick={() => onDelete(project)} />
        </div>
      </div>
    </motion.article>
  )
}

export default function ProjectsPage() {
  const { user } = useAuth()
  const toast = useToast()
  const [deleting, setDeleting] = useState(null)
  const [deleteBusy, setDeleteBusy] = useState(false)
  const projects = useAsync(useMemo(() => () => listProjects(), []))

  const mine = useMemo(() => {
    const list = (projects.data || []).filter((p) => Number(p.ownerId) === Number(user?.userId))
    return list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
  }, [projects.data, user?.userId])

  const confirmDelete = async () => {
    if (!deleting) return
    setDeleteBusy(true)
    try {
      await deleteProject(deleting.projectId)
      toast.success(`“${deleting.projectName}” has been deleted.`, 'Project deleted')
      setDeleting(null)
      projects.run()
    } catch (err) {
      toast.error(err?.message || 'Could not delete the project.', 'Delete failed')
    } finally {
      setDeleteBusy(false)
    }
  }

  return (
    <PageTransition>
      <PageHeader
        eyebrow="NGO workspace"
        title="My projects"
        subtitle="Manage the blue carbon restoration projects registered by your organisation."
        actions={
          <Button to="/ngo/projects/new" icon={PlusCircle}>
            Register project
          </Button>
        }
      />

      {projects.loading ? (
        <SkeletonList rows={3} card />
      ) : projects.error ? (
        <Card>
          <ErrorState error={projects.error} onRetry={projects.run} />
        </Card>
      ) : mine.length === 0 ? (
        <Card>
          <EmptyState
            icon={FolderKanban}
            title="No projects yet"
            description="Register a restoration project to start the MRV, verification and carbon credit journey."
            action={
              <Button to="/ngo/projects/new" icon={PlusCircle}>
                Register your first project
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="grid grid--cards">
          {mine.map((project, index) => (
            <ProjectCardView key={project.projectId} project={project} index={index} onDelete={setDeleting} />
          ))}
        </div>
      )}

      <Modal
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        title="Delete project?"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleting(null)} disabled={deleteBusy}>Cancel</Button>
            <Button variant="danger" onClick={confirmDelete} loading={deleteBusy}>Delete permanently</Button>
          </>
        }
      >
        <p className="text-sm ink-soft">
          You&apos;re about to permanently delete <strong>“{deleting?.projectName}”</strong> along with its
          MRV submissions. This action cannot be undone.
        </p>
      </Modal>
    </PageTransition>
  )
}
