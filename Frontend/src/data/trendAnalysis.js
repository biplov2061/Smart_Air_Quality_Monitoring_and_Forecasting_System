import { getAQIBand } from "./aqiService"

export function rollingMean(values, window = 3) {
  const w = Math.max(1, window)
  return values.map((_, i) => {
    const slice = values.slice(Math.max(0, i - w + 1), i + 1)
    return slice.reduce((s, v) => s + v, 0) / slice.length
  })
}

export function linearSlope(values) {
  const n = values.length
  if (n < 2) return 0
  const meanX = (n - 1) / 2
  const meanY = values.reduce((s, v) => s + v, 0) / n
  let num = 0
  let den = 0
  for (let i = 0; i < n; i++) {
    num += (i - meanX) * (values[i] - meanY)
    den += (i - meanX) ** 2
  }
  return den === 0 ? 0 : num / den
}

export function accuracy(predicted, observed) {
  const n = Math.min(predicted.length, observed.length)
  if (n === 0) return null
  let se = 0
  let ae = 0
  let ape = 0
  let apeCount = 0
  for (let i = 0; i < n; i++) {
    const err = predicted[i] - observed[i]
    se += err * err
    ae += Math.abs(err)
    if (observed[i] !== 0) {
      ape += Math.abs(err / observed[i])
      apeCount++
    }
  }
  return {
    mae: ae / n,
    rmse: Math.sqrt(se / n),
    mape: apeCount ? (ape / apeCount) * 100 : null,
    n,
  }
}

export function analyzeSeries(points, currentAqi = null) {
  const valid = (points || []).filter((p) => p && Number.isFinite(p.aqi))
  if (valid.length === 0) return null

  const values = valid.map((p) => p.aqi)
  const n = values.length
  const avg = Math.round(values.reduce((s, v) => s + v, 0) / n)

  let peak = valid[0]
  let trough = valid[0]
  for (const p of valid) {
    if (p.aqi > peak.aqi) peak = p
    if (p.aqi < trough.aqi) trough = p
  }

  const slope = linearSlope(values)
  const totalChange = values[n - 1] - values[0]
  const changePct = values[0] ? Math.round((totalChange / values[0]) * 100) : 0

  let direction = "stable"
  if (slope > 0.5) direction = "rising"
  else if (slope < -0.5) direction = "falling"

  const bandCounts = {}
  for (const v of values) {
    const b = getAQIBand(v)
    bandCounts[b] = (bandCounts[b] || 0) + 1
  }
  const dominantBand = Object.entries(bandCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null

  const rolling = rollingMean(values, Math.min(3, n))

  const cur = Number(currentAqi)
  const vsCurrent = Number.isFinite(cur) ? avg - cur : null

  return {
    count: n,
    avg,
    min: trough.aqi,
    max: peak.aqi,
    peak,
    trough,
    slope,
    direction,
    totalChange,
    changePct,
    bandCounts,
    dominantBand,
    rolling,
    vsCurrent,
  }
}

export const AQI_BAND_RANGES = [
  { from: 0, to: 50, color: "#00e400" },
  { from: 50, to: 100, color: "#ffff00" },
  { from: 100, to: 150, color: "#ff7e00" },
  { from: 150, to: 200, color: "#ff0000" },
  { from: 200, to: 300, color: "#8f3f97" },
  { from: 300, to: 500, color: "#7e0023" },
]

const WEEKDAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

export function withDayLabels(points, utcOffsetHours = 0) {
  const list = Array.isArray(points) ? points : []
  if (list.length === 0) return []

  const now = new Date()
  const hours = list.map((p) => {
    const h = parseInt(String(p.time), 10)
    return Number.isFinite(h) ? h : null
  })

  const localNow = new Date(now.getTime() + utcOffsetHours * 3600_000)
  const nowHour = localNow.getUTCHours()

  // The forecast is generated as the N hours *after* "now", so the first point
  // is the anchor. If its hour wrapped past local midnight (e.g. now 23:XX whose
  // next hour is 0:00), it belongs to the following day.
  const dates = new Array(list.length)
  dates[0] = new Date(Date.UTC(localNow.getUTCFullYear(), localNow.getUTCMonth(), localNow.getUTCDate()))
  if (hours[0] != null && hours[0] < nowHour) dates[0].setUTCDate(dates[0].getUTCDate() + 1)
  for (let i = 1; i < list.length; i++) {
    const d = new Date(dates[i - 1])
    if (hours[i] != null && hours[i - 1] != null && hours[i] < hours[i - 1]) d.setUTCDate(d.getUTCDate() + 1)
    dates[i] = d
  }

  return list.map((p, i) => ({ ...p, day: dates[i] ? WEEKDAYS_SHORT[dates[i].getUTCDay()] : "" }))
}
