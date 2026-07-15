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

function enhance(cities) {
  return cities.map((c) => ({
    ...c,
    aqi: c.aqi ?? null,
    color: c.aqi != null ? getAQIColor(c.aqi) : "#94a3b8",
    band: c.aqi != null ? getAQIBand(c.aqi) : "No data",
  }))
}

export function AQIProvider({ children }) {
  const [cities, setCities] = useState(() => enhance(cityList))
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [progress, setProgress] = useState(0)
  const mountedRef = useRef(true)

  const timeAgo = useSyncExternalStore(subscribeToTime, getTimeAgo, getTimeAgo)

  const loadData = useCallback(async () => {
    try {
      const results = await fetchAllCities(cityList, (p) => {
        if (mountedRef.current) setProgress(p)
      })

      if (!mountedRef.current) return

      setCities(enhance(results))
      globalLastUpdated = new Date().toISOString()
      notifyTimeListeners()
      setError(null)
    } catch (err) {
      if (!mountedRef.current) return
      setError(err.message)
    } finally {
      if (mountedRef.current) {
        setLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    mountedRef.current = true
    const timer = setInterval(notifyTimeListeners, 60000)

    loadData()

    const interval = setInterval(() => loadData(), REFRESH_INTERVAL)
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

  const citiesWithData = cities.filter((c) => c.aqi != null)
  const globalStats = {
    citiesMonitored: citiesWithData.length,
    countriesCovered: new Set(citiesWithData.map((c) => c.country)).size,
    avgAQI: citiesWithData.length > 0
      ? Math.round(citiesWithData.reduce((s, c) => s + c.aqi, 0) / citiesWithData.length)
      : 0,
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
