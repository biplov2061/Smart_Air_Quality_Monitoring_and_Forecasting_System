import { useState, useMemo, useRef, useEffect } from "react"
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
  { id: 232, name: "Kathmandu", country: "Nepal", lat: 27.7172, lng: 85.324, timezone: "Asia/Kathmandu" },
  { id: 1, name: "New York", country: "USA", lat: 40.7128, lng: -74.006, timezone: "America/New_York" },
  { id: 71, name: "London", country: "UK", lat: 51.5074, lng: -0.1278, timezone: "Europe/London" },
  { id: 129, name: "Cairo", country: "Egypt", lat: 30.0444, lng: 31.2357, timezone: "Africa/Cairo" },
  { id: 169, name: "Delhi", country: "India", lat: 28.7041, lng: 77.1025, timezone: "Asia/Kolkata" },
  { id: 170, name: "Mumbai", country: "India", lat: 19.076, lng: 72.8777, timezone: "Asia/Kolkata" },
  { id: 184, name: "Beijing", country: "China", lat: 39.9042, lng: 116.4074, timezone: "Asia/Shanghai" },
  { id: 197, name: "Tokyo", country: "Japan", lat: 35.6762, lng: 139.6503, timezone: "Asia/Tokyo" },
  { id: 203, name: "Seoul", country: "South Korea", lat: 37.5665, lng: 126.978, timezone: "Asia/Seoul" },
  { id: 206, name: "Bangkok", country: "Thailand", lat: 13.7563, lng: 100.5018, timezone: "Asia/Bangkok" },
  { id: 225, name: "Dhaka", country: "Bangladesh", lat: 23.8103, lng: 90.4125, timezone: "Asia/Dhaka" },
  { id: 233, name: "Pokhara", country: "Nepal", lat: 28.2096, lng: 83.9856, timezone: "Asia/Kathmandu" },
  { id: 294, name: "Bhaktapur", country: "Nepal", lat: 27.671, lng: 85.4298, timezone: "Asia/Kathmandu" },
]

// Real UTC offset in hours (fractional, e.g. Kathmandu +5.75) for an IANA
// timezone. Handles DST automatically.
function getUtcOffsetHours(timezone, date = new Date()) {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      hour12: false,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).formatToParts(date)
    const get = (t) => parts.find((p) => p.type === t)?.value ?? "0"
    const asUtc = Date.UTC(
      Number(get("year")),
      Number(get("month")) - 1,
      Number(get("day")),
      Number(get("hour")),
      Number(get("minute")),
      Number(get("second"))
    )
    const offsetMinutes = Math.round((asUtc - date.getTime()) / 60000)
    return offsetMinutes / 60
  } catch {
    return 0
  }
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

// US EPA AQI standard scale (proportional widths over 0–500).
const AQI_STANDARD = [
  { from: 0, to: 50, label: "Good", color: "#00e400", note: "Air quality is satisfactory; little or no risk." },
  { from: 50, to: 100, label: "Moderate", color: "#ffff00", note: "Acceptable; unusually sensitive people should limit prolonged outdoor activity." },
  { from: 100, to: 150, label: "Unhealthy (Sensitive)", color: "#ff7e00", note: "Sensitive groups may experience health effects." },
  { from: 150, to: 200, label: "Unhealthy", color: "#ff0000", note: "Everyone may begin to experience health effects." },
  { from: 200, to: 300, label: "Very Unhealthy", color: "#8f3f97", note: "Health alert; everyone may experience more serious effects." },
  { from: 300, to: 500, label: "Hazardous", color: "#7e0023", note: "Health warnings of emergency conditions; avoid outdoor activity." },
]

function formatUtcOffset(hours) {
  const sign = hours >= 0 ? "+" : "-"
  const abs = Math.abs(hours)
  const h = Math.floor(abs)
  const m = Math.round((abs - h) * 60)
  return `UTC${sign}${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
}

function CityLocalClock({ utcOffset }) {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const local = new Date(now.getTime() + (utcOffset ?? 0) * 3600_000)
  const hh = String(local.getUTCHours()).padStart(2, "0")
  const mm = String(local.getUTCMinutes()).padStart(2, "0")
  const ss = String(local.getUTCSeconds()).padStart(2, "0")

  return (
    <div className="flex items-baseline gap-3 flex-wrap">
      <span className="font-mono text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white tabular-nums">
        {hh}:{mm}
        <span className="text-lg text-slate-400">:{ss}</span>
      </span>
      <span className="text-sm text-slate-400 font-medium">
        {WEEKDAYS[local.getUTCDay()]} · {MONTHS[local.getUTCMonth()]} {local.getUTCDate()} · {formatUtcOffset(utcOffset ?? 0)} local
      </span>
    </div>
  )
}

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
      <p className="text-3xl sm:text-4xl font-display font-bold mt-1 leading-tight" style={color ? { color } : undefined}>
        {value}
      </p>
      {sub && <p className="text-sm text-slate-400 mt-1 overflow-hidden text-ellipsis">{sub}</p>}
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
          timezone: c.timezone,
          utcOffset: getUtcOffsetHours(c.timezone),
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

  const { data, loading, error } = usePolling(
    () =>
      selectedCity?.id != null
        ? getPrediction(selectedCity.id)
        : Promise.resolve(null),
    [selectedCity?.id],
    TREND_REFRESH_MS
  )

  const predicted = useMemo(
    () => normalizePredictionSeries(data, selectedCity?.country, selectedCity?.utcOffset ?? 0),
    [data, selectedCity?.country, selectedCity?.utcOffset]
  )

  const currentAqi = selectedCity?.aqi ?? null

  const analysis = useMemo(() => analyzeSeries(predicted, currentAqi), [predicted, currentAqi])

  const chartData = useMemo(
    () =>
      withDayLabels(
        predicted.map((p, i) => ({
          ...p,
          rolling: analysis?.rolling ? Math.round(analysis.rolling[i]) : null,
        })),
        selectedCity?.utcOffset ?? 0
      ),
    [predicted, analysis, selectedCity?.utcOffset]
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
  const nextHour = predicted[0] ?? null
  const nextHourTrend = currentAqi == null ? "steady" : nextHour ? (nextHour.aqi > currentAqi ? "rising" : nextHour.aqi < currentAqi ? "falling" : "steady") : "steady"
  const trendColor = nextHourTrend === "rising" ? "#f43f5e" : nextHourTrend === "falling" ? "#10b981" : "#94a3b8"
  const nextHourLineD = nextHourTrend === "rising" ? "M6 50 L116 12" : nextHourTrend === "falling" ? "M6 12 L116 50" : "M6 31 L116 31"
  const nextHourAreaD = nextHourTrend === "steady" ? "" : `${nextHourLineD} L 116 62 L 6 62 Z`
  const serviceDown = error != null

  return (
    <div className="min-h-screen">
      <Header />

      <div className="pt-24 px-5 sm:px-8 pb-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 py-8 border-b border-slate-200/70 dark:border-slate-800">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-sky-500 dark:text-sky-400 mb-2">
                Prediction
              </p>
              <h1 className="text-4xl sm:text-5xl font-display font-extrabold text-slate-900 dark:text-white">
                <span className="flex items-center gap-3">
                  <svg
                    className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0 text-sky-500 dark:text-sky-400"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-label="location"
                  >
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <span>
                    {selectedCity?.name}
                  </span>
                </span>
                <span className="block text-xl sm:text-2xl font-medium text-slate-400 mt-1">
                  {selectedCity?.country}
                </span>
              </h1>
              <div className="mt-3">
                <CityLocalClock utcOffset={selectedCity?.utcOffset ?? 0} />
              </div>
              <p className="text-sm text-slate-400 mt-3">
                Forecasted AQI trends &amp; future air quality estimates
              </p>
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
                            onMouseDown={(e) => {
                              e.preventDefault()
                              selectCity(c)
                            }}
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

                  <div className="my-8 rounded-xl border border-slate-200 dark:border-slate-700 bg-emerald-50/40 dark:bg-emerald-950/20 px-5 py-5">
                    <p className="text-base sm:text-lg text-slate-700 dark:text-slate-200">
                      Air quality in {selectedCity.name}, {selectedCity.country} is
                      predicted to be <span className={`font-semibold ${dir.cls}`}>{dir.verb}</span> over the next{" "}
                      {analysis.count} hours, peaking at{" "}
                      <span className="font-semibold" style={{ color: getAQIColor(analysis.peak.aqi) }}>
                        {analysis.peak.aqi} ({getAQIBand(analysis.peak.aqi)})
                      </span>{" "}
                      around {formatHour(analysis.peak.time)}.
                    </p>
                  </div>

                  {nextHour && (
                    <div className="my-8 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
                      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40">
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Next Hour Prediction
                        </p>
                        <span className="text-xs font-medium text-slate-400">
                          at {formatHour(nextHour.time)} · {selectedCity.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-6 px-6 py-5">
                        <div className="text-4xl sm:text-5xl font-display font-extrabold tabular-nums leading-none" style={{ color: getAQIColor(nextHour.aqi) }}>
                          {nextHour.aqi}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xl sm:text-2xl font-bold" style={{ color: getAQIColor(nextHour.aqi) }}>
                            {getAQIBand(nextHour.aqi)}
                          </p>
                          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            {currentAqi != null ? (
                              nextHour.aqi > currentAqi ? (
                                <>Increasing by {Math.round((nextHour.aqi - currentAqi) * 100) / 100} vs now ({currentAqi})</>
                              ) : nextHour.aqi < currentAqi ? (
                                <>Decreasing by {Math.round((currentAqi - nextHour.aqi) * 100) / 100} vs now ({currentAqi})</>
                              ) : (
                                <>Steady vs now ({currentAqi})</>
                              )
                            ) : (
                              "Predicted for the coming hour"
                            )}
                          </p>
                        </div>
                        <svg viewBox="0 0 120 62" className="w-24 h-14 sm:w-28 sm:h-16 flex-shrink-0" aria-hidden="true">
                          <defs>
                            <linearGradient id="aqiTrendArea" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor={trendColor} stopOpacity="0.28" />
                              <stop offset="100%" stopColor={trendColor} stopOpacity="0" />
                            </linearGradient>
                            <marker id="aqiTrendArrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
                              <path d="M0,0 L10,5 L0,10 z" fill={trendColor} />
                            </marker>
                          </defs>
                          {nextHourAreaD && <path d={nextHourAreaD} fill="url(#aqiTrendArea)" />}
                          <path
                            d={nextHourLineD}
                            fill="none"
                            stroke={trendColor}
                            strokeWidth="2"
                            strokeLinecap="round"
                            markerEnd="url(#aqiTrendArrow)"
                          />
                        </svg>
                      </div>
                    </div>
                  )}
                </>
              )}

              <div className="mt-10 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-xl sm:text-2xl text-slate-900 dark:text-white font-display font-bold">AQI Prediction</h3>
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
                      {serviceDown ? (
                        <div>
                          <p className="text-4xl sm:text-5xl font-display font-extrabold text-slate-900 dark:text-white">
                            Oops!
                          </p>
                          <p className="text-lg sm:text-xl font-semibold text-slate-600 dark:text-slate-300 mt-2">
                            Forecast is currently unavailable. ):
                          </p>
                          <p className="text-sm text-slate-400 leading-relaxed mt-2">
                            We're temporarily unable to generate the{" "}
                            <span className="font-medium text-slate-500 dark:text-slate-300">24-hour AQI forecast</span>.
                            Please try again in a few moments.
                          </p>
                          <div className="mt-4 inline-flex items-center gap-2 rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/40 px-4 py-2.5">
                            <span className="text-lg">🟢</span>
                            <p className="text-sm text-left text-emerald-800 dark:text-emerald-300">
                              <span className="font-semibold">Live AQI is still available:</span>
                              <br />
                              You can continue viewing the{" "}
                              <span className="font-semibold">current AQI and live air-quality information</span>{" "}
                              while the forecasting service is unavailable.
                            </p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-slate-400 leading-relaxed">
                          No prediction returned for <span className="font-medium">{selectedCity.country}</span>.
                          <br />
                          Ensure the backend and the ML service are running, and that this country is one of the
                          supported ones.
                        </p>
                      )}
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
                <div className="mt-10 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
                  <h3 className="text-xl sm:text-2xl text-slate-900 dark:text-white font-display font-bold mb-4">Hourly Prediction Table</h3>
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
                          const deltaDisplay =
                            delta == null ? null : Math.round(delta * 100) / 100
                          return (
                            <tr key={i} className="border-b border-slate-100 dark:border-slate-800">
                              <td className="py-2.5 px-3 text-slate-900 dark:text-white font-medium">{formatHour(row.time)}</td>
                              <td className="py-2.5 px-3">
                                <span className="font-mono font-bold text-base sm:text-lg" style={{ color }}>{row.aqi}</span>
                              </td>
                              <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">{band}</td>
                              <td className="py-2.5 px-3 font-mono">
                                {deltaDisplay == null ? (
                                  <span className="text-slate-400">—</span>
                                ) : (
                                  <span className={deltaDisplay > 0 ? "text-red-500" : deltaDisplay < 0 ? "text-emerald-500" : "text-slate-400"}>
                                    {deltaDisplay > 0 ? "+" : ""}{deltaDisplay}
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

              <div className="mt-10 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-xl sm:text-2xl text-slate-900 dark:text-white font-display font-bold">US AQI Standard</h3>
                  <span className="text-xs text-slate-400">US EPA reference scale</span>
                </div>
                <p className="text-xs text-slate-400 mb-4">
                  The Air Quality Index (AQI) from 0 to 500. Higher values mean higher air pollution levels and greater health concern.
                </p>

                <div className="flex h-9 rounded-lg overflow-hidden mb-4">
                  {AQI_STANDARD.map((b) => (
                    <div
                      key={b.label}
                      className="flex items-center justify-center min-w-0"
                      style={{ flexGrow: b.to - b.from, backgroundColor: b.color }}
                    >
                      <span className="text-[10px] font-bold px-1 truncate" style={{ color: b.from >= 150 ? "#fff" : "#1e293b" }}>
                        {b.from === 0 ? "0" : b.from + 1}–{b.to}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {AQI_STANDARD.map((b) => (
                    <div key={b.label} className="flex items-start gap-3 rounded-xl border border-slate-200 dark:border-slate-700 p-3">
                      <span className="w-3 h-3 rounded-full flex-shrink-0 mt-1" style={{ backgroundColor: b.color }} />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                          {b.label}
                          <span className="text-xs font-normal text-slate-400 ml-1">
                            {b.from === 0 ? "0" : b.from + 1}–{b.to}
                          </span>
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{b.note}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <Footer />
    </div>
  )
}
