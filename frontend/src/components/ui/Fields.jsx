import { useId } from 'react'
import { AlertCircle } from 'lucide-react'

function Field({ label, hint, error, required, id, children }) {
  const autoId = useId()
  const fieldId = id || autoId
  return (
    <div className="field">
      {label && (
        <label className="field__label" htmlFor={fieldId}>
          {label}
          {required && <span style={{ color: 'var(--danger)' }}> *</span>}
        </label>
      )}
      {children(fieldId)}
      {hint && <div id={`${fieldId}-hint`} className="field__hint">{hint}</div>}
      {error && (
        <div id={`${fieldId}-error`} className="field__error" role="alert">
          <AlertCircle size={13} />
          {error}
        </div>
      )}
    </div>
  )
}

export function Input({
  label,
  hint,
  error,
  className = '',
  invalid,
  id,
  ...rest
}) {
  return (
    <Field label={label} hint={hint} error={error} id={id}>
      {(fieldId) => (
        <input
          id={fieldId}
          className={`input ${error || invalid ? 'input--error' : ''} ${className}`.trim()}
          aria-describedby={error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined}
          aria-invalid={Boolean(error)}
          {...rest}
        />
      )}
    </Field>
  )
}

export function Textarea({ label, hint, error, className = '', id, rows = 4, ...rest }) {
  return (
    <Field label={label} hint={hint} error={error} id={id}>
      {(fieldId) => (
        <textarea
          id={fieldId}
          rows={rows}
          className={`textarea ${error ? 'textarea--error' : ''} ${className}`.trim()}
          aria-describedby={error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined}
          aria-invalid={Boolean(error)}
          {...rest}
        />
      )}
    </Field>
  )
}

export function Select({ label, hint, error, className = '', id, children, ...rest }) {
  return (
    <Field label={label} hint={hint} error={error} id={id}>
      {(fieldId) => (
        <select
          id={fieldId}
          className={`select ${error ? 'select--error' : ''} ${className}`.trim()}
          aria-describedby={error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined}
          aria-invalid={Boolean(error)}
          {...rest}
        >
          {children}
        </select>
      )}
    </Field>
  )
}

export function Checkbox({ label, hint, error, id, ...rest }) {
  return (
    <Field label={null} hint={hint} error={error} id={id}>
      {(fieldId) => (
        <label className="check" htmlFor={fieldId}>
          <input id={fieldId} type="checkbox" {...rest} />
          <span>{label}</span>
        </label>
      )}
    </Field>
  )
}
