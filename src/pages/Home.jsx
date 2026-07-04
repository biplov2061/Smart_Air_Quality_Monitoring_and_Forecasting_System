import { useState } from "react"
import { useAQI } from "../context/useAQI"
import GlobalMap from "../components/landing/GlobalMap"
import CountryRanking from "../components/landing/CountryRanking"
import SearchBar from "../components/landing/SearchBar"
import CityDetailsPanel from "../components/landing/CityDetailsPanel"
import Header from "../components/layout/Header"
import Footer from "../components/layout/Footer"

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCity, setSelectedCity] = useState(null)
  const { globalStats, loading } = useAQI()

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <section className="pt-32 pb-16 px-8 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 mb-6">
            <span className={`w-1.5 h-1.5 rounded-full ${loading ? "bg-yellow-500" : "bg-emerald-500"} animate-pulse`} />
            <span className="text-xs text-slate-500 font-medium">
              {loading ? "Fetching live data..." : "Real-time Air Quality Monitoring"}
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-display font-bold text-slate-900 tracking-tight leading-tight">
            Breathe{" "}
            <span className="bg-gradient-to-r from-emerald-500 to-green-500 bg-clip-text text-transparent">
              Smarter
            </span>
          </h1>
          <p className="text-slate-500 text-lg mt-4 max-w-xl mx-auto leading-relaxed">
            Real-time air quality monitoring across {globalStats.citiesMonitored}+ cities worldwide.
          </p>
        </div>
      </section>

      <section className="px-8 pb-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-900">
              Know Global AQI
            </h2>
            <p className="text-slate-500 text-sm mt-2">Track air quality across the world</p>
          </div>

          <div className="mb-8">
            <SearchBar value={searchQuery} onChange={setSearchQuery} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              <GlobalMap searchQuery={searchQuery} onCitySelect={setSelectedCity} />
            </div>
            <div className="lg:col-span-1">
              <CountryRanking />
            </div>
          </div>
        </div>
      </section>

      <section className="px-8 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm text-center">
              <span className="text-3xl font-display font-bold text-slate-900">
                {globalStats.citiesMonitored}
              </span>
              <p className="text-slate-500 text-sm mt-1">Cities Monitored</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm text-center">
              <span className="text-3xl font-display font-bold text-slate-900">
                {globalStats.countriesCovered}
              </span>
              <p className="text-slate-500 text-sm mt-1">Countries</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm text-center">
              <span className="text-3xl font-display font-bold text-emerald-600">
                {globalStats.avgAQI}
              </span>
              <p className="text-slate-500 text-sm mt-1">Global Avg AQI</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      {selectedCity && (
        <CityDetailsPanel city={selectedCity} onClose={() => setSelectedCity(null)} />
      )}
    </div>
  )
}
