import { useId, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
export default function PasswordField({ label = 'Password', error, ...props }) {
  const id = useId()
  const [visible, setVisible] = useState(false)
  return <div className="field">
    <label className="field__label" htmlFor={id}>{label}</label>
    <div className="input-affix">
      <input id={id} className={`input ${error ? 'input--error' : ''}`} type={visible ? 'text' : 'password'} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} {...props} />
      <button type="button" className="input-affix__action" aria-label={`${visible ? 'Hide' : 'Show'} ${label.toLowerCase()}`} aria-pressed={visible} onClick={() => setVisible(!visible)}>{visible ? <EyeOff size={18} /> : <Eye size={18} />}</button>
    </div>
    {error && <div id={`${id}-error`} className="field__error" role="alert">{error}</div>}
  </div>
}
