import { getAQIColor, getAQIBand } from "../../data/aqiService"

export default function AQIGauge({ aqi = 182, city = "Delhi, India" }) {
  const color = getAQIColor(aqi)
  const band = getAQIBand(aqi)
  const percentage = Math.min((aqi / 500) * 100, 100)
  const circumference = 2 * Math.PI * 80
  const offset = circumference - (percentage / 100) * circumference

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-slate-900 font-display font-semibold">Live AQI</h3>
        <span className="text-xs text-slate-400">{city}</span>
      </div>

      <div className="flex flex-col items-center">
        <div className="relative w-48 h-48">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
            <circle cx="100" cy="100" r="80" fill="none" stroke="#f1f5f9" strokeWidth="12" />
            <circle
              cx="100"
              cy="100"
              r="80"
              fill="none"
              stroke={color}
              strokeWidth="12"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span
              className="text-5xl font-bold font-mono transition-colors duration-500"
              style={{ color }}
            >
              {aqi}
            </span>
            <span className="text-sm font-medium text-slate-500 mt-1">{band}</span>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          {[
            { label: "Good", color: "#00e400" },
            { label: "Moderate", color: "#ffff00" },
            { label: "Sensitive", color: "#ff7e00" },
            { label: "Unhealthy", color: "#ff0000" },
            { label: "Very", color: "#8f3f97" },
            { label: "Hazardous", color: "#7e0023" },
          ].map((band) => (
            <div key={band.label} className="flex flex-col items-center gap-0.5">
              <div
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: band.color }}
              />
              <span className="text-[8px] text-slate-400 leading-tight text-center">{band.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
