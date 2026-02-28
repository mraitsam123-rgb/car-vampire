import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { register } from "../lib/api.js"

export default function Signup() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: "", email: "", password: "" })
  const [error, setError] = useState("")
  const onSubmit = async (e) => {
    e.preventDefault()
    setError("")
    try {
      const r = await register(form)
      localStorage.setItem("accessToken", r.accessToken)
      navigate("/")
    } catch {
      setError("Signup failed")
    }
  }
  return (
    <div className="max-w-md mx-auto px-4 py-10">
      <div className="bg-white border rounded p-6 space-y-4">
        <div className="text-xl font-semibold">Create account</div>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <form onSubmit={onSubmit} className="space-y-3">
          <input className="w-full border rounded px-3 py-2" placeholder="Name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} />
          <input className="w-full border rounded px-3 py-2" placeholder="Email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} />
          <input type="password" className="w-full border rounded px-3 py-2" placeholder="Password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} />
          <button className="w-full px-4 py-2 bg-indigo-600 text-white rounded">Sign up</button>
        </form>
        <div className="text-sm">
          Already have an account? <Link className="text-indigo-600" to="/login">Login</Link>
        </div>
      </div>
    </div>
  )
}
