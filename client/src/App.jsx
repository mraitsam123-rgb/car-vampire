import { Routes, Route, Navigate, Link, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
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
      .finally(() => setLoading(false))
  }, [])
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-10 bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
          <Link to="/" className="text-xl font-bold">Car Garage</Link>
          <div className="ml-auto flex items-center gap-3">
            <Link className="px-3 py-2 bg-indigo-600 text-white rounded" to="/post-ad">Post an Ad</Link>
            {me ? (
              <>
                <Link to="/dashboard" className="px-3 py-2 border rounded">Dashboard</Link>
                <button className="px-3 py-2 border rounded" onClick={() => {localStorage.removeItem("accessToken"); navigate(0)}}>Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="px-3 py-2 border rounded">Login</Link>
                <Link to="/signup" className="px-3 py-2 border rounded">Signup</Link>
              </>
            )}
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
