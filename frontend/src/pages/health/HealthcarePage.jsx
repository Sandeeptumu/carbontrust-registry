import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Stethoscope, Search, Users, HeartPulse, Lock, FileText } from 'lucide-react'
import PageTransition from '../../components/PageTransition'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import { Avatar } from '../../components/ui/Avatar'
import EmptyState from '../../components/ui/EmptyState'
import { SkeletonList } from '../../components/ui/Loaders'
import { useAsync } from '../../hooks/useAsync'
import { useAuth } from '../../context/AuthContext'
import { listHealthRecords } from '../../api/health'
import HealthRecordView from '../../components/health/HealthRecordView'
import { formatDateTime } from '../../utils/format'

export default function HealthcarePage() {
  const { user } = useAuth()
  const [query, setQuery] = useState('')
  const [viewing, setViewing] = useState(null)
  const { data, loading } = useAsync(useMemo(() => () => listHealthRecords(), []))

  const records = useMemo(() => {
    let list = data || []
    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter(
        (r) =>
          (r.ownerName || '').toLowerCase().includes(q) ||
          (r.ownerEmail || '').toLowerCase().includes(q) ||
          (r.bloodGroup || '').toLowerCase().includes(q),
      )
    }
    return [...list].sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''))
  }, [data, query])

  const stats = useMemo(() => {
    const all = data || []
    const withAllergy = all.filter((r) => (r.allergies || []).length > 0).length
    const missingContact = all.filter((r) => !r.emergencyName).length
    return { total: all.length, withAllergy, missingContact }
  }, [data])

  return (
    <PageTransition>
      <PageHeader
        eyebrow="Healthcare advisor"
        title={`Records overview, ${user?.username}`}
        subtitle="Consent-based access to member health records. Handle all information with the confidentiality it deserves."
      />

      <div className="health-hero mb-4">
        <span style={{ background: 'rgba(255,255,255,0.16)', width: 52, height: 52, borderRadius: 15, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Lock size={24} />
        </span>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, color: '#fff' }}>
            Privacy-protected access
          </div>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 3 }}>
            In this demo build, records are stored in the browser of the member&apos;s device, so you
            will only see records created on this same browser. Records will list here automatically
            once a real health API is connected.
          </p>
        </div>
      </div>

      <div className="grid grid--stats" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(210px,1fr))' }}>
        <Card pad className="row" style={{ gap: 14 }}>
          <span className="stat__icon" style={{ background: 'var(--teal-100)', color: 'var(--teal-700)', margin: 0 }}><Users size={20} /></span>
          <div>
            <div className="stat__label">Total records</div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 24 }}>{stats.total}</div>
          </div>
        </Card>
        <Card pad className="row" style={{ gap: 14 }}>
          <span className="stat__icon" style={{ background: 'var(--danger-bg)', color: 'var(--danger)', margin: 0 }}><HeartPulse size={20} /></span>
          <div>
            <div className="stat__label">Allergy alerts</div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 24 }}>{stats.withAllergy}</div>
          </div>
        </Card>
        <Card pad className="row" style={{ gap: 14 }}>
          <span className="stat__icon" style={{ background: 'var(--warning-bg)', color: 'var(--warning)', margin: 0 }}><FileText size={20} /></span>
          <div>
            <div className="stat__label">Missing emergency contact</div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 24 }}>{stats.missingContact}</div>
          </div>
        </Card>
      </div>

      <Card style={{ padding: '14px 18px', margin: '18px 0' }}>
        <div className="row" style={{ gap: 10, position: 'relative' }}>
          <Search size={17} style={{ position: 'absolute', left: 12, color: 'var(--muted)' }} aria-hidden="true" />
          <input
            className="input"
            style={{ paddingLeft: 38, maxWidth: 440 }}
            placeholder="Search by name, email or blood group…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label="Search health records"
          />
        </div>
      </Card>

      {loading ? (
        <SkeletonList rows={4} card />
      ) : records.length === 0 ? (
        <Card>
          <EmptyState
            icon={Stethoscope}
            title={query ? 'No matching records' : 'No health records available yet'}
            description={
              query
                ? 'Try a different name or email.'
                : 'Members add their health information from their personal health page. Once a record exists (or a real health API is connected), it will appear here.'
            }
          />
        </Card>
      ) : (
        <div className="col" style={{ gap: 12 }}>
          {records.map((record, index) => (
            <motion.div
              key={record.id || record.ownerEmail}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.3) }}
            >
              <Card className="row row--between row--wrap card--hover" style={{ padding: '16px 18px', gap: 12 }}>
                <div className="row" style={{ gap: 13 }}>
                  <Avatar name={(record.ownerName || record.ownerEmail || '?').charAt(0)} size="lg" />
                  <div>
                    <div className="bold" style={{ fontSize: 15 }}>{record.ownerName || 'Member'}</div>
                    <div className="muted text-sm">{record.ownerEmail}</div>
                    <div className="row row--wrap text-xs muted mt-2" style={{ gap: 6 }}>
                      <span className={`badge ${record.bloodGroup ? 'badge--teal' : 'badge--neutral'}`} style={{ textTransform: 'none', letterSpacing: 0, padding: '4px 8px' }}>
                        Blood {record.bloodGroup || 'n/a'}
                      </span>
                      {(record.allergies || []).length > 0 && (
                        <span className="badge badge--red" style={{ textTransform: 'none', letterSpacing: 0, padding: '4px 8px' }}>
                          {record.allergies.length} allerg{record.allergies.length > 1 ? 'ies' : 'y'}
                        </span>
                      )}
                      {record.emergencyName && (
                        <span className="badge badge--green" style={{ textTransform: 'none', letterSpacing: 0, padding: '4px 8px' }}>
                          Emergency contact set
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="row" style={{ gap: 12 }}>
                  <div className="text-right hide-mobile">
                    <div className="text-sm muted">Updated</div>
                    <div className="text-sm bold nowrap">{formatDateTime(record.updatedAt)}</div>
                  </div>
                  <Button variant="secondary" size="sm" icon={Stethoscope} onClick={() => setViewing(record)}>
                    View record
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Modal
        open={Boolean(viewing)}
        onClose={() => setViewing(null)}
        title="Health record"
        subtitle={viewing ? `${viewing.ownerName || viewing.ownerEmail} · last updated ${formatDateTime(viewing.updatedAt)}` : ''}
        size="lg"
      >
        {viewing && (
          <>
            <HealthRecordView record={viewing} />
            <div className="alert alert--warning mt-4" role="note">
              <Lock size={15} />
              <div style={{ fontSize: 12.5 }}>
                Confidential health information. Only access records as part of authorised care
                activities.
              </div>
            </div>
          </>
        )}
      </Modal>
    </PageTransition>
  )
}
