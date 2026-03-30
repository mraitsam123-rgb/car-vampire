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
  const r = await fetch(`${API}/api/auth/me`, {
    headers: { ...authHeaders(token) }
  })
  if (!r.ok) throw new Error("auth_failed")
  return r.json()
}

export const updateMe = async (data) => {
  const token = localStorage.getItem("accessToken")
  const r = await fetch(`${API}/api/auth/me`, {
    method: "PUT",
    headers: { 
      "Content-Type": "application/json",
      ...authHeaders(token) 
    },
    body: JSON.stringify(data)
  })
  if (!r.ok) throw new Error("update_failed")
  return r.json()
}

export const toggleFavorite = async (listingId) => {
  const token = localStorage.getItem("accessToken")
  const r = await fetch(`${API}/api/auth/toggle-favorite`, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      ...authHeaders(token) 
    },
    body: JSON.stringify({ listingId })
  })
  if (!r.ok) throw new Error("fav_failed")
  return r.json()
}

export const fetchListings = async (params = {}) => {
  const qs = new URLSearchParams(params).toString()
  const r = await fetch(`${API}/api/listings?${qs}`)
  if (!r.ok) return { items: [], total: 0, page: 1, pages: 1 }
  return r.json()
}

export const getListing = async (id) => {
  const r = await fetch(`${API}/api/listings/${id}`)
  if (!r.ok) throw new Error("not_found")
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
