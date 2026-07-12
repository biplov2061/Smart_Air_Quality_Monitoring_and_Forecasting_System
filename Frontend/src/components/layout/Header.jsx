import { useState, useEffect } from "react"
import { Link, useLocation } from "react-router-dom"
import ThemeToggle from "./ThemeToggle"

function NavLink({ to, active, children, onClick }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={`relative text-sm font-medium transition-colors ${
        active
          ? "text-slate-900 dark:text-white"
          : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
      }`}
    >
      {children}
      <span
        className={`absolute -bottom-1.5 left-0 h-0.5 rounded-full bg-gradient-to-r from-emerald-500 to-sky-500 transition-all duration-300 ${
          active ? "w-full" : "w-0"
        }`}
      />
    </Link>
  )
}

export default function Header() {
  const location = useLocation()
  const path = location.pathname
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => setMenuOpen(false), [path])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-[1500] glass transition-shadow duration-300 border-b ${
        scrolled ? "border-slate-200/80 dark:border-slate-700/80 shadow-sm" : "border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-5 sm:px-8 py-3.5">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-sky-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <span className="text-white font-bold">B</span>
            <span className="absolute inset-0 rounded-xl ring-1 ring-white/30" />
          </div>
          <div className="leading-tight">
            <span className="block text-slate-900 dark:text-white font-display font-semibold text-lg tracking-tight">
              bayumandal
            </span>
            <span className="block text-[10px] text-slate-400 font-medium tracking-wide uppercase">
              Air Quality
            </span>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-7">
          <NavLink to="/" active={path === "/"}>Home</NavLink>
          <NavLink to="/dashboard" active={path === "/dashboard"}>Dashboard</NavLink>
          <ThemeToggle />
          <Link
            to="/dashboard"
            className="group inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 rounded-xl transition-all shadow-sm hover:shadow-md"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </span>
            Live AQI
          </Link>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            className="p-2 -mr-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden overflow-hidden transition-[max-height] duration-300 ease-out ${
          menuOpen ? "max-h-64" : "max-h-0"
        }`}
      >
        <div className="glass border-t border-slate-200/70 dark:border-slate-700/70 px-5 py-4 flex flex-col gap-4">
          <NavLink to="/" active={path === "/"} onClick={() => setMenuOpen(false)}>Home</NavLink>
          <NavLink to="/dashboard" active={path === "/dashboard"} onClick={() => setMenuOpen(false)}>Dashboard</NavLink>
          <Link
            to="/dashboard"
            onClick={() => setMenuOpen(false)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-slate-900 dark:bg-emerald-600 rounded-xl"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400" /> Live AQI
          </Link>
        </div>
      </div>
    </nav>
  )
}
