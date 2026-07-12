import { createContext, useContext } from "react"

export const AQIContext = createContext(null)

export function useAQI() {
  const ctx = useContext(AQIContext)
  if (!ctx) throw new Error("useAQI must be used within AQIProvider")
  return ctx
}
