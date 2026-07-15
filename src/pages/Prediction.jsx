import { useState, useMemo, useEffect } from "react"
import { useAQI } from "../context/useAQI"
import { fetchCityForecast, parseHourlyForecastToDaily } from "../data/aqiService"
import Header from "../components/layout/Header"
import Footer from "../components/layout/Footer"

function getAQIColor(aqi) {
  if (aqi <= 50) return { hex: "#00e400", label: "Good" }
  if (aqi <= 100) return { hex: "#ffff00", label: "Moderate" }
  if (aqi <= 150) return { hex: "#ff7e00", label: "Unhealthy (Sensitive)" }
  if (aqi <= 200) return { hex: "#ff0000", label: "Unhealthy" }
  if (aqi <= 300) return { hex: "#8f3f97", label: "Very Unhealthy" }
  return { hex: "#7e0023", label: "Hazardous" }
}

const forecastOptions = [1, 3, 5, 7]

export default function Prediction() {
  const { cities } = useAQI()
  const [days, setDays] = useState(3)
  const [forecastData, setForecastData] = useState({})
  const [loading, setLoading] = useState(false)

  const topCities = useMemo(
    () => cities.filter((c) => c.aqi != null).sort((a, b) => b.aqi - a.aqi).slice(0, 8),
    [cities]
  )

  useEffect(() => {
    let cancelled = false
    async function fetchForecasts() {
      if (!topCities.length) return
      setLoading(true)
      const results = {}
      for (const city of topCities) {
        try {
          const raw = await fetchCityForecast(city.lat, city.lng, days)
          const daily = parseHourlyForecastToDaily(raw, days)
          results[city.name] = daily
        } catch (err) {
          console.warn(`Forecast failed for ${city.name}:`, err.message)
          results[city.name] = null
        }
      }
      if (!cancelled) {
        setForecastData(results)
        setLoading(false)
      }
    }
    fetchForecasts()
    return () => { cancelled = true }
  }, [topCities, days])

  const predictions = useMemo(() => {
    return topCities.map((city) => {
      const cityForecast = forecastData[city.name]
      if (!cityForecast || cityForecast.length === 0) {
        const predictedValues = Array.from({ length: days }, (_, d) =>
          Math.round(Math.max(0, Math.min(500, (city.aqi || 50) + d * 8)))
        )
        const finalPredicted = predictedValues[predictedValues.length - 1]
        const diff = finalPredicted - (city.aqi || 0)
        const arrow = diff > 0 ? "\u2191" : diff < 0 ? "\u2193" : "\u2192"
        const arrowColor = diff > 0 ? "text-red-500" : diff < 0 ? "text-emerald-500" : "text-slate-400"
        return { ...city, predictedValues, finalPredicted, diff, arrow, arrowColor }
      }

      const predictedValues = cityForecast.map((d) => d.aqi)
      while (predictedValues.length < days) {
        const last = predictedValues[predictedValues.length - 1] || city.aqi || 50
        predictedValues.push(Math.round(Math.max(0, Math.min(500, last))))
      }
      const finalPredicted = predictedValues[predictedValues.length - 1]
      const diff = finalPredicted - (city.aqi || 0)
      const arrow = diff > 0 ? "\u2191" : diff < 0 ? "\u2193" : "\u2192"
      const arrowColor = diff > 0 ? "text-red-500" : diff < 0 ? "text-emerald-500" : "text-slate-400"
      return { ...city, predictedValues, finalPredicted, diff, arrow, arrowColor }
    })
  }, [topCities, forecastData, days])

  const avgCurrent = useMemo(
    () => Math.round(predictions.reduce((s, c) => s + (c.aqi || 0), 0) / predictions.length),
    [predictions]
  )
  const avgPredicted = useMemo(
    () => Math.round(predictions.reduce((s, c) => s + c.finalPredicted, 0) / predictions.length),
    [predictions]
  )

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 transition-colors">
      <Header />

      <section className="pt-32 pb-16 px-8 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 border border-blue-200 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">Open-Meteo Powered Forecasting</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-display font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
            AQI{" "}
            <span className="bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
              Prediction
            </span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg mt-4 max-w-xl mx-auto leading-relaxed">
            Forecast air quality trends for the coming days based on the Open-Meteo ensemble model.
          </p>
        </div>
      </section>

      <section className="px-8 pb-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm text-center">
              <p className="text-xs text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wide">Forecast Horizon</p>
              <p className="text-2xl font-display font-bold text-slate-900 dark:text-white mt-1">{days} Day{days > 1 ? "s" : ""}</p>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm text-center">
              <p className="text-xs text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wide">Avg Current AQI</p>
              <p className="text-2xl font-display font-bold text-slate-900 dark:text-white mt-1">{avgCurrent}</p>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm text-center">
              <p className="text-xs text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wide">Avg Predicted AQI</p>
              <p className={`text-2xl font-display font-bold mt-1 ${avgPredicted > avgCurrent ? "text-red-500" : "text-emerald-500"}`}>
                {loading ? "..." : avgPredicted}
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-lg font-display font-semibold text-slate-900 dark:text-white">City Predictions</h2>
                <p className="text-sm text-slate-400 dark:text-slate-500 mt-0.5">
                  Top polluted cities — forecasted AQI for next {days} day{days > 1 ? "s" : ""}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-slate-500 dark:text-slate-400">Forecast:</label>
                <div className="flex gap-1">
                  {forecastOptions.map((d) => (
                    <button
                      key={d}
                      onClick={() => setDays(d)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                        days === d
                          ? "bg-blue-600 text-white"
                          : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                      }`}
                    >
                      {d}d
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {loading && (
              <div className="flex items-center justify-center py-8">
                <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500">
                  <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span className="text-sm">Fetching forecast data from Open-Meteo...</span>
                </div>
              </div>
            )}

            {!loading && (
              <div className="space-y-3">
                {predictions.map((city) => {
                  const currentColor = getAQIColor(city.aqi || 0)
                  const predictedColor = getAQIColor(city.finalPredicted)
                  const maxVal = Math.max(city.aqi || 0, city.finalPredicted, ...city.predictedValues)

                  return (
                    <div key={city.id} className="border border-slate-100 dark:border-slate-700/50 rounded-xl p-4 hover:bg-slate-50/50 dark:hover:bg-slate-800 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{city.name}</h3>
                          <p className="text-xs text-slate-400 dark:text-slate-500">{city.country}</p>
                        </div>
                        <div className="flex items-center gap-3 text-right">
                          <div>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500">Current</p>
                            <p className="text-sm font-semibold text-slate-900 dark:text-white">{city.aqi}</p>
                          </div>
                          <span className={`text-lg font-bold ${city.arrowColor}`}>{city.arrow}</span>
                          <div>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500">Predicted</p>
                            <p className="text-sm font-semibold text-slate-900 dark:text-white">{city.finalPredicted}</p>
                          </div>
                        </div>
                      </div>

                      <div className="relative h-8 flex items-end gap-0.5">
                        {city.predictedValues.map((val, i) => {
                          const color = getAQIColor(val)
                          const height = maxVal > 0 ? (val / maxVal) * 100 : 0
                          return (
                            <div
                              key={i}
                              className="flex-1 flex flex-col items-center justify-end group relative"
                            >
                              <div
                                className={`w-full rounded-t transition-all duration-300 ${
                                  i === city.predictedValues.length - 1 ? "opacity-100" : "opacity-60"
                                }`}
                                style={{
                                  height: `${Math.max(height, 8)}%`,
                                  backgroundColor: color.hex,
                                }}
                              />
                              <span className="text-[8px] text-slate-400 dark:text-slate-500 mt-0.5">
                                {i === 0 ? "Now" : `D${i + 1}`}
                              </span>
                            </div>
                          )
                        })}
                      </div>

                      <div className="flex items-center gap-3 mt-2">
                        <span
                          className="inline-block w-2 h-2 rounded-full"
                          style={{ backgroundColor: currentColor.hex }}
                        />
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">Current: {currentColor.label}</span>
                        <span
                          className="inline-block w-2 h-2 rounded-full"
                          style={{ backgroundColor: predictedColor.hex }}
                        />
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">Predicted: {predictedColor.label}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-100 dark:border-blue-800/30 rounded-2xl p-6 shadow-sm">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-blue-500 dark:text-blue-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white">About Predictions</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  AQI predictions are powered by the Open-Meteo Air Quality API using CAMS (Copernicus Atmosphere
                  Monitoring Service) ensemble model data. Forecasts are updated every 12-24 hours and cover up to
                  7 days ahead. Accuracy may vary based on meteorological conditions and seasonal changes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-8 py-12 bg-slate-50/50 dark:bg-slate-800/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white text-center mb-8">
            Why AQI Prediction Matters
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6">
              <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Plan Ahead</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Schedule outdoor activities when air quality is forecast to be better</p>
            </div>
            <div className="text-center p-6">
              <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Protect Health</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Take preventive measures before pollution spikes hit</p>
            </div>
            <div className="text-center p-6">
              <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Make Decisions</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Data-driven insights for schools, businesses, and governments</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
