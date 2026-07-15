import { useAQI } from "../context/useAQI"
import Header from "../components/layout/Header"
import Footer from "../components/layout/Footer"
import TrendChart from "../components/dashboard/TrendChart"

export default function TrendsPage() {
  const { globalStats } = useAQI()

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 transition-colors">
      <Header />

      <div className="pt-20 px-8 pb-8">
        <div className="max-w-7xl mx-auto">
          <div className="py-6 border-b border-slate-200 dark:border-slate-700">
            <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white">AQI Trends & Analysis</h1>
            <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Historical air quality data and predictive trends</p>
          </div>

          <div className="mt-6 max-w-4xl mx-auto">
            <TrendChart />
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
              <h3 className="text-slate-900 dark:text-white font-display font-semibold mb-2">Cities Monitored</h3>
              <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{globalStats.citiesMonitored}+</p>
            </div>
            <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
              <h3 className="text-slate-900 dark:text-white font-display font-semibold mb-2">Countries</h3>
              <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{globalStats.countriesCovered}</p>
            </div>
            <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
              <h3 className="text-slate-900 dark:text-white font-display font-semibold mb-2">Global Avg AQI</h3>
              <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{globalStats.avgAQI}</p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
