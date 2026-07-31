import { useState, useMemo, useRef, useEffect } from "react"
import Header from "../components/layout/Header"
import Footer from "../components/layout/Footer"
import { useAQI } from "../context/useAQI"
import { getPointAqi, getSafetyGuides } from "../data/apiClient"
import { getAQIColor, getAQIBand } from "../data/aqiService"
import { recommendGuides, getAqiBandKey } from "../data/safetyGuides"

const severityStyles = {
  high: {
    border: "border-red-200 dark:border-red-900/50",
    bg: "bg-red-50 dark:bg-red-950/30",
    badge: "bg-red-500 text-white",
  },
  medium: {
    border: "border-amber-200 dark:border-amber-900/50",
    bg: "bg-amber-50 dark:bg-amber-950/30",
    badge: "bg-amber-500 text-white",
  },
  low: {
    border: "border-emerald-200 dark:border-emerald-900/50",
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    badge: "bg-emerald-500 text-white",
  },
}

const inputClass =
  "w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500/30"

export default function Recommendation() {
  const { cities } = useAQI()

  const [form, setForm] = useState({
    name: "",
    age: "",
    sensitivity: "",
    hasCondition: "", 
    disease: "",
    diseaseRate: "",
  })

  const [location, setLocation] = useState(null) 
  const [currentAqi, setCurrentAqi] = useState("")

  const [search, setSearch] = useState("")
  const [open, setOpen] = useState(false)
  const [activeIdx, setActiveIdx] = useState(-1)
  const blurRef = useRef(null)
  const [guides, setGuides] = useState([])
  const [profile, setProfile] = useState(null)
  const [catalog, setCatalog] = useState(null)
  useEffect(() => {
    let alive = true
    getSafetyGuides()
      .then((list) => {
        if (alive && Array.isArray(list) && list.length) setCatalog(list)
      })
      .catch(() => {
      })
    return () => {
      alive = false
    }
  }, [])

  const conditionActive =
    (form.sensitivity === "moderate" || form.sensitivity === "high") && form.hasCondition === "yes"

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => {
      const next = { ...prev, [name]: value }
      if (name === "sensitivity" && value !== "moderate" && value !== "high") {
        next.hasCondition = ""
        next.disease = ""
        next.diseaseRate = ""
      }
      if (name === "hasCondition" && value !== "yes") {
        next.disease = ""
        next.diseaseRate = ""
      }
      return next
    })
  }

  const filteredCities = useMemo(() => {
    const list = cities.filter((c) => c.aqi != null)
    const q = search.trim().toLowerCase()
    if (!q) return [...list].sort((a, b) => b.aqi - a.aqi).slice(0, 50)

    const scored = []
    for (const c of list) {
      const name = c.name.toLowerCase()
      const country = (c.country || "").toLowerCase()
      let s = -1
      if (name.startsWith(q)) s = 0
      else if (country.startsWith(q)) s = 1
      else if (name.includes(q)) s = 2
      else if (country.includes(q)) s = 3
      if (s >= 0) scored.push({ c, s })
    }
    scored.sort((a, b) => a.s - b.s || b.c.aqi - a.c.aqi)
    return scored.slice(0, 50).map((x) => x.c)
  }, [cities, search])

  async function selectCity(city) {
    setLocation(city)
    setCurrentAqi(String(city.aqi))
    setSearch(`${city.name}, ${city.country}`)
    setOpen(false)
    setActiveIdx(-1)
    if (city.lat != null && city.lng != null) {
      try {
        const live = await getPointAqi(city.lat, city.lng, city.name, city.country)
        if (live && live.aqi != null) setCurrentAqi(String(live.aqi))
      } catch {
      }
    }
  }

  function onSearchKeyDown(e) {
    if (!open || filteredCities.length === 0) return
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setActiveIdx((i) => Math.min(filteredCities.length - 1, i + 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActiveIdx((i) => Math.max(0, i - 1))
    } else if (e.key === "Escape") {
      setOpen(false)
      setActiveIdx(-1)
    } else if (e.key === "Enter") {
      e.preventDefault()
      if (activeIdx >= 0 && filteredCities[activeIdx]) selectCity(filteredCities[activeIdx])
    }
  }

  function handleSubmit(e) {
    e.preventDefault()
    const diseaseText = conditionActive ? form.disease : ""
    const results = recommendGuides(
      {
        aqi: currentAqi,
        age: form.age,
        sensitivity: form.sensitivity,
        disease: diseaseText,
        diseaseRate: conditionActive ? form.diseaseRate : "",
      },
      catalog || undefined
    )
    setGuides(results)
    setProfile({
      name: form.name,
      location: location ? `${location.name}, ${location.country}` : search,
      age: form.age,
      sensitivity: form.sensitivity,
      disease: diseaseText,
      diseaseRate: conditionActive ? form.diseaseRate : "",
      aqi: currentAqi,
      band: getAqiBandKey(currentAqi),
    })
  }

  const aqiColor = currentAqi !== "" ? getAQIColor(Number(currentAqi)) : "#94a3b8"

  function downloadPdf() {
    if (!profile || guides.length === 0) return
    const esc = (s) =>
      String(s ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")

    const infoRows = [
      ["Name", profile.name || "—"],
      ["Location", profile.location || "—"],
      ["Age", profile.age || "—"],
      ["Health Sensitivity", profile.sensitivity || "—"],
      ["Health Condition", profile.disease || "None reported"],
      ["Condition Severity", profile.diseaseRate || "—"],
      [
        "Current AQI",
        profile.aqi !== "" && profile.aqi != null
          ? `${profile.aqi} — ${getAQIBand(Number(profile.aqi))}`
          : "—",
      ],
      ["Generated", new Date().toLocaleString()],
    ]
      .map(([k, v]) => `<tr><td class="k">${esc(k)}</td><td class="v">${esc(v)}</td></tr>`)
      .join("")

    const guideItems = guides
      .map(
        (g, i) => `
        <li class="guide ${esc(g.severity)}">
          <div class="g-head">
            <span class="g-num">${i + 1}</span>
            <span class="g-title">${esc(g.icon)} ${esc(g.title)}</span>
            <span class="g-sev sev-${esc(g.severity)}">${esc(g.severity)}</span>
          </div>
          <p class="g-desc">${esc(g.desc)}</p>
          ${
            g.reasons && g.reasons.length
              ? `<div class="g-reasons">${g.reasons
                  .map((r) => `<span class="chip">${esc(r)}</span>`)
                  .join("")}</div>`
              : ""
          }
        </li>`
      )
      .join("")

    const html = `<!doctype html><html><head><meta charset="utf-8" />
      <title>Safety Guide${profile.name ? " - " + esc(profile.name) : ""}</title>
      <style>
        * { box-sizing: border-box; }
        body { font-family: -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; color: #0f172a; margin: 32px; }
        h1 { font-size: 22px; margin: 0 0 2px; }
        h1 span { color: #0ea5e9; }
        .sub { color: #64748b; font-size: 12px; margin: 0 0 20px; }
        h2 { font-size: 15px; margin: 24px 0 10px; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; }
        table { border-collapse: collapse; width: 100%; font-size: 13px; }
        td { padding: 6px 8px; border-bottom: 1px solid #eef2f7; vertical-align: top; }
        td.k { color: #64748b; width: 180px; }
        td.v { color: #0f172a; font-weight: 600; }
        ul { list-style: none; padding: 0; margin: 0; }
        .guide { border: 1px solid #e2e8f0; border-left-width: 4px; border-radius: 10px; padding: 12px 14px; margin: 0 0 10px; page-break-inside: avoid; }
        .guide.high { border-left-color: #ef4444; }
        .guide.medium { border-left-color: #f59e0b; }
        .guide.low { border-left-color: #10b981; }
        .g-head { display: flex; align-items: center; gap: 8px; }
        .g-num { background: #0f172a; color: #fff; font-size: 11px; width: 20px; height: 20px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; flex: 0 0 auto; }
        .g-title { font-weight: 700; font-size: 13.5px; flex: 1; }
        .g-sev { font-size: 10px; text-transform: uppercase; padding: 2px 8px; border-radius: 999px; color: #fff; }
        .sev-high { background: #ef4444; }
        .sev-medium { background: #f59e0b; }
        .sev-low { background: #10b981; }
        .g-desc { font-size: 12.5px; color: #334155; margin: 8px 0 0; line-height: 1.5; }
        .g-reasons { margin-top: 8px; }
        .chip { display: inline-block; font-size: 10px; color: #475569; background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 999px; padding: 2px 8px; margin: 0 4px 4px 0; }
        .foot { margin-top: 24px; font-size: 10.5px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 8px; }
      </style></head>
      <body>
        <h1>Smart <span>Safety Guide</span></h1>
        <p class="sub">Air-quality health &amp; activity recommendations</p>
        <h2>Your details</h2>
        <table>${infoRows}</table>
        <h2>Recommended safety guides (${guides.length})</h2>
        <ul>${guideItems}</ul>
        <p class="foot">Generated by the Smart Air Quality Monitoring &amp; Forecasting System. This guidance is informational and not a substitute for professional medical advice.</p>
      </body></html>`

    const iframe = document.createElement("iframe")
    iframe.style.position = "fixed"
    iframe.style.right = "0"
    iframe.style.bottom = "0"
    iframe.style.width = "0"
    iframe.style.height = "0"
    iframe.style.border = "0"
    document.body.appendChild(iframe)
    const doc = iframe.contentWindow.document
    doc.open()
    doc.write(html)
    doc.close()
    const cleanup = () => setTimeout(() => iframe.remove(), 1000)
    iframe.contentWindow.onafterprint = cleanup
    iframe.onload = () => {
      iframe.contentWindow.focus()
      iframe.contentWindow.print()
      setTimeout(cleanup, 60000)
    }
  }

  return (
    <div className="min-h-screen">
      <Header />

      <div className="pt-24 px-5 sm:px-8 pb-10">
        <div className="max-w-3xl mx-auto">
          <div className="py-6 border-b border-slate-200/70 dark:border-slate-800">
            <h1 className="text-2xl sm:text-3xl font-display font-bold">
              <span className="text-sky-500 dark:text-sky-400">Smart Safety Guides</span>
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Personalised health &amp; activity advice based on your location's current AQI
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Name</label>
                <input type="text" name="name" value={form.name} onChange={handleChange} className={inputClass} />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Age</label>
                <input type="number" name="age" value={form.age} onChange={handleChange} min="0" max="120" className={inputClass} />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Location</label>
                <div className="relative">
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value)
                      setOpen(true)
                      setActiveIdx(-1)
                      setLocation(null)
                      setCurrentAqi("")
                    }}
                    onFocus={(e) => {
                      setOpen(true)
                      e.target.select()
                    }}
                    onBlur={() => {
                      blurRef.current = setTimeout(() => setOpen(false), 150)
                    }}
                    onKeyDown={onSearchKeyDown}
                    placeholder="Search a city or country…"
                    role="combobox"
                    aria-expanded={open}
                    aria-autocomplete="list"
                    className={inputClass}
                  />

                  {open && (
                    <ul
                      className="absolute z-50 left-0 right-0 mt-1 max-h-60 overflow-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl py-1"
                      onMouseDown={(e) => e.preventDefault()}
                    >
                      {filteredCities.length === 0 ? (
                        <li className="px-4 py-3 text-sm text-slate-400 text-center">
                          {cities.length === 0 ? "Loading cities…" : "No locations match"}
                        </li>
                      ) : (
                        filteredCities.map((c, i) => (
                          <li
                            key={c.id ?? `${c.name}-${c.country}`}
                            onMouseEnter={() => setActiveIdx(i)}
                            onClick={() => selectCity(c)}
                            className={`flex items-center gap-3 px-4 py-2 cursor-pointer transition-colors ${
                              i === activeIdx ? "bg-slate-100 dark:bg-slate-800" : ""
                            }`}
                          >
                            <span
                              className="w-2 h-2 rounded-full flex-shrink-0"
                              style={{ backgroundColor: getAQIColor(c.aqi) }}
                            />
                            <span className="flex-1 min-w-0 text-sm text-slate-900 dark:text-white truncate">
                              {c.name}, <span className="text-slate-400">{c.country}</span>
                            </span>
                            <span
                              className="text-sm font-mono font-bold flex-shrink-0"
                              style={{ color: getAQIColor(c.aqi) }}
                            >
                              {c.aqi}
                            </span>
                          </li>
                        ))
                      )}
                    </ul>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Current AQI</label>
                <div className={`${inputClass} flex items-center justify-between !cursor-default`}>
                  {currentAqi !== "" ? (
                    <>
                      <span className="font-mono font-bold text-base" style={{ color: aqiColor }}>
                        {currentAqi}
                      </span>
                      <span className="text-xs font-medium" style={{ color: aqiColor }}>
                        {getAQIBand(Number(currentAqi))}
                      </span>
                    </>
                  ) : (
                    <span className="text-slate-400">Select a location</span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Health Sensitivity</label>
                <select name="sensitivity" value={form.sensitivity} onChange={handleChange} className={inputClass}>
                  <option value="">Select...</option>
                  <option value="low">Low</option>
                  <option value="moderate">Moderate</option>
                  <option value="high">High</option>
                </select>
              </div>

              {(form.sensitivity === "moderate" || form.sensitivity === "high") && (
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Do you have any existing health condition?
                  </label>
                  <select name="hasCondition" value={form.hasCondition} onChange={handleChange} className={inputClass}>
                    <option value="">Select...</option>
                    <option value="none">No, I'm in good health</option>
                    <option value="yes">Yes, I have a condition</option>
                  </select>
                </div>
              )}

              {conditionActive && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Which condition?
                    </label>
                    <input
                      type="text"
                      name="disease"
                      value={form.disease}
                      onChange={handleChange}
                      placeholder="e.g. Asthma, COPD, Heart disease"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      How severe is it?
                    </label>
                    <select name="diseaseRate" value={form.diseaseRate} onChange={handleChange} className={inputClass}>
                      <option value="">Select...</option>
                      <option value="Mild">Mild</option>
                      <option value="Moderate">Moderate</option>
                      <option value="Severe">Severe</option>
                    </select>
                  </div>
                </>
              )}
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-semibold text-sm rounded-xl shadow-sm hover:shadow-lg transition-all"
            >
              Get Safety Guide
            </button>
          </form>

          {profile && (
            <div className="mt-10">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <div>
                  <h3 className="text-lg font-display font-semibold text-slate-900 dark:text-white">
                    Safety Guide{profile.name ? ` for ${profile.name}` : ""}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {profile.location ? `${profile.location} • ` : ""}
                    {profile.aqi !== "" && profile.aqi != null
                      ? `AQI ${profile.aqi} (${getAQIBand(Number(profile.aqi))})`
                      : "AQI not set"}
                    {" • "}
                    {guides.length} guide{guides.length === 1 ? "" : "s"} matched
                  </p>
                </div>
                {guides.length > 0 && (
                  <button
                    type="button"
                    onClick={downloadPdf}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-medium text-slate-700 dark:text-slate-200 hover:shadow-sm transition-all flex-shrink-0"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
                    </svg>
                    Download PDF
                  </button>
                )}
              </div>

              {guides.length === 0 ? (
                <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-sm text-slate-500">
                  No specific guides matched. Please select a location (to set the current AQI) and fill in your age,
                  sensitivity and any condition, then try again.
                </div>
              ) : (
                <div className="space-y-3">
                  {guides.map((g) => {
                    const styles = severityStyles[g.severity] || severityStyles.low
                    return (
                      <div
                        key={g.id}
                        className={`flex items-start gap-3 p-4 rounded-xl border ${styles.border} ${styles.bg} transition-shadow hover:shadow-sm`}
                      >
                        <span className="text-xl flex-shrink-0">{g.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">{g.title}</h4>
                            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${styles.badge}`}>
                              {g.severity}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{g.desc}</p>
                          {g.reasons && g.reasons.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {g.reasons.map((r, ri) => (
                                <span
                                  key={ri}
                                  className="text-[10px] px-2 py-0.5 rounded-full bg-white/70 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400"
                                >
                                  {r}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

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
