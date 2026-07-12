import { getWeather } from "../../data/apiClient"
import { usePolling } from "../../data/useApi"
import { REFRESH_MS } from "../../data/config"

function Metric({ label, value }) {
  return (
    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl px-3 py-2">
      <div className="text-[10px] uppercase tracking-wider text-slate-400">{label}</div>
      <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">{value}</div>
    </div>
  )
}

export default function WeatherCard({ lat, lng, city }) {
  const { data: weather, loading } = usePolling(
    () => (lat == null || lng == null ? Promise.resolve(null) : getWeather(lat, lng)),
    [lat, lng],
    REFRESH_MS
  )

  return (
    <div className="card card-hover p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-slate-900 dark:text-white font-display font-semibold">Current Weather</h3>
        <span className="text-xs text-slate-400 truncate max-w-[45%]">{city}</span>
      </div>

      {loading && !weather ? (
        <div className="space-y-3">
          <div className="h-12 w-28 rounded-lg bg-slate-100 dark:bg-slate-800 animate-pulse" />
          <div className="grid grid-cols-2 gap-3">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-12 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
            ))}
          </div>
        </div>
      ) : weather ? (
        <>
          <div className="flex items-end justify-between mb-4">
            <span className="text-5xl font-bold font-mono text-slate-900 dark:text-white leading-none">
              {weather.temperature != null ? Math.round(weather.temperature) : "—"}
              <span className="text-2xl align-top text-slate-400">°C</span>
            </span>
            <span className="text-sm text-slate-500 dark:text-slate-400 text-right">{weather.description}</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Metric label="Feels like" value={weather.feelsLike != null ? `${Math.round(weather.feelsLike)}°C` : "—"} />
            <Metric label="Humidity" value={weather.humidity != null ? `${weather.humidity}%` : "—"} />
            <Metric label="Wind" value={weather.windSpeed != null ? `${weather.windSpeed} km/h` : "—"} />
            <Metric label="Pressure" value={weather.pressure != null ? `${Math.round(weather.pressure)} hPa` : "—"} />
          </div>
        </>
      ) : (
        <p className="text-sm text-slate-400">Weather unavailable for this location.</p>
      )}
    </div>
  )
}
