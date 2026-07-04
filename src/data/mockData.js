export const countries = [
  { rank: 1, name: "India", aqi: 178, color: "red", flag: "🇮🇳" },
  { rank: 2, name: "Bangladesh", aqi: 162, color: "red", flag: "🇧🇩" },
  { rank: 3, name: "Pakistan", aqi: 153, color: "orange", flag: "🇵🇰" },
  { rank: 4, name: "Mongolia", aqi: 139, color: "orange", flag: "🇲🇳" },
  { rank: 5, name: "Afghanistan", aqi: 128, color: "orange", flag: "🇦🇫" },
]

export const globalStats = {
  citiesMonitored: 1250,
  countriesCovered: 87,
  avgAQI: 68,
  updatedAt: "2 min ago",
}

export const cities = [
  { id: 1, name: "Delhi", country: "India", aqi: 215, lat: 28.6, lng: 77.2 },
  { id: 2, name: "Mumbai", country: "India", aqi: 145, lat: 19.1, lng: 72.9 },
  { id: 3, name: "Dhaka", country: "Bangladesh", aqi: 198, lat: 23.8, lng: 90.4 },
  { id: 4, name: "Lahore", country: "Pakistan", aqi: 178, lat: 31.5, lng: 74.3 },
  { id: 5, name: "Beijing", country: "China", aqi: 95, lat: 39.9, lng: 116.4 },
  { id: 6, name: "Shanghai", country: "China", aqi: 82, lat: 31.2, lng: 121.5 },
  { id: 7, name: "Tokyo", country: "Japan", aqi: 42, lat: 35.7, lng: 139.7 },
  { id: 8, name: "Seoul", country: "South Korea", aqi: 55, lat: 37.6, lng: 127.0 },
  { id: 9, name: "Bangkok", country: "Thailand", aqi: 68, lat: 13.8, lng: 100.5 },
  { id: 10, name: "Jakarta", country: "Indonesia", aqi: 112, lat: -6.2, lng: 106.8 },
  { id: 11, name: "London", country: "UK", aqi: 38, lat: 51.5, lng: -0.1 },
  { id: 12, name: "Paris", country: "France", aqi: 45, lat: 48.9, lng: 2.3 },
  { id: 13, name: "Berlin", country: "Germany", aqi: 35, lat: 52.5, lng: 13.4 },
  { id: 14, name: "Moscow", country: "Russia", aqi: 52, lat: 55.8, lng: 37.6 },
  { id: 15, name: "New York", country: "USA", aqi: 32, lat: 40.7, lng: -74.0 },
  { id: 16, name: "Los Angeles", country: "USA", aqi: 48, lat: 34.1, lng: -118.2 },
  { id: 17, name: "Cairo", country: "Egypt", aqi: 132, lat: 30.0, lng: 31.2 },
  { id: 18, name: "Lagos", country: "Nigeria", aqi: 118, lat: 6.5, lng: 3.4 },
  { id: 19, name: "Nairobi", country: "Kenya", aqi: 62, lat: -1.3, lng: 36.8 },
  { id: 20, name: "Santiago", country: "Chile", aqi: 72, lat: -33.5, lng: -70.7 },
]

export function getAQIColor(aqi) {
  if (aqi <= 50) return "#00e400"
  if (aqi <= 100) return "#ffff00"
  if (aqi <= 150) return "#ff7e00"
  if (aqi <= 200) return "#ff0000"
  if (aqi <= 300) return "#8f3f97"
  return "#7e0023"
}

export function getAQIBand(aqi) {
  if (aqi <= 50) return "Good"
  if (aqi <= 100) return "Moderate"
  if (aqi <= 150) return "Unhealthy (Sensitive)"
  if (aqi <= 200) return "Unhealthy"
  if (aqi <= 300) return "Very Unhealthy"
  return "Hazardous"
}

export const pollutants = [
  { name: "PM2.5", value: 85, unit: "µg/m³", status: "Unhealthy", color: "red" },
  { name: "PM10", value: 120, unit: "µg/m³", status: "Unhealthy", color: "red" },
  { name: "O₃", value: 45, unit: "ppb", status: "Moderate", color: "yellow" },
  { name: "NO₂", value: 38, unit: "ppb", status: "Moderate", color: "yellow" },
  { name: "SO₂", value: 12, unit: "ppb", status: "Good", color: "green" },
  { name: "CO", value: 0.8, unit: "ppm", status: "Good", color: "green" },
]

export const trendData = [
  { time: "00:00", aqi: 142 },
  { time: "02:00", aqi: 138 },
  { time: "04:00", aqi: 135 },
  { time: "06:00", aqi: 148 },
  { time: "08:00", aqi: 165 },
  { time: "10:00", aqi: 178 },
  { time: "12:00", aqi: 182 },
  { time: "14:00", aqi: 175 },
  { time: "16:00", aqi: 168 },
  { time: "18:00", aqi: 158 },
  { time: "20:00", aqi: 152 },
  { time: "22:00", aqi: 145 },
]

export const heatMapData = Array.from({ length: 81 }, (_, i) => ({
  x: i % 9,
  y: Math.floor(i / 9),
  value: Math.floor(Math.random() * 300) + 20,
}))

export const recommendations = [
  {
    severity: "high",
    icon: "😷",
    title: "Wear N95 Mask",
    desc: "Avoid prolonged outdoor exposure. Use N95 or better filtration masks when stepping out.",
  },
  {
    severity: "high",
    icon: "🏠",
    title: "Stay Indoors",
    desc: "Keep windows and doors closed. Use air purifiers with HEPA filters if available.",
  },
  {
    severity: "medium",
    icon: "💧",
    title: "Stay Hydrated",
    desc: "Drink plenty of water to help your body flush out toxins and inhaled pollutants.",
  },
  {
    severity: "medium",
    icon: "🌿",
    title: "Indoor Plants",
    desc: "Place air-purifying plants like snake plants, pothos, or peace lilies indoors.",
  },
  {
    severity: "low",
    icon: "🚗",
    title: "Reduce Car Use",
    desc: "Opt for public transport or carpooling to help reduce overall emissions.",
  },
  {
    severity: "low",
    icon: "♻️",
    title: "Monitor Daily",
    desc: "Check AQI daily before planning outdoor activities, especially for children and elderly.",
  },
]

export const dashboardCities = [
  { name: "Delhi, India", aqi: 182 },
  { name: "Mumbai, India", aqi: 145 },
  { name: "Bangalore, India", aqi: 78 },
  { name: "Chennai, India", aqi: 62 },
  { name: "Kolkata, India", aqi: 156 },
]
