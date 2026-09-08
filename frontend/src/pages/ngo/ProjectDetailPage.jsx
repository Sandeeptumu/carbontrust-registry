import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  MapPin,
  Ruler,
  CalendarDays,
  FileCheck2,
  Layers,
  Pencil,
  Trash2,
  History,
  Sprout,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  PackagePlus,
} from 'lucide-react'
import PageTransition from '../../components/PageTransition'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import Tabs from '../../components/ui/Tabs'
import { StatusBadge } from '../../components/ui/Badge'
import EmptyState, { ErrorState } from '../../components/ui/EmptyState'
import { Input } from '../../components/ui/Fields'
import { SkeletonList } from '../../components/ui/Loaders'
import { useAsync } from '../../hooks/useAsync'
import { useToast } from '../../context/ToastContext'
import { useAuth } from '../../context/AuthContext'
import { getProject, deleteProject } from '../../api/projects'
import { listProjectMRV } from '../../api/mrv'
import { projectCredits, issueCredits } from '../../api/credits'
import { PROJECT_STATUS, MRV_STATUS, BATCH_STATUS, ecosystemMeta } from '../../utils/status'
import { formatNumber, formatDate, formatDateTime } from '../../utils/format'

const STATUS_ICON = {
  DRAFT: Clock,
  VERIFIED: ShieldCheck,
  REJECTED: XCircle,
  PENDING: Clock,
}

export default function ProjectDetailPage() {
  const { projectId } = useParams()
  const { user } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  const project = useAsync(useMemo(() => () => getProject(projectId), [projectId]))
  const mrv = useAsync(useMemo(() => () => listProjectMRV(projectId), [projectId]))
  const credits = useAsync(useMemo(() => () => projectCredits(projectId), [projectId]))

  const [tab, setTab] = useState('mrv')
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [issueOpen, setIssueOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [issueQty, setIssueQty] = useState('')

  const data = project.data
  const loading = project.loading
  const error = project.error

  const isOwner = data && Number(data.ownerId) === Number(user?.userId)
  const isVerified = data?.projectStatus === 'VERIFIED'

  const confirmDelete = async () => {
    setBusy(true)
    try {
      await deleteProject(projectId)
      toast.success(`“${data.projectName}” deleted.`, 'Project deleted')
      navigate('/ngo/projects')
    } catch (err) {
      toast.error(err?.message || 'Could not delete the project.', 'Delete failed')
      setBusy(false)
    }
  }

  const confirmIssue = async () => {
    const qty = Number(issueQty)
    if (!qty || qty <= 0) return
    setBusy(true)
    try {
      await issueCredits(projectId, qty)
      toast.success(`Issued ${formatNumber(qty)} credits — now live for buyers.`, 'Carbon credits issued')
      setIssueOpen(false)
      setIssueQty('')
      credits.run()
    } catch (err) {
      toast.error(err?.message || 'Could not issue credits.', 'Issuance failed')
    } finally {
      setBusy(false)
    }
  }

  const eco = data ? ecosystemMeta(data.ecosystemType) : null
  const StatusIcon = STATUS_ICON[data?.projectStatus] || Clock

  const timeline = useMemo(() => {
    const events = []
    if (data) {
      events.push({
        id: 'created',
        icon: Sprout,
        title: 'Project registered',
        meta: `${formatDateTime(data.createdAt)} · status: ${data.projectStatus}`,
      })
    }
    for (const submission of mrv.data || []) {
      events.push({
        id: `mrv-${submission.mrvId}`,
        icon: FileCheck2,
        title: `MRV submission #${submission.mrvId} · ${submission.mrvStatus}`,
        meta: `${formatDateTime(submission.uploadDate)} · ${submission.photoVerification ? 'photo evidence included' : 'no photo evidence'}`,
      })
    }
    for (const batch of credits.data || []) {
      events.push({
        id: `batch-${batch.ccbId}`,
        icon: Layers,
        title: `Credit batch #${batch.ccbId} issued (${formatNumber(batch.originalQuantity)} tCO₂e)`,
        meta: `${formatDateTime(batch.issuedDate)} · ${formatNumber(batch.availableQuantity)} available`,
      })
    }
    return events.sort((a, b) => b.meta.localeCompare(a.meta))
  }, [data, mrv.data, credits.data])

  if (loading) {
    return <PageTransition><SkeletonList rows={3} card /></PageTransition>
  }

  if (error) {
    return (
      <PageTransition>
        <Card><ErrorState error={error} onRetry={project.run} /></Card>
      </PageTransition>
    )
  }

  return (
    <PageTransition>
      <PageHeader
        backTo="/ngo/projects"
        eyebrow="NGO workspace"
        title={data.projectName}
        subtitle={data.description}
        actions={
          <>
            {isOwner && (
              <>
                <Button to={`/ngo/projects/${projectId}/edit`} variant="secondary" icon={Pencil}>Edit</Button>
                <Button to={`/ngo/projects/${projectId}/mrv/new`} icon={FileCheck2}>Submit MRV</Button>
                <Button variant="ghost" style={{ color: 'var(--danger)' }} icon={Trash2} onClick={() => setDeleteOpen(true)} aria-label="Delete project" />
              </>
            )}
          </>
        }
      />

      <div className="grid grid--2" style={{ gridTemplateColumns: 'minmax(0,1fr) 340px', alignItems: 'start' }}>
        <div style={{ display: 'grid', gap: 18 }}>
          {/* Visual */}
          <Card style={{ overflow: 'hidden' }}>
            <div
              style={{
                height: 130,
                background: `linear-gradient(120deg, ${eco?.color || '#12593b'}, ${eco?.color || '#12593b'}99), radial-gradient(70% 160% at 90% 0%, rgba(255,255,255,0.28), transparent 55%)`,
                padding: 22,
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <span className="badge" style={{ background: 'rgba(255,255,255,0.22)', color: '#fff', fontSize: 12 }}>
                  {eco?.label}
                </span>
              </div>
              <StatusBadge map={PROJECT_STATUS} value={data.projectStatus} />
            </div>
            <div className="row row--between row--wrap" style={{ padding: '16px 20px', gap: 10 }}>
              <div className="row" style={{ gap: 14 }}>
                <span className="stat__icon" style={{ margin: 0, background: 'var(--green-100)', color: 'var(--green-700)' }}>
                  <StatusIcon size={20} />
                </span>
                <div>
                  <div className="bold">{data.projectStatus === 'VERIFIED' ? 'Verified & credit-ready' : data.projectStatus === 'REJECTED' ? 'Verification rejected' : 'Awaiting verification'}</div>
                  <div className="muted text-sm">
                    {isVerified
                      ? 'This project can now issue carbon credit batches for the marketplace.'
                      : 'Submit MRV evidence to request independent verification.'}
                  </div>
                </div>
              </div>
              {isVerified && isOwner && (
                <Button icon={PackagePlus} onClick={() => setIssueOpen(true)}>Issue credits</Button>
              )}
            </div>
          </Card>

          <Card className="card--pad">
            <Tabs
              ariaLabel="Project sections"
              tabs={[
                { value: 'mrv', label: 'MRV submissions', count: (mrv.data || []).length },
                { value: 'credits', label: 'Carbon credits', count: (credits.data || []).length },
                { value: 'activity', label: 'Activity' },
              ]}
              value={tab}
              onChange={setTab}
            />

            <div className="mt-5">
              {tab === 'mrv' && (
                mrv.loading ? <SkeletonList rows={2} /> : mrv.data?.length ? (
                  <div className="col" style={{ gap: 12 }}>
                    {mrv.data.map((submission) => (
                      <Card key={submission.mrvId} style={{ padding: '16px 18px' }} className="row row--between row--wrap">
                        <div className="row" style={{ gap: 12 }}>
                          <span className="stat__icon" style={{ width: 42, height: 42, margin: 0, background: submission.mrvStatus === 'APPROVED' ? 'var(--success-bg)' : submission.mrvStatus === 'REJECTED' ? 'var(--danger-bg)' : 'var(--warning-bg)', color: submission.mrvStatus === 'APPROVED' ? 'var(--success)' : submission.mrvStatus === 'REJECTED' ? 'var(--danger)' : 'var(--warning)' }}>
                            <FileCheck2 size={19} />
                          </span>
                          <div>
                            <div className="bold text-sm">MRV submission #{submission.mrvId}</div>
                            <div className="muted text-xs mt-1">
                              {formatDateTime(submission.uploadDate)} · {submission.photoVerification ? 'Photo evidence attached' : 'Desk-based evidence'}
                            </div>
                            {submission.remarks && <div className="text-sm ink-soft mt-2">{submission.remarks}</div>}
                          </div>
                        </div>
                        <StatusBadge map={MRV_STATUS} value={submission.mrvStatus} />
                      </Card>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={FileCheck2}
                    title="No MRV submissions yet"
                    description="Upload measurement, reporting & verification evidence to move this project into the verifier queue."
                    action={<Button to={`/ngo/projects/${projectId}/mrv/new`} icon={FileCheck2}>Submit MRV evidence</Button>}
                  />
                )
              )}

              {tab === 'credits' && (
                credits.loading ? <SkeletonList rows={2} /> : credits.data?.length ? (
                  <div className="col" style={{ gap: 12 }}>
                    {credits.data.map((batch) => (
                      <Card key={batch.ccbId} style={{ padding: '16px 18px' }} className="row row--between row--wrap">
                        <div className="row" style={{ gap: 12 }}>
                          <span className="stat__icon" style={{ width: 42, height: 42, margin: 0, background: 'var(--violet-bg)', color: 'var(--violet)' }}>
                            <Layers size={19} />
                          </span>
                          <div>
                            <div className="bold text-sm">Batch #{batch.ccbId} · {formatNumber(batch.originalQuantity)} tCO₂e issued</div>
                            <div className="muted text-xs mt-1">{formatDateTime(batch.issuedDate)} · {formatNumber(batch.availableQuantity)} still available</div>
                          </div>
                        </div>
                        <StatusBadge map={BATCH_STATUS} value={batch.status} />
                      </Card>
                    ))}
                  </div>
                ) : isVerified ? (
                  <EmptyState
                    icon={Layers}
                    title="No credits issued yet"
                    description="Your project is verified — issue a carbon credit batch to list it on the buyer marketplace."
                    action={<Button icon={PackagePlus} onClick={() => setIssueOpen(true)}>Issue credits</Button>}
                  />
                ) : (
                  <EmptyState
                    icon={ShieldCheck}
                    title="Verification required first"
                    description="Carbon credits can only be issued once this project has been approved by a verifier."
                  />
                )
              )}

              {tab === 'activity' && (
                <div className="timeline">
                  {timeline.length === 0 ? (
                    <p className="muted text-sm">No activity recorded yet.</p>
                  ) : (
                    timeline.map((event) => (
                      <div key={event.id} className="timeline__item">
                        <span className="timeline__dot" style={{ background: 'var(--green-100)', color: 'var(--green-700)' }}>
                          <event.icon size={11} />
                        </span>
                        <div className="timeline__title">{event.title}</div>
                        <div className="timeline__meta">{event.meta}</div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div style={{ display: 'grid', gap: 18 }}>
          <Card pad>
            <div className="section-title mb-4">Project details</div>
            <div className="kv">
              <span className="kv__k row" style={{ gap: 6 }}><Sprout size={13} /> Ecosystem</span>
              <span className="kv__v">{eco?.label}</span>
              <span className="kv__k row" style={{ gap: 6 }}><MapPin size={13} /> Location</span>
              <span className="kv__v">{data.location}</span>
              <span className="kv__k row" style={{ gap: 6 }}><Ruler size={13} /> Area</span>
              <span className="kv__v">{formatNumber(data.area)} hectares</span>
              <span className="kv__k row" style={{ gap: 6 }}><CalendarDays size={13} /> Start date</span>
              <span className="kv__v">{formatDate(data.startDate)}</span>
              <span className="kv__k row" style={{ gap: 6 }}><History size={13} /> Updated</span>
              <span className="kv__v">{formatDate(data.updatedAt || data.createdAt)}</span>
            </div>
            <div className="divider" />
            <div className="row row--between">
              <span className="text-sm muted">Registry ID</span>
              <span className="mono text-sm bold">#PRJ-{String(data.projectId).padStart(4, '0')}</span>
            </div>
          </Card>

          <Card pad>
            <div className="section-title mb-4">Verification status</div>
            <div className="col" style={{ gap: 14 }}>
              <div className="row" style={{ gap: 10 }}>
                <StatusBadge map={PROJECT_STATUS} value={data.projectStatus} />
                <span className="text-sm muted">as of {formatDate(new Date().toISOString())}</span>
              </div>
              <div style={{ display: 'grid', gap: 6 }}>
                {['DRAFT', 'VERIFIED', 'REJECTED'].map((state) => {
                  const active = data.projectStatus === state
                  const Icon = active ? CheckCircle2 : state === 'DRAFT' ? Clock : state === 'REJECTED' ? XCircle : ShieldCheck
                  return (
                    <div key={state} className="row" style={{ gap: 10, opacity: active ? 1 : 0.55 }}>
                      <Icon size={15} style={{ color: active ? 'var(--green-600)' : 'var(--muted)' }} />
                      <span className="text-sm" style={{ fontWeight: active ? 700 : 500, color: active ? 'var(--ink)' : 'var(--muted)' }}>
                        {PROJECT_STATUS[state]?.label}
                      </span>
                      {active && <span className="badge badge--green" style={{ marginLeft: 'auto' }}>Current</span>}
                    </div>
                  )
                })}
              </div>
              <p className="text-xs muted" style={{ lineHeight: 1.6 }}>
                DRAFT projects need an MRV submission to enter review. VERIFIED projects can issue
                carbon credits. REJECTED projects require a revised MRV submission.
              </p>
            </div>
          </Card>

          <Card pad style={{ background: 'linear-gradient(135deg, var(--green-900), var(--teal-700))', border: 0 }}>
            <div className="bold" style={{ color: '#fff', fontSize: 15 }}>Need a hand?</div>
            <p className="text-sm mt-2" style={{ color: 'rgba(255,255,255,0.8)' }}>
              Follow the project lifecycle guide or contact platform support for MRV guidance.
            </p>
            <Link to="/ngo/projects" className="btn btn--light btn--sm mt-3" style={{ width: 'fit-content' }}>
              Back to projects
            </Link>
          </Card>
        </div>
      </div>

      {/* Delete modal */}
      <Modal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete project?"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteOpen(false)} disabled={busy}>Cancel</Button>
            <Button variant="danger" onClick={confirmDelete} loading={busy}>Delete permanently</Button>
          </>
        }
      >
        <p className="text-sm ink-soft">
          This permanently removes <strong>{data.projectName}</strong> and its MRV submissions from the registry.
        </p>
      </Modal>

      {/* Issue credits modal */}
      <Modal
        open={issueOpen}
        onClose={() => setIssueOpen(false)}
        title="Issue carbon credit batch"
        subtitle={`${data.projectName} · 1 credit = 1 tCO₂e`}
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIssueOpen(false)} disabled={busy}>Cancel</Button>
            <Button onClick={confirmIssue} loading={busy} icon={Layers}>Issue batch</Button>
          </>
        }
      >
        <Input
          label="Credit quantity"
          type="number"
          min="1"
          step="any"
          value={issueQty}
          onChange={(event) => setIssueQty(event.target.value)}
          hint="The batch is listed on the buyer marketplace at $10.00 per credit once issued."
          placeholder="e.g. 5000"
        />
      </Modal>
    </PageTransition>
  )
}
