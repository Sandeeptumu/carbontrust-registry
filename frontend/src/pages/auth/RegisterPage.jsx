import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import AuthLayout from './AuthLayout'
import Button from '../../components/ui/Button'
import { Input } from '../../components/ui/Fields'
import PasswordField from '../../components/auth/PasswordField'
export default function RegisterPage() {
  const { register } = useAuth()
  const [values, setValues] = useState({ username: '', email: '', password: '', passwordConfirmation: '' })
  const [errors, setErrors] = useState({})
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [busy, setBusy] = useState(false)
  const update = (key) => (event) => setValues({ ...values, [key]: event.target.value })
  const submit = async (event) => {
    event.preventDefault()
    if (busy) return
    const invalid = {}
    if (values.username.trim().length < 3) invalid.username = 'Username must be at least 3 characters'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) invalid.email = 'Enter a valid email address'
    if (values.password.length < 12) invalid.password = 'Use at least 12 characters'
    if (values.password.length > 64 || new TextEncoder().encode(values.password).length > 72) invalid.password = 'Use at most 64 characters and 72 UTF-8 bytes'
    if (values.password !== values.passwordConfirmation) invalid.passwordConfirmation = 'Passwords do not match'
    setErrors(invalid); setError('')
    if (Object.keys(invalid).length) return
    setBusy(true)
    try {
      const result = await register({ ...values, username: values.username.trim(), email: values.email.trim() })
      setSuccess(result?.message || 'Check your email for a verification link before signing in.')
      setValues({ ...values, password: '', passwordConfirmation: '' })
    } catch (err) { setError(err.message); setErrors(err.fieldErrors || {}) }
    finally { setBusy(false) }
  }
  return <AuthLayout><div className="auth-card">
    <div className="auth-eyebrow">Start your climate journey</div>
    <h1 className="auth-title">Create your account</h1>
    <p className="auth-sub">A shared commitment. A measurable difference.</p>
    {success ? <div className="alert alert--success" role="status">{success}</div> : <form onSubmit={submit} noValidate aria-busy={busy}>
      {error && <div className="alert alert--danger mb-4" role="alert">{error}</div>}
      <Input label="Username" autoComplete="username" value={values.username} onChange={update('username')} error={errors.username} maxLength={100} disabled={busy} />
      <Input label="Email" type="email" autoComplete="email" value={values.email} onChange={update('email')} error={errors.email} disabled={busy} />
      <PasswordField maxLength={64} autoComplete="new-password" value={values.password} onChange={update('password')} error={errors.password} disabled={busy} />
      <p className="field__hint" style={{ marginTop: -10, marginBottom: 16 }}>Use at least 12 characters. A memorable passphrase works well.</p>
      <PasswordField maxLength={64} label="Confirm password" autoComplete="new-password" value={values.passwordConfirmation} onChange={update('passwordConfirmation')} error={errors.passwordConfirmation} disabled={busy} />
      <Button type="submit" block size="lg" loading={busy}>Create account</Button>
      <p className="auth-helper">Your account starts with User access. An administrator manages elevated roles and account approval.</p>
    </form>}
    <div className="auth-foot">Already have an account? <Link to="/login">Sign in</Link></div>
    {success && <div className="auth-foot"><Link to="/resend-verification">Resend verification email</Link></div>}
  </div></AuthLayout>
}
