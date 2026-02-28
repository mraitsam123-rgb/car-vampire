import { Routes, Route, Navigate, Link, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { Toaster, toast } from "react-hot-toast"
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
import { getMe } from "./lib/api.js"

const Protected = ({ children }) => {
  const token = localStorage.getItem("accessToken")
  if (!token) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  const [me, setMe] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem("accessToken")
    if (!token) {
      setLoading(false)
      return
    }
    getMe(token)
      .then((r) => setMe(r.user))
      .catch(() => {
        localStorage.removeItem("accessToken")
        setMe(null)
      })
      .finally(() => setLoading(false))
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("accessToken")
    setMe(null)
    toast.success("Logged out successfully")
    navigate("/")
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Toaster position="top-right" />
      <header className="sticky top-0 z-10 bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
          <Link to="/" className="text-2xl font-bold text-indigo-900 shrink-0 hidden md:block">OLX</Link>
          <div className="ml-auto flex items-center gap-4">
            <Link to="/login" className="font-bold border-b-2 border-indigo-900 hover:border-transparent transition">Login</Link>
            <Link to="/post-ad" className="flex items-center gap-1 px-4 py-2 rounded-full border-4 border-t-yellow-400 border-l-blue-400 border-r-indigo-600 border-b-green-400 font-bold hover:bg-gray-50 transition">
              <span className="text-xl">+</span> SELL
            </Link>
            {me ? (
              <div className="flex items-center gap-3">
                <Link to="/dashboard" className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center font-bold text-indigo-900 border-2 border-indigo-900">
                  {me.avatar ? <img src={me.avatar} className="w-full h-full rounded-full object-cover" /> : me.name?.[0]}
                </Link>
                <button onClick={handleLogout} className="text-sm font-bold text-red-600 hover:underline">Logout</button>
              </div>
            ) : null}
          </div>
        </div>
      </header>
      {!loading && (
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
      )}
      <footer className="bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 py-6 text-sm text-gray-500">© Car Garage</div>
      </footer>
    </div>
  )
}
