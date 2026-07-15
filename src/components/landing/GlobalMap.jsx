import { useEffect, useMemo, useRef, useState } from "react"
import maplibregl from "maplibre-gl"
import { useAQI } from "../../context/useAQI"
import { getAQIColor } from "../../data/aqiService"
import "maplibre-gl/dist/maplibre-gl.css"

const DARK_TILES = "https://basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
const DARK_ATTR = '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>, <a href="https://carto.com/">CARTO</a>'

const LEGEND = [
  { max: 50, color: "#00e400", label: "Good" },
  { max: 100, color: "#ffff00", label: "Moderate" },
  { max: 150, color: "#ff7e00", label: "Sensitive" },
  { max: 200, color: "#ff0000", label: "Unhealthy" },
  { max: 300, color: "#8f3f97", label: "V.Unhealthy" },
  { max: 500, color: "#7e0023", label: "Hazardous" },
]

function citiesToGeoJSON(cities) {
  return {
    type: "FeatureCollection",
    features: cities.map((c) => ({
      type: "Feature",
      properties: {
        id: c.id,
        name: c.name,
        country: c.country,
        aqi: c.aqi,
        color: getAQIColor(c.aqi),
      },
      geometry: { type: "Point", coordinates: [c.lng, c.lat] },
    })),
  }
}

export default function GlobalMap({ searchQuery, onCitySelect }) {
  const { cities } = useAQI()
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const citiesRef = useRef([])
  const onSelectRef = useRef(onCitySelect)
  const [mapLoaded, setMapLoaded] = useState(false)

  useEffect(() => {
    onSelectRef.current = onCitySelect
  }, [onCitySelect])

  const filteredCities = useMemo(() => {
    if (!searchQuery) return cities
    const q = searchQuery.toLowerCase()
    return cities.filter(
      (c) =>
        c.name.toLowerCase().includes(q) || c.country.toLowerCase().includes(q)
    )
  }, [searchQuery, cities])

  const visibleCities = useMemo(() => filteredCities.filter((c) => c.aqi != null), [filteredCities])

  const topPolluted = useMemo(() => {
    return [...visibleCities].sort((a, b) => b.aqi - a.aqi).slice(0, 3)
  }, [visibleCities])

  useEffect(() => {
    if (mapRef.current || !containerRef.current) return

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: {
        version: 8,
        sources: {
          basemap: {
            type: "raster",
            tiles: [DARK_TILES],
            tileSize: 256,
            attribution: DARK_ATTR,
          },
        },
        layers: [
          { id: "basemap", type: "raster", source: "basemap", minzoom: 0, maxzoom: 22 },
        ],
      },
      center: [0, 20],
      zoom: 2,
      attributionControl: false,
    })

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "bottom-right")
    map.dragRotate.disable()

    map.on("load", () => {
      const geojson = citiesToGeoJSON(visibleCities)

      map.addSource("cities", { type: "geojson", data: geojson })

      map.addLayer({
        id: "cities-heat",
        type: "heatmap",
        source: "cities",
        paint: {
          "heatmap-radius": 60,
          "heatmap-opacity": 0.6,
          "heatmap-intensity": 0.8,
          "heatmap-weight": ["step", ["get", "aqi"], 0, 50, 0.3, 100, 0.6, 150, 0.8, 200, 1, 300, 1.2, 500, 1.5],
          "heatmap-color": [
            "interpolate",
            ["linear"],
            ["heatmap-density"],
            0, "rgba(0,0,0,0)",
            0.2, "rgba(0,228,100,0.1)",
            0.4, "rgba(255,255,0,0.15)",
            0.6, "rgba(255,126,0,0.2)",
            0.8, "rgba(255,0,0,0.3)",
            1, "rgba(143,63,151,0.4)",
          ],
        },
      })

      map.addLayer({
        id: "cities-glow",
        type: "circle",
        source: "cities",
        paint: {
          "circle-radius": ["step", ["get", "aqi"], 40, 50, 50, 100, 60, 150, 70, 200, 80, 300, 90, 500, 100],
          "circle-color": "#ffffff",
          "circle-opacity": 0.08,
          "circle-blur": 0.9,
        },
      })

      map.addLayer({
        id: "cities-dot-outer",
        type: "circle",
        source: "cities",
        paint: {
          "circle-radius": ["step", ["get", "aqi"], 12, 50, 14, 100, 18, 150, 22, 200, 28, 300, 34, 500, 40],
          "circle-color": ["get", "color"],
          "circle-opacity": 0.25,
          "circle-blur": 0.5,
        },
      })

      map.addLayer({
        id: "cities-dot",
        type: "circle",
        source: "cities",
        paint: {
          "circle-radius": ["step", ["get", "aqi"], 6, 50, 8, 100, 12, 150, 16, 200, 22, 300, 30, 500, 40],
          "circle-color": ["get", "color"],
          "circle-opacity": 0.95,
          "circle-stroke-color": "rgba(255,255,255,0.3)",
          "circle-stroke-width": 1.5,
        },
      })

      map.on("click", "cities-dot", (e) => {
        if (!e.features?.[0]) return
        const props = e.features[0].properties
        const city = citiesRef.current.find((c) => c.id === props.id)
        if (city) onSelectRef.current?.(city)
      })

      map.on("mouseenter", "cities-dot", () => {
        map.getCanvas().style.cursor = "pointer"
      })

      map.on("mouseleave", "cities-dot", () => {
        map.getCanvas().style.cursor = ""
      })

      setMapLoaded(true)
    })

    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
      setMapLoaded(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    citiesRef.current = visibleCities
    if (!mapRef.current || !mapLoaded) return
    const map = mapRef.current
    const source = map.getSource("cities")
    if (source) source.setData(citiesToGeoJSON(visibleCities))

    if (visibleCities.length === 1) {
      map.flyTo({ center: [visibleCities[0].lng, visibleCities[0].lat], zoom: 5, duration: 1000 })
    } else if (visibleCities.length > 1) {
      const bounds = visibleCities.reduce(
        (b, c) => b.extend([c.lng, c.lat]),
        new maplibregl.LngLatBounds([visibleCities[0].lng, visibleCities[0].lat], [visibleCities[0].lng, visibleCities[0].lat])
      )
      map.fitBounds(bounds, { padding: 50, maxZoom: 4, duration: 1000 })
    } else {
      map.flyTo({ center: [0, 20], zoom: 2, duration: 1000 })
    }
  }, [visibleCities, mapLoaded])

  return (
    <div className="relative w-full h-[520px] rounded-2xl overflow-hidden">
      <div ref={containerRef} className="w-full h-full" />

      <div className="absolute top-3 left-3 z-[1000] pointer-events-none bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 shadow-sm">
        <span className="text-xs text-slate-600 dark:text-slate-400 font-mono">
          {visibleCities.length} cities with data
        </span>
      </div>

      <div className="absolute bottom-3 left-3 right-3 z-[1000] flex items-end justify-between gap-2 pointer-events-none">
        <div className="flex gap-1 items-center bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 shadow-sm">
          {LEGEND.map((band) => (
            <div key={band.max} className="flex items-center gap-1" title={`${band.label} (0-${band.max})`}>
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: band.color }} />
            </div>
          ))}
          <span className="text-[10px] text-slate-600 dark:text-slate-400 ml-1 font-mono">AQI</span>
        </div>
        {topPolluted.length > 0 && (
          <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 shadow-sm">
            <div className="flex items-center gap-2.5">
              {topPolluted.map((city) => (
                <div key={city.id} className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: getAQIColor(city.aqi) }} />
                  <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300">{city.name}</span>
                  <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">{city.aqi}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
