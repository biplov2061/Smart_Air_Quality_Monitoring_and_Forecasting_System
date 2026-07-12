import { getPollutants } from "../../data/apiClient"
import { usePolling } from "../../data/useApi"
import { REFRESH_MS } from "../../data/config"

export default function PollutantBreakdown({ lat, lng }) {
  const { data, loading } = usePolling(
    () => (lat == null || lng == null ? Promise.resolve(null) : getPollutants(lat, lng)),
    [lat, lng],
    REFRESH_MS
  )
  const pollutants = data || []

  return (
    <div className="card card-hover p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-slate-900 dark:text-white font-display font-semibold">Pollutant Breakdown</h3>
        <span className="text-xs text-slate-400">Live · µg/m³</span>
      </div>

      {loading && pollutants.length === 0 ? (
        <div className="space-y-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-14 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {pollutants.map((p) => (
            <div
              key={p.name}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <div>
                <span className="text-slate-900 dark:text-white font-medium text-sm">{p.name}</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-slate-400 text-xs font-mono">
                    {p.value != null ? `${p.value} ${p.unit}` : "no data"}
                  </span>
                </div>
              </div>
              <span
                className="text-xs font-medium px-2.5 py-1 rounded-full"
                style={{ backgroundColor: `${p.color}22`, color: p.color }}
              >
                {p.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
