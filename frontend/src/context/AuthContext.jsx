import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loginUser, registerUser, fetchCurrentUser, logoutUser } from '../api/auth'
import { useToast } from './ToastContext'

const AuthContext = createContext(null)
export function AuthProvider({ children }) {
  const navigate = useNavigate()
  const toast = useToast()
  const sessionRevision = useRef(0)
  const [user, setUser] = useState(null)
  const [ready, setReady] = useState(false)
  const [sessionError, setSessionError] = useState(null)
  const expire = useCallback(() => { sessionRevision.current += 1; setUser(null); setReady(true); navigate('/login', { replace: true }) }, [navigate])
  const refreshSession = useCallback(async () => {
    const revision = ++sessionRevision.current
    try {
      const fresh = await fetchCurrentUser()
      if (revision !== sessionRevision.current) return
      setUser(fresh)
      setSessionError(null)
    } catch (error) {
      if (revision !== sessionRevision.current) return
      if (error.status === 401 || error.status === 403) { setUser(null); setSessionError(null) }
      else setSessionError(error)
    } finally { if (revision === sessionRevision.current) setReady(true) }
  }, [])
  useEffect(() => {
    // Discard legacy browser bearer credentials; identity is always restored from the server.
    localStorage.removeItem('carbontrust.token')
    localStorage.removeItem('carbontrust.user')
    refreshSession()
  }, [refreshSession])
  useEffect(() => {
    window.addEventListener('carbontrust:session-expired', expire)
    return () => window.removeEventListener('carbontrust:session-expired', expire)
  }, [expire])
  useEffect(() => {
    if (!user?.userId) return undefined
    const refresh = () => { if (document.visibilityState !== 'hidden') refreshSession() }
    window.addEventListener('focus', refresh)
    window.addEventListener('carbontrust:permissions-changed', refresh)
    const interval = window.setInterval(refresh, 30000)
    return () => {
      window.clearInterval(interval)
      window.removeEventListener('focus', refresh)
      window.removeEventListener('carbontrust:permissions-changed', refresh)
    }
  }, [user?.userId, refreshSession])
  const login = useCallback(async (credentials) => {
    const session = await loginUser(credentials)
    sessionRevision.current += 1
    setUser(session); setReady(true); setSessionError(null)
    return session
  }, [])
  const logout = useCallback(async (message) => {
    try { await logoutUser(); expire(); if (message) toast.info(message, 'Signed out') }
    catch (error) { toast.error(error.message || 'Sign out failed. Please try again.'); throw error }
  }, [expire, toast])
  const value = useMemo(() => ({ user, ready, sessionError, refreshSession, login, logout, register: registerUser, isAuthenticated: Boolean(user) }), [user, ready, sessionError, refreshSession, login, logout])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
