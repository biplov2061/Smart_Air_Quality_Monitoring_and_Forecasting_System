import { useEffect, useRef, useState } from "react"

export function usePolling(fetcher, deps = [], intervalMs = 0) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const fetcherRef = useRef(fetcher)
  fetcherRef.current = fetcher

  useEffect(() => {
    let alive = true
    let timer

    async function tick() {
      try {
        const result = await fetcherRef.current()
        if (alive && result !== null) {
          setData(result)
          setError(null)
        }
      } catch (err) {
        if (alive) setError(err.message)
      } finally {
        if (alive) setLoading(false)
      }
    }

    setLoading(true)
    tick()
    if (intervalMs > 0) timer = setInterval(tick, intervalMs)

    return () => {
      alive = false
      if (timer) clearInterval(timer)
    }
  }, deps)

  return { data, loading, error }
}
