import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AlertCircle, Eye, EyeOff, LogIn, Info } from 'lucide-react'
import { ApiError } from '../../api/client'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { roleHome } from '../../utils/roles'
import AuthLayout from './AuthLayout'
import Button from '../../components/ui/Button'

export default function LoginPage() {
  const { login } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const from = location.state?.from
  const justRegistered = location.state?.registered

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError(null)
    if (!email.trim() || !password) {
      setError('Please enter your email and password.')
      return
    }
    setLoading(true)
    try {
      const session = await login({ email: email.trim(), password })
      toast.success(`Welcome back, ${session.username}!`)
      navigate(from || roleHome(session.role), { replace: true })
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message || 'Sign in failed. Please check your credentials.'
          : 'Sign in failed. Please try again.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      <motion.div
        className="auth-card"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-sub">Sign in to continue to your CarbonTrust workspace.</p>

        {justRegistered && (
          <div className="alert alert--success mb-4" role="status">
            <Info size={17} />
            <div>
              Account created successfully. Sign in with your credentials below — new accounts
              receive the <strong>Buyer</strong> role.
            </div>
          </div>
        )}

        {error && (
          <div className="alert alert--danger mb-4" role="alert">
            <AlertCircle size={17} />
            <div>{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label className="field__label" htmlFor="login-email">
              Email address
            </label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              className="input"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoFocus
            />
          </div>

          <div className="field">
            <label className="field__label" htmlFor="login-password">
              Password
            </label>
            <div className="input-affix">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                className="input"
                placeholder="Your password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
              <button
                type="button"
                className="input-affix__action"
                onClick={() => setShowPassword((show) => !show)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

          <Button type="submit" block size="lg" loading={loading} icon={LogIn} style={{ marginTop: 6 }}>
            Sign in
          </Button>
        </form>

        <div className="auth-foot">
          Don&apos;t have an account yet? <Link to="/register">Create one</Link>
        </div>
        <p className="text-xs muted mt-4" style={{ textAlign: 'center', lineHeight: 1.6 }}>
          New registrations are created as <strong>Buyer</strong>. NGO, Verifier and Admin accounts
          are provisioned by your administrator.
        </p>
      </motion.div>
    </AuthLayout>
  )
}
