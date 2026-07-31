import { useState, useMemo, useRef } from "react"
import { useAQI } from "../context/useAQI"
import { getPointAqi } from "../data/apiClient"
import { usePolling } from "../data/useApi"
import { REFRESH_MS } from "../data/config"
import { getAQIColor } from "../data/aqiService"
import Header from "../components/layout/Header"
import Footer from "../components/layout/Footer"
import AQIGauge from "../components/dashboard/AQIGauge"
import PollutantBreakdown from "../components/dashboard/PollutantBreakdown"
import WeatherCard from "../components/dashboard/WeatherCard"
import TrendChart from "../components/dashboard/TrendChart"

export default function Dashboard() {
  const { cities, online } = useAQI()

  const [search, setSearch] = useState("")
  const [open, setOpen] = useState(false)
  const [activeIdx, setActiveIdx] = useState(-1)
  const blurRef = useRef(null)
  const inputRef = useRef(null)

  const rawCities = useMemo(
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

  const filteredCities = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return [...rawCities].sort((a, b) => b.aqi - a.aqi)

    const scored = []
    for (const c of rawCities) {
      const name = c.name.toLowerCase()
      const country = c.country.toLowerCase()
      let s = -1
      if (name.startsWith(q)) s = 0
      else if (country.startsWith(q)) s = 1
      else if (name.includes(q)) s = 2
      else if (country.includes(q)) s = 3
      if (s >= 0) scored.push({ c, s })
    }
    scored.sort((a, b) => a.s - b.s || b.c.aqi - a.c.aqi)
    return scored.map((x) => x.c)
  }, [rawCities, search])

  const [selectedCityId, setSelectedCityId] = useState(null)

  const selectedCity = useMemo(() => {
    if (selectedCityId) {
      const found = rawCities.find((c) => c.id === selectedCityId)
      if (found) return found
    }
    return filteredCities[0] ?? rawCities[0] ?? null
  }, [rawCities, filteredCities, selectedCityId])

  const { data: live } = usePolling(
    () =>
      selectedCity && selectedCity.lat != null
        ? getPointAqi(selectedCity.lat, selectedCity.lng, selectedCity.name, selectedCity.country)
        : Promise.resolve(null),
    [selectedCity?.id],
    REFRESH_MS
  )

  const liveAqi = online ? (live?.aqi ?? selectedCity?.aqi ?? null) : null
  const cityLabel = online ? (selectedCity?.label ?? "Loading...") : "Backend offline"
  const lat = selectedCity?.lat
  const lng = selectedCity?.lng

  function selectCity(city) {
    setSelectedCityId(city.id)
    setSearch(city.label)
    setOpen(false)
    setActiveIdx(-1)
  }

  function onKeyDown(e) {
    if (!open || filteredCities.length === 0) return
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setActiveIdx((i) => Math.min(filteredCities.length - 1, i + 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActiveIdx((i) => Math.max(0, i - 1))
    } else if (e.key === "Escape") {
      setOpen(false)
      setActiveIdx(-1)
    } else if (e.key === "Enter") {
      if (activeIdx >= 0 && filteredCities[activeIdx]) {
        e.preventDefault()
        selectCity(filteredCities[activeIdx])
      }
    }
  }

  return (
    <div className="min-h-screen">
      <Header />

      <div className="pt-24 px-5 sm:px-8 pb-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 py-6 border-b border-slate-200/70 dark:border-slate-800">
            <div>
              <div className="inline-flex items-center gap-2 mb-2">
                {online ? (
                  <>
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                    </span>
                    <span className="text-xs font-medium text-emerald-600 uppercase tracking-wider">Live</span>
                  </>
                ) : (
                  <>
                    <span className="inline-flex rounded-full h-2 w-2 bg-red-500" />
                    <span className="text-xs font-medium text-red-500 uppercase tracking-wider">Offline</span>
                  </>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-display font-bold text-slate-900 dark:text-white">
                Air Quality{" "}
                <span className="text-sky-500 dark:text-sky-400">
                  Dashboard
                </span>
              </h1>
              <p className="text-sm text-slate-400 mt-1">Real-time monitoring &amp; analytics</p>
            </div>
            <div className="flex flex-col gap-1 min-w-[16rem]">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Location</span>
              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setOpen(true); setActiveIdx(-1) }}
                  onFocus={(e) => { setOpen(true); e.target.select() }}
                  onBlur={() => { blurRef.current = setTimeout(() => setOpen(false), 150) }}
                  onKeyDown={onKeyDown}
                  placeholder={selectedCity?.label ?? "Search city..."}
                  className="w-full px-4 py-2.5 glass border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 shadow-sm"
                />
                {open && search.trim() && filteredCities.length > 0 && (
                  <ul
                    className="absolute z-50 left-0 right-0 mt-1 max-h-60 overflow-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl py-1"
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    {filteredCities.length === 0 ? (
                      <li className="px-4 py-3 text-sm text-slate-400 text-center">No cities match</li>
                    ) : (
                      filteredCities.map((c, i) => (
                        <li
                          key={c.id}
                          onMouseEnter={() => setActiveIdx(i)}
                          onClick={() => selectCity(c)}
                          className={`flex items-center gap-3 px-4 py-2 cursor-pointer transition-colors ${
                            i === activeIdx ? "bg-slate-100 dark:bg-slate-800" : ""
                          }`}
                        >
                          <span
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ backgroundColor: getAQIColor(c.aqi) }}
                          />
                          <span className="flex-1 min-w-0 text-sm text-slate-900 dark:text-white truncate">
                            {c.name}, <span className="text-slate-400">{c.country}</span>
                          </span>
                          <span
                            className="text-sm font-mono font-bold flex-shrink-0"
                            style={{ color: getAQIColor(c.aqi) }}
                          >
                            {c.aqi}
                          </span>
                        </li>
                      ))
                    )}
                  </ul>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 mt-6">
            <AQIGauge aqi={liveAqi} city={cityLabel} />
            <PollutantBreakdown lat={lat} lng={lng} />
            <WeatherCard lat={lat} lng={lng} city={cityLabel} />
          </div>

          <div className="grid grid-cols-1 gap-6 mt-6">
            <TrendChart lat={lat} lng={lng} />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
