import { useState, useMemo, useRef } from "react"
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { useAQI } from "../context/useAQI"
import { getAQIColor, getAQIBand } from "../data/aqiService"
import Header from "../components/layout/Header"
import Footer from "../components/layout/Footer"

const CITY_MAP = [
  { id: 1, name: "Bhaktapur", country: "Nepal" },
  { id: 2, name: "Bangkok", country: "Thailand" },
  { id: 3, name: "Beijing", country: "China" },
  { id: 4, name: "Cairo", country: "Egypt" },
  { id: 5, name: "Delhi", country: "India" },
  { id: 6, name: "Dhaka", country: "Bangladesh" },
  { id: 7, name: "Kathmandu", country: "Nepal" },
  { id: 8, name: "London", country: "UK" },
  { id: 9, name: "Mumbai", country: "India" },
  { id: 10, name: "New York", country: "USA" },
  { id: 11, name: "Seoul", country: "South Korea" },
  { id: 12, name: "Tokyo", country: "Japan" },
  { id: 13, name: "Pokhara", country: "Nepal" },
]

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

function formatHourLabel(date) {
  const h = date.getHours()
  const period = h >= 12 ? "PM" : "AM"
  const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h
  const dayName = DAY_NAMES[date.getDay()]
  return `${dayName} ${hour12}${period}`
}

function generateHourlyData(baseAqi) {
  const now = new Date()
  const base = baseAqi ?? 65 + Math.random() * 30
  return Array.from({ length: 24 }, (_, i) => {
    const date = new Date(now.getTime() + i * 60 * 60 * 1000)
    const variation = Math.sin((i / 24) * Math.PI * 2) * 20 + (Math.random() - 0.5) * 10
    const aqi = Math.round(Math.max(10, base + variation + (i < 6 ? 0 : i < 12 ? 15 : -10)))
    return { label: formatHourLabel(date), sortKey: i, aqi }
  })
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
          lat: match?.lat ?? null,
          lng: match?.lng ?? null,
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
                    dataKey="label"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                    interval={3}
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
                    fill="url(#predGradient)"
                    dot={false}
                    activeDot={{ r: 4, fill: "#059669", stroke: "#fff", strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-6 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
            <h3 className="text-slate-900 dark:text-white font-display font-semibold mb-4">24-Hour Prediction Table</h3>
            <div className="overflow-x-auto max-h-72 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-white dark:bg-slate-900">
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="text-left py-3 px-3 font-medium text-slate-400">Time</th>
                    <th className="text-left py-3 px-3 font-medium text-slate-400">Predicted AQI</th>
                    <th className="text-left py-3 px-3 font-medium text-slate-400">Band</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((row, i) => {
                    const band = getAQIBand(row.aqi)
                    const color = getAQIColor(row.aqi)
                    return (
                      <tr key={i} className="border-b border-slate-100 dark:border-slate-800">
                        <td className="py-2.5 px-3 text-slate-900 dark:text-white font-medium">{row.label}</td>
                        <td className="py-2.5 px-3">
                          <span className="font-mono font-bold" style={{ color }}>{row.aqi}</span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">{band}</td>
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
