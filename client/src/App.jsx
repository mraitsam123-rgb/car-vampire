import { Toaster, toast } from "react-hot-toast"
import { useEffect, useState } from "react"
import { Routes, Route, Navigate, Link, useNavigate } from "react-router-dom"
import Home from "./pages/Home.jsx"
import Listings from "./pages/Listings.jsx"
import ListingDetail from "./pages/ListingDetail.jsx"
import PostAd from "./pages/PostAd.jsx"
import Login from "./pages/Login.jsx"
import Signup from "./pages/Signup.jsx"
import Forgot from "./pages/Forgot.jsx"
import Dashboard from "./pages/Dashboard.jsx"
import Chats from "./pages/Chats.jsx"
import Profile from "./pages/Profile.jsx"
import About from "./pages/About.jsx"
import Privacy from "./pages/Privacy.jsx"
import Terms from "./pages/Terms.jsx"
import Favorites from "./pages/Favorites.jsx"
import Notifications from "./pages/Notifications.jsx"
import Report from "./pages/Report.jsx"
import { UserProvider, useUser } from "./context/UserContext.jsx"
import ErrorBoundary from "./components/ErrorBoundary.jsx"
import NotificationDropdown from "./components/NotificationDropdown.jsx"
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from "./lib/api.js"

import { io } from "socket.io-client"

const Protected = ({ children }) => {
  const token = localStorage.getItem("accessToken")
  if (!token) return <Navigate to="/login" replace />
  return children
}

function AppContent() {
  const { me, logout, loading } = useUser()
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState([])
  const [showNotifs, setShowNotifs] = useState(false)

  useEffect(() => {
    if (!me) return
    
    // Initial fetch
    getNotifications().then(setNotifications)

    const token = localStorage.getItem("accessToken")
    const socket = io(import.meta.env.VITE_API_URL || "", { auth: { token } })

    socket.on("notification", (data) => {
      setNotifications(prev => [data, ...prev])
      toast.success(`New Message: ${data.text.slice(0, 30)}...`, {
        icon: '💬',
        duration: 4000,
        onClick: () => navigate(data.link || "/chats")
      })
    })

    return () => socket.disconnect()
  }, [me, navigate])

  const unreadCount = notifications?.filter(n => !n.isRead).length

  const handleMarkRead = async (id) => {
    await markNotificationAsRead(id)
    setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n))
  }

  const handleMarkAllRead = async () => {
    await markAllNotificationsAsRead()
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
  }

  const handleLogout = () => {
    logout()
    navigate("/")
  }

  if (loading) return <div className="h-screen flex items-center justify-center font-bold text-indigo-900">Loading...</div>

  return (
    <div className="min-h-screen flex flex-col">
      <Toaster position="top-right" />
      <header className="sticky top-0 z-50 bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 group">
            <img src="/logos/Colorful QuickBuy logo design.png" className="w-10 h-10 group-hover:rotate-12 transition-transform duration-300" alt="QuickBuy Logo" />
            <span className="text-3xl font-black bg-gradient-to-r from-indigo-900 via-indigo-600 to-indigo-900 bg-clip-text text-transparent uppercase italic tracking-tighter">QuickBuy</span>
          </Link>
          <div className="ml-auto flex items-center gap-6">
            {me && (
              <>
                <Link to="/favorites" className="text-2xl hover:text-red-500 transition" title="Favorites">❤️</Link>
                <Link to="/chats" className="text-2xl hover:text-indigo-600 transition" title="Messages">💬</Link>
                <div>
                  <button 
                    onClick={() => setShowNotifs(!showNotifs)}
                    className="text-2xl hover:text-indigo-600 transition relative z-[60]"
                  >
                    🔔
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-black animate-pulse">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                  {showNotifs && (
                    <>
                      <div className="fixed inset-0 z-[50]" onClick={() => setShowNotifs(false)}></div>
                      <div className="absolute right-0 mt-2 top-full z-[60]">
                        <NotificationDropdown 
                          notifications={notifications}
                          onMarkAsRead={handleMarkRead}
                          onMarkAllRead={handleMarkAllRead}
                          onClose={() => setShowNotifs(false)}
                        />
                      </div>
                    </>
                  )}
                </div>
              </>
            )}
            {!me && (
              <>
                <Link to="/login" className="font-bold border-b-2 border-indigo-900 hover:border-transparent transition text-indigo-900">Login</Link>
                <Link to="/signup" className="font-bold border-b-2 border-indigo-900 hover:border-transparent transition text-indigo-900">Sign Up</Link>
              </>
            )}
            <Link to="/post-ad" className="flex items-center gap-1 px-4 py-2 rounded-full border-4 border-t-yellow-400 border-l-blue-400 border-r-indigo-600 border-b-green-400 font-bold hover:bg-gray-50 transition">
              <span className="text-xl">+</span> SELL
            </Link>
            {me ? (
              <div className="flex items-center gap-3">
                <Link to={`/profile/${me.id || me._id}`} className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center font-bold text-indigo-900 border-2 border-indigo-900 overflow-hidden">
                  {me.avatar ? <img src={me.avatar} className="w-full h-full object-cover" /> : me.name?.[0]}
                </Link>
                <button onClick={handleLogout} className="text-sm font-bold text-red-600 hover:underline">Logout</button>
              </div>
            ) : null}
          </div>
        </div>
      </header>
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/listings" element={<Listings />} />
          <Route path="/listings/:id" element={<ListingDetail />} />
          <Route path="/cars/:city/:make/:model/:id" element={<ListingDetail />} />
          <Route path="/post-ad" element={<Protected><PostAd /></Protected>} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot" element={<Forgot />} />
          <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
          <Route path="/chats" element={<Protected><Chats /></Protected>} />
          <Route path="/chats/:chatId" element={<Protected><Chats /></Protected>} />
          <Route path="/profile/:id" element={<Profile />} />
          <Route path="/about" element={<About />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/favorites" element={<Protected><Favorites /></Protected>} />
          <Route path="/notifications" element={<Protected><Notifications /></Protected>} />
          <Route path="/report/:id" element={<Protected><Report /></Protected>} />
        </Routes>
      </main>
      <footer className="bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <Link to="/" className="flex items-center gap-2">
              <img src="/logos/Colorful QuickBuy logo design.png" className="w-8 h-8" alt="QuickBuy Logo" />
              <span className="text-xl font-black text-indigo-900 uppercase italic">QuickBuy</span>
            </Link>
            <div className="text-sm text-gray-500 font-bold uppercase tracking-widest">© 2026 QuickBuy Pakistan</div>
            <div className="flex gap-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">
              <Link to="/about" className="hover:text-indigo-600">About Us</Link>
              <Link to="/privacy" className="hover:text-indigo-600">Privacy</Link>
              <Link to="/terms" className="hover:text-indigo-600">Terms</Link>
              <Link to="/favorites" className="hover:text-red-500 transition">❤️ Favorites</Link>
              <Link to="/chats" className="hover:text-indigo-600 transition">💬 Messages</Link>
            </div>
          </div>
          <div className="mt-6 flex flex-col items-center gap-3">
            <div className="text-xs font-black text-gray-500 uppercase tracking-widest">Get the App</div>
            <div className="flex gap-4">
              <button
                onClick={() => toast.success("App coming soon")}
                className="hover:scale-105 transition"
                aria-label="Get it on App Store"
              >
                <img src="/logos/apple store.png" alt="App Store" className="h-10 w-auto" />
              </button>
              <button
                onClick={() => toast.success("App coming soon")}
                className="hover:scale-105 transition"
                aria-label="Get it on Google Play"
              >
                <img src="/logos/play store.png" alt="Google Play" className="h-10 w-auto" />
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <UserProvider>
        <AppContent />
      </UserProvider>
    </ErrorBoundary>
  )
}
