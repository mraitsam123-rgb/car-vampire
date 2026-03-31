import { useEffect, useState } from "react"
import { useUser } from "../context/UserContext.jsx"
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from "../lib/api.js"
import { Link } from "react-router-dom"

const formatTime = (date) => {
  const diff = new Date() - new Date(date)
  const seconds = Math.floor(diff / 1000)
  if (seconds < 60) return "just now"
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return new Date(date).toLocaleDateString()
}

export default function Notifications() {
  const { me } = useUser()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!me) return

    getNotifications()
      .then(data => setNotifications(data || []))
      .catch(err => console.error("Failed to fetch notifications", err))
      .finally(() => setLoading(false))
  }, [me])

  const handleMarkRead = async (id) => {
    try {
      await markNotificationAsRead(id)
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n))
    } catch (err) {
      console.error(err)
    }
  }

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsAsRead()
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 py-20 flex justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-900"></div>
    </div>
  )

  const unreadCount = notifications.filter(n => !n.isRead).length

  return (
    <div className="bg-[#f7f8f8] min-h-screen py-10">
      <div className="max-w-3xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8 border-b-2 border-gray-200 pb-4">
          <div>
            <h1 className="text-3xl font-black text-indigo-900 uppercase italic">Notifications</h1>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-1">
              You have {unreadCount} unread {unreadCount === 1 ? 'alert' : 'alerts'}
            </p>
          </div>
          {unreadCount > 0 && (
            <button 
              onClick={handleMarkAllRead}
              className="px-6 py-2 bg-indigo-100 text-indigo-900 font-black uppercase text-xs rounded-full hover:bg-indigo-200 transition tracking-widest"
            >
              Mark All As Read
            </button>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          {notifications.length === 0 ? (
            <div className="py-20 text-center">
              <div className="text-6xl mb-4">🔕</div>
              <p className="text-gray-500 font-bold uppercase tracking-tight">You have no new notifications.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {notifications.map(n => (
                <div key={n._id} className={`p-6 transition hover:bg-gray-50 ${!n.isRead ? 'bg-indigo-50/30' : ''}`}>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center font-black text-indigo-900 border-2 border-white shadow-sm overflow-hidden shrink-0">
                      {n.senderId?.avatar ? (
                        <img src={n.senderId.avatar} className="w-full h-full object-cover" />
                      ) : (
                        n.senderId?.name?.[0]
                      )}
                    </div>
                    <div className="flex-1 min-w-0 pt-1">
                      <p className="font-bold text-gray-900 text-sm">
                        <span className="font-black text-indigo-900 uppercase">{n.senderId?.name}</span> {n.type === 'message' ? 'sent you a message' : n.text}
                      </p>
                      {n.type === 'message' && (
                        <p className="text-xs text-gray-600 mt-1 italic border-l-2 border-indigo-200 pl-3 py-1">"{n.text}"</p>
                      )}
                      <div className="flex items-center justify-between mt-3">
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                          {formatTime(n.createdAt)}
                        </p>
                        <div className="flex gap-3">
                          {!n.isRead && (
                            <button 
                              onClick={() => handleMarkRead(n._id)}
                              className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline"
                            >
                              Mark as read
                            </button>
                          )}
                          <Link 
                            to={n.link || "#"}
                            onClick={() => !n.isRead && handleMarkRead(n._id)}
                            className="text-[10px] font-black text-indigo-900 uppercase tracking-widest hover:underline"
                          >
                            View details ›
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
