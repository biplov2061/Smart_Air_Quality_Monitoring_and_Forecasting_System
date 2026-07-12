import { getCountryRanking } from "../../data/apiClient"
import { usePolling } from "../../data/useApi"
import { CITIES_REFRESH_MS } from "../../data/config"
import { getAQIColor, getAQIBand } from "../../data/aqiService"

export default function CountryRanking() {
  const { data, loading } = usePolling(() => getCountryRanking(5), [], CITIES_REFRESH_MS)
  const countries = data || []
  const maxAQI = countries[0]?.aqi || 200

  return (
    <div className="card card-hover p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-slate-900 dark:text-white font-display font-semibold text-lg">Most Polluted</h3>
        <span className="text-xs text-slate-500 dark:text-slate-400">Top 5 Countries</span>
      </div>

      {loading && countries.length === 0 ? (
        <div className="space-y-4">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="h-8 rounded-lg bg-slate-100 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {countries.map((country) => {
            const color = getAQIColor(country.aqi)
            const band = getAQIBand(country.aqi)
            const widthPercent = (country.aqi / maxAQI) * 100

            return (
              <div key={country.name} className="group cursor-pointer">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-mono text-slate-500 dark:text-slate-400 group-hover:bg-slate-200 dark:group-hover:bg-slate-700 transition-colors">
                      {country.rank}
                    </span>
                    <span className="text-slate-900 dark:text-white text-sm font-medium">
                      {country.flag} {country.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-900 dark:text-white font-mono text-sm font-bold">{country.aqi}</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">{band}</span>
                  </div>
                </div>
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500 group-hover:opacity-80"
                    style={{
                      width: `${widthPercent}%`,
                      backgroundColor: color,
                      boxShadow: `0 0 8px ${color}40`,
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
