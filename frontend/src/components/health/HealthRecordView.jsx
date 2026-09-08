import { Droplet, AlertTriangle, Pill, Stethoscope, HeartHandshake, FileText, Phone } from 'lucide-react'
import { formatDateTime } from '../../utils/format'

function Tag({ children, tone = 'green' }) {
  return <span className={`badge badge--${tone}`} style={{ textTransform: 'none', letterSpacing: 0, fontWeight: 600 }}>{children}</span>
}

function Section({ icon: Icon, title, items, emptyText, tone }) {
  const list = Array.isArray(items) ? items : []
  return (
    <div>
      <div className="row" style={{ gap: 8, marginBottom: 10 }}>
        <Icon size={16} style={{ color: 'var(--green-700)' }} />
        <span className="bold" style={{ fontSize: 13.5 }}>{title}</span>
      </div>
      {list.length ? (
        <div className="row row--wrap" style={{ gap: 7 }}>
          {list.map((item, index) => (
            <Tag key={index} tone={tone}>{item}</Tag>
          ))}
        </div>
      ) : (
        <p className="muted text-sm">{emptyText}</p>
      )}
    </div>
  )
}

export default function HealthRecordView({ record }) {
  if (!record) return null

  return (
    <div>
      <div className="row row--between row--wrap" style={{ gap: 14 }}>
        <div className="row" style={{ gap: 16 }}>
          <div
            style={{
              width: 92,
              height: 92,
              borderRadius: '50%',
              border: '6px solid var(--green-100)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'var(--green-50)',
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, color: 'var(--green-700)', lineHeight: 1.1 }}>
                {record.bloodGroup || '—'}
              </div>
              <div className="text-xs muted">blood group</div>
            </div>
          </div>
          <div>
            <div className="muted text-xs" style={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}>Owner</div>
            <div className="bold" style={{ fontSize: 16 }}>{record.ownerName || record.ownerEmail}</div>
            <div className="text-sm muted">{record.ownerEmail}</div>
            <div className="row text-xs muted mt-2" style={{ gap: 5 }}>
              <FileText size={12} /> Last updated {formatDateTime(record.updatedAt)}
            </div>
          </div>
        </div>
        <span className="badge badge--green">Up to date</span>
      </div>

      <div className="divider" />

      <div className="grid grid--2" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 22 }}>
        <Section icon={AlertTriangle} title="Allergies" items={record.allergies} emptyText="No known allergies recorded." tone="red" />
        <Section icon={Stethoscope} title="Existing conditions" items={record.conditions} emptyText="No existing conditions recorded." tone="amber" />
        <Section icon={Pill} title="Current medications" items={record.medications} emptyText="No medications recorded." tone="blue" />
        <div>
          <div className="row" style={{ gap: 8, marginBottom: 10 }}>
            <HeartHandshake size={16} style={{ color: 'var(--green-700)' }} />
            <span className="bold" style={{ fontSize: 13.5 }}>Emergency contact</span>
          </div>
          {record.emergencyName ? (
            <div className="card" style={{ background: 'var(--surface-2)', border: 0, padding: '12px 14px', display: 'grid', gap: 6 }}>
              <div className="bold text-sm">{record.emergencyName} <span className="muted" style={{ fontWeight: 500 }}>({record.emergencyRelation || 'contact'})</span></div>
              <div className="row text-sm muted" style={{ gap: 6 }}>
                <Phone size={13} /> {record.emergencyPhone || 'No phone recorded'}
              </div>
            </div>
          ) : (
            <p className="muted text-sm">No emergency contact recorded.</p>
          )}
        </div>
      </div>

      {record.notes && (
        <>
          <div className="divider" />
          <div className="row" style={{ gap: 8, marginBottom: 8 }}>
            <Droplet size={16} style={{ color: 'var(--green-700)' }} />
            <span className="bold" style={{ fontSize: 13.5 }}>Additional notes</span>
          </div>
          <p className="text-sm ink-soft" style={{ lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{record.notes}</p>
        </>
      )}
    </div>
  )
}
