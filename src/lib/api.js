const API = import.meta.env.VITE_API_URL || ""

export const authHeaders = (token) => ({ Authorization: `Bearer ${token}` })

const request = async (url, options = {}) => {
  const r = await fetch(url, options)
  
  if (r.status === 401) {
    localStorage.removeItem("accessToken")
    window.location.href = "/login"
    throw new Error("unauthorized")
  }
  
  if (!r.ok) {
    const errorData = await r.json().catch(() => ({}))
    throw new Error(errorData.error || "request_failed")
  }
  
  return r.json()
}

export const login = async (email, password) => {
  return request(`${API}/api/auth/login`, { 
    method: "POST", 
    headers: { "Content-Type": "application/json" }, 
    body: JSON.stringify({ email, password }) 
  })
}

export const register = async (payload) => {
  return request(`${API}/api/auth/register`, { 
    method: "POST", 
    headers: { "Content-Type": "application/json" }, 
    body: JSON.stringify(payload) 
  })
}

export const getMe = async (token) => {
  return request(`${API}/api/auth/me`, {
    headers: { ...authHeaders(token) }
  })
}

export const updateMe = async (data) => {
  const token = localStorage.getItem("accessToken")
  return request(`${API}/api/auth/me`, {
    method: "PUT",
    headers: { 
      "Content-Type": "application/json",
      ...authHeaders(token) 
    },
    body: JSON.stringify(data)
  })
}

export const toggleFavorite = async (listingId) => {
  const token = localStorage.getItem("accessToken")
  return request(`${API}/api/auth/toggle-favorite`, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      ...authHeaders(token) 
    },
    body: JSON.stringify({ listingId })
  })
}

export const fetchListings = async (params = {}) => {
  const qs = new URLSearchParams(params).toString()
  try {
    return await request(`${API}/api/listings?${qs}`)
  } catch (err) {
    return { items: [], total: 0, page: 1, pages: 1 }
  }
}

export const getListing = async (id) => {
  return request(`${API}/api/listings/${id}`)
}

export const createListing = async (token, payload) => {
  return request(`${API}/api/listings`, { 
    method: "POST", 
    headers: { "Content-Type": "application/json", ...authHeaders(token) }, 
    body: JSON.stringify(payload) 
  })
}

export const uploadImages = async (token, files) => {
  const fd = new FormData()
  Array.from(files).forEach(f => fd.append("images", f))
  return request(`${API}/api/listings/upload`, { 
    method: "POST", 
    headers: { ...authHeaders(token) }, 
    body: fd 
  })
}

export const getReviews = async (id) => {
  try {
    return await request(`${API}/api/listings/${id}/reviews`)
  } catch (err) {
    return []
  }
}

export const addReview = async (id, payload) => {
  const token = localStorage.getItem("accessToken")
  return request(`${API}/api/listings/${id}/reviews`, { 
    method: "POST", 
    headers: { "Content-Type": "application/json", ...authHeaders(token) }, 
    body: JSON.stringify(payload) 
  })
}

export const getChats = async () => {
  const token = localStorage.getItem("accessToken")
  try {
    return await request(`${API}/api/chats`, {
      headers: { ...authHeaders(token) }
    })
  } catch (err) {
    return []
  }
}

export const getMessages = async (chatId) => {
  const token = localStorage.getItem("accessToken")
  try {
    return await request(`${API}/api/chats/${chatId}/messages`, {
      headers: { ...authHeaders(token) }
    })
  } catch (err) {
    return []
  }
}

export const startChat = async (payload) => {
  const token = localStorage.getItem("accessToken")
  return request(`${API}/api/chats/start`, { 
    method: "POST", 
    headers: { "Content-Type": "application/json", ...authHeaders(token) }, 
    body: JSON.stringify(payload) 
  })
}

export const deleteListing = async (id) => {
  const token = localStorage.getItem("accessToken")
  return request(`${API}/api/listings/${id}`, { 
    method: "DELETE", 
    headers: { ...authHeaders(token) } 
  })
}
