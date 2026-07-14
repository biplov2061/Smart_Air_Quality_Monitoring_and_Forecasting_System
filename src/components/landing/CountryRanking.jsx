import { useMemo } from "react"
import { useAQI } from "../../context/useAQI"
import { getAQIColor, getAQIBand } from "../../data/aqiService"

const countryFlags = {
  India: "🇮🇳", Bangladesh: "🇧🇩", Pakistan: "🇵🇰", China: "🇨🇳",
  Mongolia: "🇲🇳", Afghanistan: "🇦🇫", Nigeria: "🇳🇬", Egypt: "🇪🇬",
  Indonesia: "🇮🇩", Thailand: "🇹🇭", Vietnam: "🇻🇳", Iran: "🇮🇷",
  Iraq: "🇮🇶", Kuwait: "🇰🇼", UAE: "🇦🇪",
  Turkey: "🇹🇷", Russia: "🇷🇺", Ukraine: "🇺🇦", Poland: "🇵🇱",
  Germany: "🇩🇪", France: "🇫🇷", UK: "🇬🇧", Italy: "🇮🇹",
  Spain: "🇪🇸", USA: "🇺🇸", Canada: "🇨🇦", Mexico: "🇲🇽",
  Brazil: "🇧🇷", Argentina: "🇦🇷", Chile: "🇨🇱", Colombia: "🇨🇴",
  Peru: "🇵🇪", Kenya: "🇰🇪", Ethiopia: "🇪🇹",
  Japan: "🇯🇵", Australia: "🇦🇺",
  "Saudi Arabia": "🇸🇦",
  "South Africa": "🇿🇦",
  "South Korea": "🇰🇷",
  "New Zealand": "🇳🇿",
  "DR Congo": "🇨🇩",
  "Ivory Coast": "🇨🇮",
  "Burkina Faso": "🇧🇫",
  "Sierra Leone": "🇸🇱",
  "Sri Lanka": "🇱🇰",
  "Papua New Guinea": "🇵🇬",
  "New Caledonia": "🇳🇨",
  "French Guiana": "🇬🇫",
  "Czech Republic": "🇨🇿",
  "Dominican Republic": "🇩🇴",
  "Costa Rica": "🇨🇷",
  "El Salvador": "🇸🇻",
}

export default function CountryRanking() {
  const { cities } = useAQI()

  const countries = useMemo(() => {
    const map = {}
    cities.forEach((c) => {
      if (!c.aqi) return
      if (!map[c.country]) {
        map[c.country] = { name: c.country, aqiSum: 0, count: 0 }
      }
      map[c.country].aqiSum += c.aqi
      map[c.country].count += 1
    })
    return Object.values(map)
      .map((c) => ({ name: c.name, aqi: Math.round(c.aqiSum / c.country) }))
      .sort((a, b) => b.aqi - a.aqi)
      .slice(0, 5)
      .map((c, i) => ({ ...c, rank: i + 1, flag: countryFlags[c.name] || "🌍" }))
  }, [cities])

  const maxAQI = countries[0]?.aqi || 200

  if (countries.length === 0) return null

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-slate-900 font-display font-semibold text-lg">Most Polluted</h3>
        <span className="text-xs text-slate-500">Top 5 Countries</span>
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
                  <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-mono text-slate-500 group-hover:bg-slate-200 transition-colors">
                    {country.rank}
                  </span>
                  <span className="text-slate-900 text-sm font-medium">{country.flag} {country.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-900 font-mono text-sm font-bold">{country.aqi}</span>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider">{band}</span>
                </div>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
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
