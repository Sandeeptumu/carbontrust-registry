import { useMemo, useState } from 'react'
import { Search, Layers } from 'lucide-react'
import PageTransition from '../../components/PageTransition'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import { StatusBadge } from '../../components/ui/Badge'
import EmptyState, { ErrorState } from '../../components/ui/EmptyState'
import { SkeletonList } from '../../components/ui/Loaders'
import { useAsync } from '../../hooks/useAsync'
import Button from '../../components/ui/Button'
import { Input, Select } from '../../components/ui/Fields'
import { issueCredits } from '../../api/credits'
import { adminCredits, adminProjects } from '../../api/admin'
import { BATCH_STATUS } from '../../utils/status'
import { formatNumber, formatDate } from '../../utils/format'

function IssueCredits({ onIssued }) {
  const projects = useAsync(useMemo(() => adminProjects, []))
  const [projectId, setProjectId] = useState('')
  const [quantity, setQuantity] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const submit = async event => {
    event.preventDefault()
    if (busy) return
    if (!projectId || !Number.isFinite(Number(quantity)) || Number(quantity) <= 0) { setError('Choose a verified project and enter a positive quantity.'); return }
    setBusy(true); setError(''); setSuccess('')
    try {
      const batch = await issueCredits(Number(projectId), Number(quantity))
      setSuccess(`Batch ${batch.ccbId ? '#' + batch.ccbId : ''} issued successfully.`)
      setQuantity('')
      await onIssued()
    } catch (err) { setError(err.message || 'Issuance failed. Please try again.') }
    finally { setBusy(false) }
  }
  return <Card className="card--pad mb-4"><h2>Issue verified credits</h2><p className="muted text-sm mb-4">Enter the quantity supported by the verified evidence. The registry does not estimate carbon quantities or set prices.</p>
    {projects.error ? <ErrorState error={projects.error} onRetry={projects.run} /> : <form onSubmit={submit}>
      <div className="row row--wrap" style={{ alignItems: 'start' }}><Select label="Verified project" value={projectId} onChange={e => setProjectId(e.target.value)} required disabled={busy || projects.loading}><option value="">Choose project</option>{(projects.data || []).filter(p => p.projectStatus === 'VERIFIED').map(p => <option value={p.projectId} key={p.projectId}>{p.projectName} · #{p.projectId}</option>)}</Select>
      <Input label="Verified quantity (tCO₂e)" type="number" min="0.001" step="any" required value={quantity} onChange={e => setQuantity(e.target.value)} disabled={busy} /></div>
      {error && <div className="alert alert--danger mb-4" role="alert">{error}</div>}{success && <div className="alert alert--success mb-4" role="status">{success}</div>}
      <Button type="submit" loading={busy} disabled={!projectId || !quantity}>Issue credits</Button>
    </form>}
  </Card>
}

export default function AdminCreditsPage() {
  const [query, setQuery] = useState('')
  const { data, loading, error, run } = useAsync(useMemo(() => () => adminCredits(), []))

  const rows = useMemo(() => {
    let list = data || []
    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter(
        (b) => (b.projectName || '').toLowerCase().includes(q) || String(b.ccbId).includes(q),
      )
    }
    return [...list].sort((a, b) => new Date(b.issuedDate) - new Date(a.issuedDate))
  }, [data, query])

  const totals = useMemo(() => {
    let issued = 0
    let available = 0
    for (const b of data || []) {
      issued += Number(b.originalQuantity || 0)
      available += Number(b.availableQuantity || 0)
    }
    return { issued, available, sold: issued - available, count: data?.length || 0 }
  }, [data])

  return (
    <PageTransition>
      <PageHeader
        eyebrow="Administration"
        title="Carbon credit batches"
        subtitle="Every issued credit batch across all verified projects."
        actions={
          <span className="badge badge--green" style={{ fontSize: 12.5, padding: '9px 14px' }}>
            <Layers size={14} /> {formatNumber(totals.issued)} issued · {formatNumber(totals.available)} available
          </span>
        }
      />

      <IssueCredits onIssued={run} />
      <Card style={{ padding: '14px 18px', marginBottom: 18 }}>
        <div className="row" style={{ position: 'relative' }}>
          <Search size={17} style={{ position: 'absolute', left: 12, color: 'var(--muted)' }} aria-hidden="true" />
          <input
            className="input"
            style={{ paddingLeft: 38, maxWidth: 420 }}
            placeholder="Search by project or batch number…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label="Search batches"
          />
        </div>
      </Card>

      {loading ? (
        <SkeletonList rows={5} />
      ) : error ? (
        <Card><ErrorState error={error} onRetry={run} /></Card>
      ) : rows.length === 0 ? (
        <Card>
          <EmptyState
            icon={Layers}
            title="No credit batches issued"
            description="Batches are created once a project is verified. They will appear here."
          />
        </Card>
      ) : (
        <Card className="table-wrap" style={{ overflow: 'hidden' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Batch</th>
                <th>Project</th>
                <th>Issued</th>
                <th>Available</th>
                <th>Sold</th>
                <th>Status</th>
                <th>Issued on</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((batch) => {
                const issued = Number(batch.originalQuantity || 0)
                const available = Number(batch.availableQuantity || 0)
                const sold = issued - available
                const pct = issued ? Math.min(100, (sold / issued) * 100) : 0
                return (
                  <tr key={batch.ccbId}>
                    <td><span className="mono text-sm bold">BATCH-{batch.ccbId}</span></td>
                    <td className="bold text-sm">{batch.projectName}</td>
                    <td>{formatNumber(issued)}</td>
                    <td>
                      <div className="bold text-sm">{formatNumber(available)}</div>
                      <div style={{ width: 90, height: 5, background: 'var(--surface-sunken)', borderRadius: 99, marginTop: 5, overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', background: 'var(--green-500)', borderRadius: 99 }} />
                      </div>
                    </td>
                    <td className="muted text-sm">{formatNumber(sold)}</td>
                    <td><StatusBadge map={BATCH_STATUS} value={batch.status} /></td>
                    <td className="muted nowrap text-sm">{formatDate(batch.issuedDate)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </Card>
      )}
    </PageTransition>
  )
}
