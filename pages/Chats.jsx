import { useEffect, useRef, useState } from "react"
import { io } from "socket.io-client"

export default function Chats() {
  const token = localStorage.getItem("accessToken")
  const [chatId, setChatId] = useState(null)
  const [messages, setMessages] = useState([])
  const socketRef = useRef(null)
  useEffect(() => {
    const socket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5000", { auth: { token } })
    socketRef.current = socket
    if (chatId) socket.emit("join", chatId)
    socket.on("message", (msg) => setMessages((m) => [...m, msg]))
    return () => { socket.disconnect() }
  }, [chatId])
  const [text, setText] = useState("")
  const send = () => {
    if (!chatId || !text.trim()) return
    socketRef.current.emit("message", { chatId, text })
    setText("")
  }
  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="bg-white border rounded h-[60vh] flex flex-col">
        <div className="p-3 border-b flex items-center gap-3">
          <input className="border rounded px-3 py-2 w-60" placeholder="Chat ID" value={chatId || ""} onChange={e=>setChatId(e.target.value)} />
        </div>
        <div className="flex-1 overflow-auto p-3 space-y-2">
          {messages.map(m => (<div key={m._id} className="text-sm">{m.text}</div>))}
        </div>
        <div className="p-3 border-t flex gap-2">
          <input className="flex-1 border rounded px-3 py-2" value={text} onChange={e=>setText(e.target.value)} />
          <button className="px-4 py-2 bg-indigo-600 text-white rounded" onClick={send}>Send</button>
        </div>
      </div>
    </div>
  )
}
