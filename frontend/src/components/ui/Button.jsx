import { Link } from 'react-router-dom'
import { Loader2 } from 'lucide-react'

const VARIANTS = ['primary', 'secondary', 'ghost', 'danger', 'light', 'subtle-danger']

export default function Button({
  variant = 'primary',
  size,
  to,
  loading = false,
  block = false,
  icon: Icon,
  children,
  className = '',
  type = 'button',
  disabled,
  ...rest
}) {
  const variantClass = VARIANTS.includes(variant) ? `btn--${variant}` : 'btn--primary'
  const classes = `btn ${variantClass} ${size ? `btn--${size}` : ''} ${block ? 'btn--block' : ''} ${className}`.trim()

  const content = (
    <>
      {loading ? (
        <Loader2 size={16} className="spinner" style={{ width: 16, height: 16 }} aria-hidden="true" />
      ) : (
        Icon && <Icon size={16} aria-hidden="true" />
      )}
      {children}
    </>
  )

  if (to) {
    return (
      <Link to={to} className={classes} {...rest}>
        {content}
      </Link>
    )
  }

  return (
    <button type={type} className={classes} disabled={disabled || loading} {...rest}>
      {content}
    </button>
  )
}
