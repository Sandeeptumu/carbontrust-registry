import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { useNavigate } from 'react-router-dom'
import { ApiError } from '../api/client'
import { loginUser, registerUser, fetchCurrentUser } from '../api/auth'
import {
  getStoredUser,
  getToken,
  setToken,
  setStoredUser,
  clearSession,
} from '../utils/storage'
import { useToast } from './ToastContext'

const AuthContext = createContext(null)

const EVENT = 'carbontrust:session-expired'

export function AuthProvider({ children }) {
  const navigate = useNavigate()
  const toast = useToast()
  const [user, setUser] = useState(() => getStoredUser())
  const [ready, setReady] = useState(false)

  const logout = useCallback(
    (message, title = 'Signed out') => {
      clearSession()
      setUser(null)
      setReady(true)
      if (message) toast.info(message, title)
      navigate('/login', { replace: true })
    },
    [navigate, toast],
  )

  // A 401/403 from any API call means the JWT is invalid/expired.
  useEffect(() => {
    const onExpired = () => logout('Your session has expired. Please sign in again.', 'Session expired')
    window.addEventListener(EVENT, onExpired)
    return () => window.removeEventListener(EVENT, onExpired)
  }, [logout])

  // Restore + validate the stored session once on boot.
  useEffect(() => {
    let cancelled = false
    const bootstrap = async () => {
      const token = getToken()
      const stored = getStoredUser()
      if (!token || !stored) {
        if (!cancelled) setReady(true)
        return
      }
      try {
        const fresh = await fetchCurrentUser()
        if (!cancelled) {
          const next = {
            userId: fresh.userId ?? stored.userId,
            username: fresh.username ?? stored.username,
            email: fresh.email ?? stored.email,
            role: fresh.role ?? stored.role,
          }
          setUser(next)
          setStoredUser(next)
          setReady(true)
        }
      } catch (error) {
        // Invalid token -> session-expired event logs out.
        // Network error -> keep the optimistic session so the app still opens.
        if (!cancelled && error instanceof ApiError && error.status === 0) {
          setReady(true)
        } else if (!cancelled && !(error instanceof ApiError)) {
          setReady(true)
        }
      }
    }
    bootstrap()
    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(
    async (credentials) => {
      const response = await loginUser(credentials)
      const session = {
        userId: response.userId,
        username: response.username,
        email: response.email,
        role: response.role,
      }
      setToken(response.token)
      setStoredUser(session)
      setUser(session)
      return session
    },
    [],
  )

  const register = useCallback(
    async (payload) => {
      await registerUser(payload)
    },
    [],
  )

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      ready,
      login,
      register,
      logout,
    }),
    [user, ready, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
