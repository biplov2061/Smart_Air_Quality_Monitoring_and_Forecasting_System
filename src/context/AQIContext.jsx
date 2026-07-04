import { useState, useEffect, useCallback, useRef, useSyncExternalStore } from "react"
import { cityList } from "../data/cities"
import { fetchAllCities, getAQIColor, getAQIBand } from "../data/aqiService"
import { AQIContext } from "./useAQI"

const REFRESH_INTERVAL = 10 * 60 * 1000

let globalLastUpdated = null
const timeListeners = new Set()

function notifyTimeListeners() {
  timeListeners.forEach((fn) => fn())
}

function subscribeToTime(fn) {
  timeListeners.add(fn)
  return () => timeListeners.delete(fn)
}

function getTimeAgo() {
  if (!globalLastUpdated) return "Loading..."
  const mins = Math.floor((Date.now() - new Date(globalLastUpdated).getTime()) / 60000)
  return mins < 1 ? "Just now" : `${mins} min ago`
}

function fillMissing(cities) {
  return cities.map((c) => ({
    ...c,
    aqi: c.aqi ?? Math.floor(Math.random() * 60) + 15,
    color: getAQIColor(c.aqi ?? 30),
    band: getAQIBand(c.aqi ?? 30),
  }))
}

export function AQIProvider({ children }) {
  const [cities, setCities] = useState(() =>
    fillMissing(cityList.map((c) => ({ ...c, id: c.id || Math.random().toString(36).substring(2, 9) })))
  )
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [progress, setProgress] = useState(0)
  const mountedRef = useRef(true)
  const fetchedOnce = useRef(false)

  const timeAgo = useSyncExternalStore(subscribeToTime, getTimeAgo, getTimeAgo)

  const loadData = useCallback(async () => {
    setError(null)
    setProgress(0)

    try {
      const results = await fetchAllCities(cityList, (p) => {
        if (mountedRef.current) setProgress(p)
      })

      if (!mountedRef.current) return

      const enhanced = results.map((r) => ({
        ...r,
        aqi: r.aqi ?? Math.floor(Math.random() * 60) + 15,
        color: getAQIColor(r.aqi ?? 30),
        band: getAQIBand(r.aqi ?? 30),
      }))

      setCities(enhanced)
      globalLastUpdated = new Date().toISOString()
      notifyTimeListeners()
      setError(null)
      fetchedOnce.current = true
    } catch (err) {
      if (!mountedRef.current) return
      console.warn("Failed to fetch AQI data, using fallback:", err.message)
      setError(err.message)
    } finally {
      if (mountedRef.current) {
        setLoading(false)
        if (!fetchedOnce.current) {
          fetchedOnce.current = true
        }
      }
    }
  }, [])

  useEffect(() => {
    const timer = setInterval(notifyTimeListeners, 60000)

    async function init() {
      await loadData()
    }
    init()

    const interval = setInterval(() => init(), REFRESH_INTERVAL)
    return () => {
      mountedRef.current = false
      clearInterval(interval)
      clearInterval(timer)
    }
  }, [loadData])

  const refresh = useCallback(() => {
    setLoading(true)
    loadData()
  }, [loadData])

  const globalStats = {
    citiesMonitored: cities.length,
    countriesCovered: new Set(cities.map((c) => c.country)).size,
    avgAQI: Math.round(cities.reduce((s, c) => s + (c.aqi || 0), 0) / cities.length),
    updatedAt: timeAgo,
  }

  return (
    <AQIContext.Provider
      value={{
        cities,
        loading,
        error,
        lastUpdated: globalLastUpdated,
        progress,
        refresh,
        globalStats,
      }}
    >
      {children}
    </AQIContext.Provider>
  )
}
