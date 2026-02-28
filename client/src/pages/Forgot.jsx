import { Link } from "react-router-dom"

export default function Forgot() {
  return (
    <div className="max-w-md mx-auto px-4 py-10">
      <div className="bg-white border rounded p-6 space-y-4">
        <div className="text-xl font-semibold">Forgot password</div>
        <input className="w-full border rounded px-3 py-2" placeholder="Email" />
        <button className="w-full px-4 py-2 bg-indigo-600 text-white rounded">Send email</button>
        <div className="text-sm"><Link className="text-indigo-600" to="/login">Back to login</Link></div>
      </div>
    </div>
  )
}
