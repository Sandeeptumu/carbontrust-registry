import { useState } from 'react'
import { KeyRound, ShieldCheck } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { changePassword } from '../../api/auth'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import PasswordField from '../../components/auth/PasswordField'
import { RoleBadge } from '../../components/ui/Avatar'

export default function SignInMethodsPage() {
  const { user } = useAuth()
  const toast = useToast()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    if (busy) return
    setError('')
    if (newPassword !== confirmation) {
      setError('New passwords do not match.')
      return
    }
    setBusy(true)
    try {
      await changePassword({ currentPassword, newPassword, passwordConfirmation: confirmation })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmation('')
      toast.success('Your password was changed. Sign in again to continue.', 'Password updated')
      window.dispatchEvent(new CustomEvent('carbontrust:session-expired'))
    } catch (requestError) {
      setError(requestError.message || 'Could not change your password. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <PageHeader eyebrow="Account" title="Account security" subtitle="Keep your CarbonTrust Registry account protected." />
      <div className="grid grid--2" style={{ gridTemplateColumns: 'minmax(0, 1fr) minmax(280px, .62fr)', alignItems: 'start' }}>
        <Card className="card--pad" style={{ maxWidth: 620 }}>
          <div className="row" style={{ gap: 12, marginBottom: 22 }}>
            <span className="stat__icon" style={{ margin: 0, background: 'var(--green-100)', color: 'var(--green-700)' }}><KeyRound size={21} /></span>
            <div>
              <h2 style={{ fontSize: 19 }}>Change password</h2>
              <p className="muted text-sm">Use at least 12 characters. You will be signed out from every active session when the change is complete.</p>
            </div>
          </div>
          <form onSubmit={submit} aria-busy={busy}>
            {error && <div className="alert alert--danger mb-4" role="alert">{error}</div>}
            <PasswordField label="Current password" required autoComplete="current-password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} disabled={busy} />
            <PasswordField label="New password" required minLength={12} maxLength={64} autoComplete="new-password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} disabled={busy} />
            <PasswordField label="Confirm new password" required minLength={12} maxLength={64} autoComplete="new-password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} disabled={busy} />
            <Button type="submit" loading={busy} icon={ShieldCheck}>Save new password</Button>
          </form>
        </Card>
        <Card className="card--pad" style={{ background: 'var(--green-50)' }}>
          <span className="section-title">Signed-in account</span>
          <h2 className="mt-2" style={{ fontSize: 18 }}>{user?.username}</h2>
          <p className="muted text-sm mt-1">{user?.email}</p>
          <div className="mt-3"><RoleBadge role={user?.role} /></div>
          <div className="divider" />
          <p className="text-sm ink-soft">Changing your password revokes existing sessions. This helps protect your account if you signed in on another device.</p>
        </Card>
      </div>
    </>
  )
}
