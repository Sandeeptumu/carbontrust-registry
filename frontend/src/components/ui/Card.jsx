export default function Card({ className = '', pad = false, hover = false, children, ...rest }) {
  const classes = [
    'card',
    pad && 'card--pad',
    hover && 'card--hover',
    className,
  ]
    .filter(Boolean)
    .join(' ')
  return (
    <div className={classes} {...rest}>
      {children}
    </div>
  )
}
