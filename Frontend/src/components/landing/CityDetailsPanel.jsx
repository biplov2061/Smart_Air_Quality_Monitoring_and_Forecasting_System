import { getAQIColor, getAQIBand } from "../../data/aqiService"
import { getWeather } from "../../data/apiClient"
import { usePolling } from "../../data/useApi"
import { TREND_REFRESH_MS } from "../../data/config"

const pollutantInfo = [
  { key: "pm25", label: "PM2.5", unit: "µg/m³" },
  { key: "pm10", label: "PM10", unit: "µg/m³" },
  { key: "ozone", label: "O₃", unit: "µg/m³" },
  { key: "no2", label: "NO₂", unit: "µg/m³" },
  { key: "so2", label: "SO₂", unit: "µg/m³" },
  { key: "co", label: "CO", unit: "µg/m³" },
]

function getPollutantLevel(value) {
  if (value == null) return { label: "No data", color: "#94a3b8", pct: 0 }
  if (value <= 33) return { label: "Good", color: "#16a34a", pct: 25 }
  if (value <= 66) return { label: "Moderate", color: "#ca8a04", pct: 50 }
  if (value <= 100) return { label: "Unhealthy", color: "#ea580c", pct: 75 }
  return { label: "Hazardous", color: "#dc2626", pct: 100 }
}

const recommendations = [
  { minAqi: 301, icon: "☠️", title: "Health Emergency", desc: "Avoid all outdoor activity. Wear N95 mask if going out. Use air purifiers indoors." },
  { minAqi: 201, icon: "😷", title: "Severe Health Risk", desc: "Avoid outdoor exertion. Keep windows sealed. Run air purifiers continuously." },
  { minAqi: 151, icon: "⚠️", title: "Health Alert", desc: "Limit outdoor activity. Sensitive groups should stay indoors." },
  { minAqi: 101, icon: "⚡", title: "Reduce Exposure", desc: "Sensitive groups should reduce prolonged outdoor exertion." },
  { minAqi: 51, icon: "👃", title: "Moderate", desc: "Unusually sensitive people should consider limiting outdoor activity." },
  { minAqi: 0, icon: "🌿", title: "Good Air", desc: "Air quality is satisfactory. Enjoy outdoor activities." },
]

function getRecommendation(aqi) {
  return recommendations.find((r) => aqi >= r.minAqi) || recommendations[recommendations.length - 1]
}

export default function CityDetailsPanel({ city, onClose, loading }) {
  // Live weather for the shown location (searched or map-clicked).
  const { data: weather } = usePolling(
    () => (!city || city.lat == null ? Promise.resolve(null) : getWeather(city.lat, city.lng)),
    [city?.lat, city?.lng],
    TREND_REFRESH_MS
  )

  if (!city) return null

  const hasAqi = city.aqi != null
  const color = getAQIColor(city.aqi)
  const band = getAQIBand(city.aqi)
  const percentage = Math.min(((city.aqi ?? 0) / 500) * 100, 100)
  const circumference = 2 * Math.PI * 70
  const offset = circumference - (percentage / 100) * circumference
  const rec = getRecommendation(city.aqi ?? 0)

  return (
    <>
      <div className="fixed inset-0 z-[2000]" onClick={onClose} />
      <div className="fixed top-0 right-0 z-[2001] h-full w-full max-w-md bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 overflow-y-auto">
        <div className="sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-slate-100 dark:border-slate-800 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-lg font-display font-bold text-slate-900 dark:text-white">{city.name}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
              {city.country || "Live location"}
              {loading && (
                <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  fetching live AQI…
                </span>
              )}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-6 space-y-6">
          <div className="flex flex-col items-center">
            <div className="relative w-44 h-44">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
                <circle cx="100" cy="100" r="70" fill="none" strokeWidth="14" stroke="currentColor" className="text-slate-100 dark:text-slate-700" />
                <circle
                  cx="100" cy="100" r="70"
                  fill="none" stroke={color}
                  strokeWidth="14"
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                  style={{ filter: `drop-shadow(0 0 6px ${color}55)` }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-bold font-mono" style={{ color }}>{hasAqi ? city.aqi : "—"}</span>
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">{band}</span>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              {[
                { label: "Good", color: "#00e400" },
                { label: "Mod", color: "#ffff00" },
                { label: "Sens", color: "#ff7e00" },
                { label: "Unh", color: "#ff0000" },
                { label: "V.U", color: "#8f3f97" },
                { label: "Haz", color: "#7e0023" },
              ].map((b) => (
                <div key={b.label} className="flex flex-col items-center gap-0.5">
                  <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: b.color }} />
                  <span className="text-[7px] text-slate-400 leading-tight text-center">{b.label}</span>
                </div>
              ))}
            </div>
          </div>

          {weather && (
            <div className="rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Current Weather</h3>
                <span className="text-xs text-slate-400">{weather.description}</span>
              </div>
              <div className="text-4xl font-bold font-mono text-slate-900 dark:text-white mb-3">
                {weather.temperature != null ? `${Math.round(weather.temperature)}°C` : "—"}
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400 uppercase tracking-wide">Feels like</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-200">{weather.feelsLike != null ? `${Math.round(weather.feelsLike)}°C` : "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 uppercase tracking-wide">Humidity</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-200">{weather.humidity != null ? `${weather.humidity}%` : "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 uppercase tracking-wide">Wind</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-200">{weather.windSpeed != null ? `${weather.windSpeed} km/h` : "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 uppercase tracking-wide">Pressure</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-200">{weather.pressure != null ? `${Math.round(weather.pressure)} hPa` : "—"}</span>
                </div>
              </div>
            </div>
          )}

          <div>
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 uppercase tracking-wider">Pollutant Breakdown</h3>
            <div className="space-y-2">
              {pollutantInfo.map((p) => {
                const value = city[p.key]
                const level = getPollutantLevel(value)
                return (
                  <div key={p.key} className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg px-3 py-2">
                    <span className="w-12 text-xs font-medium text-slate-600 dark:text-slate-300">{p.label}</span>
                    <div className="flex-1">
                      <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${level.pct}%`, backgroundColor: level.color }}
                        />
                      </div>
                    </div>
                    <span className="w-20 text-right text-xs font-mono text-slate-500 dark:text-slate-400">
                      {value != null ? `${value} ${p.unit}` : "—"}
                    </span>
                    <span className="w-16 text-right text-xs font-medium" style={{ color: level.color }}>
                      {level.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-700">
            <div className="flex items-start gap-3">
              <span className="text-xl">{rec.icon}</span>
              <div>
                <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100">{rec.title}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{rec.desc}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
