import { Leaf } from 'lucide-react'

export default function Logo({ size = 40 }) {
  return (
    <span
      className="sidebar__logo"
      style={{ width: size, height: size, borderRadius: size * 0.3 }}
      aria-hidden="true"
    >
      <Leaf size={size * 0.52} strokeWidth={2.4} />
    </span>
  )
}
