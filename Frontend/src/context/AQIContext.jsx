import { useState, useEffect, useCallback, useRef, useSyncExternalStore } from "react"
import { getCities } from "../data/apiClient"
import { getAQIColor, getAQIBand } from "../data/aqiService"
import { CITIES_REFRESH_MS, TICK_MS } from "../data/config"
import { AQIContext } from "./useAQI"

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
  const secs = Math.floor((Date.now() - new Date(globalLastUpdated).getTime()) / 1000)
  if (secs < 5) return "Just now"
  if (secs < 60) return `${secs}s ago`
  const mins = Math.floor(secs / 60)
  return `${mins}m ago`
}


function decorate(city) {
  return {
    ...city,
    color: city.color || getAQIColor(city.aqi),
    band: city.band || getAQIBand(city.aqi),
  }
}

export function AQIProvider({ children }) {
  const [cities, setCities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const mountedRef = useRef(true)

  const timeAgo = useSyncExternalStore(subscribeToTime, getTimeAgo, getTimeAgo)

  const loadData = useCallback(async () => {
    setError(null)
    try {
      const results = await getCities()
      if (!mountedRef.current) return
      setCities(results.map(decorate))
      globalLastUpdated = new Date().toISOString()
      notifyTimeListeners()
      setError(null)
    } catch (err) {
      if (!mountedRef.current) return
      console.warn("Failed to fetch AQI data from backend:", err.message)
      setError(err.message)
    } finally {
      if (mountedRef.current) setLoading(false)
    }
  }, [])

  useEffect(() => {
    mountedRef.current = true
    const ticker = setInterval(notifyTimeListeners, TICK_MS)
    loadData()
    const refresh = setInterval(loadData, CITIES_REFRESH_MS)
    return () => {
      mountedRef.current = false
      clearInterval(refresh)
      clearInterval(ticker)
    }
  }, [loadData])

  const refresh = useCallback(() => {
    setLoading(true)
    loadData()
  }, [loadData])

  const withData = cities.filter((c) => c.aqi != null)
  const globalStats = {
    citiesMonitored: cities.length,
    countriesCovered: new Set(cities.map((c) => c.country)).size,
    avgAQI: withData.length
      ? Math.round(withData.reduce((s, c) => s + c.aqi, 0) / withData.length)
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
        refresh,
        globalStats,
      }}
    >
      {children}
    </AQIContext.Provider>
  )
}
