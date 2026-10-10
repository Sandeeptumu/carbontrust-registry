import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Camera, FileCheck2, Info } from 'lucide-react'
import PageTransition from '../../components/PageTransition'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import { Checkbox, Textarea } from '../../components/ui/Fields'
import { SkeletonList } from '../../components/ui/Loaders'
import { useAsync } from '../../hooks/useAsync'
import { useToast } from '../../context/ToastContext'
import { getProject } from '../../api/projects'
import { createMRVSubmission } from '../../api/mrv'
import { ecosystemMeta } from '../../utils/status'

export default function MRVSubmitPage() {
  const { projectId } = useParams()
  const toast = useToast()
  const navigate = useNavigate()

  const project = useAsync(useMemo(() => () => getProject(projectId), [projectId]))

  const [photoVerification, setPhotoVerification] = useState(false)
  const [file, setFile] = useState(null)
  const [remarks, setRemarks] = useState('')
  const [fieldError, setFieldError] = useState(null)
  const [serverError, setServerError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const data = project.data
  const eco = data ? ecosystemMeta(data.ecosystemType) : null

  const submit = async (event) => {
    event.preventDefault()
    if (submitting) return
    setServerError(null)
    if (!file || file.size > 10 * 1024 * 1024 || !["application/pdf", "image/jpeg", "image/png"].includes(file.type)) {
      setServerError("Choose a PDF, JPEG or PNG file up to 10 MB.")
      return
    }
    if (!remarks.trim()) {
      setFieldError('Please add remarks describing the evidence and site status for this reporting period.')
      return
    }
    setSubmitting(true)
    try {
      await createMRVSubmission(projectId, {
        photoVerification, file,
        remarks: remarks.trim(),
      })
      toast.success('Your MRV submission is now in the verifier queue.', 'MRV submitted')
      navigate(`/ngo/projects/${projectId}`)
    } catch (err) {
      setServerError(err?.message || 'Could not submit MRV evidence.')
    } finally {
      setSubmitting(false)
    }
  }

  if (project.loading) {
    return <PageTransition><SkeletonList rows={2} card /></PageTransition>
  }

  if (project.error) {
    return (
      <PageTransition>
        <Card pad><p className="text-sm" style={{ color: 'var(--danger)' }}>{project.error?.message}</p></Card>
      </PageTransition>
    )
  }

  return (
    <PageTransition>
      <PageHeader
        backTo={`/ngo/projects/${projectId}`}
        eyebrow="NGO workspace · MRV"
        title="Submit MRV evidence"
        subtitle={`Measurement, Reporting & Verification submission for ${data.projectName}.`}
      />

      <div style={{ maxWidth: 680, margin: '0 auto' }}>
        <Card pad>
          <div className="row" style={{ gap: 12, paddingBottom: 18, borderBottom: '1px solid var(--border)' }}>
            <span className="stat__icon" style={{ width: 46, height: 46, background: eco?.color, color: '#fff', margin: 0 }}>
              <FileCheck2 size={21} />
            </span>
            <div>
              <div className="bold" style={{ fontSize: 15 }}>{data.projectName}</div>
              <div className="muted text-sm">{eco?.label} · {data.location} · #{String(data.projectId).padStart(4, '0')}</div>
            </div>
          </div>

          <form onSubmit={submit} className="mt-4">
            <div className="alert alert--info mb-4" role="status">
              <Info size={16} />
              <div style={{ fontSize: 13 }}>
                Evidence you submit here is reviewed by an independent verifier. Approved submissions
                move the project to <strong>VERIFIED</strong>, enabling carbon credit issuance.
              </div>
            </div>

            <label className="field__label" htmlFor="evidence">Evidence file (required, up to 10 MB)</label>
            <input id="evidence" type="file" accept=".pdf,.jpg,.jpeg,.png" required disabled={submitting} onChange={(e) => setFile(e.target.files?.[0] || null)} className="mb-4" />

            <Checkbox
              label="Photo / spatial verification evidence available"
              hint="Confirm that on-site photographic or geospatial evidence was collected for this reporting period."
              checked={photoVerification}
              onChange={(event) => setPhotoVerification(event.target.checked)}
            />

            <Textarea
              label="Reporting remarks"
              rows={6}
              maxLength={2000}
              value={remarks}
              onChange={(event) => {
                setRemarks(event.target.value)
                setFieldError(null)
              }}
              error={fieldError}
              hint={`${remarks.length}/2000 characters`}
              placeholder="Describe restoration progress, seedling survival, canopy cover, water quality or other monitoring data for this reporting period…"
            />

            {serverError && (
              <div className="alert alert--danger mb-4" role="alert">
                <Info size={16} /> {serverError}
              </div>
            )}

            <div className="row row--between" style={{ borderTop: '1px solid var(--border)', paddingTop: 18 }}>
              <Button variant="ghost" to={`/ngo/projects/${projectId}`}>Cancel</Button>
              <Button type="submit" loading={submitting} icon={Camera}>
                Submit for verification
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </PageTransition>
  )
}
