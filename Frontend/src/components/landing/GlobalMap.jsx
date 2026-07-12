import { useEffect, useMemo, useRef, useState } from "react"
import { MapContainer, TileLayer, CircleMarker, Popup, useMap, useMapEvents, AttributionControl } from "react-leaflet"
import L from "leaflet"
import { useAQI } from "../../context/useAQI"
import { getAQIColor, getAQIBand } from "../../data/aqiService"
import "leaflet/dist/leaflet.css"

function MapController({ searchQuery, filteredCities }) {
  const map = useMap()

  useEffect(() => {
    if (filteredCities.length === 1) {
      map.setView([filteredCities[0].lat, filteredCities[0].lng], 5, { animate: true })
    } else if (filteredCities.length > 1) {
      const bounds = filteredCities.map((c) => [c.lat, c.lng])
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 4, animate: true })
    } else {
      map.setView([20, 0], 2, { animate: true })
    }
  }, [searchQuery, filteredCities, map])

  return null
}

function ClickHandler({ onPick }) {
  useMapEvents({
    click(e) {
      const lat = Math.max(-90, Math.min(90, e.latlng.lat))
      const lng = ((e.latlng.lng + 180) % 360 + 360) % 360 - 180
      onPick?.(lat, lng)
    },
  })
  return null
}

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 }
}

function AQIPulseStyles() {
  useEffect(() => {
    const style = document.createElement("style")
    style.textContent = `
      @keyframes aqi-ring-pulse {
        0% { opacity: 0.6; r: var(--ring-min); }
        50% { opacity: 0.05; r: var(--ring-max); }
        100% { opacity: 0.6; r: var(--ring-min); }
      }
      @keyframes aqi-breathing {
        0%, 100% { opacity: 0.6; }
        50% { opacity: 1; }
      }
      @keyframes aqi-glow-pulse {
        0%, 100% { filter: drop-shadow(0 0 4px var(--glow-color)); }
        50% { filter: drop-shadow(0 0 12px var(--glow-color)); }
      }
      .aqi-label {
        animation: aqi-breathing 3s ease-in-out infinite;
      }
    `
    document.head.appendChild(style)
    return () => style.remove()
  }, [])
  return null
}

function RealisticHeatmap({ filteredCities }) {
  const map = useMap()
  const canvasRef = useRef(null)
  const animRef = useRef(null)

  useEffect(() => {
    const canvas = L.DomUtil.create("canvas", "")
    canvas.style.cssText =
      "position:absolute;top:0;left:0;pointer-events:none;z-index:400;mix-blend-mode:screen"
    canvasRef.current = canvas
    map.getPanes().overlayPane.appendChild(canvas)

    const scale = 2.5
    let time = 0

    const resize = () => {
      const size = map.getSize()
      canvas.width = Math.ceil(size.x / scale)
      canvas.height = Math.ceil(size.y / scale)
      canvas.style.width = size.x + "px"
      canvas.style.height = size.y + "px"
    }

    const draw = () => {
      const ctx = canvas.getContext("2d")
      const w = canvas.width
      const h = canvas.height
      ctx.clearRect(0, 0, w, h)

      filteredCities.forEach((city) => {
        const point = map.latLngToContainerPoint([city.lat, city.lng])
        const px = point.x / scale
        const py = point.y / scale

        const intensity = Math.min(1, city.aqi / 300)
        const baseRadius = Math.max(35, city.aqi * 0.7) / scale
        const pulseFactor = 1 + 0.2 * Math.sin(time + city.aqi * 0.01)
        const pulseRadius = baseRadius * pulseFactor
        const color = getAQIColor(city.aqi)
        const rgb = hexToRgb(color)

        const grad = ctx.createRadialGradient(px, py, 0, px, py, pulseRadius)
        const peakAlpha = 0.3 + intensity * 0.4
        grad.addColorStop(0, `rgba(${rgb.r},${rgb.g},${rgb.b},${peakAlpha})`)
        grad.addColorStop(0.25, `rgba(${rgb.r},${rgb.g},${rgb.b},${peakAlpha * 0.7})`)
        grad.addColorStop(0.5, `rgba(${rgb.r},${rgb.g},${rgb.b},${peakAlpha * 0.3})`)
        grad.addColorStop(0.8, `rgba(${rgb.r},${rgb.g},${rgb.b},${peakAlpha * 0.1})`)
        grad.addColorStop(1, `rgba(${rgb.r},${rgb.g},${rgb.b},0)`)

        ctx.fillStyle = grad
        ctx.beginPath()
        ctx.arc(px, py, pulseRadius, 0, Math.PI * 2)
        ctx.fill()

        if (city.aqi > 80) {
          const hazeGrad = ctx.createRadialGradient(px, py, 0, px, py, pulseRadius * 3)
          hazeGrad.addColorStop(0, `rgba(${rgb.r},${rgb.g},${rgb.b},0.05)`)
          hazeGrad.addColorStop(0.5, `rgba(${rgb.r},${rgb.g},${rgb.b},0.02)`)
          hazeGrad.addColorStop(1, `rgba(${rgb.r},${rgb.g},${rgb.b},0)`)
          ctx.fillStyle = hazeGrad
          ctx.beginPath()
          ctx.arc(px, py, pulseRadius * 3, 0, Math.PI * 2)
          ctx.fill()
        }
      })

      time += 0.025
      animRef.current = requestAnimationFrame(draw)
    }

    resize()
    map.on("moveend zoomend resize", resize)
    draw()

    return () => {
      map.off("moveend zoomend resize", resize)
      if (animRef.current) cancelAnimationFrame(animRef.current)
      canvas.remove()
    }
  }, [map, filteredCities])

  return null
}

function GlowLayer({ filteredCities }) {
  const map = useMap()

  useEffect(() => {
    const group = L.layerGroup()

    filteredCities.forEach((city) => {
      const color = getAQIColor(city.aqi)
      const intensity = Math.min(1, city.aqi / 300)
      const baseRadius = Math.max(15, city.aqi * 0.25)

      if (city.aqi > 60) {
        L.circleMarker([city.lat, city.lng], {
          radius: baseRadius * 4,
          color: color,
          fillColor: color,
          fillOpacity: 0.03 * intensity,
          weight: 1,
          opacity: 0.06 * intensity,
        }).addTo(group)
      }

      L.circleMarker([city.lat, city.lng], {
        radius: baseRadius * 2.5,
        color: color,
        fillColor: color,
        fillOpacity: 0.07 * intensity,
        weight: 0,
      }).addTo(group)

      L.circleMarker([city.lat, city.lng], {
        radius: baseRadius * 1.3,
        color: color,
        fillColor: color,
        fillOpacity: 0.15 * intensity,
        weight: 0,
      }).addTo(group)
    })

    group.addTo(map)
    return () => {
      map.removeLayer(group)
    }
  }, [filteredCities, map])

  return null
}

const AQI_COLORS = [
  { max: 50, color: "#00e400", label: "Good" },
  { max: 100, color: "#ffff00", label: "Moderate" },
  { max: 150, color: "#ff7e00", label: "Unhealthy (Sensitive)" },
  { max: 200, color: "#ff0000", label: "Unhealthy" },
  { max: 300, color: "#8f3f97", label: "Very Unhealthy" },
  { max: 500, color: "#7e0023", label: "Hazardous" },
]

export default function GlobalMap({ searchQuery, onPointSelect }) {
  const { cities } = useAQI()
  const [hoveredCity, setHoveredCity] = useState(null)

  const filteredCities = useMemo(() => {
    if (!searchQuery) return cities
    const q = searchQuery.toLowerCase()
    return cities.filter(
      (city) =>
        city.name.toLowerCase().includes(q) || city.country.toLowerCase().includes(q)
    )
  }, [searchQuery, cities])

  const topPolluted = useMemo(() => {
    return [...filteredCities].sort((a, b) => b.aqi - a.aqi).slice(0, 5)
  }, [filteredCities])

  return (
    <div className="relative w-full h-[520px] rounded-2xl overflow-hidden">
      <div
        className="absolute inset-0 rounded-2xl z-[1] pointer-events-none"
        style={{
          background: "linear-gradient(135deg, rgba(0,228,64,0.15) 0%, rgba(255,255,0,0.1) 25%, rgba(255,126,0,0.12) 50%, rgba(255,0,0,0.15) 75%, rgba(143,63,151,0.1) 100%)",
          mixBlendMode: "overlay",
        }}
      />
      <div
        className="absolute inset-0 rounded-2xl z-[1] pointer-events-none"
        style={{
          background: "linear-gradient(180deg, rgba(0,0,0,0.3) 0%, transparent 15%, transparent 85%, rgba(0,0,0,0.3) 100%)",
        }}
      />
      <div className="relative w-full h-full z-0">
        <AQIPulseStyles />
        <MapContainer
          center={[20, 0]}
          zoom={2}
          className="w-full h-full"
          zoomControl={false}
          scrollWheelZoom={true}
          attributionControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          {/* Minimal, required attribution (drops the "Leaflet" prefix). */}
          <AttributionControl position="bottomright" prefix={false} />
          <MapController searchQuery={searchQuery} filteredCities={filteredCities} />
          <ClickHandler onPick={(lat, lng) => onPointSelect?.({ lat, lng })} />
          <RealisticHeatmap filteredCities={filteredCities} />
          <GlowLayer filteredCities={filteredCities} />

          {filteredCities.map((city) => {
            const color = getAQIColor(city.aqi)
            const radius = Math.max(7, city.aqi * 0.1)
            const rgb = hexToRgb(color)
            const isTopPolluted = topPolluted.some((c) => c.name === city.name && c.country === city.country)
            return (
              <CircleMarker
                key={city.id}
                center={[city.lat, city.lng]}
                radius={radius}
                pathOptions={{
                  color: `rgba(${rgb.r},${rgb.g},${rgb.b},0.8)`,
                  fillColor: color,
                  fillOpacity: 0.95,
                  weight: isTopPolluted ? 3 : 2,
                  opacity: 0.9,
                }}
                eventHandlers={{
                  click: () =>
                    onPointSelect?.({
                      lat: city.lat,
                      lng: city.lng,
                      name: city.name,
                      country: city.country,
                      preview: city,
                    }),
                  mouseover: () => setHoveredCity(city.id),
                  mouseout: () => setHoveredCity(null),
                }}
              >
                <Popup>
                  <div className="text-center min-w-[140px] p-1">
                    <p className="font-semibold text-sm">{city.name}</p>
                    <p className="text-xs text-slate-500">{city.country}</p>
                    <div className="flex items-center justify-center gap-1.5 mt-2">
                      <span
                        className="w-3 h-3 rounded-full inline-block"
                        style={{ backgroundColor: color }}
                      />
                      <span className="font-bold font-mono text-lg">{city.aqi}</span>
                      <span className="text-xs text-slate-400">- {getAQIBand(city.aqi)}</span>
                    </div>
                  </div>
                </Popup>
              </CircleMarker>
            )
          })}
        </MapContainer>
      </div>

      <div className="absolute top-3 left-3 z-[1000] pointer-events-none bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
        <span className="text-xs text-slate-600 font-mono">
          {filteredCities.length} cities monitored
        </span>
      </div>

      <div className="absolute bottom-7 left-3 right-3 z-[1000] flex items-end justify-between gap-2 pointer-events-none">
        <div className="flex gap-1 items-center bg-white/90 backdrop-blur-sm px-2.5 py-1.5 rounded-lg border border-slate-200 shadow-sm">
          {AQI_COLORS.map((band) => (
            <div key={band.max} className="flex items-center gap-1" title={`${band.label} (0-${band.max})`}>
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: band.color }}
              />
            </div>
          ))}
          <span className="text-[10px] text-slate-600 ml-1 font-mono">AQI</span>
        </div>
        {topPolluted.length > 0 && (
          <div className="bg-white/90 backdrop-blur-sm px-2.5 py-1.5 rounded-lg border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2.5">
              {topPolluted.slice(0, 3).map((city) => (
                <div key={city.id} className="flex items-center gap-1.5">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: getAQIColor(city.aqi) }}
                  />
                  <span className="text-[11px] font-medium text-slate-700">{city.name}</span>
                  <span className="text-[11px] font-mono text-slate-500">{city.aqi}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
