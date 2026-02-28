import { useEffect, useRef, useState } from "react"
import { io } from "socket.io-client"

export default function Chats() {
  const token = localStorage.getItem("accessToken")
  const [chatId, setChatId] = useState(null)
  const [messages, setMessages] = useState([])
  const socketRef = useRef(null)
  useEffect(() => {
    const socket = io(import.meta.env.VITE_SOCKET_URL || undefined, { auth: { token } })
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
    <div className="bg-gray-50 h-[calc(100-72px)] overflow-hidden">
      <div className="max-w-7xl mx-auto h-full flex flex-col md:flex-row shadow-lg">
        {/* Conversations List */}
        <aside className="w-full md:w-80 bg-white border-r flex flex-col h-1/3 md:h-full">
          <div className="p-4 border-b">
            <h2 className="text-xl font-bold text-indigo-900">Chats</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {chats.map(c => {
              const other = c.buyerId?._id === me?._id ? c.sellerId : c.buyerId
              return (
                <button
                  key={c._id}
                  onClick={() => navigate(`/chats?listingId=${c.listingId?._id}`)}
                  className={`w-full p-4 flex items-center gap-3 hover:bg-gray-50 border-b transition ${listingId === c.listingId?._id ? 'bg-indigo-50 border-l-4 border-l-indigo-900' : ''}`}
                >
                  <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center font-bold text-indigo-900 shrink-0">
                    {other?.name?.[0]}
                  </div>
                  <div className="text-left overflow-hidden">
                    <div className="font-bold text-sm truncate">{other?.name}</div>
                    <div className="text-xs text-gray-500 truncate">{c.listingId?.title}</div>
                  </div>
                </button>
              )
            })}
          </div>
        </aside>

        {/* Chat Window */}
        <main className="flex-1 bg-white flex flex-col h-2/3 md:h-full relative">
          {chat ? (
            <>
              {/* Chat Header */}
              <div className="p-3 border-b flex items-center justify-between bg-white sticky top-0 z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center font-bold text-indigo-900">
                    {(chat.buyerId?._id === me?._id ? chat.sellerId : chat.buyerId)?.name?.[0]}
                  </div>
                  <div>
                    <div className="font-bold text-sm">{(chat.buyerId?._id === me?._id ? chat.sellerId : chat.buyerId)?.name}</div>
                    <Link to={`/listings/${chat.listingId?._id}`} className="text-[10px] text-indigo-600 hover:underline font-bold uppercase">View: {chat.listingId?.title}</Link>
                  </div>
                </div>
                <Link to={`/listings?category=${chat.listingId?.category}`} className="text-[10px] bg-gray-100 px-2 py-1 rounded font-bold hover:bg-gray-200">
                  BACK TO {chat.listingId?.category?.toUpperCase()}
                </Link>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#e5ddd5] flex flex-col">
                <div className="mt-auto"></div>
                {chat.messages.map((m, i) => (
                  <div key={i} className={`flex ${m.senderId === me?._id ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] px-4 py-2 rounded-lg text-sm shadow-sm ${m.senderId === me?._id ? 'bg-indigo-900 text-white rounded-tr-none' : 'bg-white text-gray-800 rounded-tl-none'}`}>
                      {m.content}
                      <div className={`text-[9px] mt-1 text-right ${m.senderId === me?._id ? 'text-indigo-200' : 'text-gray-400'}`}>
                        {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={endRef} />
              </div>

              {/* Input Area */}
              <form onSubmit={send} className="p-4 border-t bg-white">
                <div className="flex gap-2">
                  <input
                    required
                    className="flex-1 border-2 border-gray-100 rounded-full px-4 py-2 focus:border-indigo-900 focus:outline-none transition"
                    placeholder="Type a message..."
                    value={content}
                    onChange={e => setContent(e.target.value)}
                  />
                  <button className="w-12 h-12 bg-indigo-900 text-white rounded-full flex items-center justify-center hover:bg-indigo-800 transition shadow-lg">
                    ✈️
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-10 text-center">
              <div className="text-8xl mb-4">💬</div>
              <h3 className="text-xl font-bold text-gray-600">Your Messages</h3>
              <p className="max-w-xs mt-2 text-sm">Select a conversation from the left to start chatting with buyers or sellers.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
