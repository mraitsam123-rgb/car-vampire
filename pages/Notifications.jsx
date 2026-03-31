import { useEffect, useState } from "react"
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from "../lib/api.js"
import { Link } from "react-router-dom"
import { toast } from "react-hot-toast"

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
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchNotifs = async () => {
    try {
      const data = await getNotifications()
      setNotifications(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifs()
  }, [])

  const handleMarkRead = async (id) => {
    await markNotificationAsRead(id)
    setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n))
  }

  const handleMarkAllRead = async () => {
    await markAllNotificationsAsRead()
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    toast.success("All notifications marked as read")
  }

  return (
    <div className="bg-[#f7f8f8] min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-black text-indigo-900 uppercase italic">Notifications 🔔</h1>
            <span className="bg-indigo-900 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
              {notifications.filter(n => !n.isRead).length} New
            </span>
          </div>
          {notifications.length > 0 && (
            <button 
              onClick={handleMarkAllRead}
              className="text-xs font-black text-indigo-600 hover:underline uppercase tracking-widest"
            >
              Mark all as read
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-900"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-white rounded-xl p-20 text-center border-2 border-dashed border-gray-100">
            <span className="text-6xl mb-4 block">🔕</span>
            <h2 className="text-xl font-black text-gray-900 uppercase mb-2">No notifications yet</h2>
            <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest">
              We'll notify you about new messages and updates
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-50">
            {notifications.map(n => (
              <div
                key={n._id}
                className={`flex items-start gap-4 p-6 transition group ${!n.isRead ? 'bg-indigo-50/20' : 'hover:bg-gray-50/50'}`}
              >
                <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center font-black text-indigo-900 border-2 border-white shadow-sm overflow-hidden shrink-0">
                  {n.senderId?.avatar ? (
                    <img src={n.senderId.avatar} className="w-full h-full object-cover" />
                  ) : (
                    n.senderId?.name?.[0]
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <p className="text-sm font-bold text-gray-900 leading-tight">
                      <span className="font-black text-indigo-900 uppercase">{n.senderId?.name}</span> {n.type === 'message' ? 'sent you a message' : n.text}
                    </p>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">
                      {formatTime(n.createdAt)}
                    </span>
                  </div>
                  {n.type === 'message' && (
                    <p className="text-sm text-gray-600 mt-2 italic border-l-4 border-indigo-100 pl-4 py-1">
                      "{n.text}"
                    </p>
                  )}
                  <div className="flex gap-4 mt-4">
                    <Link 
                      to={n.link || "#"}
                      onClick={() => handleMarkRead(n._id)}
                      className="text-[10px] font-black text-indigo-900 bg-indigo-50 px-4 py-2 rounded-full hover:bg-indigo-100 transition uppercase tracking-widest"
                    >
                      {n.type === 'message' ? 'View Message' : 'View Ad'}
                    </Link>
                    {!n.isRead && (
                      <button 
                        onClick={() => handleMarkRead(n._id)}
                        className="text-[10px] font-black text-gray-400 hover:text-indigo-600 transition uppercase tracking-widest"
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                </div>
                {!n.isRead && (
                  <div className="w-3 h-3 bg-indigo-600 rounded-full mt-2 shrink-0 shadow-lg shadow-indigo-200"></div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
