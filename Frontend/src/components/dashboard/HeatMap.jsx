

import { useMemo } from "react"
import { useAQI } from "../../context/useAQI"
import { getAQIColor } from "../../data/aqiService"


export default function HeatMap({ centerLat, centerLng, aqi, city }) {
  const { cities } = useAQI()

  const cityGrid = useMemo(() => {
    const valid = cities.filter((c) => c.lat != null && c.lng != null && c.aqi != null)
    if (valid.length === 0) return []

    const cLat = centerLat ?? 20
    const cLng = centerLng ?? 0
    const span = 18 
    const sources =
      aqi != null && centerLat != null && centerLng != null
        ? [...valid, { lat: cLat, lng: cLng, aqi }]
        : valid

    const rows = 9
    const cols = 9
    return Array.from({ length: rows * cols }, (_, i) => {
      const x = i % cols
      const y = Math.floor(i / cols)
      const cellLat = cLat + (1 - (2 * y) / (rows - 1)) * span 
      const cellLng = cLng + ((2 * x) / (cols - 1) - 1) * span

      const dists = sources.map((c) => ({
        c,
        d: Math.sqrt((c.lat - cellLat) ** 2 + (c.lng - cellLng) ** 2),
      }))
      dists.sort((a, b) => a.d - b.d)
      const near = dists.slice(0, 4)
      const value =
        near.reduce((s, n) => s + n.c.aqi / (n.d + 0.5), 0) /
        near.reduce((s, n) => s + 1 / (n.d + 0.5), 0)

      return { x, y, value: Math.round(value) }
    })
  }, [cities, centerLat, centerLng, aqi])

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-slate-900 font-display font-semibold">AQI Heat Map</h3>
        <span className="text-xs text-slate-400 truncate max-w-[45%]">{city || "Regional"}</span>
      </div>

      <div className="relative aspect-square w-full bg-gradient-to-br from-emerald-900/5 to-slate-900/10 rounded-xl p-2">
        <div className="grid grid-cols-9 gap-0.5 w-full h-full">
          {cityGrid.map((cell, i) => (
            <div
              key={i}
              className="aspect-square rounded-[2px] transition-all duration-500 hover:scale-[1.3] hover:z-10 cursor-crosshair"
              style={{
                backgroundColor: getAQIColor(cell.value),
                opacity: 0.5 + (cell.value / 350) * 0.45,
              }}
              title={`AQI ~${cell.value}`}
            />
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Low</span>
          <div className="flex gap-[1px]">
            {[0, 50, 100, 150, 200, 300].map((v) => (
              <div key={v} className="w-3 h-3" style={{ backgroundColor: getAQIColor(v + 1) }} />
            ))}
          </div>
          <span className="text-xs text-slate-400">High</span>
        </div>
        <span className="text-xs text-slate-400 font-mono">±18° region</span>
      </div>
    </div>
  )
}










// import { useMemo } from "react"
// import { useAQI } from "../../context/useAQI"
// import { getAQIColor } from "../../data/aqiService"

// import Map, { Marker } from "react-map-gl/maplibre"
// import "maplibre-gl/dist/maplibre-gl.css"

// export default function HeatMap({ centerLat, centerLng, aqi, city }) {
//   const { cities } = useAQI()

//   const cityGrid = useMemo(() => {
//     const valid = cities.filter(
//       (c) => c.lat != null && c.lng != null && c.aqi != null
//     )

//     if (valid.length === 0) return []

//     const cLat = centerLat ?? 20
//     const cLng = centerLng ?? 0
//     const span = 18

//     const sources =
//       aqi != null && centerLat != null && centerLng != null
//         ? [...valid, { lat: cLat, lng: cLng, aqi }]
//         : valid

//     const rows = 9
//     const cols = 9

//     return Array.from({ length: rows * cols }, (_, i) => {
//       const x = i % cols
//       const y = Math.floor(i / cols)

//       const cellLat = cLat + (1 - (2 * y) / (rows - 1)) * span
//       const cellLng = cLng + ((2 * x) / (cols - 1) - 1) * span

//       const dists = sources.map((c) => ({
//         c,
//         d: Math.sqrt((c.lat - cellLat) ** 2 + (c.lng - cellLng) ** 2),
//       }))

//       dists.sort((a, b) => a.d - b.d)

//       const near = dists.slice(0, 4)

//       const value =
//         near.reduce((s, n) => s + n.c.aqi / (n.d + 0.5), 0) /
//         near.reduce((s, n) => s + 1 / (n.d + 0.5), 0)

//       return {
//         x,
//         y,
//         lat: cellLat,
//         lng: cellLng,
//         value: Math.round(value),
//       }
//     })
//   }, [cities, centerLat, centerLng, aqi])

//   return (
//     <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
//       <div className="flex items-center justify-between mb-4">
//         <h3 className="text-slate-900 font-display font-semibold">
//           AQI Heat Map
//         </h3>

//         <span className="text-xs text-slate-400 truncate max-w-[45%]">
//           {city || "Regional"}
//         </span>
//       </div>

//       <div className="rounded-xl overflow-hidden">
//         <Map
//           initialViewState={{
//             longitude: centerLng ?? 0,
//             latitude: centerLat ?? 20,
//             zoom: 4.5,
//           }}
//           style={{
//             width: "100%",
//             height: 500,
//           }}
//           mapStyle="https://demotiles.maplibre.org/style.json"
//         >
//           {cityGrid.map((cell, i) => (
//             <Marker
//               key={i}
//               longitude={cell.lng}
//               latitude={cell.lat}
//               anchor="center"
//             >
//               <div
//                 title={`AQI ~${cell.value}`}
//                 style={{
//                   width: 28,
//                   height: 28,
//                   backgroundColor: getAQIColor(cell.value),
//                   opacity: 0.65 + (cell.value / 350) * 0.3,
//                   borderRadius: 4,
//                   border: "1px solid rgba(255,255,255,.35)",
//                   cursor: "crosshair",
//                   transition: "0.3s",
//                 }}
//               />
//             </Marker>
//           ))}
//         </Map>
//       </div>

//       <div className="flex items-center justify-between mt-3">
//         <div className="flex items-center gap-2">
//           <span className="text-xs text-slate-400">Low</span>

//           <div className="flex gap-[1px]">
//             {[0, 50, 100, 150, 200, 300].map((v) => (
//               <div
//                 key={v}
//                 className="w-3 h-3"
//                 style={{
//                   backgroundColor: getAQIColor(v + 1),
//                 }}
//               />
//             ))}
//           </div>

//           <span className="text-xs text-slate-400">High</span>
//         </div>

//         <span className="text-xs text-slate-400 font-mono">
//           ±18° region
//         </span>
//       </div>
//     </div>
//   )
// }