import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { roleHome } from '../../utils/roles'
import AuthLayout from './AuthLayout'
import Button from '../../components/ui/Button'
import { Input } from '../../components/ui/Fields'
import PasswordField from '../../components/auth/PasswordField'
export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const submit = async (event) => {
    event.preventDefault()
    if (busy) return
    setError(''); setBusy(true)
    try {
      const session = await login({ email: email.trim(), password })
      const from = location.state?.from
      navigate(typeof from === 'string' && from.startsWith('/') && !from.startsWith('//') ? from : roleHome(session.role), { replace: true })
    } catch (err) { setError(err.message || 'Sign in failed. Please try again.') }
    finally { setBusy(false) }
  }
  return <AuthLayout><div className="auth-card">
    <div className="auth-eyebrow">The future is worth restoring</div>
    <h1 className="auth-title">Welcome back.</h1>
    <p className="auth-sub">Sign in to your CarbonTrust workspace.</p>
    {error && <div className="alert alert--danger mb-4" role="alert">{error}</div>}
    <form onSubmit={submit} aria-busy={busy}>
      <Input label="Email address" type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} disabled={busy} />
      <PasswordField autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} disabled={busy} />
      <div className="auth-recovery"><Link to="/forgot-password">Forgot password?</Link></div>
      <Button type="submit" block size="lg" loading={busy}>Sign in</Button>
    </form>
    <div className="auth-foot">New to CarbonTrust? <Link to="/register">Create an account</Link></div>
    <div className="auth-foot"><Link to="/resend-verification">Resend verification email</Link></div>
  </div></AuthLayout>
}
