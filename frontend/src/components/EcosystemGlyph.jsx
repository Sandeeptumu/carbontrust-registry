import { Trees, Waves, Sprout, Droplets, TreePine, Leaf } from 'lucide-react'
import { ecosystemMeta } from '../utils/status'

const ICONS = {
  MANGROVE: Trees,
  SEAGRASS: Waves,
  'SALT MARSH': Sprout,
  SALT_MARSH: Sprout,
  WETLAND: Droplets,
  FOREST: TreePine,
}

export default function EcosystemGlyph({ ecosystem, size = 22, className = '' }) {
  const meta = ecosystemMeta(ecosystem)
  const Icon = ICONS[ecosystem] || ICONS[ecosystem?.trim().toUpperCase().replace(/\s+/g, '_')] || Leaf
  return (
    <Icon
      size={size}
      className={className}
      style={{ color: meta.color }}
      aria-hidden="true"
    />
  )
}

export function EcosystemTile({ ecosystem, size = 'md', light = false }) {
  const meta = ecosystemMeta(ecosystem)
  const Icon = ICONS[ecosystem] || Leaf
  return (
    <span
      className={`eco-tile eco-tile--${size}`}
      style={{
        background: light
          ? 'rgba(255,255,255,0.16)'
          : `linear-gradient(135deg, ${meta.color}, ${meta.color}bb)`,
        width: size === 'md' ? 46 : 62,
        height: size === 'md' ? 46 : 62,
        borderRadius: size === 'md' ? 13 : 16,
      }}
      aria-hidden="true"
    >
      <Icon size={size === 'md' ? 22 : 28} color={light ? '#fff' : '#fff'} />
    </span>
  )
}
