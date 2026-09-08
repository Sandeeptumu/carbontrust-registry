import { useMemo } from 'react'
import { History as HistoryIcon, MessageSquareText } from 'lucide-react'
import PageTransition from '../../components/PageTransition'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import EmptyState, { ErrorState } from '../../components/ui/EmptyState'
import { SkeletonList } from '../../components/ui/Loaders'
import { useAsync } from '../../hooks/useAsync'
import { verifierHistory } from '../../api/mrv'
import { formatDateTime } from '../../utils/format'

export default function HistoryPage() {
  const { data, loading, error, run } = useAsync(useMemo(() => () => verifierHistory(), []))

  const history = useMemo(
    () => [...(data || [])].sort((a, b) => new Date(b.verificationDate) - new Date(a.verificationDate)),
    [data],
  )

  return (
    <PageTransition>
      <PageHeader
        eyebrow="Verifier workspace"
        title="My verifications"
        subtitle="Every decision you've recorded, with the comments attached to the permanent registry record."
      />

      {loading ? (
        <SkeletonList rows={4} card />
      ) : error ? (
        <Card><ErrorState error={error} onRetry={run} /></Card>
      ) : history.length === 0 ? (
        <Card>
          <EmptyState
            icon={HistoryIcon}
            title="No verifications yet"
            description="Submissions you review in the MRV queue will be recorded here once you approve or reject them."
          />
        </Card>
      ) : (
        <Card className="table-wrap" style={{ overflow: 'hidden' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Project</th>
                <th>MRV</th>
                <th>Decision</th>
                <th>Comments</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item) => (
                <tr key={item.verificationId}>
                  <td>
                    <div className="bold text-sm">{item.projectName}</div>
                    <div className="muted text-xs">Registry #{String(item.projectId || '').padStart(4, '0')}</div>
                  </td>
                  <td><span className="mono text-sm">MRV-{item.mrvId}</span></td>
                  <td>
                    <span className={`badge ${item.verificationStatus === 'APPROVED' ? 'badge--green' : 'badge--red'}`}>
                      {item.verificationStatus === 'APPROVED' ? 'Approved' : 'Rejected'}
                    </span>
                  </td>
                  <td style={{ maxWidth: 320 }}>
                    {item.comments ? (
                      <div className="row" style={{ gap: 8, alignItems: 'flex-start' }}>
                        <MessageSquareText size={14} className="muted" style={{ flexShrink: 0, marginTop: 2 }} />
                        <span className="text-sm ink-soft">{item.comments}</span>
                      </div>
                    ) : (
                      <span className="muted text-sm">—</span>
                    )}
                  </td>
                  <td className="muted nowrap text-sm">{formatDateTime(item.verificationDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </PageTransition>
  )
}
