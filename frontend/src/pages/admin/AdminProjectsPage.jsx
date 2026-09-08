import { useMemo, useState } from 'react'
import { Search, FolderKanban, MapPin } from 'lucide-react'
import PageTransition from '../../components/PageTransition'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import { StatusBadge } from '../../components/ui/Badge'
import EcosystemGlyph from '../../components/EcosystemGlyph'
import EmptyState, { ErrorState } from '../../components/ui/EmptyState'
import { SkeletonList } from '../../components/ui/Loaders'
import { useAsync } from '../../hooks/useAsync'
import { adminProjects } from '../../api/admin'
import { PROJECT_STATUS } from '../../utils/status'
import { formatNumber, formatDate } from '../../utils/format'

export default function AdminProjectsPage() {
  const [status, setStatus] = useState('ALL')
  const [query, setQuery] = useState('')
  const { data, loading, error, run } = useAsync(useMemo(() => () => adminProjects(), []))

  const rows = useMemo(() => {
    let list = data || []
    if (status !== 'ALL') list = list.filter((p) => p.projectStatus === status)
    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter(
        (p) =>
          (p.projectName || '').toLowerCase().includes(q) ||
          (p.location || '').toLowerCase().includes(q) ||
          (p.ownerUsername || '').toLowerCase().includes(q),
      )
    }
    return [...list].sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
  }, [data, status, query])

  const filters = ['ALL', 'DRAFT', 'VERIFIED', 'REJECTED', 'PENDING']
  const counts = useMemo(() => {
    const map = { ALL: (data || []).length }
    for (const p of data || []) map[p.projectStatus] = (map[p.projectStatus] || 0) + 1
    return map
  }, [data])

  return (
    <PageTransition>
      <PageHeader
        eyebrow="Administration"
        title="All projects"
        subtitle="Registry-wide view of every registered restoration project and its verification status."
      />

      <Card style={{ padding: '14px 18px', marginBottom: 18 }}>
        <div className="row row--wrap" style={{ gap: 12 }}>
          <div className="row" style={{ flex: 1, minWidth: 220, position: 'relative' }}>
            <Search size={17} style={{ position: 'absolute', left: 12, color: 'var(--muted)' }} aria-hidden="true" />
            <input
              className="input"
              style={{ paddingLeft: 38 }}
              placeholder="Search project, location or NGO…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              aria-label="Search projects"
            />
          </div>
          <div className="tabs">
            {filters.map((item) => (
              <button
                key={item}
                type="button"
                className={`tab ${status === item ? 'is-active' : ''}`}
                onClick={() => setStatus(item)}
              >
                {item === 'ALL' ? 'All' : PROJECT_STATUS[item]?.label}
                <span className="badge badge--neutral" style={{ padding: '3px 7px', fontSize: 10.5 }}>{counts[item] || 0}</span>
              </button>
            ))}
          </div>
        </div>
      </Card>

      {loading ? (
        <SkeletonList rows={5} />
      ) : error ? (
        <Card><ErrorState error={error} onRetry={run} /></Card>
      ) : rows.length === 0 ? (
        <Card>
          <EmptyState
            icon={FolderKanban}
            title={query || status !== 'ALL' ? 'No matching projects' : 'No projects registered yet'}
            description="Adjust your filters, or projects will appear here once NGOs register them."
          />
        </Card>
      ) : (
        <Card className="table-wrap" style={{ overflow: 'hidden' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Project</th>
                <th>Ecosystem</th>
                <th>NGO</th>
                <th>Area</th>
                <th>Status</th>
                <th>Registered</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((project) => (
                <tr key={project.projectId}>
                  <td>
                    <div className="bold text-sm">{project.projectName}</div>
                    <div className="row muted text-xs" style={{ gap: 4 }}>
                      <MapPin size={11} /> {project.location}
                    </div>
                  </td>
                  <td>
                    <div className="row" style={{ gap: 8 }}>
                      <EcosystemGlyph ecosystem={project.ecosystemType} size={16} />
                      <span className="text-sm">{project.ecosystemType?.toLowerCase().replace(/_/g, ' ')}</span>
                    </div>
                  </td>
                  <td className="text-sm">{project.ownerUsername}</td>
                  <td className="text-sm nowrap">{formatNumber(project.area)} ha</td>
                  <td><StatusBadge map={PROJECT_STATUS} value={project.projectStatus} /></td>
                  <td className="muted nowrap text-sm">{formatDate(project.createdAt || project.startDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </PageTransition>
  )
}
