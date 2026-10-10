import { useMemo, useState } from 'react'
import { Search, Users } from 'lucide-react'
import PageTransition from '../../components/PageTransition'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import { RoleBadge } from '../../components/ui/Avatar'
import EmptyState, { ErrorState } from '../../components/ui/EmptyState'
import { SkeletonList } from '../../components/ui/Loaders'
import { useAsync } from '../../hooks/useAsync'
import { adminUsers, updateUserRole, updateUserStatus, updateUserEmail, userAudit } from '../../api/admin'
import { formatDate } from '../../utils/format'
import { ROLE_META } from '../../utils/roles'
import { useToast } from '../../context/ToastContext'
import Modal from '../../components/ui/Modal'
import Button from '../../components/ui/Button'
import { Input } from '../../components/ui/Fields'

function AccountEditor({ account, onClose, onUpdated }) {
  const toast = useToast()
  const [role, setRole] = useState(account.role)
  const [status, setStatus] = useState(account.accountStatus)
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState('')
  const [error, setError] = useState('')
  const audit = useAsync(useMemo(() => () => userAudit(account.userId), [account.userId]))
  const save = async (kind, action) => {
    if (busy) return
    setBusy(kind); setError('')
    try {
      await action()
      toast.success(kind === 'email' ? 'Verification email requested. The address changes only after verification.' : 'Account updated.')
      await onUpdated()
      await audit.run()
    } catch (err) { setError(err.message || 'Could not update the account. Refresh and try again.') }
    finally { setBusy('') }
  }
  return <Modal open onClose={() => { if (!busy) onClose() }} title="Manage account" subtitle={`${account.username} · ${account.email}`}>
    {error && <div className="alert alert--danger mb-4" role="alert">{error}</div>}
    <form onSubmit={e => { e.preventDefault(); save('role', () => updateUserRole(account.userId, role, account.role)) }}>
      <label className="field__label" htmlFor="account-role">Assigned role</label>
      <select id="account-role" className="input" value={role} disabled={Boolean(busy)} onChange={e => setRole(e.target.value)}>{Object.entries(ROLE_META).map(([key, meta]) => <option key={key} value={key}>{meta.label}</option>)}</select>
      {role === 'ADMIN' && <p className="field__hint">Administrators can change account access and assign privileged roles.</p>}
      <Button type="submit" className="mt-2" disabled={Boolean(busy) || role === account.role} loading={busy === 'role'}>Save role</Button>
    </form>
    <form className="mt-4" onSubmit={e => { e.preventDefault(); save('status', () => updateUserStatus(account.userId, status)) }}>
      <label className="field__label" htmlFor="account-status">Account status</label>
      <select id="account-status" className="input" value={status} disabled={Boolean(busy)} onChange={e => setStatus(e.target.value)}>{['PENDING', 'APPROVED', 'ACTIVE', 'SUSPENDED'].map(value => <option key={value} value={value}>{value}</option>)}</select>
      <Button type="submit" className="mt-2" disabled={Boolean(busy) || status === account.accountStatus} loading={busy === 'status'}>Save status</Button>
    </form>
    <form className="mt-4" onSubmit={e => { e.preventDefault(); save('email', () => updateUserEmail(account.userId, email.trim())) }}>
      <Input label="New email address" type="email" required value={email} onChange={e => setEmail(e.target.value)} disabled={Boolean(busy)} hint="The current address remains in use until the new address is verified." />
      <Button type="submit" disabled={Boolean(busy) || !email.trim()} loading={busy === 'email'}>Send verification</Button>
    </form>
    <h3 className="mt-4">Audit history</h3>
    {audit.loading ? <p role="status">Loading account history…</p> : audit.error ? <ErrorState error={audit.error} onRetry={audit.run} /> : audit.data?.length ? <ol style={{ paddingLeft: 22, maxHeight: 240, overflowY: 'auto' }}>{audit.data.map(entry => <li key={entry.id} className="mt-2"><strong>{entry.action}</strong><div className="text-sm">{entry.detail}</div><div className="text-xs muted">{entry.actorEmail || 'System'} · {formatDate(entry.createdAt)}</div></li>)}</ol> : <p className="muted">No recorded account changes.</p>}
  </Modal>
}
export default function AdminUsersPage() {
  const [query, setQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [selectedId, setSelectedId] = useState(null)
  const { data, loading, error, run } = useAsync(useMemo(() => adminUsers, []))
  const rows = (data || []).filter(account => (!roleFilter || account.role === roleFilter) && `${account.username} ${account.email} ${account.role} ${account.accountStatus}`.toLowerCase().includes(query.toLowerCase().trim()))
  const selected = data?.find(account => account.userId === selectedId)
  return <PageTransition>
    <PageHeader eyebrow="Administration" title="Accounts & access" subtitle="Review registrations, manage roles and account access, and inspect changes." actions={<Button variant="secondary" disabled={loading} onClick={() => run().catch(() => {})}>Refresh users</Button>} />
    <Card className="card--pad mb-4"><div className="row row--wrap"><Search size={18} aria-hidden="true" /><input className="input" style={{ flex: 1, minWidth: 180 }} aria-label="Search users" placeholder="Search username, email or status…" value={query} onChange={e => setQuery(e.target.value)} /><select className="input" style={{ width: 'auto' }} aria-label="Filter by role" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}><option value="">All roles</option>{Object.entries(ROLE_META).map(([role, meta]) => <option key={role} value={role}>{meta.label}</option>)}</select></div></Card>
    {loading && !data ? <SkeletonList rows={5} /> : error ? <Card><ErrorState error={error} onRetry={run} /></Card> : !rows.length ? <Card><EmptyState icon={Users} title="No matching accounts" description="Registered accounts appear here. Try adjusting your search." /></Card> : <Card className="table-wrap" style={{ overflowX: 'auto' }}><table className="table"><thead><tr><th>Username</th><th>Email</th><th>Role</th><th>Account status</th><th>Registered</th><th>Manage</th></tr></thead><tbody>{rows.map(account => <tr key={account.userId}>
      <td><strong>{account.username}</strong><div className="muted text-xs">ID {account.userId}</div></td>
      <td>{account.email}<div className="text-xs muted">{account.emailVerified ? 'Verified' : 'Email verification pending'}</div></td>
      <td><RoleBadge role={account.role} /></td><td>{account.accountStatus}</td><td>{formatDate(account.createdAt)}</td>
      <td><Button variant="secondary" size="sm" onClick={() => setSelectedId(account.userId)} aria-label={`Manage ${account.username}`}>Manage account</Button></td>
    </tr>)}</tbody></table></Card>}
    {selected && <AccountEditor key={selected.userId} account={selected} onClose={() => setSelectedId(null)} onUpdated={run} />}
  </PageTransition>
}
