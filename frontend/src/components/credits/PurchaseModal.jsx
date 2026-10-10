import { useMemo } from 'react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import { ErrorState } from '../ui/EmptyState'
import { marketplaceProject } from '../../api/credits'
import { useAsync } from '../../hooks/useAsync'
import { formatNumber } from '../../utils/format'
export default function PurchaseModal({ batch, open, onClose }) {
  const project = useAsync(useMemo(() => () => batch?.projectId ? marketplaceProject(batch.projectId) : Promise.resolve(null), [batch?.projectId]), { immediate: Boolean(open && batch?.projectId) })
  return <Modal open={open} onClose={onClose} title="Project & credit details" subtitle={`Batch #${batch?.ccbId} · ${batch?.projectName}`}>
    <p>{formatNumber(batch?.availableQuantity)} credits available</p>
    {project.loading ? <p role="status">Loading project details…</p> : project.error ? <ErrorState error={project.error} onRetry={project.run} /> : project.data && <dl className="mt-4"><dt>Project</dt><dd>{project.data.projectName}</dd><dt>Location</dt><dd>{project.data.location}</dd><dt>Ecosystem</dt><dd>{project.data.ecosystemType}</dd>{project.data.description && <><dt>Description</dt><dd>{project.data.description}</dd></>}</dl>}
    <div className="alert alert--info mt-4" role="status">Purchasing is unavailable until registry pricing and payment processing are configured. You can browse verified projects and view your existing portfolio.</div>
    <Button variant="secondary" className="mt-4" onClick={onClose}>Close</Button>
  </Modal>
}
