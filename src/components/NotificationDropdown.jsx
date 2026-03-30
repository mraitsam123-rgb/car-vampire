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

export default function NotificationDropdown({ notifications, onMarkAsRead, onMarkAllRead, onClose }) {
  return (
    <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 z-[100] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="p-4 border-b flex justify-between items-center bg-gray-50/50">
        <h3 className="font-black text-indigo-900 uppercase italic text-sm">Notifications</h3>
        <button 
          onClick={onMarkAllRead}
          className="text-[10px] font-black text-indigo-600 hover:underline uppercase tracking-widest"
        >
          Mark all as read
        </button>
      </div>
      
      <div className="max-h-[400px] overflow-y-auto">
        {notifications?.length === 0 ? (
          <div className="p-10 text-center text-gray-400 font-bold uppercase text-[10px] tracking-widest">
            No notifications yet
          </div>
        ) : (
          notifications?.map(n => (
            <Link
              key={n._id}
              to={n.link || "#"}
              onClick={() => {
                onMarkAsRead(n._id)
                onClose()
              }}
              className={`flex items-start gap-3 p-4 hover:bg-indigo-50/50 transition border-b border-gray-50 last:border-0 ${!n.isRead ? 'bg-indigo-50/30' : ''}`}
            >
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center font-black text-indigo-900 border-2 border-white shadow-sm overflow-hidden shrink-0">
                {n.senderId?.avatar ? (
                  <img src={n.senderId.avatar} className="w-full h-full object-cover" />
                ) : (
                  n.senderId?.name?.[0]
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-gray-900 leading-tight">
                  <span className="font-black text-indigo-900 uppercase">{n.senderId?.name}</span> {n.type === 'message' ? 'sent you a message' : n.text}
                </p>
                {n.type === 'message' && (
                  <p className="text-[10px] text-gray-500 mt-1 truncate italic">"{n.text}"</p>
                )}
                <p className="text-[8px] font-black uppercase mt-1 tracking-widest">
                  {formatTime(n.createdAt)}
                </p>
              </div>
              {!n.isRead && (
                <div className="w-2 h-2 bg-indigo-600 rounded-full mt-2 shrink-0"></div>
              )}
            </Link>
          ))
        )}
      </div>
      
      <div className="p-3 border-t text-center bg-gray-50/50">
        <Link 
          to="/notifications" 
          onClick={onClose}
          className="text-[10px] font-black text-indigo-900 hover:text-indigo-600 uppercase tracking-widest"
        >
          View all notifications
        </Link>
      </div>
    </div>
  )
}
