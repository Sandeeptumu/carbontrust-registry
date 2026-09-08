import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, Info, AlertTriangle, X } from 'lucide-react'

const ToastContext = createContext(null)

let counter = 0

const TYPE_META = {
  success: { icon: CheckCircle2, className: 'toast--success' },
  error: { icon: AlertTriangle, className: 'toast--error' },
  info: { icon: Info, className: 'toast--info' },
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const timers = useRef(new Map())

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
    const timer = timers.current.get(id)
    if (timer) {
      clearTimeout(timer)
      timers.current.delete(id)
    }
  }, [])

  const push = useCallback(
    (type, message, title) => {
      const id = ++counter
      setToasts((prev) => [...prev.slice(-4), { id, type, message, title }])
      timers.current.set(
        id,
        setTimeout(() => dismiss(id), type === 'error' ? 6000 : 4200),
      )
    },
    [dismiss],
  )

  const toast = useMemo(() => {
    const api = { dismiss }
    api.success = (message, title) => push('success', message, title)
    api.error = (message, title) => push('error', message, title)
    api.info = (message, title) => push('info', message, title)
    return api
  }, [dismiss, push])

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="toast-viewport" role="status" aria-live="polite">
        <AnimatePresence>
          {toasts.map((t) => {
            const meta = TYPE_META[t.type] || TYPE_META.info
            const Icon = meta.icon
            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: 16, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 24, transition: { duration: 0.18 } }}
                className={`toast ${meta.className}`}
                role="alert"
              >
                <Icon size={18} aria-hidden="true" />
                <div className="toast__content">
                  {t.title && <div className="toast__title">{t.title}</div>}
                  <div className="toast__msg">{t.message}</div>
                </div>
                <button
                  type="button"
                  className="icon-btn icon-btn--dark"
                  onClick={() => dismiss(t.id)}
                  aria-label="Dismiss notification"
                  style={{ color: 'rgba(255,255,255,.7)' }}
                >
                  <X size={15} />
                </button>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
