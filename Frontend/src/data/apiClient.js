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

// Current weather for a location. Returns null if unavailable (empty body).
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
