import { useState, useCallback } from "react"
import { useAQI } from "../context/useAQI"
import { getPointAqi, searchLocation } from "../data/apiClient"
import { getAQIColor } from "../data/aqiService"
import GlobalMap from "../components/landing/GlobalMap"
import CountryRanking from "../components/landing/CountryRanking"
import SearchBar from "../components/landing/SearchBar"
import CityDetailsPanel from "../components/landing/CityDetailsPanel"
import Header from "../components/layout/Header"
import Footer from "../components/layout/Footer"

const AQI_SCALE = [
  { label: "Good", range: "0–50", color: "#00e400" },
  { label: "Moderate", range: "51–100", color: "#eab308" },
  { label: "Sensitive", range: "101–150", color: "#ff7e00" },
  { label: "Unhealthy", range: "151–200", color: "#ff0000" },
  { label: "Very Unhealthy", range: "201–300", color: "#8f3f97" },
  { label: "Hazardous", range: "301+", color: "#7e0023" },
]

function StatCard({ value, label, accent, tag }) {
  return (
    <div className="card card-hover group relative overflow-hidden p-6">
      <div
        className="absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10 blur-2xl transition-opacity group-hover:opacity-20"
        style={{ background: accent }}
        aria-hidden
      />
      <div className="flex items-center gap-2 mb-3">
        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: accent }} aria-hidden />
        <span className="text-xs font-medium uppercase tracking-wider text-slate-400">{tag}</span>
      </div>
      <div className="text-4xl font-display font-bold text-slate-900 dark:text-white">{value}</div>
      <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{label}</p>
    </div>
  )
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCity, setSelectedCity] = useState(null)
  const [panelLoading, setPanelLoading] = useState(false)
  const [notFound, setNotFound] = useState(false)
  const { globalStats, loading } = useAQI()

  const handlePointSelect = useCallback(async ({ lat, lng, name, country, preview }) => {
    setNotFound(false)
    setPanelLoading(true)
    if (preview) setSelectedCity(preview)
    else setSelectedCity({ name: "Locating…", country: "", aqi: null, lat, lng })
    try {
      const dto = await getPointAqi(lat, lng, name, country)
      setSelectedCity(dto)
    } catch (err) {
      console.warn("Point fetch failed:", err.message)
    } finally {
      setPanelLoading(false)
    }
  }, [])

  const handleSearchSubmit = useCallback(async (query) => {
    const q = (query || "").trim()
    if (!q) return
    setNotFound(false)
    setPanelLoading(true)
    setSelectedCity({ name: q, country: "", aqi: null, lat: 0, lng: 0 })
    try {
      const dto = await searchLocation(q)
      if (dto) setSelectedCity(dto)
      else {
        setNotFound(true)
        setSelectedCity(null)
      }
    } catch (err) {
      console.warn("Search failed:", err.message)
      setNotFound(true)
      setSelectedCity(null)
    } finally {
      setPanelLoading(false)
    }
  }, [])

  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden pt-36 pb-20 px-5 sm:px-8 text-center">
        <div aria-hidden className="absolute inset-0 -z-10 pointer-events-none">
          <div className="absolute top-10 left-[12%] w-72 h-72 rounded-full bg-emerald-400/20 blur-3xl animate-drift" />
          <div className="absolute top-24 right-[10%] w-80 h-80 rounded-full bg-sky-400/20 blur-3xl animate-drift delay-200" />
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-indigo-300/10 blur-3xl animate-float" />
        </div>

        <div className="max-w-3xl mx-auto animate-fade-up">
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-display font-bold text-slate-900 dark:text-white tracking-tight leading-[1.05]">
            Breathe{" "}
            <span className="bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500 bg-clip-text text-transparent">
              Smarter
            </span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg mt-5 max-w-xl mx-auto leading-relaxed">
            Track real-time air quality across {globalStats.citiesMonitored}+ cities worldwide.
            click the map, search any place, and see live pollution the moment it changes.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-sm">
            <a href="#explore" className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-emerald-600 text-white font-semibold shadow-sm hover:bg-slate-800 dark:hover:bg-emerald-500 hover:shadow-md transition-all">
              Explore the map
            </a>
            <span className="text-slate-400">
              Updated <span className="text-slate-600 dark:text-slate-300 font-medium">{globalStats.updatedAt}</span>
            </span>
          </div>
        </div>
      </section>

      <section id="explore" className="px-5 sm:px-8 pb-8 scroll-mt-24">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-900 dark:text-white">Know Global AQI</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">Search a place, or tap anywhere on the map for a live reading</p>
          </div>

          <div className="mb-8">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              onSubmit={handleSearchSubmit}
              onSelect={(city) =>
                handlePointSelect({
                  lat: city.lat,
                  lng: city.lng,
                  name: city.name,
                  country: city.country,
                  preview: city,
                })
              }
            />
            {notFound && (
              <p className="text-center text-sm text-red-500 mt-3">
                Couldn’t find that location. Try a different city or country name.
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              <div className="rounded-3xl border border-slate-200/80 dark:border-slate-700/70 glass p-1.5 shadow-sm">
                <GlobalMap searchQuery={searchQuery} onPointSelect={handlePointSelect} />
              </div>
            </div>
            <div className="lg:col-span-1">
              <CountryRanking />
            </div>
          </div>

          <div className="mt-6 rounded-3xl border border-slate-200/80 dark:border-slate-700/70 glass p-5">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">The AQI scale</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {AQI_SCALE.map((b) => (
                <div key={b.label} className="flex items-center gap-2.5">
                  <span className="w-3.5 h-3.5 rounded-md flex-shrink-0" style={{ backgroundColor: b.color }} />
                  <div className="leading-tight">
                    <div className="text-xs font-semibold text-slate-700 dark:text-slate-200">{b.label}</div>
                    <div className="text-[11px] text-slate-400 font-mono">{b.range}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 sm:px-8 py-16">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard value={globalStats.citiesMonitored} label="Cities Monitored" accent="#0ea5e9" tag="Coverage" />
          <StatCard value={globalStats.countriesCovered} label="Countries Covered" accent="#6366f1" tag="Reach" />
          <StatCard value={globalStats.avgAQI} label="Global Average AQI" accent={getAQIColor(globalStats.avgAQI)} tag="Live" />
        </div>
      </section>

      <Footer />

      {selectedCity && (
        <CityDetailsPanel city={selectedCity} loading={panelLoading} onClose={() => setSelectedCity(null)} />
      )}
    </div>
  )
}
