import { useMemo, useState } from 'react'
import { Search, Users } from 'lucide-react'
import PageTransition from '../../components/PageTransition'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import { RoleBadge } from '../../components/ui/Avatar'
import EmptyState, { ErrorState } from '../../components/ui/EmptyState'
import { SkeletonList } from '../../components/ui/Loaders'
import { useAsync } from '../../hooks/useAsync'
import { adminUsers } from '../../api/admin'
import { formatDate } from '../../utils/format'

export default function AdminUsersPage() {
  const [query, setQuery] = useState('')
  const { data, loading, error, run } = useAsync(useMemo(() => () => adminUsers(), []))

  const rows = useMemo(() => {
    const list = (data || []).filter((user) => {
      if (!query.trim()) return true
      const q = query.toLowerCase()
      return (
        (user.username || '').toLowerCase().includes(q) ||
        (user.email || '').toLowerCase().includes(q) ||
        (user.firstName || '').toLowerCase().includes(q) ||
        (user.lastName || '').toLowerCase().includes(q) ||
        (user.role || '').toLowerCase().includes(q)
      )
    })
    return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }, [data, query])

  return (
    <PageTransition>
      <PageHeader
        eyebrow="Administration"
        title="User management"
        subtitle="All registered platform accounts across every role."
      />

      <Card style={{ padding: '14px 18px', marginBottom: 18 }}>
        <div className="row" style={{ gap: 10, position: 'relative' }}>
          <Search size={17} style={{ position: 'absolute', left: 12, color: 'var(--muted)' }} aria-hidden="true" />
          <input
            className="input"
            style={{ paddingLeft: 38, maxWidth: 420 }}
            placeholder="Search by name, username, email or role…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label="Search users"
          />
          <span className="badge badge--neutral hide-mobile">{data?.length || 0} users</span>
        </div>
      </Card>

      {loading ? (
        <SkeletonList rows={5} />
      ) : error ? (
        <Card><ErrorState error={error} onRetry={run} /></Card>
      ) : rows.length === 0 ? (
        <Card>
          <EmptyState
            icon={Users}
            title={query ? 'No matching users' : 'No users registered yet'}
            description={query ? 'Try a different search term.' : 'Registered platform users will appear here.'}
          />
        </Card>
      ) : (
        <Card className="table-wrap" style={{ overflow: 'hidden' }}>
          <table className="table">
            <thead>
              <tr>
                <th>User</th>
                <th>Contact</th>
                <th>Role</th>
                <th>Status</th>
                <th>Registered</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((user) => (
                <tr key={user.userId}>
                  <td>
                    <div className="bold text-sm">
                      {user.firstName || ''} {user.lastName || ''}
                      <span className="muted" style={{ fontWeight: 500 }}> · @{user.username}</span>
                    </div>
                    <div className="muted text-xs mono">ID {user.userId}</div>
                  </td>
                  <td>
                    <div className="text-sm">{user.email}</div>
                    <div className="muted text-xs">{user.phoneNumber || ''} · {user.address || ''}</div>
                  </td>
                  <td><RoleBadge role={user.role} /></td>
                  <td>
                    <span className={`badge ${user.status ? 'badge--green' : 'badge--red'}`}>
                      {user.status ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="muted nowrap text-sm">{formatDate(user.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </PageTransition>
  )
}
