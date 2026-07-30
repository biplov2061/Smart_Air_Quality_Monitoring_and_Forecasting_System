import { useState, useMemo, useRef } from "react"
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { useAQI } from "../context/useAQI"
import { getAQIColor, getAQIBand } from "../data/aqiService"
import Header from "../components/layout/Header"
import Footer from "../components/layout/Footer"

function generateHourlyData(baseAqi) {
  const now = new Date()
  const base = baseAqi ?? 65 + Math.random() * 30
  return Array.from({ length: 24 }, (_, i) => {
    const hour = (now.getHours() + i) % 24
    const label = `${hour.toString().padStart(2, "0")}:00`
    const variation = Math.sin((i / 24) * Math.PI * 2) * 20 + (Math.random() - 0.5) * 10
    const aqi = Math.round(Math.max(10, base + variation + (i < 6 ? 0 : i < 12 ? 15 : -10)))
    return { time: label, aqi }
  })
}

const formatHour = (label) => {
  const h = parseInt(label, 10)
  if (isNaN(h)) return label
  const period = h >= 12 ? "PM" : "AM"
  const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h
  return `${hour12}${period}`
}

export default function Prediction() {
  const { cities } = useAQI()

  const [search, setSearch] = useState("")
  const [open, setOpen] = useState(false)
  const [activeIdx, setActiveIdx] = useState(-1)
  const blurRef = useRef(null)

  const cityList = useMemo(
    () =>
      cities
        .filter((c) => c.aqi != null)
        .slice(0, 100)
        .map((c) => ({
          id: c.id,
          label: `${c.name}, ${c.country}`,
          name: c.name,
          country: c.country,
          aqi: c.aqi,
          lat: c.lat,
          lng: c.lng,
        })),
    [cities]
  )

  const [selectedCityId, setSelectedCityId] = useState(null)

  const selectedCity = useMemo(() => {
    if (selectedCityId && cityList.some((c) => c.id === selectedCityId))
      return cityList.find((c) => c.id === selectedCityId)
    return cityList[0] ?? null
  }, [cityList, selectedCityId])

  const data = useMemo(() => generateHourlyData(selectedCity?.aqi), [selectedCity?.aqi])

  function selectCity(city) {
    setSelectedCityId(city.id)
    setSearch("")
    setOpen(false)
    setActiveIdx(-1)
  }

  return (
    <div className="min-h-screen">
      <Header />

      <div className="pt-24 px-5 sm:px-8 pb-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 py-6 border-b border-slate-200/70 dark:border-slate-800">
            <div>
              <h1 className="text-2xl sm:text-3xl font-display font-bold text-slate-900 dark:text-white">
                <span className="bg-gradient-to-r from-emerald-500 to-sky-500 bg-clip-text text-transparent">
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
                {open && search.trim() && (
                  <ul className="absolute z-50 left-0 right-0 mt-1 max-h-60 overflow-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl py-1">
                    {cityList
                      .filter((c) =>
                        c.name.toLowerCase().includes(search.toLowerCase()) ||
                        c.country.toLowerCase().includes(search.toLowerCase())
                      )
                      .map((c, i) => (
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
                      ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-slate-900 dark:text-white font-display font-semibold">24-Hour AQI Prediction</h3>
              {selectedCity && (
                <span className="text-xs text-slate-400">{selectedCity.name}, {selectedCity.country}</span>
              )}
            </div>
            <p className="text-xs text-slate-400 mb-4">Hourly forecast for the next 24 hours</p>

            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                  <defs>
                    <linearGradient id="predGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#059669" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="time"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                    tickFormatter={formatHour}
                    interval={2}
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
                    labelFormatter={formatHour}
                    formatter={(value) => [value, "AQI"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="aqi"
                    stroke="#059669"
                    strokeWidth={2}
                    fill="url(#predGradient)"
                    dot={false}
                    activeDot={{ r: 4, fill: "#059669", stroke: "#fff", strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-6 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
            <h3 className="text-slate-900 dark:text-white font-display font-semibold mb-4">Hourly Prediction Table</h3>
            <div className="overflow-x-auto max-h-72 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-white dark:bg-slate-900">
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="text-left py-3 px-3 font-medium text-slate-400">Time</th>
                    <th className="text-left py-3 px-3 font-medium text-slate-400">Predicted AQI</th>
                    <th className="text-left py-3 px-3 font-medium text-slate-400">Band</th>
                    <th className="text-left py-3 px-3 font-medium text-slate-400">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((row, i) => {
                    const band = getAQIBand(row.aqi)
                    const color = getAQIColor(row.aqi)
                    return (
                      <tr key={i} className="border-b border-slate-100 dark:border-slate-800">
                        <td className="py-2.5 px-3 text-slate-900 dark:text-white font-medium">{formatHour(row.time)}</td>
                        <td className="py-2.5 px-3">
                          <span className="font-mono font-bold" style={{ color }}>{row.aqi}</span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">{band}</td>
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
        </div>
      </div>

      <Footer />
    </div>
  )
}
