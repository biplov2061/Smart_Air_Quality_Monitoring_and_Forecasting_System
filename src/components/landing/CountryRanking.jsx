import { useMemo } from "react"
import { useAQI } from "../../context/useAQI"
import { getAQIColor, getAQIBand } from "../../data/aqiService"

const countryFlags = {
  India: "\uD83C\uDDEE\uD83C\uDDF3", Bangladesh: "\uD83C\uDDE7\uD83C\uDDE9", Pakistan: "\uD83C\uDDF5\uD83C\uDDF0", China: "\uD83C\uDDE8\uD83C\uDDF3",
  Mongolia: "\uD83C\uDDF2\uD83C\uDDF3", Afghanistan: "\uD83C\uDDE6\uD83C\uDDEB", Nigeria: "\uD83C\uDDF3\uD83C\uDDEC", Egypt: "\uD83C\uDDEA\uD83C\uDDEC",
  Indonesia: "\uD83C\uDDEE\uD83C\uDDE9", Thailand: "\uD83C\uDDF9\uD83C\uDDED", Vietnam: "\uD83C\uDDFB\uD83C\uDDF3", Iran: "\uD83C\uDDEE\uD83C\uDDF7",
  Iraq: "\uD83C\uDDEE\uD83C\uDDF6", Kuwait: "\uD83C\uDDF0\uD83C\uDDFC", UAE: "\uD83C\uDDE6\uD83C\uDDEA",
  Turkey: "\uD83C\uDDF9\uD83C\uDDF7", Russia: "\uD83C\uDDF7\uD83C\uDDFA", Ukraine: "\uD83C\uDDFA\uD83C\uDDE6", Poland: "\uD83C\uDDF5\uD83C\uDDF1",
  Germany: "\uD83C\uDDE9\uD83C\uDDEA", France: "\uD83C\uDDEB\uD83C\uDDF7", UK: "\uD83C\uDDEC\uD83C\uDDE7", Italy: "\uD83C\uDDEE\uD83C\uDDF9",
  Spain: "\uD83C\uDDEA\uD83C\uDDF8", USA: "\uD83C\uDDFA\uD83C\uDDF8", Canada: "\uD83C\uDDE8\uD83C\uDDE6", Mexico: "\uD83C\uDDF2\uD83C\uDDFD",
  Brazil: "\uD83C\uDDE7\uD83C\uDDF7", Argentina: "\uD83C\uDDE6\uD83C\uDDF7", Chile: "\uD83C\uDDE8\uD83C\uDDF1", Colombia: "\uD83C\uDDE8\uD83C\uDDF4",
  Peru: "\uD83C\uDDF5\uD83C\uDDEA", Kenya: "\uD83C\uDDF0\uD83C\uDDEA", Ethiopia: "\uD83C\uDDEA\uD83C\uDDF9",
  Japan: "\uD83C\uDDEF\uD83C\uDDF5", Australia: "\uD83C\uDDE6\uD83C\uDDFA",
  "Saudi Arabia": "\uD83C\uDDF8\uD83C\uDDE6",
  "South Africa": "\uD83C\uDDFF\uD83C\uDDE6",
  "South Korea": "\uD83C\uDDF0\uD83C\uDDF7",
  "New Zealand": "\uD83C\uDDF3\uD83C\uDDFF",
  "DR Congo": "\uD83C\uDDE9\uD83C\uDDF7",
  "Ivory Coast": "\uD83C\uDDE8\uD83C\uDDEE",
  "Burkina Faso": "\uD83C\uDDE7\uD83C\uDDEB",
  "Sierra Leone": "\uD83C\uDDF8\uD83C\uDDF1",
  "Sri Lanka": "\uD83C\uDDF1\uD83C\uDDF0",
  "Papua New Guinea": "\uD83C\uDDF5\uD83C\uDDEC",
  "New Caledonia": "\uD83C\uDDF3\uD83C\uDDE8",
  "French Guiana": "\uD83C\uDDEB\uD83C\uDDF7",
  "Czech Republic": "\uD83C\uDDE8\uD83C\uDDFF",
  "Dominican Republic": "\uD83C\uDDE9\uD83C\uDDF4",
  "Costa Rica": "\uD83C\uDDE8\uD83C\uDDF7",
  "El Salvador": "\uD83C\uDDF8\uD83C\uDDFB",
}

export default function CountryRanking() {
  const { cities } = useAQI()

  const countries = useMemo(() => {
    const map = {}
    cities.forEach((c) => {
      if (c.aqi == null) return
      if (!map[c.country]) {
        map[c.country] = { name: c.country, aqiSum: 0, count: 0 }
      }
      map[c.country].aqiSum += c.aqi
      map[c.country].count += 1
    })
    return Object.values(map)
      .map((c) => ({ name: c.name, aqi: Math.round(c.aqiSum / c.count) }))
      .sort((a, b) => b.aqi - a.aqi)
      .slice(0, 5)
      .map((c, i) => ({ ...c, rank: i + 1, flag: countryFlags[c.name] || "\uD83C\uDF0D" }))
  }, [cities])

  const maxAQI = countries[0]?.aqi || 200

  if (countries.length === 0) return null

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-slate-900 dark:text-white font-display font-semibold text-lg">Most Polluted</h3>
        <span className="text-xs text-slate-500 dark:text-slate-400">Top 5 Countries</span>
      </div>

      <div className="space-y-4">
        {countries.map((country) => {
          const color = getAQIColor(country.aqi)
          const band = getAQIBand(country.aqi)
          const widthPercent = (country.aqi / maxAQI) * 100

          return (
            <div key={country.name} className="group cursor-pointer">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-xs font-mono text-slate-500 dark:text-slate-400 group-hover:bg-slate-200 dark:group-hover:bg-slate-600 transition-colors">
                    {country.rank}
                  </span>
                  <span className="text-slate-900 dark:text-white text-sm font-medium">{country.flag} {country.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-900 dark:text-white font-mono text-sm font-bold">{country.aqi}</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">{band}</span>
                </div>
              </div>
              <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500 group-hover:opacity-80"
                  style={{
                    width: `${widthPercent}%`,
                    backgroundColor: color,
                    boxShadow: `0 0 8px ${color}40`,
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
