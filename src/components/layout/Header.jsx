import { Link, useLocation } from "react-router-dom"

export default function Header() {
  const location = useLocation()
  const isDashboard = location.pathname === "/dashboard"

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <Link to="/" className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center">
          <span className="text-white font-bold text-sm">B</span>
        </div>
        <span className="text-slate-900 font-display font-semibold text-lg tracking-tight">
          bayumandal
        </span>
      </Link>

      <div className="flex items-center gap-6">
        <Link
          to="/"
          className={`text-sm font-medium transition-colors ${
            !isDashboard ? "text-slate-900" : "text-slate-500 hover:text-slate-900"
          }`}
        >
          Home
        </Link>
        <Link
          to="/dashboard"
          className={`text-sm font-medium transition-colors ${
            isDashboard ? "text-slate-900" : "text-slate-500 hover:text-slate-900"
          }`}
        >
          Dashboard
        </Link>
        <Link
          to="/dashboard"
          className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors"
        >
          Live AQI
        </Link>
      </div>
    </nav>
  )
}
