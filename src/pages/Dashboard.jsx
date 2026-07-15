import { useState, useMemo } from "react"
import { useAQI } from "../context/useAQI"
import Header from "../components/layout/Header"
import Footer from "../components/layout/Footer"
import AQIGauge from "../components/dashboard/AQIGauge"
import PollutantBreakdown from "../components/dashboard/PollutantBreakdown"
import HeatMap from "../components/dashboard/HeatMap"
import WeatherCard from "../components/dashboard/WeatherCard"
import TrendChart from "../components/dashboard/TrendChart"
import Recommendations from "../components/dashboard/Recommendations"

export default function Dashboard() {
  const { cities } = useAQI()

  const dashCities = useMemo(
    () =>
      cities
        .filter((c) => c.aqi != null)
        .sort((a, b) => b.aqi - a.aqi)
        .slice(0, 100)
        .map((c) => ({ name: `${c.name}, ${c.country}`, aqi: c.aqi, id: c.id, ...c })),
    [cities]
  )

  const [selectedCity, setSelectedCity] = useState(
    () => dashCities.length > 0 ? dashCities[0] : { name: "No data", aqi: null, lat: null, lng: null }
  )

  const selectedCityData = useMemo(
    () => dashCities.find((c) => c.name === selectedCity.name) || selectedCity,
    [dashCities, selectedCity]
  )

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 transition-colors">
      <Header />

      <div className="pt-20 px-8 pb-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between py-6 border-b border-slate-200 dark:border-slate-700">
            <div>
              <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white">Air Quality Dashboard</h1>
              <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Real-time monitoring & analytics</p>
            </div>
            <select
              value={selectedCity.name}
              onChange={(e) => {
                const city = dashCities.find((c) => c.name === e.target.value)
                if (city) setSelectedCity(city)
              }}
              className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm"
            >
              {dashCities.map((city) => (
                <option key={city.id} value={city.name}>
                  {city.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-6">
            <div className="lg:col-span-1">
              <AQIGauge aqi={selectedCityData.aqi} city={selectedCityData.name} />
            </div>
            <div className="lg:col-span-1">
              <PollutantBreakdown cityData={selectedCityData} />
            </div>
            <div className="lg:col-span-1">
              <WeatherCard
                cityLat={selectedCityData.lat}
                cityLng={selectedCityData.lng}
                cityName={selectedCityData.name}
              />
            </div>
            <div className="lg:col-span-1">
              <HeatMap />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            <div className="lg:col-span-2">
              <TrendChart cityLat={selectedCityData.lat} cityLng={selectedCityData.lng} />
            </div>
            <div className="lg:col-span-1">
              <Recommendations />
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
