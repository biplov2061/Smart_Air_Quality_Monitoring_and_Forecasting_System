import { useState, useRef } from "react"
import chatIcon from "../../data/photos/chatbot.png"

const CHAT_API = import.meta.env.VITE_CHAT_API || "http://localhost:8000/api/v1/chat"

const fallbackReplies = [
  "Stay indoors if AQI is above 150.",
  "Wear an N95 mask when stepping out.",
  "Keep windows closed during high pollution.",
  "Use an air purifier indoors.",
  "Avoid outdoor exercise when AQI is unhealthy.",
  "Sensitive groups should limit prolonged exertion.",
  "Check the dashboard for real-time updates.",
  "Plan outdoor activities during lower AQI hours.",
]

async function getReply(message, history) {
  const res = await fetch(CHAT_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, history }),
  })
  if (!res.ok) {
    throw new Error(`Chat API ${res.status}`)
  }
  const data = await res.json()
  return data.reply
}

export default function ChatBot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hi! Ask me anything about air quality." },
  ])
  const [input, setInput] = useState("")
  const [typing, setTyping] = useState(false)
  const endRef = useRef(null)

  async function handleSend(e) {
    e.preventDefault()
    if (!input.trim() || typing) return
    const userMsg = input.trim()
    setInput("")
    setMessages((prev) => [...prev, { from: "user", text: userMsg }])
    setTyping(true)
    try {
      const history = messages
        .filter((m) => m.text && m.text !== userMsg)
        .map((m) => ({ role: m.from === "user" ? "user" : "model", text: m.text }))
        .slice(-10)
      const reply = await getReply(userMsg, history)
      setMessages((prev) => [...prev, { from: "bot", text: reply }])
    } catch {
      const reply = fallbackReplies[Math.floor(Math.random() * fallbackReplies.length)]
      setMessages((prev) => [...prev, { from: "bot", text: reply }])
    } finally {
      setTyping(false)
      endRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-[1600] flex flex-col items-end gap-3">
      {open && (
        <div className="w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700">
            <span className="text-sm font-semibold text-slate-900 dark:text-white">AQI Assistant</span>
            <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg leading-none">&times;</button>
          </div>
          <div className="flex-1 h-80 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                    msg.from === "user"
                      ? "bg-emerald-500 text-white rounded-br-md"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-bl-md"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex justify-start">
                <div className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-2xl rounded-bl-md px-4 py-2 text-sm">
                  Typing...
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>
          <form onSubmit={handleSend} className="border-t border-slate-200 dark:border-slate-700 p-3 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            />
            <button
              type="submit"
              disabled={typing}
              className="px-3 py-2 bg-emerald-500 text-white rounded-xl text-sm font-medium hover:bg-emerald-600 transition-colors disabled:opacity-50"
            >
              Send
            </button>
          </form>
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500 to-sky-500 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center"
        aria-label="Chat"
      >
        <img
          src={chatIcon}
          alt="Chat"
          className="w-8 h-8"
        />
      </button>
    </div>
  )
}
