import { useEffect, useRef, useState } from 'react'

const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3)

/** Animates from 0 to `target` once mounted. Pass `start` to delay. */
export function useCountUp(target, { duration = 1400, delay = 0 } = {}) {
  const [value, setValue] = useState(0)
  const started = useRef(false)

  useEffect(() => {
    if (started.current) return
    started.current = true
    let frame
    let startTime
    const step = (now) => {
      if (startTime === undefined) startTime = now - delay * 1000
      const elapsed = now - startTime
      if (elapsed <= 0) {
        frame = requestAnimationFrame(step)
        return
      }
      const progress = Math.min(1, elapsed / duration)
      setValue(target * easeOutCubic(progress))
      if (progress < 1) frame = requestAnimationFrame(step)
    }
    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [target, duration, delay])

  return value
}
