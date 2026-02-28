import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { login } from "../lib/api.js"

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const onSubmit = async (e) => {
    e.preventDefault()
    setError("")
    try {
      const r = await login(email, password)
      localStorage.setItem("accessToken", r.accessToken)
      navigate("/")
    } catch {
      setError("Invalid email or password")
    }
  }
  return (
    <div className="max-w-md mx-auto px-4 py-10">
      <div className="bg-white border rounded p-6 space-y-4">
        <div className="text-xl font-semibold">Login</div>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <form onSubmit={onSubmit} className="space-y-3">
          <input className="w-full border rounded px-3 py-2" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
          <input type="password" className="w-full border rounded px-3 py-2" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
          <button className="w-full px-4 py-2 bg-indigo-600 text-white rounded">Login</button>
        </form>
        <div className="text-sm">
          No account? <Link className="text-indigo-600" to="/signup">Create one</Link>
        </div>
      </div>
    </div>
  )
}
