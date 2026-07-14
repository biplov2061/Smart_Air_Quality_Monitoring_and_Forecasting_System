const BASE_URL = "https://air-quality-api.open-meteo.com/v1/air-quality"
const BATCH_SIZE = 100

function generateId() {
  return Math.random().toString(36).substring(2, 9)
}

function aqiFromUS(value) {
  if (value == null || isNaN(value)) return null
  return Math.round(Math.max(0, Math.min(500, value)))
}

function getAQIColor(aqi) {
  if (aqi <= 50) return "#00e400"
  if (aqi <= 100) return "#ffff00"
  if (aqi <= 150) return "#ff7e00"
  if (aqi <= 200) return "#ff0000"
  if (aqi <= 300) return "#8f3f97"
  return "#7e0023"
}

function getAQIBand(aqi) {
  if (aqi <= 50) return "Good"
  if (aqi <= 100) return "Moderate"
  if (aqi <= 150) return "Unhealthy (Sensitive)"
  if (aqi <= 200) return "Unhealthy"
  if (aqi <= 300) return "Very Unhealthy"
  return "Hazardous"
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

  const response = await fetch(`${BASE_URL}?${params}`)
  if (!response.ok) {
    throw new Error(`Open-Meteo API error: ${response.status}`)
  }

  const data = await response.json()
  return data
}

function parseBatchResponse(raw, cities) {
  if (!raw || raw.error) throw new Error(raw?.reason || "API error")

  const results = []

  if (Array.isArray(raw)) {
    raw.forEach((entry, i) => {
      const city = cities[i]
      if (!city) return
      const current = entry.current
      results.push({
        id: generateId(),
        name: city.name,
        country: city.country,
        lat: city.lat,
        lng: city.lng,
        aqi: aqiFromUS(current?.us_aqi),
        pm25: current?.pm2_5,
        pm10: current?.pm10,
        ozone: current?.ozone,
        no2: current?.nitrogen_dioxide,
        so2: current?.sulphur_dioxide,
        co: current?.carbon_monoxide,
        updatedAt: current?.time ? new Date(current.time * 1000).toISOString() : null,
      })
    })
  } else {
    const current = raw.current
    results.push({
      id: generateId(),
      name: cities[0]?.name || "Unknown",
      country: cities[0]?.country || "",
      lat: cities[0]?.lat || 0,
      lng: cities[0]?.lng || 0,
      aqi: aqiFromUS(current?.us_aqi),
      pm25: current?.pm2_5,
      pm10: current?.pm10,
      ozone: current?.ozone,
      no2: current?.nitrogen_dioxide,
      so2: current?.sulphur_dioxide,
      co: current?.carbon_monoxide,
      updatedAt: current?.time ? new Date(current.time * 1000).toISOString() : null,
    })
  }

  return results
}

export async function fetchAllCities(cityList, onProgress) {
  const allResults = []
  const total = cityList.length

  for (let i = 0; i < total; i += BATCH_SIZE) {
    const batch = cityList.slice(i, i + BATCH_SIZE)
    try {
      const raw = await fetchBatch(batch)
      const parsed = parseBatchResponse(raw, batch)
      allResults.push(...parsed)
    } catch (err) {
      console.warn(`Batch ${i / BATCH_SIZE + 1} failed:`, err.message)
      for (const city of batch) {
        allResults.push({
          id: generateId(),
          name: city.name,
          country: city.country,
          lat: city.lat,
          lng: city.lng,
          aqi: null,
          pm25: null,
          pm10: null,
          updatedAt: null,
        })
      }
    }

    if (onProgress) {
      onProgress(Math.min((i + BATCH_SIZE) / total, 1))
    }
  }

  return allResults
}

export { getAQIColor, getAQIBand }
