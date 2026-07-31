import { useState, useMemo, useRef } from "react"
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea,
} from "recharts"
import { useAQI } from "../context/useAQI"
import { getAQIColor, getAQIBand } from "../data/aqiService"
import { getPrediction, normalizePredictionSeries } from "../data/apiClient"
import { usePolling } from "../data/useApi"
import { TREND_REFRESH_MS } from "../data/config"
import { analyzeSeries, AQI_BAND_RANGES, withDayLabels } from "../data/trendAnalysis"
import Header from "../components/layout/Header"
import Footer from "../components/layout/Footer"

const CITY_MAP = [
  { id: "np", name: "Kathmandu", country: "Nepal", lat: 27.7172, lng: 85.324 },
  { id: "in", name: "Delhi", country: "India", lat: 28.7041, lng: 77.1025 },
  { id: "pk", name: "Lahore", country: "Pakistan", lat: 31.5204, lng: 74.3587 },
  { id: "bd", name: "Dhaka", country: "Bangladesh", lat: 23.8103, lng: 90.4125 },
  { id: "cn", name: "Beijing", country: "China", lat: 39.9042, lng: 116.4074 },
  { id: "us", name: "New York", country: "USA", lat: 40.7128, lng: -74.006 },
  { id: "gb", name: "London", country: "UK", lat: 51.5074, lng: -0.1278 },
  { id: "jp", name: "Tokyo", country: "Japan", lat: 35.6762, lng: 139.6503 },
  { id: "th", name: "Bangkok", country: "Thailand", lat: 13.7563, lng: 100.5018 },
  { id: "id", name: "Jakarta", country: "Indonesia", lat: -6.2088, lng: 106.8456 },
  { id: "br", name: "São Paulo", country: "Brazil", lat: -23.5505, lng: -46.6333 },
  { id: "de", name: "Berlin", country: "Germany", lat: 52.52, lng: 13.405 },
  { id: "au", name: "Sydney", country: "Australia", lat: -33.8688, lng: 151.2093 },
]

const formatHour = (label) => {
  const h = parseInt(label, 10)
  if (isNaN(h)) return label
  const period = h >= 12 ? "PM" : "AM"
  const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h
  return `${hour12}${period}`
}

const directionMeta = {
  rising: { verb: "worsen", arrow: "▲", cls: "text-red-500" },
  falling: { verb: "improve", arrow: "▼", cls: "text-emerald-500" },
  stable: { verb: "stay steady", arrow: "▬", cls: "text-slate-400" },
}

function Kpi({ label, value, sub, color }) {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
      <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-display font-bold mt-1" style={color ? { color } : undefined}>
        {value}
      </p>
      {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
    </div>
  )
}

export default function Prediction() {
  const { cities } = useAQI()

  const [search, setSearch] = useState("")
  const [open, setOpen] = useState(false)
  const [activeIdx, setActiveIdx] = useState(-1)
  const blurRef = useRef(null)

  const cityList = useMemo(
    () =>
      CITY_MAP.map((c) => {
        const match = cities.find((cc) => cc.name === c.name)
        return {
          id: c.id,
          name: c.name,
          country: c.country,
          label: `${c.name}, ${c.country}`,
          aqi: match?.aqi ?? 50,
          lat: match?.lat ?? c.lat,
          lng: match?.lng ?? c.lng,
        }
      }),
    [cities]
  )

  const [selectedCityId, setSelectedCityId] = useState(null)

  const selectedCity = useMemo(() => {
    if (selectedCityId && cityList.some((c) => c.id === selectedCityId))
      return cityList.find((c) => c.id === selectedCityId)
    return cityList[0] ?? null
  }, [cityList, selectedCityId])

  const { data, loading } = usePolling(
    () =>
      selectedCity?.country
        ? getPrediction(selectedCity.country, selectedCity.name)
        : Promise.resolve(null),
    [selectedCity?.country, selectedCity?.name],
    TREND_REFRESH_MS
  )

  const predicted = useMemo(
    () => normalizePredictionSeries(data, selectedCity?.country),
    [data, selectedCity?.country]
  )

  const currentAqi = selectedCity?.aqi ?? null

  const analysis = useMemo(() => analyzeSeries(predicted, currentAqi), [predicted, currentAqi])

  const chartData = useMemo(
    () =>
      withDayLabels(
        predicted.map((p, i) => ({
          ...p,
          rolling: analysis?.rolling ? Math.round(analysis.rolling[i]) : null,
        }))
      ),
    [predicted, analysis]
  )

  const dayByTime = useMemo(() => {
    const m = {}
    for (const d of chartData) m[d.time] = d.day
    return m
  }, [chartData])
  const axisLabel = (t) => `${dayByTime[t] ? dayByTime[t] + " " : ""}${formatHour(t)}`

  const yMax = useMemo(() => {
    if (!analysis) return 100
    const top = Math.max(analysis.max, Number(currentAqi) || 0)
    return Math.min(500, Math.max(50, Math.ceil((top + 20) / 25) * 25))
  }, [analysis, currentAqi])

  function selectCity(city) {
    setSelectedCityId(city.id)
    setSearch("")
    setOpen(false)
    setActiveIdx(-1)
  }

  const dir = analysis ? directionMeta[analysis.direction] : null
  const hasPrediction = predicted.length > 0

  return (
    <div className="min-h-screen">
      <Header />

      <div className="pt-24 px-5 sm:px-8 pb-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 py-6 border-b border-slate-200/70 dark:border-slate-800">
            <div>
              <h1 className="text-2xl sm:text-3xl font-display font-bold text-slate-900 dark:text-white">
                <span className="text-sky-500 dark:text-sky-400">
                  Prediction
                </span>
              </h1>
              <p className="text-sm text-slate-400 mt-1">Forecasted AQI trends &amp; future air quality estimates</p>
            </div>
            <div className="flex flex-col gap-1 min-w-[16rem]">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">City</span>
              <div className="relative">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setOpen(true); setActiveIdx(-1) }}
                  onFocus={() => setOpen(true)}
                  onBlur={() => { blurRef.current = setTimeout(() => setOpen(false), 150) }}
                  placeholder={selectedCity?.label ?? "Search city..."}
                  className="w-full px-4 py-2.5 glass border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 shadow-sm"
                />
                {open && (
                  <ul className="absolute z-50 left-0 right-0 mt-1 max-h-60 overflow-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl py-1">
                    {(() => {
                      const q = search.trim().toLowerCase()
                      const filtered = q
                        ? cityList.filter(
                            (c) =>
                              c.name.toLowerCase().includes(q) || c.country.toLowerCase().includes(q)
                          )
                        : cityList
                      return filtered.length === 0 ? (
                        <li className="px-4 py-3 text-sm text-slate-400 text-center">No match</li>
                      ) : (
                        filtered.map((c, i) => (
                          <li
                            key={c.id}
                            onMouseEnter={() => setActiveIdx(i)}
                            onClick={() => selectCity(c)}
                            className={`flex items-center gap-3 px-4 py-2 cursor-pointer transition-colors ${
                              i === activeIdx ? "bg-slate-100 dark:bg-slate-800" : ""
                            }`}
                          >
                            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: getAQIColor(c.aqi) }} />
                            <span className="flex-1 min-w-0 text-sm text-slate-900 dark:text-white truncate">
                              {c.name}, <span className="text-slate-400">{c.country}</span>
                            </span>
                            <span className="text-sm font-mono font-bold" style={{ color: getAQIColor(c.aqi) }}>{c.aqi}</span>
                          </li>
                        ))
                      )
                    })()}
                  </ul>
                )}
              </div>
            </div>
          </div>

          {!selectedCity ? (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40 p-10 text-center">
              <p className="text-sm text-slate-400">
                Select a city above to see its country's predicted AQI trend.
                {cities.length === 0 && " (Waiting for the live city data to load…)"}
              </p>
            </div>
          ) : (
            <>
              {analysis && (
                <>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                    <Kpi
                      label="Current AQI"
                      value={currentAqi ?? "—"}
                      sub={currentAqi != null ? getAQIBand(Number(currentAqi)) : "no data"}
                      color={currentAqi != null ? getAQIColor(Number(currentAqi)) : undefined}
                    />
                    <Kpi
                      label="Predicted Avg"
                      value={analysis.avg}
                      sub={`${getAQIBand(analysis.avg)}${
                        analysis.vsCurrent != null
                          ? ` · ${analysis.vsCurrent >= 0 ? "+" : ""}${analysis.vsCurrent} vs now`
                          : ""
                      }`}
                      color={getAQIColor(analysis.avg)}
                    />
                    <Kpi
                      label="Predicted Peak"
                      value={analysis.peak.aqi}
                      sub={`${getAQIBand(analysis.peak.aqi)} · ${formatHour(analysis.peak.time)}`}
                      color={getAQIColor(analysis.peak.aqi)}
                    />
                    <Kpi
                      label="Trend"
                      value={
                        <span className={dir.cls}>
                          {dir.arrow} {analysis.direction}
                        </span>
                      }
                      sub={`${analysis.changePct >= 0 ? "+" : ""}${analysis.changePct}% over ${analysis.count}h`}
                    />
                  </div>

                  <div className="mt-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-emerald-50/40 dark:bg-emerald-950/20 px-4 py-3">
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      Air quality in <span className="font-semibold">{selectedCity.name}, {selectedCity.country}</span> is
                      predicted to <span className={`font-semibold ${dir.cls}`}>{dir.verb}</span> over the next{" "}
                      {analysis.count} hours, peaking at{" "}
                      <span className="font-semibold" style={{ color: getAQIColor(analysis.peak.aqi) }}>
                        {analysis.peak.aqi} ({getAQIBand(analysis.peak.aqi)})
                      </span>{" "}
                      around {formatHour(analysis.peak.time)}.
                      {analysis.vsCurrent != null && (
                        <>
                          {" "}On average that is{" "}
                          <span className="font-semibold">
                            {Math.abs(analysis.vsCurrent)} point{Math.abs(analysis.vsCurrent) === 1 ? "" : "s"}{" "}
                            {analysis.vsCurrent >= 0 ? "above" : "below"}
                          </span>{" "}
                          the current level.
                        </>
                      )}
                    </p>
                  </div>
                </>
              )}

              <div className="mt-6 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-slate-900 dark:text-white font-display font-semibold">AQI Prediction</h3>
                  <span className="text-xs text-slate-400">{selectedCity.name}, {selectedCity.country}</span>
                </div>
                <p className="text-xs text-slate-400 mb-3">
                  Predicted vs current AQI · model forecast for {selectedCity.country}
                </p>

                {hasPrediction && (
                  <div className="flex flex-wrap items-center gap-4 mb-3 text-xs text-slate-500 dark:text-slate-400">
                    <span className="inline-flex items-center gap-1.5"><span className="w-3 h-0.5 rounded bg-emerald-600 inline-block" />Predicted AQI</span>
                    <span className="inline-flex items-center gap-1.5"><span className="w-3 h-0.5 rounded bg-sky-500 inline-block" style={{ borderTop: "2px dashed" }} />Trend (3h avg)</span>
                    <span className="inline-flex items-center gap-1.5"><span className="w-3 h-0.5 rounded bg-amber-500 inline-block" />Current AQI</span>
                  </div>
                )}

                <div className="h-72">
                  {loading && !hasPrediction ? (
                    <div className="h-full w-full rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
                  ) : !hasPrediction ? (
                    <div className="h-full w-full rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center px-6 text-center">
                      <p className="text-sm text-slate-400 leading-relaxed">
                        No prediction returned for <span className="font-medium">{selectedCity.country}</span>.
                        <br />
                        Ensure the backend and the ML service are running, and that this country is one of the
                        supported ones.
                      </p>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                        <defs>
                          <linearGradient id="predGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#059669" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                          </linearGradient>
                        </defs>

                        {AQI_BAND_RANGES.map((b) => (
                          <ReferenceArea
                            key={b.from}
                            y1={b.from}
                            y2={b.to}
                            fill={b.color}
                            fillOpacity={0.06}
                            strokeOpacity={0}
                            ifOverflow="hidden"
                          />
                        ))}

                        <XAxis
                          dataKey="time"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 11, fill: "#94a3b8" }}
                          tickFormatter={axisLabel}
                          interval={3}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 11, fill: "#94a3b8" }}
                          domain={[0, yMax]}
                        />
                        <Tooltip
                          contentStyle={{
                            background: "#0f172a",
                            border: "1px solid rgba(255,255,255,0.1)",
                            borderRadius: "12px",
                            fontSize: "13px",
                          }}
                          labelStyle={{ color: "#94a3b8" }}
                          labelFormatter={axisLabel}
                          formatter={(value, name) => [value, name]}
                        />

                        {currentAqi != null && (
                          <ReferenceLine
                            y={Number(currentAqi)}
                            stroke="#f59e0b"
                            strokeDasharray="5 4"
                            label={{ value: "now", position: "insideTopRight", fill: "#f59e0b", fontSize: 11 }}
                          />
                        )}

                        <Area
                          type="monotone"
                          dataKey="aqi"
                          name="Predicted AQI"
                          stroke="#059669"
                          strokeWidth={2}
                          fill="url(#predGradient)"
                          dot={false}
                          activeDot={{ r: 4, fill: "#059669", stroke: "#fff", strokeWidth: 2 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="rolling"
                          name="Trend (3h avg)"
                          stroke="#0ea5e9"
                          strokeWidth={2}
                          strokeDasharray="5 4"
                          dot={false}
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {hasPrediction && (
                <div className="mt-6 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
                  <h3 className="text-slate-900 dark:text-white font-display font-semibold mb-4">Hourly Prediction Table</h3>
                  <div className="overflow-x-auto max-h-72 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className="sticky top-0 bg-white dark:bg-slate-900">
                        <tr className="border-b border-slate-200 dark:border-slate-700">
                          <th className="text-left py-3 px-3 font-medium text-slate-400">Time</th>
                          <th className="text-left py-3 px-3 font-medium text-slate-400">Predicted AQI</th>
                          <th className="text-left py-3 px-3 font-medium text-slate-400">Band</th>
                          <th className="text-left py-3 px-3 font-medium text-slate-400">vs Current</th>
                          <th className="text-left py-3 px-3 font-medium text-slate-400">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {predicted.map((row, i) => {
                          const band = getAQIBand(row.aqi)
                          const color = getAQIColor(row.aqi)
                          const delta = currentAqi != null ? row.aqi - Number(currentAqi) : null
                          return (
                            <tr key={i} className="border-b border-slate-100 dark:border-slate-800">
                              <td className="py-2.5 px-3 text-slate-900 dark:text-white font-medium">{formatHour(row.time)}</td>
                              <td className="py-2.5 px-3">
                                <span className="font-mono font-bold" style={{ color }}>{row.aqi}</span>
                              </td>
                              <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">{band}</td>
                              <td className="py-2.5 px-3 font-mono">
                                {delta == null ? (
                                  <span className="text-slate-400">—</span>
                                ) : (
                                  <span className={delta > 0 ? "text-red-500" : delta < 0 ? "text-emerald-500" : "text-slate-400"}>
                                    {delta > 0 ? "+" : ""}{delta}
                                  </span>
                                )}
                              </td>
                              <td className="py-2.5 px-3">
                                <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <Footer />
    </div>
  )
}
