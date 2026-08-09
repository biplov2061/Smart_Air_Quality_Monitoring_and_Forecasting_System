import { BrowserRouter, Routes, Route } from "react-router-dom"
import { AQIProvider } from "./context/AQIContext"
import Home from "./pages/Home"
import Dashboard from "./pages/Dashboard"
import Recommendation from "./pages/Recommendation"
import Prediction from "./pages/Prediction"
import ChatBot from "./components/chatbot/ChatBot"

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
        <ChatBot />
      </BrowserRouter>
    </AQIProvider>
  )
}

export default App
