import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { forgotPassword, resendVerification, resetPassword, verifyEmail } from '../../api/auth'
import AuthLayout from './AuthLayout'
import Button from '../../components/ui/Button'
import { Input } from '../../components/ui/Fields'
import PasswordField from '../../components/auth/PasswordField'
const TITLES = { forgot: 'Reset your password', resend: 'Verify your email', reset: 'Choose a new password', verify: 'Confirm your email' }
export default function RecoveryPage({ mode }) {
  const [params] = useSearchParams()
  const token = params.get('token') || ''
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const needsToken = mode === 'reset' || mode === 'verify'
  const submit = async (event) => {
    event.preventDefault()
    if (busy) return
    setError('')
    if (mode === 'reset' && password !== confirmation) { setError('Passwords do not match'); return }
    setBusy(true)
    try {
      let result
      if (mode === 'forgot') result = await forgotPassword(email.trim())
      if (mode === 'resend') result = await resendVerification(email.trim())
      if (mode === 'reset') result = await resetPassword({ token, password, passwordConfirmation: confirmation })
      if (mode === 'verify') result = await verifyEmail(token)
      setSuccess(result?.message || (mode === 'reset' ? 'Password updated. Sign in with your new password.' : mode === 'verify' ? 'Email verified. You can now sign in when your account is active.' : 'If an eligible account exists, an email will arrive shortly.'))
      setPassword(''); setConfirmation('')
    } catch (err) { setError(err.message || 'Could not complete the request. Please try again.') }
    finally { setBusy(false) }
  }
  return <AuthLayout><div className="auth-card">
    <div className="auth-eyebrow">Account security</div>
    <h1 className="auth-title">{TITLES[mode]}</h1>
    <p className="auth-sub">{mode === 'verify' ? 'Confirm to finish verifying the email address for your account.' : mode === 'reset' ? 'Use a new passphrase with at least 12 characters.' : 'Enter your account email and we’ll send you a secure link.'}</p>
    {success ? <div className="alert alert--success" role="status">{success}</div> : needsToken && !token ? <div className="alert alert--danger" role="alert">This link is missing its security token. Request a new link below.</div> : <form onSubmit={submit} aria-busy={busy}>
      {error && <div className="alert alert--danger mb-4" role="alert">{error}</div>}
      {!needsToken && <Input label="Email address" type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} disabled={busy} />}
      {mode === 'reset' && <>
        <PasswordField required minLength={12} maxLength={64} autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)} disabled={busy} />
        <PasswordField label="Confirm password" required minLength={12} maxLength={64} autoComplete="new-password" value={confirmation} onChange={e => setConfirmation(e.target.value)} disabled={busy} />
      </>}
      <Button type="submit" loading={busy} block size="lg">{mode === 'verify' ? 'Verify email' : mode === 'reset' ? 'Save new password' : 'Send secure link'}</Button>
    </form>}
    {needsToken && !success && <div className="auth-foot"><Link to={mode === 'verify' ? '/resend-verification' : '/forgot-password'}>Request a new link</Link></div>}
    <div className="auth-foot"><Link to="/login">Back to sign in</Link></div>
  </div></AuthLayout>
}
