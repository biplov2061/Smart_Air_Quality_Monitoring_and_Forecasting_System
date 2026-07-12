import { useAQI } from "../../context/useAQI"

export default function Footer() {
  const { globalStats } = useAQI()
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40 glass">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-sky-500 flex items-center justify-center">
                <span className="text-white font-bold text-xs">B</span>
              </div>
              <span className="text-slate-900 dark:text-white font-display font-semibold">bayumandal</span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Real-time air quality monitoring system. Breathe smarter, live better.
            </p>
          </div>

          <div>
            <h4 className="text-slate-900 dark:text-white text-sm font-semibold mb-3">Platform</h4>
            <ul className="space-y-2">
              <li><a href="/" className="text-slate-500 dark:text-slate-400 text-sm hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Home</a></li>
              <li><a href="/dashboard" className="text-slate-500 dark:text-slate-400 text-sm hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Dashboard</a></li>
              <li><a href="/dashboard" className="text-slate-500 dark:text-slate-400 text-sm hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Heat Map</a></li>
              <li><a href="/dashboard" className="text-slate-500 dark:text-slate-400 text-sm hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Trends</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-slate-900 dark:text-white text-sm font-semibold mb-3">Resources</h4>
            <ul className="space-y-2">
              <li><span className="text-slate-500 dark:text-slate-400 text-sm">API Access</span></li>
              <li><span className="text-slate-500 dark:text-slate-400 text-sm">Documentation</span></li>
              <li><span className="text-slate-500 dark:text-slate-400 text-sm">Research</span></li>
              <li><span className="text-slate-500 dark:text-slate-400 text-sm">FAQ</span></li>
            </ul>
          </div>

          <div>
            <h4 className="text-slate-900 dark:text-white text-sm font-semibold mb-3">Global Stats</h4>
            <ul className="space-y-2">
              <li className="text-slate-500 dark:text-slate-400 text-sm">{globalStats.citiesMonitored} Cities Monitored</li>
              <li className="text-slate-500 dark:text-slate-400 text-sm">{globalStats.countriesCovered} Countries</li>
              <li className="text-slate-500 dark:text-slate-400 text-sm">Updated {globalStats.updatedAt}</li>
              <li className="text-slate-500 dark:text-slate-400 text-sm">support@bayumandal.io</li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-400 text-xs">
            &copy; {new Date().getFullYear()} bayumandal. All rights reserved.
          </p>
          <div className="flex gap-4 text-xs text-slate-400">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Cookie Policy</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
