import { useState, useRef } from "react"
import chatIcon from "../../data/photos/chatbot.png"

const replies = [
  "Stay indoors if AQI is above 150.",
  "Wear an N95 mask when stepping out.",
  "Keep windows closed during high pollution.",
  "Use an air purifier indoors.",
  "Avoid outdoor exercise when AQI is unhealthy.",
  "Sensitive groups should limit prolonged exertion.",
  "Check the dashboard for real-time updates.",
  "Plan outdoor activities during lower AQI hours.",
]

export default function ChatBot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hi! Ask me anything about air quality." },
  ])
  const [input, setInput] = useState("")
  const endRef = useRef(null)

  function handleSend(e) {
    e.preventDefault()
    if (!input.trim()) return
    const userMsg = input.trim()
    setInput("")
    setMessages((prev) => [...prev, { from: "user", text: userMsg }])
    setTimeout(() => {
      const reply = replies[Math.floor(Math.random() * replies.length)]
      setMessages((prev) => [...prev, { from: "bot", text: reply }])
      endRef.current?.scrollIntoView({ behavior: "smooth" })
    }, 600)
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
                      ? "bg-sky-500 text-white rounded-br-md"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-bl-md"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={endRef} />
          </div>
          <form onSubmit={handleSend} className="border-t border-slate-200 dark:border-slate-700 p-3 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500/30"
            />
            <button
              type="submit"
              className="px-3 py-2 bg-sky-500 text-white rounded-xl text-sm font-medium hover:bg-sky-600 transition-colors"
            >
              Send
            </button>
          </form>
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        className="w-14 h-14 rounded-full bg-sky-500 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center"
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
