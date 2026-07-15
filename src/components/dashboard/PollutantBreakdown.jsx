const statusColors = {
  green: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  yellow: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  red: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
}

function getStatus(value, type) {
  if (value == null) return { label: "N/A", color: "green" }
  if (type === "pm25") {
    if (value <= 12) return { label: "Good", color: "green" }
    if (value <= 35.5) return { label: "Moderate", color: "yellow" }
    return { label: "Unhealthy", color: "red" }
  }
  if (type === "pm10") {
    if (value <= 55) return { label: "Good", color: "green" }
    if (value <= 155) return { label: "Moderate", color: "yellow" }
    return { label: "Unhealthy", color: "red" }
  }
  if (type === "o3") {
    if (value <= 55) return { label: "Good", color: "green" }
    if (value <= 70) return { label: "Moderate", color: "yellow" }
    return { label: "Unhealthy", color: "red" }
  }
  if (type === "no2") {
    if (value <= 54) return { label: "Good", color: "green" }
    if (value <= 100) return { label: "Moderate", color: "yellow" }
    return { label: "Unhealthy", color: "red" }
  }
  if (type === "so2") {
    if (value <= 35) return { label: "Good", color: "green" }
    if (value <= 75) return { label: "Moderate", color: "yellow" }
    return { label: "Unhealthy", color: "red" }
  }
  if (type === "co") {
    if (value <= 4.5) return { label: "Good", color: "green" }
    if (value <= 9.5) return { label: "Moderate", color: "yellow" }
    return { label: "Unhealthy", color: "red" }
  }
  return { label: "Good", color: "green" }
}

const pollutantMeta = {
  pm25: { name: "PM2.5", unit: "µg/m³", key: "pm25" },
  pm10: { name: "PM10", unit: "µg/m³", key: "pm10" },
  o3: { name: "O\u2083", unit: "ppb", key: "ozone" },
  no2: { name: "NO\u2082", unit: "ppb", key: "no2" },
  so2: { name: "SO\u2082", unit: "ppb", key: "so2" },
  co: { name: "CO", unit: "ppm", key: "co" },
}

export default function PollutantBreakdown({ cityData }) {
  const pollutants = cityData
    ? [
        { ...pollutantMeta.pm25, value: cityData.pm25 },
        { ...pollutantMeta.pm10, value: cityData.pm10 },
        { ...pollutantMeta.o3, value: cityData.ozone },
        { ...pollutantMeta.no2, value: cityData.no2 },
        { ...pollutantMeta.so2, value: cityData.so2 },
        { ...pollutantMeta.co, value: cityData.co },
      ]
    : []

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
      <h3 className="text-slate-900 dark:text-white font-display font-semibold mb-4">Pollutant Breakdown</h3>
      {pollutants.length === 0 || pollutants.every((p) => p.value == null) ? (
        <div className="text-sm text-slate-400 dark:text-slate-500 text-center py-6">
          Select a city to view pollutant data
        </div>
      ) : (
        <div className="space-y-3">
          {pollutants.map((p) => {
            const status = getStatus(p.value, p.key)
            return (
              <div
                key={p.name}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <div>
                  <span className="text-slate-900 dark:text-white font-medium text-sm">{p.name}</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-slate-400 dark:text-slate-500 text-xs font-mono">
                      {p.value != null ? `${p.value} ${p.unit}` : "N/A"}
                    </span>
                  </div>
                </div>
                <span
                  className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                    statusColors[status.color] || "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                  }`}
                >
                  {status.label}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
