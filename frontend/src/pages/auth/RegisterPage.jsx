import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AlertCircle, Eye, EyeOff, UserPlus } from 'lucide-react'
import { ApiError } from '../../api/client'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import AuthLayout from './AuthLayout'
import Button from '../../components/ui/Button'
import { Input } from '../../components/ui/Fields'

const INITIAL = {
  firstName: '',
  lastName: '',
  username: '',
  email: '',
  phoneNumber: '',
  address: '',
  dateOfBirth: '',
  password: '',
  confirmPassword: '',
}

function validate(values) {
  const errors = {}
  if (!values.firstName.trim()) errors.firstName = 'First name is required'
  if (!values.lastName.trim()) errors.lastName = 'Last name is required'
  if (values.username.trim().length < 3) errors.username = 'Username must be at least 3 characters'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) errors.email = 'Enter a valid email address'
  if (!values.phoneNumber.trim()) errors.phoneNumber = 'Phone number is required'
  if (!values.address.trim()) errors.address = 'Address is required'
  if (values.password.length < 8) errors.password = 'Password must be at least 8 characters'
  if (values.password !== values.confirmPassword) errors.confirmPassword = 'Passwords do not match'
  return errors
}

export default function RegisterPage() {
  const { register } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  const [values, setValues] = useState(INITIAL)
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState(null)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const update = (key) => (event) =>
    setValues((prev) => ({ ...prev, [key]: event.target.value }))

  const handleSubmit = async (event) => {
    event.preventDefault()
    setServerError(null)
    const validation = validate(values)
    setErrors(validation)
    if (Object.keys(validation).length) return

    setLoading(true)
    try {
      const payload = {
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        username: values.username.trim(),
        email: values.email.trim(),
        phoneNumber: values.phoneNumber.trim(),
        address: values.address.trim(),
        password: values.password,
        dateOfBirth: values.dateOfBirth || null,
      }
      await register(payload)
      toast.success('Your account is ready. Please sign in.', 'Account created')
      navigate('/login', { state: { registered: values.email.trim() } })
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.fieldErrors) {
          setErrors(err.fieldErrors)
        } else {
          setServerError(err.message || 'Registration failed.')
        }
      } else {
        setServerError('Registration failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      <motion.div
        className="auth-card"
        style={{ maxWidth: 460 }}
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <h1 className="auth-title">Create your account</h1>
        <p className="auth-sub">
          Join the registry as a carbon credit buyer. NGOs, verifiers and admins are onboarded by
          administrators.
        </p>

        {serverError && (
          <div className="alert alert--danger mb-4" role="alert">
            <AlertCircle size={17} />
            <div>{serverError}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 14px' }}>
            <Input label="First name" value={values.firstName} onChange={update('firstName')} error={errors.firstName} placeholder="Jane" autoComplete="given-name" />
            <Input label="Last name" value={values.lastName} onChange={update('lastName')} error={errors.lastName} placeholder="Doe" autoComplete="family-name" />
          </div>

          <Input label="Username" value={values.username} onChange={update('username')} error={errors.username} placeholder="janedoe" autoComplete="username" />
          <Input label="Email" type="email" value={values.email} onChange={update('email')} error={errors.email} placeholder="you@example.com" autoComplete="email" />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 14px' }}>
            <Input label="Phone number" value={values.phoneNumber} onChange={update('phoneNumber')} error={errors.phoneNumber} placeholder="+1 555 0100" autoComplete="tel" />
            <div>
              <div className="field__label" style={{ marginBottom: 7 }}>Date of birth</div>
              <Input type="date" value={values.dateOfBirth} onChange={update('dateOfBirth')} aria-label="Date of birth" />
            </div>
          </div>

          <Input label="Address" value={values.address} onChange={update('address')} error={errors.address} placeholder="City, country" autoComplete="street-address" />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 14px' }}>
            <div className="field">
              <label className="field__label" htmlFor="reg-password">Password</label>
              <div className="input-affix">
                <input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  className={`input ${errors.password ? 'input--error' : ''}`}
                  placeholder="Min. 8 characters"
                  value={values.password}
                  onChange={update('password')}
                  autoComplete="new-password"
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
              {errors.password && <div className="field__error" role="alert">{errors.password}</div>}
            </div>
            <Input
              label="Confirm password"
              type="password"
              value={values.confirmPassword}
              onChange={update('confirmPassword')}
              error={errors.confirmPassword}
              placeholder="Repeat password"
              autoComplete="new-password"
            />
          </div>

          <Button type="submit" block size="lg" loading={loading} icon={UserPlus} style={{ marginTop: 4 }}>
            Create account
          </Button>
        </form>

        <div className="auth-foot">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </motion.div>
    </AuthLayout>
  )
}
