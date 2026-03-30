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
import { UserProvider, useUser } from "./context/UserContext.jsx"
import ErrorBoundary from "./components/ErrorBoundary.jsx"

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

  useEffect(() => {
    if (!me) return
    const token = localStorage.getItem("accessToken")
    const socket = io(import.meta.env.VITE_API_URL || "", { auth: { token } })

    socket.on("notification", (data) => {
      setNotifications(prev => [data, ...prev])
      toast.success(`New Message: ${data.text}...`, {
        icon: '💬',
        duration: 4000,
        onClick: () => navigate(`/chats?listingId=${data.chatId}`)
      })
    })

    return () => socket.disconnect()
  }, [me, navigate])

  const handleLogout = () => {
    logout()
    navigate("/")
  }

  if (loading) return <div className="h-screen flex items-center justify-center font-bold text-indigo-900">Loading...</div>

  return (
    <div className="min-h-screen flex flex-col">
      <Toaster position="top-right" />
      <header className="sticky top-0 z-10 bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
          <Link to="/" className="text-2xl font-bold text-indigo-900 shrink-0 hidden md:block">OLX</Link>
          <div className="ml-auto flex items-center gap-6">
            {me && (
              <>
                <Link to="/chats" className="text-2xl hover:text-indigo-600 transition">💬</Link>
                <button className="text-2xl hover:text-indigo-600 transition relative">
                  🔔
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                      {notifications.length}
                    </span>
                  )}
                </button>
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
          <Route path="/profile/:id" element={<Profile />} />
        </Routes>
      </main>
      <footer className="bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 py-6 text-sm text-gray-500">© Car Garage</div>
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
