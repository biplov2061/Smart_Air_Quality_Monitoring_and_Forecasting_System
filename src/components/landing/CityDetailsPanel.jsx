import { getAQIColor, getAQIBand } from "../../data/aqiService"

const pollutantInfo = [
  { key: "pm25", label: "PM2.5", unit: "µg/m³" },
  { key: "pm10", label: "PM10", unit: "µg/m³" },
  { key: "ozone", label: "O₃", unit: "ppb" },
  { key: "no2", label: "NO₂", unit: "ppb" },
  { key: "so2", label: "SO₂", unit: "ppb" },
  { key: "co", label: "CO", unit: "ppm" },
]

function getPollutantLevel(value) {
  if (value == null) return { label: "No data", color: "#94a3b8", pct: 0 }
  if (value <= 33) return { label: "Good", color: "#00e400", pct: 25 }
  if (value <= 66) return { label: "Moderate", color: "#ffff00", pct: 50 }
  if (value <= 100) return { label: "Unhealthy", color: "#ff7e00", pct: 75 }
  return { label: "Hazardous", color: "#ff0000", pct: 100 }
}

const recommendations = [
  { minAqi: 301, icon: "☠️", title: "Health Emergency", desc: "Avoid all outdoor activity. Wear N95 mask if going out. Use air purifiers indoors." },
  { minAqi: 201, icon: "😷", title: "Severe Health Risk", desc: "Avoid outdoor exertion. Keep windows sealed. Run air purifiers continuously." },
  { minAqi: 151, icon: "⚠️", title: "Health Alert", desc: "Limit outdoor activity. Sensitive groups should stay indoors." },
  { minAqi: 101, icon: "⚡", title: "Reduce Exposure", desc: "Sensitive groups should reduce prolonged outdoor exertion." },
  { minAqi: 51, icon: "👃", title: "Moderate", desc: "Unusually sensitive people should consider limiting outdoor activity." },
  { minAqi: 0, icon: "🌿", title: "Good Air", desc: "Air quality is satisfactory. Enjoy outdoor activities." },
]

function getRecommendation(aqi) {
  return recommendations.find((r) => aqi >= r.minAqi) || recommendations[recommendations.length - 1]
}

export default function CityDetailsPanel({ city, onClose }) {
  if (!city) return null

  const color = getAQIColor(city.aqi)
  const band = getAQIBand(city.aqi)
  const percentage = Math.min((city.aqi / 500) * 100, 100)
  const circumference = 2 * Math.PI * 70
  const offset = circumference - (percentage / 100) * circumference
  const rec = getRecommendation(city.aqi)

  return (
    <>
      <div
        className="fixed inset-0 z-[2000] bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="fixed top-0 right-0 z-[2001] h-full w-full max-w-md bg-white shadow-2xl border-l border-slate-200 overflow-y-auto">
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-slate-100 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-lg font-display font-bold text-slate-900">{city.name}</h2>
            <p className="text-sm text-slate-500">{city.country}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-6 space-y-6">
          <div className="flex flex-col items-center">
            <div className="relative w-44 h-44">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
                <circle cx="100" cy="100" r="70" fill="none" stroke="#f1f5f9" strokeWidth="14" />
                <circle
                  cx="100" cy="100" r="70"
                  fill="none" stroke={color}
                  strokeWidth="14"
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-bold font-mono" style={{ color }}>{city.aqi}</span>
                <span className="text-sm font-medium text-slate-500 mt-1">{band}</span>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              {[
                { label: "Good", color: "#00e400" },
                { label: "Mod", color: "#ffff00" },
                { label: "Sens", color: "#ff7e00" },
                { label: "Unh", color: "#ff0000" },
                { label: "V.U", color: "#8f3f97" },
                { label: "Haz", color: "#7e0023" },
              ].map((b) => (
                <div key={b.label} className="flex flex-col items-center gap-0.5">
                  <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: b.color }} />
                  <span className="text-[7px] text-slate-400 leading-tight text-center">{b.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wider">Pollutant Breakdown</h3>
            <div className="space-y-2">
              {pollutantInfo.map((p) => {
                const value = city[p.key]
                const level = getPollutantLevel(value)
                return (
                  <div key={p.key} className="flex items-center gap-3 bg-slate-50 rounded-lg px-3 py-2">
                    <span className="w-12 text-xs font-medium text-slate-600">{p.label}</span>
                    <div className="flex-1">
                      <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${level.pct}%`, backgroundColor: level.color }}
                        />
                      </div>
                    </div>
                    <span className="w-16 text-right text-xs font-mono text-slate-500">
                      {value != null ? value : "—"} {value != null ? p.unit : ""}
                    </span>
                    <span
                      className="w-16 text-right text-xs font-medium"
                      style={{ color: level.color }}
                    >
                      {level.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <div className="flex items-start gap-3">
              <span className="text-xl">{rec.icon}</span>
              <div>
                <h4 className="text-sm font-semibold text-slate-800">{rec.title}</h4>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{rec.desc}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
