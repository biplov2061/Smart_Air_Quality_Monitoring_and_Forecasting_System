import { useState, useEffect } from "react"
import { XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts"
import { fetchCityHistory, fetchCityForecast, parseHourlyTrend } from "../../data/aqiService"

export default function TrendChart({ cityLat, cityLng }) {
  const [data, setData] = useState([])
  const [range, setRange] = useState("24H")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        let raw
        if (range === "24H") {
          raw = await fetchCityHistory(cityLat || 28.6, cityLng || 77.2, 1)
        } else if (range === "7D") {
          raw = await fetchCityHistory(cityLat || 28.6, cityLng || 77.2, 7)
        } else {
          raw = await fetchCityForecast(cityLat || 28.6, cityLng || 77.2, 7)
        }
        if (!cancelled) {
          const parsed = parseHourlyTrend(raw)
          setData(parsed.length > 0 ? parsed : [])
        }
      } catch (err) {
        if (!cancelled) {
          console.warn("Failed to fetch trend data:", err.message)
          setData([])
        }
      }
      if (!cancelled) setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [cityLat, cityLng, range])

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-slate-900 dark:text-white font-display font-semibold">
            {range === "24H" ? "24-Hour" : range === "7D" ? "7-Day" : "7-Day Forecast"} Trend
          </h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
            {range === "24H" ? "Hourly AQI readings (past 24h)" : range === "7D" ? "Hourly AQI readings (past 7 days)" : "Forecasted AQI from Open-Meteo"}
          </p>
        </div>
        <div className="flex gap-2">
          {["24H", "7D", "Forecast"].map((label) => (
            <button
              key={label}
              onClick={() => setRange(label)}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                range === label
                  ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900"
                  : "text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-64">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500">
              <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="text-sm">Loading...</span>
            </div>
          </div>
        ) : data.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-400 dark:text-slate-500 text-sm">
            No data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
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
