import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Runs an async function and tracks { data, loading, error }.
 * `fn` must be memoized by the caller (useCallback) to control reloads.
 */
export function useAsync(fn, { immediate = true } = {}) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(Boolean(immediate))
  const [error, setError] = useState(null)
  const mounted = useRef(true)

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])

  const run = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await fn()
      if (mounted.current) {
        setData(result)
        setLoading(false)
      }
      return result
    } catch (err) {
      if (mounted.current) {
        setError(err)
        setLoading(false)
      }
      throw err
    }
  }, [fn])

  useEffect(() => {
    if (immediate) {
      run().catch(() => {})
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run])

  return { data, loading, error, run, setData }
}

export default useAsync
