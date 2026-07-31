export const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080/api"

async function get(path) {
  const res = await fetch(`${API_BASE}${path}`)
  if (!res.ok) {
    throw new Error(`API ${res.status} for ${path}`)
  }
  return res.json()
}

export function getCities() {
  return get("/cities")
}

export function getSafetyGuides() {
  return get("/safety-guides")
}

export async function pingBackend() {
  try {
    const res = await fetch(`${API_BASE}/health`, { cache: "no-store" })
    return res.ok
  } catch {
    return false
  }
}

export function getPointAqi(lat, lng, name, country) {
  const params = new URLSearchParams({ lat: String(lat), lng: String(lng) })
  if (name) params.set("name", name)
  if (country) params.set("country", country)
  return get(`/aqi?${params.toString()}`)
}

export async function searchLocation(query) {
  const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}`)
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`API ${res.status} for /search`)
  return res.json()
}

export function getTrend(lat, lng) {
  return get(`/trend?lat=${lat}&lng=${lng}`)
}

export function getHistory(lat, lng, hours = 24) {
  return get(`/history?lat=${lat}&lng=${lng}&hours=${hours}`)
}

export async function getWeather(lat, lng) {
  const res = await fetch(`${API_BASE}/weather?lat=${lat}&lng=${lng}`)
  if (!res.ok) return null
  const text = await res.text()
  return text ? JSON.parse(text) : null
}

export function getPollutants(lat, lng) {
  return get(`/pollutants?lat=${lat}&lng=${lng}`)
}

export function getRecommendations({ aqi, lat, lng }) {
  const params = new URLSearchParams()
  if (aqi != null) params.set("aqi", String(aqi))
  if (lat != null) params.set("lat", String(lat))
  if (lng != null) params.set("lng", String(lng))
  return get(`/recommendations?${params.toString()}`)
}

export function getCountryRanking(limit = 5) {
  return get(`/countries/ranking?limit=${limit}`)
}

export function getStats() {
  return get("/stats")
}

export async function getPrediction(country, city) {
  const params = new URLSearchParams({ country })
  if (city) params.set("city", city)
  const res = await fetch(`${API_BASE}/predict?${params.toString()}`)
  if (!res.ok) throw new Error(`API ${res.status} for /predict`)
  return res.json()
}

function formatTimeLabel(t) {
  if (t == null) return ""
  const s = String(t)
  if (s.length >= 16 && (s.includes("T") || s.includes(" "))) return s.substring(11, 16)
  return s
}

export function normalizePredictionSeries(raw, country) {
  if (!raw) return []

  let arr = null
  if (Array.isArray(raw)) arr = raw
  else if (Array.isArray(raw.predictions)) arr = raw.predictions
  else if (Array.isArray(raw.forecast)) arr = raw.forecast
  else if (Array.isArray(raw.data)) arr = raw.data
  else if (raw && typeof raw === "object") {
    const key = Object.keys(raw).find(
      (k) => String(k).toLowerCase() === String(country || "").toLowerCase()
    )
    if (key && Array.isArray(raw[key])) arr = raw[key]
  }
  if (!Array.isArray(arr)) return []

  const countryOf = (it) => it.country ?? it.name ?? null
  const matched = country
    ? arr.filter((it) => {
        const c = countryOf(it)
        return c == null || String(c).toLowerCase() === String(country).toLowerCase()
      })
    : arr
  const src = matched.length ? matched : arr

  return src
    .map((it) => {
      const rawTime = it.time ?? it.hour ?? it.timestamp ?? it.datetime ?? it.date ?? ""
      const rawAqi = it.aqi ?? it.value ?? it.predicted_aqi ?? it.prediction ?? it.us_aqi
      return { time: formatTimeLabel(rawTime), aqi: Number(rawAqi) }
    })
    .filter((p) => Number.isFinite(p.aqi))
}
