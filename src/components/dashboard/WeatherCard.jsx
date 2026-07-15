import { useState, useEffect } from "react"
import { fetchCityWeather, parseWeatherData, getWeatherDescription } from "../../data/aqiService"

export default function WeatherCard({ cityLat, cityLng, cityName }) {
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      if (cityLat == null || cityLng == null) return
      setLoading(true)
      try {
        const raw = await fetchCityWeather(cityLat, cityLng)
        if (!cancelled) {
          const parsed = parseWeatherData(raw)
          setWeather(parsed)
        }
      } catch (err) {
        if (!cancelled) {
          console.warn("Weather fetch failed:", err.message)
          setWeather(null)
        }
      }
      if (!cancelled) setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [cityLat, cityLng])

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-slate-900 dark:text-white font-display font-semibold">Current Weather</h3>
        <span className="text-xs text-slate-400 dark:text-slate-500">{cityName || ""}</span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-6">
          <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500">
            <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="text-sm">Loading weather...</span>
          </div>
        </div>
      ) : !weather ? (
        <div className="text-sm text-slate-400 dark:text-slate-500 text-center py-6">Weather data unavailable</div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-3xl font-bold text-slate-900 dark:text-white">{Math.round(weather.temperature)}°C</span>
            <span className="text-sm text-slate-500 dark:text-slate-400">{getWeatherDescription(weather.weatherCode)}</span>
          </div>
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-700">
            <div>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wide">Feels Like</p>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{Math.round(weather.apparentTemperature)}°C</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wide">Humidity</p>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{weather.humidity}%</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wide">Wind</p>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{weather.windSpeed} km/h</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wide">Pressure</p>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{weather.pressure} hPa</p>
            </div>
          </div>
          {weather.precipitation > 0 && (
            <div className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-lg px-3 py-1.5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
              Precipitation: {weather.precipitation} mm
            </div>
          )}
        </div>
      )}
    </div>
  )
}
