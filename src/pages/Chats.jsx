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
  const [selectedChat, setSelectedChat] = useState(null)
  const [messages, setMessages] = useState([])
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
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        const chatsData = Array.isArray(data) ? data : []
        setChats(chatsData)
        setLoading(false)
        
        // If listingId is in URL, find that chat
        if (listingId) {
          const existing = chatsData.find(c => c.listingId?._id === listingId)
          if (existing) {
            setSelectedChat(existing)
          }
        }
      })
      .catch(() => {
        setChats([])
        setLoading(false)
      })
  }, [token, listingId])

  // Fetch messages when a chat is selected
  useEffect(() => {
    if (selectedChat?._id) {
      fetch(`${API}/api/chats/${selectedChat._id}/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(r => r.ok ? r.json() : [])
        .then(data => setMessages(Array.isArray(data) ? data : []))
        .catch(() => setMessages([]))
    } else {
      setMessages([])
    }
  }, [selectedChat?._id, token])

  useEffect(() => {
    if (!token) return
    const socket = io(API, { auth: { token } })
    socketRef.current = socket

    socket.on("message", (msg) => {
      // If the message belongs to the currently selected chat, add it to messages
      if (selectedChat?._id === msg.chatId) {
        setMessages(prev => [...prev, msg])
      }
    })

    socket.on("chat_update", (data) => {
      // Update the chat list (inbox) with the new last message and timestamp
      setChats(prev => prev.map(c => {
        if (c._id === data.chatId) {
          return { ...c, lastMessage: data.lastMessage, updatedAt: data.updatedAt }
        }
        return c
      }).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)))
    })

    return () => socket.disconnect()
  }, [token, selectedChat?._id])

  useEffect(() => {
    if (selectedChat?._id && socketRef.current) {
      socketRef.current.emit("join", selectedChat._id)
    }
  }, [selectedChat?._id])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const send = (e) => {
    e.preventDefault()
    if (!selectedChat || !content.trim()) return
    
    socketRef.current.emit("message", { 
      chatId: selectedChat._id, 
      text: content 
    })
    setContent("")
  }

  if (loading) return <div className="h-screen flex items-center justify-center font-black text-indigo-900">Loading Chats...</div>

  return (
    <div className="bg-gray-50 h-[calc(100vh-72px)] overflow-hidden">
      <div className="max-w-7xl mx-auto h-full flex flex-col md:flex-row shadow-lg">
        {/* Conversations List (Inbox) */}
        <aside className="w-full md:w-80 bg-white border-r flex flex-col h-1/3 md:h-full">
          <div className="p-4 border-b">
            <h2 className="text-xl font-black text-indigo-900 uppercase italic">Inbox</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {chats.length === 0 ? (
              <div className="p-10 text-center text-gray-400 font-bold text-sm uppercase">No messages yet</div>
            ) : (
              chats.map(c => {
                const isBuyer = String(c.buyerId?._id || c.buyerId) === String(me?.id || me?._id)
                const other = isBuyer ? c.sellerId : c.buyerId
                const isSelected = selectedChat?._id === c._id
                return (
                  <button
                    key={c._id}
                    onClick={() => setSelectedChat(c)}
                    className={`w-full p-4 flex items-center gap-3 hover:bg-gray-50 border-b transition ${isSelected ? 'bg-indigo-50 border-l-4 border-l-indigo-900' : ''}`}
                  >
                    <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center font-black text-indigo-900 shrink-0 border-2 border-white shadow-sm overflow-hidden">
                      {other?.avatar ? <img src={other.avatar} className="w-full h-full object-cover" /> : other?.name?.[0]}
                    </div>
                    <div className="text-left overflow-hidden flex-1">
                      <div className="flex justify-between items-start">
                        <div className="font-black text-sm truncate uppercase">{other?.name || 'User'}</div>
                        <div className="text-[8px] font-bold text-gray-400 uppercase">{new Date(c.updatedAt || c.lastMessageAt || c.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}</div>
                      </div>
                      <div className="text-[10px] text-gray-500 truncate font-bold uppercase">{c.listingId?.title}</div>
                      <div className="text-[10px] text-indigo-900 truncate font-medium mt-1 italic">{c.lastMessage || 'No messages yet'}</div>
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </aside>

        {/* Chat Window */}
        <main className="flex-1 bg-white flex flex-col h-2/3 md:h-full relative">
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div className="p-3 border-b flex items-center justify-between bg-white sticky top-0 z-10 shadow-sm">
                <div className="flex items-center gap-3">
                  {(() => {
                    const isBuyer = String(selectedChat.buyerId?._id || selectedChat.buyerId) === String(me?.id || me?._id)
                    const other = isBuyer ? selectedChat.sellerId : selectedChat.buyerId
                    return (
                      <>
                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center font-black text-indigo-900 border-2 border-white shadow-sm overflow-hidden">
                          {other?.avatar ? <img src={other.avatar} className="w-full h-full object-cover" /> : other?.name?.[0]}
                        </div>
                        <div>
                          <div className="font-black text-sm uppercase italic">{other?.name || 'User'}</div>
                          <Link to={`/listings/${selectedChat.listingId?._id}`} className="text-[10px] text-indigo-600 hover:underline font-black uppercase tracking-tight">View: {selectedChat.listingId?.title}</Link>
                        </div>
                      </>
                    )
                  })()}
                </div>
                <Link to={`/listings?category=${selectedChat.listingId?.category}`} className="text-[10px] bg-gray-100 px-3 py-1.5 rounded-full font-black hover:bg-gray-200 transition uppercase tracking-widest">
                  {selectedChat.listingId?.category}
                </Link>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 flex flex-col">
                <div className="mt-auto"></div>
                {messages.map((m, i) => (
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
