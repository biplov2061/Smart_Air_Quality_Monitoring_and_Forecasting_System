import { BrowserRouter, Routes, Route } from "react-router-dom"
import { AQIProvider } from "./context/AQIContext"
import Home from "./pages/Home"
import Dashboard from "./pages/Dashboard"
import HeatMapPage from "./pages/HeatMapPage"
import TrendsPage from "./pages/TrendsPage"
import SafetyGuide from "./pages/SafetyGuide"
import Prediction from "./pages/Prediction"

function App() {
  return (
    <AQIProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/heatmap" element={<HeatMapPage />} />
          <Route path="/trends" element={<TrendsPage />} />
          <Route path="/safety-guide" element={<SafetyGuide />} />
          <Route path="/prediction" element={<Prediction />} />
        </Routes>
      </BrowserRouter>
    </AQIProvider>
  )
}

export default App
