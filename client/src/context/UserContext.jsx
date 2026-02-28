import { createContext, useContext, useEffect, useState } from "react"
import { getMe } from "../lib/api.js"
import { toast } from "react-hot-toast"

const UserContext = createContext()

export const UserProvider = ({ children }) => {
  const [me, setMe] = useState(null)
  const [loading, setLoading] = useState(true)

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

  const logout = () => {
    localStorage.removeItem("accessToken")
    setMe(null)
    toast.success("Logged out successfully")
  }

  const updateMe = (userData) => {
    setMe(userData)
  }

  return (
    <UserContext.Provider value={{ me, setMe, updateMe, logout, loading }}>
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => useContext(UserContext)
