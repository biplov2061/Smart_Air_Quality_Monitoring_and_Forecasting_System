import { BrowserRouter, Routes, Route } from "react-router-dom"
import { AQIProvider } from "./context/AQIContext"
import Home from "./pages/Home"
import Dashboard from "./pages/Dashboard"
import Recommendation from "./pages/Recommendation"
import Prediction from "./pages/Prediction"

function App() {
  return (
    <AQIProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/recommendation" element={<Recommendation />} />
          <Route path="/prediction" element={<Prediction />} />
        </Routes>
      </BrowserRouter>
    </AQIProvider>
  )
}

export default App
