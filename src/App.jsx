import { BrowserRouter, Routes, Route } from "react-router-dom"
import { AQIProvider } from "./context/AQIContext"
import Home from "./pages/Home"
import Dashboard from "./pages/Dashboard"

function App() {
  return (
    <AQIProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </BrowserRouter>
    </AQIProvider>
  )
}

export default App
