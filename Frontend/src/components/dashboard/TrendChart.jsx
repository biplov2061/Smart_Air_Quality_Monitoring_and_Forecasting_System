import { useState } from "react"
import { XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart, ReferenceLine } from "recharts"
import { getTrend, getHistory } from "../../data/apiClient"
import { usePolling } from "../../data/useApi"
import { TREND_REFRESH_MS } from "../../data/config"

const MODES = [
  { key: "forecast", label: "Forecast" },
  { key: "history", label: "History" },
]

export default function TrendChart({ lat, lng }) {
  const [mode, setMode] = useState("forecast")

  const { data, loading } = usePolling(
    () => {
      if (lat == null || lng == null) return Promise.resolve(null)
      return mode === "history" ? getHistory(lat, lng, 24) : getTrend(lat, lng)
    },
    [lat, lng, mode],
    TREND_REFRESH_MS
  )
  const trendData = data || []
  const isHistory = mode === "history"
  const forecastStart = !isHistory ? trendData.find((p) => p.forecast)?.time : undefined

  return (
    <div className="card card-hover p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-slate-900 dark:text-white font-display font-semibold">24-Hour Trend</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {isHistory ? "Past · stored readings" : "Past → now → forecast · hourly"}
          </p>
        </div>
        <div className="flex gap-2">
          {MODES.map((m) => (
            <button
              key={m.key}
              onClick={() => setMode(m.key)}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                mode === m.key
                  ? "bg-slate-900 dark:bg-emerald-600 text-white"
                  : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-64">
        {loading && trendData.length === 0 ? (
          <div className="h-full w-full rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
        ) : isHistory && trendData.length === 0 ? (
          <div className="h-full w-full rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center px-6 text-center">
            <p className="text-sm text-slate-400 leading-relaxed">
              No history yet — the backend logs a reading every ~10&nbsp;min.
              Check back after it has been running for a while.
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <defs>
                <linearGradient id="aqiGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#059669" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="time"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                interval="preserveStartEnd"
                minTickGap={24}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                domain={[0, "auto"]}
              />
              <Tooltip
                contentStyle={{
                  background: "#0f172a",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "12px",
                  fontSize: "13px",
                }}
                labelStyle={{ color: "#94a3b8" }}
                formatter={(value) => [value, "AQI"]}
              />
              {forecastStart && (
                <ReferenceLine
                  x={forecastStart}
                  stroke="#94a3b8"
                  strokeDasharray="4 4"
                  label={{ value: "now", position: "insideTopRight", fill: "#94a3b8", fontSize: 11 }}
                />
              )}
              <Area
                type="monotone"
                dataKey="aqi"
                stroke="#059669"
                strokeWidth={2}
                fill="url(#aqiGradient)"
                dot={false}
                activeDot={{ r: 4, fill: "#059669", stroke: "#fff", strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
