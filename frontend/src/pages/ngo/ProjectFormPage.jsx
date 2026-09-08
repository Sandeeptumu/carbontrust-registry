import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Check, Info, Sprout } from 'lucide-react'
import PageTransition from '../../components/PageTransition'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import { Input, Select, Textarea } from '../../components/ui/Fields'
import { useAsync } from '../../hooks/useAsync'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { getProject, createProject, updateProject } from '../../api/projects'
import { ecosystemMeta } from '../../utils/status'
import { formatNumber } from '../../utils/format'

const ECOSYSTEMS = [
  { value: 'MANGROVE', label: 'Mangrove forest' },
  { value: 'SEAGRASS', label: 'Seagrass meadow' },
  { value: 'SALT MARSH', label: 'Salt marsh' },
  { value: 'WETLAND', label: 'Coastal wetland' },
  { value: 'FOREST', label: 'Restoration forest' },
]

const STEPS = [
  { title: 'Basics', caption: 'Name & description' },
  { title: 'Site', caption: 'Ecosystem & location' },
  { title: 'Review', caption: 'Confirm & submit' },
]

const emptyForm = {
  projectName: '',
  description: '',
  ecosystemType: '',
  location: '',
  area: '',
  startDate: '',
}

function validateStep(step, form) {
  const errors = {}
  if (step === 0) {
    if (!form.projectName.trim()) errors.projectName = 'Project name is required'
    if (form.description.trim().length < 20) errors.description = 'Add a description of at least 20 characters'
  }
  if (step === 1) {
    if (!form.ecosystemType) errors.ecosystemType = 'Select the ecosystem type'
    if (!form.location.trim()) errors.location = 'Location is required'
    const area = Number(form.area)
    if (!form.area || Number.isNaN(area) || area <= 0) errors.area = 'Area must be greater than zero (hectares)'
    if (!form.startDate) errors.startDate = 'Start date is required'
  }
  return errors
}

export default function ProjectFormPage() {
  const { projectId } = useParams()
  const isEdit = Boolean(projectId)
  const { user } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  const [form, setForm] = useState(emptyForm)
  const [step, setStep] = useState(0)
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState(null)
  const [saving, setSaving] = useState(false)

  const existing = useAsync(
    useMemo(
      () =>
        isEdit && projectId
          ? () => getProject(projectId)
          : () => Promise.resolve(null),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [projectId],
    ),
    { immediate: isEdit },
  )

  useEffect(() => {
    if (existing.data) {
      setForm({
        projectName: existing.data.projectName || '',
        description: existing.data.description || '',
        ecosystemType: existing.data.ecosystemType || '',
        location: existing.data.location || '',
        area: existing.data.area ?? '',
        startDate: existing.data.startDate || '',
      })
    }
  }, [existing.data])

  const set = (key) => (event) => {
    const value = event.target.value
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  const next = () => {
    const validation = validateStep(step, form)
    setErrors(validation)
    if (Object.keys(validation).length) return
    setStep((current) => Math.min(STEPS.length - 1, current + 1))
  }

  const submit = async () => {
    setServerError(null)
    setSaving(true)
    const payload = {
      projectName: form.projectName.trim(),
      description: form.description.trim(),
      ecosystemType: form.ecosystemType,
      location: form.location.trim(),
      area: Number(form.area),
      startDate: form.startDate,
    }
    try {
      const saved = isEdit
        ? await updateProject(projectId, payload)
        : await createProject(payload)
      toast.success(
        isEdit ? `“${saved.projectName}” was updated.` : `Project “${saved.projectName}” registered.`,
        isEdit ? 'Project updated' : 'Project registered',
      )
      navigate(`/ngo/projects/${saved.projectId}`)
    } catch (err) {
      if (err?.fieldErrors) setErrors(err.fieldErrors)
      setServerError(err?.message || 'Could not save the project.')
      setStep(0)
    } finally {
      setSaving(false)
    }
  }

  const ecoMeta = form.ecosystemType ? ecosystemMeta(form.ecosystemType) : null

  return (
    <PageTransition>
      <PageHeader
        backTo={isEdit ? `/ngo/projects/${projectId}` : '/ngo/projects'}
        eyebrow="NGO workspace"
        title={isEdit ? 'Edit project' : 'Register a project'}
        subtitle={
          isEdit
            ? 'Update the details of your restoration project.'
            : 'Follow three steps to register your blue carbon restoration project.'
        }
      />

      <div className="row mb-5" style={{ gap: 12, justifyContent: 'center' }}>
        {STEPS.map((meta, index) => {
          const active = step === index
          const done = step > index
          return (
            <div key={meta.title} className="row" style={{ gap: 8 }}>
              <button
                type="button"
                onClick={() => index < step && setStep(index)}
                className="row"
                style={{
                  gap: 8,
                  border: 0,
                  background: 'transparent',
                  cursor: index < step ? 'pointer' : 'default',
                  fontFamily: 'var(--font-body)',
                  padding: 0,
                }}
              >
                <span
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: '50%',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: 13,
                    background: done ? 'var(--green-600)' : active ? 'var(--green-100)' : 'var(--surface-sunken)',
                    color: done ? '#fff' : active ? 'var(--green-700)' : 'var(--muted)',
                    border: active && !done ? '1.5px solid var(--green-500)' : '1px solid transparent',
                  }}
                >
                  {done ? <Check size={15} /> : index + 1}
                </span>
                <span className="hide-mobile" style={{ fontSize: 12.5, fontWeight: 700, color: active ? 'var(--ink)' : 'var(--muted)' }}>
                  {meta.title}
                </span>
              </button>
              {index < STEPS.length - 1 && <span className="muted" style={{ fontSize: 11 }}>——</span>}
            </div>
          )
        })}
      </div>

      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        {isEdit && existing.loading ? (
          <Card pad><p className="muted text-sm">Loading project…</p></Card>
        ) : isEdit && existing.error ? (
          <Card><p className="text-sm" style={{ color: 'var(--danger)' }}>{existing.error?.message}</p></Card>
        ) : (
          <Card pad>
            {serverError && (
              <div className="alert alert--danger mb-4" role="alert"><Info size={16} /> {serverError}</div>
            )}

            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 22 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -22 }}
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              >
                {step === 0 && (
                  <div>
                    <Input
                      label="Project name"
                      value={form.projectName}
                      onChange={set('projectName')}
                      error={errors.projectName}
                      placeholder="e.g. Sundarbans Mangrove Restoration – Zone B"
                      autoFocus
                    />
                    <Textarea
                      label="Description"
                      rows={5}
                      value={form.description}
                      onChange={set('description')}
                      error={errors.description}
                      hint={`${form.description.length} characters · describe the site, the restoration approach and the expected climate benefit.`}
                      placeholder="Describe the restoration area, the species being restored, community involvement and monitoring plans…"
                    />
                  </div>
                )}

                {step === 1 && (
                  <div>
                    <Select label="Ecosystem type" value={form.ecosystemType} onChange={set('ecosystemType')} error={errors.ecosystemType}>
                      <option value="">Select an ecosystem…</option>
                      {ECOSYSTEMS.map((eco) => (
                        <option key={eco.value} value={eco.value}>{eco.label}</option>
                      ))}
                    </Select>
                    <Input
                      label="Location"
                      value={form.location}
                      onChange={set('location')}
                      error={errors.location}
                      placeholder="Region, country — e.g. Sundarbans, Bangladesh"
                    />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 14px' }}>
                      <Input
                        label="Restoration area (hectares)"
                        type="number"
                        min="0.01"
                        step="any"
                        value={form.area}
                        onChange={set('area')}
                        error={errors.area}
                        placeholder="e.g. 1250"
                      />
                      <Input label="Start date" type="date" value={form.startDate} onChange={set('startDate')} error={errors.startDate} />
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div>
                    <div className="alert alert--info mb-4" role="status">
                      <Info size={16} />
                      <div>
                        On submission your project is stored as a <strong>draft</strong>. Submit MRV
                        evidence to move it into verification.
                      </div>
                    </div>
                    <div className="card" style={{ background: 'var(--surface-2)', border: 0 }}>
                      <div className="row row--between row--wrap" style={{ gap: 10, padding: '14px 16px' }}>
                        <div className="row" style={{ gap: 12 }}>
                          {ecoMeta && (
                            <span className="stat__icon" style={{ width: 44, height: 44, background: ecoMeta.color, color: '#fff', margin: 0 }}>
                              <Sprout size={20} />
                            </span>
                          )}
                          <div>
                            <div className="bold" style={{ fontSize: 15 }}>{form.projectName || 'Untitled project'}</div>
                            <div className="muted text-sm">{ecoMeta?.label} · {form.location || 'Location TBD'}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20 }}>{formatNumber(Number(form.area) || 0)} ha</div>
                          <div className="muted text-xs">restoration area</div>
                        </div>
                      </div>
                      {form.description && (
                        <>
                          <div className="divider" style={{ margin: 0 }} />
                          <p className="text-sm ink-soft" style={{ padding: '14px 16px' }}>{form.description}</p>
                        </>
                      )}
                      <div className="divider" style={{ margin: 0 }} />
                      <div className="text-xs muted" style={{ padding: '12px 16px' }}>
                        Registered by <strong className="ink-soft">{user?.username}</strong> · Start date{' '}
                        {form.startDate ? new Date(form.startDate).toLocaleDateString() : '—'}
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="row row--between mt-5" style={{ borderTop: '1px solid var(--border)', paddingTop: 18 }}>
              <Button
                variant="ghost"
                icon={ArrowLeft}
                disabled={step === 0 || saving}
                onClick={() => setStep((current) => Math.max(0, current - 1))}
              >
                Back
              </Button>
              {step < STEPS.length - 1 ? (
                <Button onClick={next}>
                  Continue <ArrowRight size={15} />
                </Button>
              ) : (
                <Button onClick={submit} loading={saving}>
                  {isEdit ? 'Save changes' : 'Register project'}
                </Button>
              )}
            </div>
          </Card>
        )}
      </div>
    </PageTransition>
  )
}
