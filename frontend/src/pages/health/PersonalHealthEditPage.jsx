import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { HeartPulse, Info } from 'lucide-react'
import PageTransition from '../../components/PageTransition'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import { Input, Select, Textarea } from '../../components/ui/Fields'
import { SkeletonList } from '../../components/ui/Loaders'
import { useAsync } from '../../hooks/useAsync'
import { useToast } from '../../context/ToastContext'
import { getMyHealthRecord, saveHealthRecord, HEALTH_CONSTANTS } from '../../api/health'

const EMPTY = {
  bloodGroup: '',
  allergies: '',
  conditions: '',
  medications: '',
  emergencyName: '',
  emergencyPhone: '',
  emergencyRelation: '',
  notes: '',
}

function toCsv(items) {
  return Array.isArray(items) ? items.join(', ') : ''
}

export default function PersonalHealthEditPage() {
  const toast = useToast()
  const navigate = useNavigate()
  const existing = useAsync(useMemo(() => () => getMyHealthRecord(), []))

  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [serverError, setServerError] = useState(null)

  useEffect(() => {
    if (existing.data) {
      setForm({
        bloodGroup: existing.data.bloodGroup || '',
        allergies: toCsv(existing.data.allergies),
        conditions: toCsv(existing.data.conditions),
        medications: toCsv(existing.data.medications),
        emergencyName: existing.data.emergencyName || '',
        emergencyPhone: existing.data.emergencyPhone || '',
        emergencyRelation: existing.data.emergencyRelation || '',
        notes: existing.data.notes || '',
      })
    }
  }, [existing.data])

  const set = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }))

  const submit = async (event) => {
    event.preventDefault()
    setServerError(null)
    if (!form.bloodGroup) {
      setServerError('Please select your blood group.')
      return
    }
    setSaving(true)
    try {
      await saveHealthRecord({
        bloodGroup: form.bloodGroup,
        allergies: form.allergies,
        conditions: form.conditions,
        medications: form.medications,
        emergencyName: form.emergencyName.trim(),
        emergencyPhone: form.emergencyPhone.trim(),
        emergencyRelation: form.emergencyRelation.trim(),
        notes: form.notes.trim(),
      })
      toast.success('Your health record has been updated.', 'Record saved')
      navigate('/personal-health')
    } catch (err) {
      setServerError(err?.message || 'Could not save your record.')
    } finally {
      setSaving(false)
    }
  }

  if (existing.loading) {
    return <PageTransition><SkeletonList rows={3} card /></PageTransition>
  }

  return (
    <PageTransition>
      <PageHeader
        backTo="/personal-health"
        eyebrow="Personal health"
        title={existing.data ? 'Edit health record' : 'Add health information'}
        subtitle="Fill in what applies to you — leave anything you don't wish to share empty."
      />

      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <Card pad>
          <div className="alert alert--info mb-4" role="status">
            <Info size={16} />
            <div style={{ fontSize: 13 }}>
              For the demo this record is stored locally in your browser. Separate fields with commas,
              e.g. <strong>peanuts, penicillin</strong>.
            </div>
          </div>

          {serverError && (
            <div className="alert alert--danger mb-4" role="alert">
              <Info size={16} /> {serverError}
            </div>
          )}

          <form onSubmit={submit}>
            <div className="section-title mb-3">Basics</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 14px' }}>
              <Select label="Blood group" value={form.bloodGroup} onChange={set('bloodGroup')}>
                <option value="">Select…</option>
                {HEALTH_CONSTANTS.BLOOD_GROUPS.map((group) => (
                  <option key={group} value={group}>{group}</option>
                ))}
              </Select>
            </div>

            <div className="section-title mt-5 mb-3">Medical</div>
            <Input label="Allergies" value={form.allergies} onChange={set('allergies')} placeholder="e.g. peanuts, penicillin" hint="Comma-separated list" />
            <Input label="Existing conditions" value={form.conditions} onChange={set('conditions')} placeholder="e.g. asthma, hypertension" hint="Comma-separated list" />
            <Input label="Current medications" value={form.medications} onChange={set('medications')} placeholder="e.g. Metformin 500mg" hint="Comma-separated list" />

            <div className="section-title mt-5 mb-3">Emergency contact</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 14px' }}>
              <Input label="Contact name" value={form.emergencyName} onChange={set('emergencyName')} placeholder="Full name" />
              <Input label="Relationship" value={form.emergencyRelation} onChange={set('emergencyRelation')} placeholder="e.g. spouse, parent" />
            </div>
            <Input label="Contact phone" value={form.emergencyPhone} onChange={set('emergencyPhone')} placeholder="+1 555 010 0100" />

            <div className="section-title mt-5 mb-3">Notes</div>
            <Textarea rows={4} value={form.notes} onChange={set('notes')} placeholder="Anything else a healthcare advisor should know…" />

            <div className="row row--between" style={{ borderTop: '1px solid var(--border)', paddingTop: 18, marginTop: 22 }}>
              <Button variant="ghost" to="/personal-health">Cancel</Button>
              <Button type="submit" loading={saving} icon={HeartPulse}>
                {existing.data ? 'Save changes' : 'Save health record'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </PageTransition>
  )
}
