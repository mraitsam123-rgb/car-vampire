import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { register } from "../lib/api.js"
import { toast } from "react-hot-toast"

export default function Signup() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: "", email: "", password: "" })
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const r = await register(form)
      localStorage.setItem("accessToken", r.accessToken)
      toast.success("Account created successfully!")
      window.location.href = "/" // Refresh to update App state
    } catch (err) {
      toast.error("Signup failed. Email might already be in use.")
    } finally {
      setLoading(false)
    }
  }
  return (
    <div className="max-w-md mx-auto px-4 py-20">
      <div className="bg-white border-2 border-indigo-900 rounded-lg p-8 space-y-6 shadow-xl">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-indigo-900 mb-2">Create Account</h1>
          <p className="text-gray-500">Join the OLX community</p>
        </div>
        
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Full Name</label>
            <input 
              required
              className="w-full border-2 border-gray-200 rounded px-4 py-3 focus:border-indigo-900 focus:outline-none transition" 
              placeholder="Enter your name" 
              value={form.name} 
              onChange={e=>setForm({...form,name:e.target.value})} 
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
            <input 
              required
              type="email"
              className="w-full border-2 border-gray-200 rounded px-4 py-3 focus:border-indigo-900 focus:outline-none transition" 
              placeholder="Enter your email" 
              value={form.email} 
              onChange={e=>setForm({...form,email:e.target.value})} 
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Password</label>
            <input 
              required
              type="password" 
              className="w-full border-2 border-gray-200 rounded px-4 py-3 focus:border-indigo-900 focus:outline-none transition" 
              placeholder="At least 6 characters" 
              value={form.password} 
              onChange={e=>setForm({...form,password:e.target.value})} 
            />
          </div>
          
          <button 
            disabled={loading}
            className="w-full px-4 py-3 bg-indigo-900 text-white rounded font-bold hover:bg-indigo-800 transition disabled:bg-gray-400"
          >
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>
        
        <div className="text-center text-sm">
          Already have an account? <Link className="text-indigo-900 font-bold hover:underline" to="/login">Login</Link>
        </div>
      </div>
    </div>
  )
}
