import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { login } from "../lib/api.js"
import { toast } from "react-hot-toast"

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const r = await login(email, password)
      localStorage.setItem("accessToken", r.accessToken)
      toast.success(`Welcome back, ${r.user?.name || "User"}!`)
      window.location.href = "/" // Refresh to update App state
    } catch (err) {
      toast.error("Invalid email or password. Please try again.")
    } finally {
      setLoading(false)
    }
  }
  return (
    <div className="max-w-md mx-auto px-4 py-20">
      <div className="bg-white border-2 border-indigo-900 rounded-lg p-8 space-y-6 shadow-xl">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-6 group">
            <img src="/logos/Colorful QuickBuy logo design.png" className="w-12 h-12 group-hover:rotate-12 transition-transform duration-300" alt="QuickBuy Logo" />
            <span className="text-4xl font-black bg-gradient-to-r from-indigo-900 via-indigo-600 to-indigo-900 bg-clip-text text-transparent uppercase italic tracking-tighter">QuickBuy</span>
          </Link>
          <h1 className="text-2xl font-black text-indigo-900 mb-2 uppercase italic">Login</h1>
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Welcome back to QuickBuy Pakistan</p>
        </div>
        
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
            <input 
              required
              type="email"
              className="w-full border-2 border-gray-200 rounded px-4 py-3 focus:border-indigo-900 focus:outline-none transition" 
              placeholder="Enter your email" 
              value={email} 
              onChange={e=>setEmail(e.target.value)} 
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Password</label>
            <input 
              required
              type="password" 
              className="w-full border-2 border-gray-200 rounded px-4 py-3 focus:border-indigo-900 focus:outline-none transition" 
              placeholder="Enter your password" 
              value={password} 
              onChange={e=>setPassword(e.target.value)} 
            />
          </div>
          
          <button 
            disabled={loading}
            className="w-full px-4 py-3 bg-indigo-900 text-white rounded font-bold hover:bg-indigo-800 transition disabled:bg-gray-400"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        
        <div className="text-center text-sm">
          Don't have an account? <Link className="text-indigo-900 font-bold hover:underline" to="/signup">Signup</Link>
        </div>
      </div>
    </div>
  )
}
