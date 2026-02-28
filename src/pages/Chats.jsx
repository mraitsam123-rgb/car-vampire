import { useEffect, useRef, useState } from "react"
import { io } from "socket.io-client"
import { useLocation, useNavigate, Link } from "react-router-dom"
import { useUser } from "../context/UserContext.jsx"
import { toast } from "react-hot-toast"

const API = import.meta.env.VITE_API_URL || ""

export default function Chats() {
  const { me } = useUser()
  const { search } = useLocation()
  const navigate = useNavigate()
  const listingId = new URLSearchParams(search).get("listingId")
  const token = localStorage.getItem("accessToken")
  
  const [chats, setChats] = useState([])
  const [chat, setChat] = useState(null)
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(true)
  const socketRef = useRef(null)
  const endRef = useRef(null)

  useEffect(() => {
    if (!token) return
    
    // Fetch all conversations
    fetch(`${API}/api/chats`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => {
        setChats(data)
        setLoading(false)
        
        // If listingId is in URL, find or start that chat
        if (listingId) {
          const existing = data.find(c => c.listingId?._id === listingId)
          if (existing) {
            setChat(existing)
          } else {
            // Start new chat logic would go here if needed
            // But usually the Chat button in ListingDetail would call /start first
          }
        }
      })
  }, [token, listingId])

  useEffect(() => {
    if (!token) return
    const socket = io(API, { auth: { token } })
    socketRef.current = socket

    if (chat?._id) {
      socket.emit("join", chat._id)
    }

    socket.on("message", (msg) => {
      if (chat && msg.chatId === chat._id) {
        setChat(prev => ({
          ...prev,
          messages: [...(prev.messages || []), msg]
        }))
      }
      // Update chats list last message
      setChats(prev => prev.map(c => 
        c._id === msg.chatId ? { ...c, updatedAt: new Date() } : c
      ).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)))
    })

    return () => socket.disconnect()
  }, [token, chat?._id])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [chat?.messages])

  const send = (e) => {
    e.preventDefault()
    if (!chat || !content.trim()) return
    
    socketRef.current.emit("message", { 
      chatId: chat._id, 
      text: content 
    })
    setContent("")
  }

  if (loading) return <div className="h-screen flex items-center justify-center font-black text-indigo-900">Loading Chats...</div>

  return (
    <div className="bg-gray-50 h-[calc(100vh-72px)] overflow-hidden">
      <div className="max-w-7xl mx-auto h-full flex flex-col md:flex-row shadow-lg">
        {/* Conversations List */}
        <aside className="w-full md:w-80 bg-white border-r flex flex-col h-1/3 md:h-full">
          <div className="p-4 border-b">
            <h2 className="text-xl font-black text-indigo-900 uppercase italic">Chats</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {chats.length === 0 ? (
              <div className="p-10 text-center text-gray-400 font-bold text-sm uppercase">No chats yet</div>
            ) : (
              chats.map(c => {
                const other = c.buyerId === me?._id ? c.sellerId : c.buyerId
                const isSelected = chat?._id === c._id
                return (
                  <button
                    key={c._id}
                    onClick={() => setChat(c)}
                    className={`w-full p-4 flex items-center gap-3 hover:bg-gray-50 border-b transition ${isSelected ? 'bg-indigo-50 border-l-4 border-l-indigo-900' : ''}`}
                  >
                    <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center font-black text-indigo-900 shrink-0 border-2 border-white shadow-sm">
                      {typeof other === 'object' ? other?.name?.[0] : 'U'}
                    </div>
                    <div className="text-left overflow-hidden">
                      <div className="font-black text-sm truncate uppercase">{typeof other === 'object' ? other?.name : 'User'}</div>
                      <div className="text-[10px] text-gray-500 truncate font-bold uppercase">{c.listingId?.title}</div>
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </aside>

        {/* Chat Window */}
        <main className="flex-1 bg-white flex flex-col h-2/3 md:h-full relative">
          {chat ? (
            <>
              {/* Chat Header */}
              <div className="p-3 border-b flex items-center justify-between bg-white sticky top-0 z-10 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center font-black text-indigo-900 border-2 border-white shadow-sm">
                    {(chat.buyerId === me?._id ? chat.sellerId : chat.buyerId)?.name?.[0] || 'U'}
                  </div>
                  <div>
                    <div className="font-black text-sm uppercase italic">{(chat.buyerId === me?._id ? chat.sellerId : chat.buyerId)?.name || 'User'}</div>
                    <Link to={`/listings/${chat.listingId?._id}`} className="text-[10px] text-indigo-600 hover:underline font-black uppercase tracking-tight">View: {chat.listingId?.title}</Link>
                  </div>
                </div>
                <Link to={`/listings?category=${chat.listingId?.category}`} className="text-[10px] bg-gray-100 px-3 py-1.5 rounded-full font-black hover:bg-gray-200 transition uppercase tracking-widest">
                  {chat.listingId?.category}
                </Link>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 flex flex-col">
                <div className="mt-auto"></div>
                {chat.messages?.map((m, i) => (
                  <div key={i} className={`flex ${m.senderId === me?._id ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm shadow-sm font-medium ${m.senderId === me?._id ? 'bg-indigo-900 text-white rounded-tr-none' : 'bg-white text-gray-800 rounded-tl-none'}`}>
                      {m.text}
                      <div className={`text-[8px] mt-1 text-right font-black uppercase ${m.senderId === me?._id ? 'text-indigo-200' : 'text-gray-400'}`}>
                        {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={endRef} />
              </div>

              {/* Input Area */}
              <form onSubmit={send} className="p-4 border-t bg-white shadow-lg">
                <div className="flex gap-2">
                  <input
                    required
                    className="flex-1 border-2 border-gray-100 rounded-full px-6 py-3 focus:border-indigo-900 focus:outline-none transition font-medium"
                    placeholder="Type your message here..."
                    value={content}
                    onChange={e => setContent(e.target.value)}
                  />
                  <button className="w-12 h-12 bg-indigo-900 text-white rounded-full flex items-center justify-center hover:bg-indigo-800 transition shadow-xl hover:scale-110 active:scale-95">
                    <span className="text-xl">✈️</span>
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-10 text-center bg-gray-50">
              <div className="text-9xl mb-6 animate-bounce">💬</div>
              <h3 className="text-2xl font-black text-indigo-900 uppercase italic">Your Messages</h3>
              <p className="max-w-xs mt-3 text-sm font-bold text-gray-500 uppercase tracking-tight">Select a conversation from the left to start chatting with buyers or sellers.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
