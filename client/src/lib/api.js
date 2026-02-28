const API = import.meta.env.VITE_API_URL || ""

export const authHeaders = (token) => ({ Authorization: `Bearer ${token}` })

export const login = async (email, password) => {
  const r = await fetch(`${API}/api/auth/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) })
  if (!r.ok) throw new Error("login_failed")
  return r.json()
}

export const register = async (payload) => {
  const r = await fetch(`${API}/api/auth/register`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
  if (!r.ok) throw new Error("register_failed")
  return r.json()
}

export const getMe = async (token) => {
  const r = await fetch(`${API}/api/auth/me`, { headers: { ...authHeaders(token) } })
  if (!r.ok) throw new Error("unauthorized")
  return r.json()
}

export const fetchListings = async (params = {}) => {
  const qs = new URLSearchParams(params).toString()
  const r = await fetch(`${API}/api/listings?${qs}`)
  return r.json()
}

export const fetchListing = async (id) => {
  const r = await fetch(`${API}/api/listings/${id}`)
  return r.json()
}

export const createListing = async (token, payload) => {
  const r = await fetch(`${API}/api/listings`, { method: "POST", headers: { "Content-Type": "application/json", ...authHeaders(token) }, body: JSON.stringify(payload) })
  if (!r.ok) throw new Error("create_failed")
  return r.json()
}

export const uploadImages = async (token, files) => {
  const fd = new FormData()
  Array.from(files).forEach(f => fd.append("images", f))
  const r = await fetch(`${API}/api/listings/upload`, { method: "POST", headers: { ...authHeaders(token) }, body: fd })
  if (!r.ok) throw new Error("upload_failed")
  return r.json()
}

export const toggleFavorite = async (token, listingId) => {
  const r = await fetch(`${API}/api/favorites/${listingId}`, { method: "POST", headers: { ...authHeaders(token) } })
  return r.json()
}

export const getFavorites = async (token) => {
  const r = await fetch(`${API}/api/favorites`, { headers: { ...authHeaders(token) } })
  return r.json()
}
