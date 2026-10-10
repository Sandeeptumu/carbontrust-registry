import { useMemo, useState } from 'react'
import { adminMRV, adminUsers, assignMRV } from '../../api/admin'
import { useAsync } from '../../hooks/useAsync'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import { ErrorState } from '../../components/ui/EmptyState'
function Assignment({ row, verifiers, onSaved }) {
  const [verifier, setVerifier] = useState(row.assignedVerifierId || '')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const save = async e => {
    e.preventDefault(); if (busy || !verifier) return
    setBusy(true); setError(''); setSuccess(false)
    try { await assignMRV(row.mrvId, Number(verifier)); await onSaved(); setSuccess(true) }
    catch (err) { setError(err.message) } finally { setBusy(false) }
  }
  return <form onSubmit={save}><div className="row row--wrap"><select className="input" style={{ minWidth: 180 }} aria-label={`Verifier for submission ${row.mrvId}`} value={verifier} onChange={e => setVerifier(e.target.value)} disabled={busy || row.mrvStatus !== 'PENDING'}><option value="">Choose verifier</option>{verifiers.map(v => <option key={v.userId} value={v.userId}>{v.username} · {v.email}</option>)}</select><Button type="submit" size="sm" loading={busy} disabled={!verifier || row.mrvStatus !== 'PENDING'}>Assign</Button></div>{error && <p className="field__error" role="alert">{error}</p>}{success && <p role="status">Assignment saved.</p>}</form>
}
export default function AdminMRVPage() {
  const result = useAsync(useMemo(() => async () => { const [submissions, users] = await Promise.all([adminMRV(), adminUsers()]); return { submissions, users } }, []))
  const verifiers = (result.data?.users || []).filter(u => u.role === 'VERIFIER' && u.accountStatus === 'ACTIVE')
  return <><PageHeader eyebrow="Administration" title="MRV assignments" subtitle="Assign pending evidence submissions to an active verifier." />
    {result.error ? <ErrorState error={result.error} onRetry={result.run} /> : result.loading && !result.data ? <p role="status">Loading submissions…</p> : <Card className="table-wrap" style={{ overflowX: 'auto' }}>{!result.data?.submissions.length ? <p style={{ padding: 24 }}>No MRV submissions yet.</p> : <table className="table"><thead><tr><th>Submission</th><th>Project</th><th>Status</th><th>Verifier</th></tr></thead><tbody>{result.data.submissions.map(row => <tr key={row.mrvId}><td>#{row.mrvId}<div className="text-xs muted">{row.fileName || 'No uploaded file'}</div></td><td>{row.projectName}</td><td>{row.mrvStatus}</td><td><Assignment row={row} verifiers={verifiers} onSaved={result.run} /></td></tr>)}</tbody></table>}</Card>}
  </>
}
