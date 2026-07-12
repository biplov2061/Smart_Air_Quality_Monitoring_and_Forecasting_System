import { useState, useMemo, useEffect } from "react"
import { useAQI } from "../context/useAQI"
import { getPointAqi } from "../data/apiClient"
import { usePolling } from "../data/useApi"
import { REFRESH_MS } from "../data/config"
import Header from "../components/layout/Header"
import Footer from "../components/layout/Footer"
import AQIGauge from "../components/dashboard/AQIGauge"
import PollutantBreakdown from "../components/dashboard/PollutantBreakdown"
import HeatMap from "../components/dashboard/HeatMap"
import WeatherCard from "../components/dashboard/WeatherCard"
import TrendChart from "../components/dashboard/TrendChart"

export default function Dashboard() {
  const { cities } = useAQI()

  const dashCities = useMemo(
    () =>
      cities
        .filter((c) => c.aqi != null)
        .sort((a, b) => b.aqi - a.aqi)
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

  const [selectedCity, setSelectedCity] = useState(null)

  useEffect(() => {
    if (dashCities.length === 0) return
    setSelectedCity((prev) => {
      if (prev && dashCities.some((c) => c.id === prev.id)) return prev
      return dashCities[0]
    })
  }, [dashCities])

  const { data: live } = usePolling(
    () =>
      selectedCity && selectedCity.lat != null
        ? getPointAqi(selectedCity.lat, selectedCity.lng, selectedCity.name, selectedCity.country)
        : Promise.resolve(null),
    [selectedCity?.id],
    REFRESH_MS
  )

  const liveAqi = live?.aqi ?? selectedCity?.aqi ?? 0
  const cityLabel = selectedCity?.label ?? "Loading..."
  const lat = selectedCity?.lat
  const lng = selectedCity?.lng

  return (
    <div className="min-h-screen">
      <Header />

      <div className="pt-24 px-5 sm:px-8 pb-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 py-6 border-b border-slate-200/70 dark:border-slate-800">
            <div>
              <div className="inline-flex items-center gap-2 mb-2">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span className="text-xs font-medium text-emerald-600 uppercase tracking-wider">Live</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-display font-bold text-slate-900 dark:text-white">
                Air Quality{" "}
                <span className="bg-gradient-to-r from-emerald-500 to-sky-500 bg-clip-text text-transparent">
                  Dashboard
                </span>
              </h1>
              <p className="text-sm text-slate-400 mt-1">Real-time monitoring &amp; analytics</p>
            </div>
            <label className="flex flex-col gap-1">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Location</span>
              <select
                value={selectedCity?.label ?? ""}
                onChange={(e) => {
                  const city = dashCities.find((c) => c.label === e.target.value)
                  if (city) setSelectedCity(city)
                }}
                className="px-4 py-2.5 glass border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 shadow-sm min-w-[13rem]"
              >
                {dashCities.map((city) => (
                  <option key={city.id} value={city.label}>
                    {city.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mt-6">
            <AQIGauge aqi={liveAqi} city={cityLabel} />
            <PollutantBreakdown lat={lat} lng={lng} />
            <WeatherCard lat={lat} lng={lng} city={cityLabel} />
            <HeatMap centerLat={lat} centerLng={lng} aqi={liveAqi} city={cityLabel} />
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
