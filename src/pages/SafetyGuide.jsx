import { useState } from "react"
import { useAQI } from "../context/useAQI"
import Header from "../components/layout/Header"
import Footer from "../components/layout/Footer"

function getAQIBand(aqi) {
  if (aqi <= 50) return { label: "Good", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" }
  if (aqi <= 100) return { label: "Moderate", color: "text-yellow-600", bg: "bg-yellow-50", border: "border-yellow-200" }
  if (aqi <= 150) return { label: "Unhealthy (Sensitive)", color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200" }
  if (aqi <= 200) return { label: "Unhealthy", color: "text-red-600", bg: "bg-red-50", border: "border-red-200" }
  if (aqi <= 300) return { label: "Very Unhealthy", color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-200" }
  return { label: "Hazardous", color: "text-rose-700", bg: "bg-rose-50", border: "border-rose-300" }
}

const safetyTips = [
  {
    aqiRange: "0–50",
    band: "Good",
    icon: "🟢",
    color: "text-emerald-600",
    tips: [
      "Air quality is satisfactory, little to no risk",
      "Enjoy outdoor activities normally",
      "Ideal conditions for exercise and commuting",
    ],
  },
  {
    aqiRange: "51–100",
    band: "Moderate",
    icon: "🟡",
    color: "text-yellow-600",
    tips: [
      "Acceptable air quality for most individuals",
      "Unusually sensitive people should limit prolonged outdoor exertion",
      "Keep windows open for ventilation during cooler hours",
    ],
  },
  {
    aqiRange: "101–150",
    band: "Unhealthy (Sensitive)",
    icon: "🟠",
    color: "text-orange-600",
    tips: [
      "People with respiratory issues should reduce outdoor activity",
      "Children and elderly should avoid prolonged exertion",
      "Use air purifiers indoors if available",
    ],
  },
  {
    aqiRange: "151–200",
    band: "Unhealthy",
    icon: "🔴",
    color: "text-red-600",
    tips: [
      "Everyone should reduce prolonged outdoor exertion",
      "Wear N95 masks when going outside",
      "Keep windows and doors sealed",
    ],
  },
  {
    aqiRange: "201–300",
    band: "Very Unhealthy",
    icon: "🟣",
    color: "text-purple-600",
    tips: [
      "Avoid all outdoor physical activity",
      "Use HEPA air purifiers indoors",
      "Wear high-filtration masks if you must go out",
    ],
  },
  {
    aqiRange: "301–500",
    band: "Hazardous",
    icon: "⚫",
    color: "text-rose-700",
    tips: [
      "Stay indoors with doors and windows closed",
      "Run air purifiers at maximum setting",
      "Evacuate to cleaner areas if possible",
    ],
  },
]

export default function SafetyGuide() {
  const { cities } = useAQI()
  const [form, setForm] = useState({ country: "", city: "", name: "", phone: "", email: "" })
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitted(true)
  }

  const uniqueCountries = [...new Set(cities.map((c) => c.country))].sort()
  const filteredCities = form.country
    ? cities.filter((c) => c.country === form.country).sort((a, b) => a.name.localeCompare(b.name))
    : []
  const selectedCityData = form.city
    ? cities.find((c) => c.name.toLowerCase() === form.city.toLowerCase() && c.country === form.country)
    : null
  const topUnhealthy = cities.filter((c) => c.aqi != null).sort((a, b) => b.aqi - a.aqi).slice(0, 3)

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 transition-colors">
      <Header />

      <section className="pt-32 pb-16 px-8 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs text-emerald-600 font-medium">Smart Safety Guide</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-display font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
            Stay{" "}
            <span className="bg-gradient-to-r from-emerald-500 to-green-500 bg-clip-text text-transparent">
              Safe
            </span>{" "}
            &amp; Informed
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg mt-4 max-w-xl mx-auto leading-relaxed">
            Personalized air quality safety plans based on real-time AQI data for your city.
          </p>
        </div>
      </section>

      <section className="px-8 pb-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm h-full">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <h2 className="text-lg font-display font-semibold text-slate-900 dark:text-white">Create Safety Plan</h2>
                </div>

                {submitted ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-3">✅</div>
                    <h4 className="text-base font-semibold text-slate-900 dark:text-white">Safety Plan Saved!</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                      {form.name}, we'll send AQI alerts for <strong>{form.city}</strong> to {form.email || form.phone}
                    </p>
                    {selectedCityData && (() => {
                      const band = getAQIBand(selectedCityData.aqi)
                      return (
                        <div className={`mt-4 p-3 ${band.bg} rounded-lg border ${band.border}`}>
                          <p className={`text-sm ${band.color}`}>
                            Current AQI in {selectedCityData.name}: <strong>{selectedCityData.aqi}</strong> ({band.label})
                          </p>
                        </div>
                      )
                    })()}
                    <button
                      onClick={() => { setSubmitted(false); setForm({ country: "", city: "", name: "", phone: "", email: "" }) }}
                      className="mt-4 text-sm text-emerald-600 hover:underline font-medium"
                    >
                      Add another plan
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-slate-600 dark:text-slate-300 block mb-1">Country *</label>
                      <select
                        name="country"
                        value={form.country}
                        onChange={(e) => { setForm((prev) => ({ ...prev, country: e.target.value, city: "" })) }}
                        required
                        className="w-full px-3 py-2.5 text-sm border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      >
                        <option value="">Select your country</option>
                        {uniqueCountries.map((country) => (
                          <option key={country} value={country}>{country}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600 dark:text-slate-300 block mb-1">City *</label>
                      <select
                        name="city"
                        value={form.city}
                        onChange={handleChange}
                        required
                        disabled={!form.country}
                        className="w-full px-3 py-2.5 text-sm border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <option value="">{form.country ? "Select your city" : "Select a country first"}</option>
                        {filteredCities.map((c) => (
                          <option key={c.name} value={c.name}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                    {selectedCityData && !submitted && (() => {
                      const band = getAQIBand(selectedCityData.aqi)
                      return (
                        <div className={`p-3 ${band.bg} rounded-lg border ${band.border}`}>
                          <div className="flex items-center justify-between mb-1">
                            <p className={`text-sm font-semibold ${band.color}`}>
                              {selectedCityData.name}, {selectedCityData.country}
                            </p>
                            <span className={`text-lg font-bold ${band.color}`}>{selectedCityData.aqi}</span>
                          </div>
                          <p className={`text-xs ${band.color}`}>
                            AQI: {band.label}
                          </p>
                        </div>
                      )
                    })()}
                    {selectedCityData && !submitted && (() => {
                      const band = getAQIBand(selectedCityData.aqi)
                      const tip = safetyTips.find((t) => {
                        const range = t.aqiRange.split("–").map(Number)
                        return selectedCityData.aqi >= range[0] && selectedCityData.aqi <= range[1]
                      })
                      if (!tip) return null
                      return (
                        <div className={`p-3 ${band.bg} rounded-lg border ${band.border}`}>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg">{tip.icon}</span>
                            <span className={`text-sm font-semibold ${band.color}`}>
                              Safety Guide - {tip.band}
                            </span>
                          </div>
                          <ul className="space-y-1">
                            {tip.tips.map((item, i) => (
                              <li key={i} className="text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2">
                                <span className="text-emerald-500 mt-0.5">•</span>
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )
                    })()}
                    <div>
                      <label className="text-sm font-medium text-slate-600 dark:text-slate-300 block mb-1">Name *</label>
                      <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        required
                        placeholder="Your full name"
                        className="w-full px-3 py-2.5 text-sm border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 dark:text-white dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600 dark:text-slate-300 block mb-1">Phone</label>
                      <input
                        type="tel"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="+1 234 567 890"
                        className="w-full px-3 py-2.5 text-sm border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 dark:text-white dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600 dark:text-slate-300 block mb-1">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="you@example.com"
                        className="w-full px-3 py-2.5 text-sm border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 dark:text-white dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full px-4 py-2.5 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-colors"
                    >
                      Save Safety Plan
                    </button>
                  </form>
                )}
              </div>
            </div>

            <div className="lg:col-span-3">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                    <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <h2 className="text-lg font-display font-semibold text-slate-900 dark:text-white">AQI Safety Guidelines</h2>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                  Follow these recommendations based on your local AQI level to protect your health.
                </p>

                <div className="space-y-3">
                  {safetyTips.map((tip) => (
                    <div key={tip.band} className="border border-slate-100 dark:border-slate-700/50 rounded-xl p-4 bg-slate-50/50 dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">{tip.icon}</span>
                        <span className={`text-sm font-semibold ${tip.color}`}>
                          {tip.aqiRange} — {tip.band}
                        </span>
                      </div>
                      <ul className="space-y-1">
                        {tip.tips.map((item, i) => (
                          <li key={i} className="text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2">
                            <span className="text-emerald-500 mt-0.5">•</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {topUnhealthy.length > 0 && (
        <section className="px-8 py-12">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white text-center mb-8">
              Cities That Need Safety Plans Most
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {topUnhealthy.map((city) => {
                const band = getAQIBand(city.aqi)
                return (
                  <div key={city.id} className={`${band.bg} border ${band.border} rounded-2xl p-5 shadow-sm`}>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-display font-semibold text-slate-900 dark:text-white">{city.name}</h3>
                      <span className={`text-sm font-bold ${band.color}`}>{city.aqi}</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{city.country}</p>
                    <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${band.bg} ${band.color} border ${band.border}`}>
                      {band.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      <section className="px-8 py-12 bg-slate-50/50 dark:bg-slate-800/50 transition-colors">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <span className="text-3xl font-display font-bold text-emerald-600">😷</span>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white mt-2">Wear Masks</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">N95 or better when AQI exceeds 150</p>
            </div>
            <div className="text-center">
              <span className="text-3xl font-display font-bold text-emerald-600">🏠</span>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white mt-2">Stay Indoors</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Seal windows during high pollution</p>
            </div>
            <div className="text-center">
              <span className="text-3xl font-display font-bold text-emerald-600">💧</span>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white mt-2">Stay Hydrated</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Flush toxins with plenty of water</p>
            </div>
            <div className="text-center">
              <span className="text-3xl font-display font-bold text-emerald-600">🌿</span>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white mt-2">Air Purifiers</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Use HEPA filters indoors</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
