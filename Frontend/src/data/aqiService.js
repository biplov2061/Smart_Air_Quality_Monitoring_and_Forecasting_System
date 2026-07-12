
export function getAQIColor(aqi) {
  if (aqi == null || isNaN(aqi)) return "#94a3b8" 
  if (aqi <= 50) return "#00e400"
  if (aqi <= 100) return "#ffff00"
  if (aqi <= 150) return "#ff7e00"
  if (aqi <= 200) return "#ff0000"
  if (aqi <= 300) return "#8f3f97"
  return "#7e0023"
}

export function getAQIBand(aqi) {
  if (aqi == null || isNaN(aqi)) return "No data"
  if (aqi <= 50) return "Good"
  if (aqi <= 100) return "Moderate"
  if (aqi <= 150) return "Unhealthy (Sensitive)"
  if (aqi <= 200) return "Unhealthy"
  if (aqi <= 300) return "Very Unhealthy"
  return "Hazardous"
}
