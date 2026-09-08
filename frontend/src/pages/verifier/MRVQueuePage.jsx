import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { ClipboardList, MapPin, ShieldCheck, XCircle, FileCheck2, CheckCircle2, Clock, MessageSquareText } from 'lucide-react'
import PageTransition from '../../components/PageTransition'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import Tabs from '../../components/ui/Tabs'
import { Textarea } from '../../components/ui/Fields'
import { StatusBadge } from '../../components/ui/Badge'
import EmptyState, { ErrorState } from '../../components/ui/EmptyState'
import { SkeletonList } from '../../components/ui/Loaders'
import { useAsync } from '../../hooks/useAsync'
import { useToast } from '../../context/ToastContext'
import { verifierSubmissions, verifyMRV } from '../../api/mrv'
import { MRV_STATUS, PROJECT_STATUS, ecosystemMeta } from '../../utils/status'
import EcosystemGlyph from '../../components/EcosystemGlyph'
import { formatDateTime } from '../../utils/format'

const FILTERS = [
  { value: 'PENDING', label: 'Awaiting review' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
]

function ReviewModal({ submission, onClose, onDecided }) {
  const toast = useToast()
  const [decision, setDecision] = useState('')
  const [comments, setComments] = useState('')
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  const eco = submission ? ecosystemMeta(submission.ecosystemType) : null

  const submitDecision = async () => {
    setError(null)
    if (!decision) {
      setError('Choose APPROVED or REJECTED to continue.')
      return
    }
    if (decision === 'REJECTED' && !comments.trim()) {
      setError('A rejection must include comments explaining the reason.')
      return
    }
    setBusy(true)
    try {
      await verifyMRV(submission.mrvId, {
        verificationStatus: decision,
        comments: comments.trim(),
      })
      toast.success(
        decision === 'APPROVED'
          ? `MRV #${submission.mrvId} approved — the project is now verified.`
          : `MRV #${submission.mrvId} rejected with feedback.`,
        'Decision recorded',
      )
      onDecided()
    } catch (err) {
      setError(err?.message || 'Could not record your decision.')
      setBusy(false)
    }
  }

  return (
    <Modal
      open={Boolean(submission)}
      onClose={() => !busy && onClose()}
      title={`Review MRV submission #${submission?.mrvId}`}
      subtitle="Assess the evidence carefully — your decision becomes part of the permanent registry record."
      size="lg"
    >
      {submission && (
        <div className="grid grid--2" style={{ gridTemplateColumns: '1.15fr 1fr', alignItems: 'start' }}>
          <div>
            <div className="card" style={{ background: 'var(--surface-2)', border: 0, padding: 16 }}>
              <div className="row" style={{ gap: 12 }}>
                <span className="stat__icon" style={{ width: 46, height: 46, margin: 0, background: eco?.color, color: '#fff' }}>
                  <EcosystemGlyph ecosystem={submission.ecosystemType} size={20} />
                </span>
                <div className="flex-1">
                  <div className="bold" style={{ fontSize: 15 }}>{submission.projectName}</div>
                  <div className="row muted text-sm" style={{ gap: 5, marginTop: 2 }}>
                    <MapPin size={12} /> {submission.location} · {eco?.label}
                  </div>
                  <div className="row text-xs muted mt-2" style={{ gap: 6 }}>
                    by <strong className="ink-soft">{submission.ownerUsername}</strong> · {formatDateTime(submission.uploadDate)}
                  </div>
                </div>
                <StatusBadge map={PROJECT_STATUS} value={submission.projectStatus} />
              </div>
              <div className="divider" />
              <div className="row row--between">
                <span className="text-sm muted">Evidence quality</span>
                <span className="badge badge--green">
                  <FileCheck2 size={12} /> {submission.photoVerification ? 'Photo / spatial evidence included' : 'Desk-based evidence'}
                </span>
              </div>
            </div>

            <div className="card mt-3" style={{ padding: '16px 18px' }}>
              <div className="section-title mb-3">Verifier remarks</div>
              <p className="text-sm ink-soft" style={{ lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                {submission.remarks || 'No remarks were provided by the NGO.'}
              </p>
            </div>
          </div>

          <div>
            <span className="field__label">Your decision</span>
            <div className="row mt-2" style={{ gap: 10 }}>
              <button
                type="button"
                className={`btn btn--sm ${decision === 'APPROVED' ? 'btn--primary' : 'btn--secondary'}`}
                style={{ flex: 1 }}
                onClick={() => { setDecision('APPROVED'); setError(null) }}
              >
                <CheckCircle2 size={15} /> Approve
              </button>
              <button
                type="button"
                className={`btn btn--sm ${decision === 'REJECTED' ? 'btn--danger' : 'btn--secondary'}`}
                style={{ flex: 1, background: decision === 'REJECTED' ? undefined : undefined }}
                onClick={() => { setDecision('REJECTED'); setError(null) }}
              >
                <XCircle size={15} /> Reject
              </button>
            </div>

            <div className="mt-4">
              <Textarea
                label={decision === 'REJECTED' ? 'Comments (required for rejection)' : 'Verification comments (optional)'}
                rows={5}
                value={comments}
                onChange={(event) => setComments(event.target.value)}
                placeholder={decision === 'REJECTED'
                  ? 'Explain what evidence is missing or why the submission cannot be approved…'
                  : 'Add context to your approval for the registry record…'}
              />
            </div>

            {error && (
              <div className="alert alert--danger mt-2" role="alert">
                <MessageSquareText size={15} /> {error}
              </div>
            )}

            <div className="card mt-4" style={{ background: decision === 'APPROVED' ? 'var(--success-bg)' : decision === 'REJECTED' ? 'var(--danger-bg)' : 'var(--surface-sunken)', border: 0, padding: '13px 15px' }}>
              <p className="text-sm" style={{ color: decision === 'APPROVED' ? 'var(--success)' : decision === 'REJECTED' ? 'var(--danger)' : 'var(--ink-soft)', fontWeight: 600 }}>
                {decision === 'APPROVED'
                  ? 'Approving verifies the project and unlocks carbon credit issuance.'
                  : decision === 'REJECTED'
                    ? 'Rejecting returns the submission to the NGO with your comments.'
                    : 'Select Approve or Reject above to record your decision.'}
              </p>
            </div>

            <Button block className="mt-4" size="lg" onClick={submitDecision} loading={busy} icon={decision === 'APPROVED' ? ShieldCheck : decision === 'REJECTED' ? XCircle : ClipboardList}>
              {busy ? 'Recording…' : `Record ${decision || 'decision'}`}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  )
}

export default function MRVQueuePage() {
  const [filter, setFilter] = useState('PENDING')
  const [reviewing, setReviewing] = useState(null)
  const { data, loading, error, run } = useAsync(useMemo(() => () => verifierSubmissions(), []))

  const rows = useMemo(() => {
    const list = (data || []).filter((s) => s.mrvStatus === filter)
    return list.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate))
  }, [data, filter])

  const counts = useMemo(() => {
    const map = { PENDING: 0, APPROVED: 0, REJECTED: 0 }
    for (const s of data || []) map[s.mrvStatus] = (map[s.mrvStatus] || 0) + 1
    return map
  }, [data])

  const refetch = () => {
    setReviewing(null)
    run()
  }

  return (
    <PageTransition>
      <PageHeader
        eyebrow="Verifier workspace"
        title="MRV review queue"
        subtitle="Pending submissions appear first. Open a submission to review the evidence and record your decision."
      />

      <Tabs
        ariaLabel="Filter MRV queue"
        tabs={FILTERS.map((item) => ({ ...item, count: counts[item.value] || 0 }))}
        value={filter}
        onChange={setFilter}
      />

      <div className="mt-4">
        {loading ? (
          <SkeletonList rows={4} card />
        ) : error ? (
          <Card><ErrorState error={error} onRetry={run} /></Card>
        ) : rows.length === 0 ? (
          <Card>
            <EmptyState
              icon={filter === 'PENDING' ? Clock : CheckCircle2}
              title={filter === 'PENDING' ? 'Queue is clear' : `No ${filter.toLowerCase()} submissions`}
              description={
                filter === 'PENDING'
                  ? 'New MRV submissions from NGOs will appear here as they are uploaded.'
                  : 'Submissions you have reviewed under this status will be listed here.'
              }
            />
          </Card>
        ) : (
          <div className="col" style={{ gap: 12 }}>
            {rows.map((submission, index) => (
              <motion.div
                key={submission.mrvId}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.3) }}
              >
                <Card className="row row--between row--wrap card--hover" style={{ padding: '16px 18px', gap: 12 }}>
                  <div className="row" style={{ gap: 12, minWidth: 0 }}>
                    <span className="stat__icon" style={{ width: 44, height: 44, margin: 0, background: 'var(--surface-sunken)' }}>
                      <EcosystemGlyph ecosystem={submission.ecosystemType} size={20} />
                    </span>
                    <div style={{ minWidth: 0 }}>
                      <div className="row" style={{ gap: 10 }}>
                        <span className="bold text-sm">MRV #{submission.mrvId}</span>
                        <StatusBadge map={MRV_STATUS} value={submission.mrvStatus} />
                      </div>
                      <div className="bold" style={{ fontSize: 15, marginTop: 2 }}>{submission.projectName}</div>
                      <div className="row muted text-xs" style={{ gap: 8, marginTop: 2, flexWrap: 'wrap' }}>
                        <span className="row" style={{ gap: 4 }}><MapPin size={11} /> {submission.location}</span>
                        <span>· by {submission.ownerUsername}</span>
                        <span>· {formatDateTime(submission.uploadDate)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="row" style={{ gap: 10 }}>
                    {submission.photoVerification && (
                      <span className="badge badge--blue hide-mobile"><FileCheck2 size={12} /> evidence attached</span>
                    )}
                    <Button size="sm" icon={ClipboardList} onClick={() => setReviewing(submission)}>
                      {filter === 'PENDING' ? 'Review' : 'View'}
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <ReviewModal
        submission={reviewing}
        onClose={() => setReviewing(null)}
        onDecided={refetch}
      />
    </PageTransition>
  )
}
