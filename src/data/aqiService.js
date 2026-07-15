const BASE_URL = "https://air-quality-api.open-meteo.com/v1/air-quality"
const WEATHER_BASE_URL = "https://api.open-meteo.com/v1/forecast"
const BATCH_SIZE = 50

function aqiFromUS(value) {
  if (value == null || isNaN(value)) return null
  return Math.round(Math.max(0, Math.min(500, value)))
}

function getAQIColor(aqi) {
  if (aqi == null) return "#94a3b8"
  if (aqi <= 50) return "#00e400"
  if (aqi <= 100) return "#ffff00"
  if (aqi <= 150) return "#ff7e00"
  if (aqi <= 200) return "#ff0000"
  if (aqi <= 300) return "#8f3f97"
  return "#7e0023"
}

function getAQIBand(aqi) {
  if (aqi == null) return "No data"
  if (aqi <= 50) return "Good"
  if (aqi <= 100) return "Moderate"
  if (aqi <= 150) return "Unhealthy (Sensitive)"
  if (aqi <= 200) return "Unhealthy"
  if (aqi <= 300) return "Very Unhealthy"
  return "Hazardous"
}

async function fetchWithTimeout(url, timeoutMs = 10000) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const response = await fetch(url, { signal: controller.signal })
    return response
  } finally {
    clearTimeout(timeout)
  }
}

function cityResult(city, current) {
  const aqi = aqiFromUS(current?.us_aqi)
  return {
    id: city.id,
    name: city.name,
    country: city.country,
    lat: city.lat,
    lng: city.lng,
    aqi,
    pm25: current?.pm2_5 ?? null,
    pm10: current?.pm10 ?? null,
    ozone: current?.ozone ?? null,
    no2: current?.nitrogen_dioxide ?? null,
    so2: current?.sulphur_dioxide ?? null,
    co: current?.carbon_monoxide ?? null,
    updatedAt: current?.time ? new Date(current.time * 1000).toISOString() : null,
  }
}

function nullResult(city) {
  return {
    id: city.id,
    name: city.name,
    country: city.country,
    lat: city.lat,
    lng: city.lng,
    aqi: null,
    pm25: null, pm10: null, ozone: null, no2: null, so2: null, co: null,
    updatedAt: null,
  }
}

async function fetchBatch(cities) {
  const lats = cities.map((c) => c.lat.toFixed(4)).join(",")
  const lngs = cities.map((c) => c.lng.toFixed(4)).join(",")

  const params = new URLSearchParams({
    latitude: lats,
    longitude: lngs,
    current: "us_aqi,pm2_5,pm10,ozone,nitrogen_dioxide,sulphur_dioxide,carbon_monoxide",
    timeformat: "unixtime",
  })

  const url = `${BASE_URL}?${params}`

  const response = await fetchWithTimeout(url)
  if (!response.ok) {
    throw new Error(`Open-Meteo API error: ${response.status} for batch of ${cities.length}`)
  }

  return response.json()
}

function parseBatchResponse(raw, cities) {
  if (!raw || raw.error) throw new Error(raw?.reason || "API error")

  const results = []

  if (Array.isArray(raw)) {
    raw.forEach((entry, i) => {
      const city = cities[i]
      if (!city) return
      results.push(cityResult(city, entry.current))
    })
    for (let i = raw.length; i < cities.length; i++) {
      results.push(nullResult(cities[i]))
    }
  } else {
    results.push(cityResult(cities[0], raw.current))
  }

  return results
}

export async function fetchAllCities(cityList, onProgress) {
  const total = cityList.length

  const batches = []
  for (let i = 0; i < total; i += BATCH_SIZE) {
    batches.push(cityList.slice(i, i + BATCH_SIZE))
  }

  const results = await Promise.allSettled(
    batches.map(async (batch) => {
      const raw = await fetchBatch(batch)
      return parseBatchResponse(raw, batch)
    })
  )

  const allResults = []
  results.forEach((result, idx) => {
    if (result.status === "fulfilled") {
      allResults.push(...result.value)
    } else {
      for (const city of batches[idx]) {
        allResults.push(nullResult(city))
      }
    }
    if (onProgress) {
      onProgress((idx + 1) / batches.length)
    }
  })

  return allResults
}

export async function fetchCityForecast(lat, lng, days = 3) {
  const params = new URLSearchParams({
    latitude: lat.toFixed(4),
    longitude: lng.toFixed(4),
    hourly: "us_aqi,pm2_5,pm10,ozone,nitrogen_dioxide,sulphur_dioxide,carbon_monoxide",
    forecast_days: String(Math.max(1, Math.min(7, days))),
    timeformat: "unixtime",
  })
  const response = await fetch(`${BASE_URL}?${params}`)
  if (!response.ok) throw new Error(`Open-Meteo forecast API error: ${response.status}`)
  return response.json()
}

export async function fetchCityHistory(lat, lng, pastDays = 1) {
  const params = new URLSearchParams({
    latitude: lat.toFixed(4),
    longitude: lng.toFixed(4),
    hourly: "us_aqi,pm2_5,pm10,ozone,nitrogen_dioxide,sulphur_dioxide,carbon_monoxide",
    past_days: String(Math.max(0, Math.min(92, pastDays))),
    forecast_days: "0",
    timeformat: "unixtime",
  })
  const response = await fetch(`${BASE_URL}?${params}`)
  if (!response.ok) throw new Error(`Open-Meteo history API error: ${response.status}`)
  return response.json()
}

export async function fetchCityWeather(lat, lng) {
  const params = new URLSearchParams({
    latitude: lat.toFixed(4),
    longitude: lng.toFixed(4),
    current: "temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,pressure_msl",
    timeformat: "unixtime",
  })
  const response = await fetch(`${WEATHER_BASE_URL}?${params}`)
  if (!response.ok) throw new Error(`Open-Meteo weather API error: ${response.status}`)
  return response.json()
}

export function parseHourlyForecastToDaily(raw, days) {
  if (!raw?.hourly?.us_aqi?.length) return []
  const { time, us_aqi } = raw.hourly
  const dailyMap = new Map()
  for (let i = 0; i < time.length; i++) {
    const date = new Date(time[i] * 1000).toISOString().split("T")[0]
    const aqi = Math.round(us_aqi[i])
    if (aqi == null || isNaN(aqi)) continue
    if (!dailyMap.has(date) || aqi > dailyMap.get(date)) {
      dailyMap.set(date, aqi)
    }
  }
  return Array.from(dailyMap.entries()).slice(0, days).map(([date, aqi]) => ({
    date,
    aqi: Math.max(0, Math.min(500, aqi)),
  }))
}

export function parseHourlyTrend(raw) {
  if (!raw?.hourly?.us_aqi?.length) return []
  const { time, us_aqi } = raw.hourly
  return time.map((t, i) => ({
    time: new Date(t * 1000).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }),
    aqi: Math.round(us_aqi[i] ?? 0),
  }))
}

export function parseWeatherData(raw) {
  if (!raw?.current) return null
  return {
    temperature: raw.current.temperature_2m,
    humidity: raw.current.relative_humidity_2m,
    apparentTemperature: raw.current.apparent_temperature,
    precipitation: raw.current.precipitation,
    weatherCode: raw.current.weather_code,
    windSpeed: raw.current.wind_speed_10m,
    pressure: raw.current.pressure_msl,
  }
}

export function getWeatherDescription(code) {
  const map = {
    0: "Clear sky", 1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
    45: "Foggy", 48: "Depositing rime fog",
    51: "Light drizzle", 53: "Moderate drizzle", 55: "Dense drizzle",
    56: "Light freezing drizzle", 57: "Dense freezing drizzle",
    61: "Slight rain", 63: "Moderate rain", 65: "Heavy rain",
    66: "Light freezing rain", 67: "Heavy freezing rain",
    71: "Slight snow", 73: "Moderate snow", 75: "Heavy snow",
    77: "Snow grains",
    80: "Slight rain showers", 81: "Moderate rain showers", 82: "Violent rain showers",
    85: "Slight snow showers", 86: "Heavy snow showers",
    95: "Thunderstorm", 96: "Thunderstorm with slight hail", 99: "Thunderstorm with heavy hail",
  }
  return map[code] || "Unknown"
}

export { getAQIColor, getAQIBand }
