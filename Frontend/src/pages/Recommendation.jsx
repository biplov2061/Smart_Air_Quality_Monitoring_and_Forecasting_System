import { useState } from "react"
import Header from "../components/layout/Header"
import Footer from "../components/layout/Footer"

export default function Recommendation() {
  const [form, setForm] = useState({
    name: "",
    location: "",
    age: "",
    sensitivity: "",
    disease: "",
    futureAqi: "",
    currentAqi: "",
  })

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function handleSubmit(e) {
    e.preventDefault()
    console.log("Form submitted:", form)
  }

  return (
    <div className="min-h-screen">
      <Header />

      <div className="pt-24 px-5 sm:px-8 pb-10">
        <div className="max-w-3xl mx-auto">
          <div className="py-6 border-b border-slate-200/70 dark:border-slate-800">
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-slate-900 dark:text-white">
              <span className="bg-gradient-to-r from-emerald-500 to-sky-500 bg-clip-text text-transparent">
                Recommendation
              </span>
            </h1>
            <p className="text-sm text-slate-400 mt-1">Personalised health &amp; activity advice based on current AQI</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Location</label>
                <input
                  type="text"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Age</label>
                <input
                  type="number"
                  name="age"
                  value={form.age}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Health Sensitivity</label>
                <select
                  name="sensitivity"
                  value={form.sensitivity}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                >
                  <option value="">Select...</option>
                  <option value="low">Low</option>
                  <option value="moderate">Moderate</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Disease</label>
                <input
                  type="text"
                  name="disease"
                  value={form.disease}
                  onChange={handleChange}
                  placeholder="e.g. Asthma, COPD"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Current AQI</label>
                <input
                  type="number"
                  name="currentAqi"
                  value={form.currentAqi}
                  onChange={handleChange}
                  min={0}
                  max={500}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Future AQI</label>
                <input
                  type="number"
                  name="futureAqi"
                  value={form.futureAqi}
                  onChange={handleChange}
                  min={0}
                  max={500}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-sky-500 text-white font-semibold text-sm rounded-xl hover:shadow-lg transition-all"
            >
              Provide Safety Guide
            </button>
          </form>

          <div className="mt-10">
            <h3 className="text-lg font-display font-semibold text-slate-900 dark:text-white mb-4">US AQI Standard</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="text-left py-3 px-4 font-medium text-slate-400">Level</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-400">AQI Range</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-400">Color</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { level: "Good", range: "0 – 50", color: "bg-emerald-500" },
                    { level: "Moderate", range: "51 – 100", color: "bg-yellow-400" },
                    { level: "Unhealthy for Sensitive Groups", range: "101 – 150", color: "bg-orange-400" },
                    { level: "Unhealthy", range: "151 – 200", color: "bg-red-500" },
                    { level: "Very Unhealthy", range: "201 – 300", color: "bg-purple-600" },
                    { level: "Hazardous", range: "301 – 500", color: "bg-rose-800" },
                  ].map((row) => (
                    <tr key={row.level} className="border-b border-slate-100 dark:border-slate-800">
                      <td className="py-3 px-4 text-slate-900 dark:text-white font-medium">{row.level}</td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{row.range}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-block w-5 h-5 rounded-full ${row.color}`} />
                      </td>
                    </tr>
                  ))}
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
