import { useAQI } from "../context/useAQI"
import Header from "../components/layout/Header"
import Footer from "../components/layout/Footer"
import HeatMap from "../components/dashboard/HeatMap"

export default function HeatMapPage() {
  const { globalStats } = useAQI()

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 transition-colors">
      <Header />

      <div className="pt-20 px-8 pb-8">
        <div className="max-w-7xl mx-auto">
          <div className="py-6 border-b border-slate-200 dark:border-slate-700">
            <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white">AQI Heat Map</h1>
            <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Geographic distribution of air quality across {globalStats.citiesMonitored}+ cities</p>
          </div>

          <div className="mt-6 max-w-2xl mx-auto">
            <HeatMap />
          </div>

          <div className="mt-6 p-6 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
            <h3 className="text-slate-900 dark:text-white font-display font-semibold mb-2">About This Map</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              The heat map visualizes AQI levels across geographic regions. Darker colors indicate higher pollution levels.
              Data is interpolated from monitoring stations across {globalStats.countriesCovered} countries.
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
