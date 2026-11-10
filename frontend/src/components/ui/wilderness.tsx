import { type ReactNode, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

interface ParallaxHeroProps {
  className?: string
  children?: ReactNode
}

export function ParallaxHero({ className, children }: ParallaxHeroProps) {
  const heroRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const hero = heroRef.current
    if (!hero || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let frame = 0
    const move = (event: PointerEvent) => {
      const bounds = hero.getBoundingClientRect()
      const x = (event.clientX - bounds.left) / bounds.width - 0.5
      const y = (event.clientY - bounds.top) / bounds.height - 0.5
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        hero.style.setProperty('--hero-x', `${x * 14}px`)
        hero.style.setProperty('--hero-y', `${y * 10}px`)
      })
    }
    const reset = () => {
      hero.style.setProperty('--hero-x', '0px')
      hero.style.setProperty('--hero-y', '0px')
    }

    hero.addEventListener('pointermove', move)
    hero.addEventListener('pointerleave', reset)
    return () => {
      cancelAnimationFrame(frame)
      hero.removeEventListener('pointermove', move)
      hero.removeEventListener('pointerleave', reset)
    }
  }, [])

  return (
    <section ref={heroRef} className={cn('wilderness', className)} aria-label="CarbonTrust Registry introduction">
      <img
        className="wilderness__photo"
        src="/images/community-restoration-hero.png"
        alt="Community volunteers planting and documenting young trees in a wetland"
        fetchPriority="high"
      />
      <div className="wilderness__wash" aria-hidden="true" />
      <div className="wilderness__grid" aria-hidden="true" />
      <div className="wilderness__glow wilderness__glow--one" aria-hidden="true" />
      <div className="wilderness__glow wilderness__glow--two" aria-hidden="true" />

      <div className="wilderness__content">
        <span className="wilderness__eyebrow"><i /> Transparent climate action</span>
        <h1>Nature restored.<br /><em>Impact recorded.</em></h1>
        <p className="wilderness__description">
          CarbonTrust connects community-led restoration with evidence, independent review and a clear credit trail.
        </p>
        {children}
      </div>

      <aside className="wilderness__signal" aria-label="Registry evidence signal">
        <span className="wilderness__signal-dot" />
        <span>Evidence in motion</span>
        <strong>Field → Registry</strong>
      </aside>
      <div className="wilderness__caption" aria-hidden="true">Community · Evidence · Accountability</div>
    </section>
  )
}

export default ParallaxHero
