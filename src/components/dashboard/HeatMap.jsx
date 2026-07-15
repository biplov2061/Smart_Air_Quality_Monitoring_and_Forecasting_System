import { useMemo } from "react"
import { useAQI } from "../../context/useAQI"
import { getAQIColor } from "../../data/aqiService"

export default function HeatMap() {
  const { cities: allCities } = useAQI()

  const cityGrid = useMemo(() => {
    const valid = allCities.filter((c) => c.lat != null && c.lng != null && c.aqi != null)
    if (valid.length === 0) return []
    const lats = valid.map((c) => c.lat)
    const lngs = valid.map((c) => c.lng)
    const minLat = Math.min(...lats)
    const maxLat = Math.max(...lats)
    const minLng = Math.min(...lngs)
    const maxLng = Math.max(...lngs)
    const rows = 9
    const cols = 9

    const grid = Array.from({ length: rows * cols }, (_, i) => {
      const x = i % cols
      const y = Math.floor(i / rows)
      const cellLat = minLat + (y / (rows - 1)) * (maxLat - minLat)
      const cellLng = minLng + (x / (cols - 1)) * (maxLng - minLng)

      const distances = valid.map((c) => {
        const d = Math.sqrt((c.lat - cellLat) ** 2 + (c.lng - cellLng) ** 2)
        return { city: c, dist: d }
      })
      distances.sort((a, b) => a.dist - b.dist)
      const nearest = distances.slice(0, 3)
      const weighted =
        nearest.reduce((sum, n) => sum + n.city.aqi / (n.dist + 0.5), 0) /
        nearest.reduce((sum, n) => sum + 1 / (n.dist + 0.5), 0)

      return { x, y, value: Math.round(weighted), lat: cellLat, lng: cellLng }
    })
    return grid
  }, [allCities])

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-slate-900 dark:text-white font-display font-semibold">AQI Heat Map</h3>
        <span className="text-xs text-slate-400 dark:text-slate-500">Geographic distribution</span>
      </div>

      <div className="relative aspect-square w-full bg-gradient-to-br from-emerald-900/5 to-slate-900/10 dark:from-emerald-900/10 dark:to-slate-900/30 rounded-xl p-2">
        <div className="grid grid-cols-9 gap-0.5 w-full h-full">
          {cityGrid.map((cell, i) => (
            <div
              key={i}
              className="aspect-square rounded-[2px] transition-transform hover:scale-[1.3] hover:z-10 cursor-crosshair"
              style={{
                backgroundColor: getAQIColor(cell.value),
                opacity: 0.5 + (cell.value / 350) * 0.45,
              }}
              title={`AQI: ${cell.value}`}
            />
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 dark:text-slate-500">Low</span>
          <div className="flex gap-[1px]">
            {[0, 50, 100, 150, 200, 300].map((v) => (
              <div
                key={v}
                className="w-3 h-3"
                style={{ backgroundColor: getAQIColor(v + 1) }}
              />
            ))}
          </div>
          <span className="text-xs text-slate-400 dark:text-slate-500">High</span>
        </div>
        <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">{allCities.length} city sources</span>
      </div>
    </div>
  )
}
