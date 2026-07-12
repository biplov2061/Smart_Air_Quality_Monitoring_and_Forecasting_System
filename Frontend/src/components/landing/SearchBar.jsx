import { useMemo, useState, useRef } from "react"
import { useAQI } from "../../context/useAQI"
import { getAQIColor, getAQIBand } from "../../data/aqiService"

export default function SearchBar({ value, onChange, onSubmit, onSelect }) {
  const { cities } = useAQI()
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)
  const blurTimer = useRef(null)

  const q = value.trim().toLowerCase()

  const suggestions = useMemo(() => {
    if (!q) return []
    const scored = []
    for (const c of cities) {
      if (c.aqi == null) continue
      const name = c.name.toLowerCase()
      const country = (c.country || "").toLowerCase()
      let score = -1
      if (name.startsWith(q)) score = 0
      else if (country.startsWith(q)) score = 1
      else if (name.includes(q)) score = 2
      else if (country.includes(q)) score = 3
      if (score >= 0) scored.push({ c, score })
    }
    scored.sort((a, b) => a.score - b.score || b.c.aqi - a.c.aqi)
    return scored.slice(0, 8).map((s) => s.c)
  }, [q, cities])

  const showDropdown = open && q.length > 0

  function choose(city) {
    onChange(city.name)
    setOpen(false)
    setActive(-1)
    onSelect?.(city)
  }

  function submitFree() {
    setOpen(false)
    setActive(-1)
    onSubmit?.(value)
  }

  function onKeyDown(e) {
    if (!showDropdown) return
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setActive((i) => Math.min(suggestions.length - 1, i + 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActive((i) => Math.max(0, i - 1))
    } else if (e.key === "Escape") {
      setOpen(false)
      setActive(-1)
    } else if (e.key === "Enter") {
      if (active >= 0 && suggestions[active]) {
        e.preventDefault()
        choose(suggestions[active])
      }
    }
  }

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          submitFree()
        }}
        role="search"
      >
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value)
            setOpen(true)
            setActive(-1)
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => {
            blurTimer.current = setTimeout(() => setOpen(false), 120)
          }}
          onKeyDown={onKeyDown}
          role="combobox"
          aria-expanded={showDropdown}
          aria-autocomplete="list"
          aria-controls="search-suggestions"
          placeholder="Search any city or country"
          className="w-full pl-12 pr-4 py-4 bg-white/90 dark:bg-slate-800/70 glass border border-slate-300 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 text-base focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/25 transition-all shadow-sm"
        />
      </form>

      {showDropdown && (
        <ul
          id="search-suggestions"
          role="listbox"
          className="absolute z-[1200] left-0 right-0 mt-2 max-h-80 overflow-auto rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl py-1.5"
          onMouseDown={(e) => e.preventDefault() }
        >
          {suggestions.map((c, i) => {
            const color = getAQIColor(c.aqi)
            return (
              <li
                key={c.id}
                role="option"
                aria-selected={i === active}
                onMouseEnter={() => setActive(i)}
                onClick={() => choose(c)}
                className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors ${
                  i === active ? "bg-slate-100 dark:bg-slate-800" : ""
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-medium text-slate-900 dark:text-white truncate">{c.name}</span>
                  <span className="block text-xs text-slate-400 truncate">{c.country}</span>
                </span>
                <span className="text-right">
                  <span className="block text-sm font-mono font-bold" style={{ color }}>{c.aqi}</span>
                  <span className="block text-[10px] text-slate-400 uppercase tracking-wide">{getAQIBand(c.aqi)}</span>
                </span>
              </li>
            )
          })}

          <li
            role="option"
            aria-selected={false}
            onClick={submitFree}
            className="flex items-center gap-3 px-4 py-2.5 cursor-pointer border-t border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="text-sm">
              {suggestions.length === 0 ? "No match in list — " : "Not what you want? "}
              <span className="font-medium text-emerald-600 dark:text-emerald-400">Fetch “{value}” live</span>
            </span>
          </li>
        </ul>
      )}
    </div>
  )
}
