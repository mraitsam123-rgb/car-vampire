import { Link } from "react-router-dom"
import { useUser } from "../context/UserContext.jsx"
import { toggleFavorite } from "../lib/api.js"
import { toast } from "react-hot-toast"

export default function ListingCard({ it }) {
  const { me, setMe } = useUser()
  const isFav = me?.favorites?.includes(it._id)

  const handleToggleFav = async (e) => {
    e.preventDefault()
    if (!me) return toast.error("Please login to favorite")
    try {
      const { favorites } = await toggleFavorite(it._id)
      setMe({ ...me, favorites })
      toast.success(isFav ? "Removed from favorites" : "Added to favorites")
    } catch (err) {
      toast.error("Something went wrong")
    }
  }

  return (
    <Link to={`/listings/${it._id}`} className="bg-white rounded border-2 border-gray-100 hover:border-indigo-200 transition shadow-sm group overflow-hidden relative block">
      <div className="aspect-[4/3] relative bg-gray-50 overflow-hidden">
        {it.images?.[0] ? (
          <img 
            src={typeof it.images[0] === 'string' ? it.images[0] : it.images[0]?.url} 
            alt={it.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">No Image</div>
        )}
        <button 
          onClick={handleToggleFav}
          className={`absolute top-2 right-2 p-1.5 bg-white/90 rounded-full shadow-md hover:scale-110 transition-all z-10 ${isFav ? 'text-red-500' : 'text-gray-400'}`}
        >
          {isFav ? '❤️' : '🤍'}
        </button>
      </div>
      <div className="p-3">
        <div className="flex justify-between items-start mb-1">
          <div className="text-lg font-bold text-gray-900">Rs {it.price?.toLocaleString()}</div>
        </div>
        <div className="text-sm text-gray-600 line-clamp-1 mb-2">{it.title}</div>
        
        {/* Rating Display */}
        <div className="flex items-center gap-1 mb-3">
          <div className="flex text-yellow-400 text-xs">
            {[1, 2, 3, 4, 5].map((s) => (
              <span key={s}>{it.rating >= s ? "★" : it.rating >= s - 0.5 ? "⯪" : "☆"}</span>
            ))}
          </div>
          <span className="text-[10px] font-bold text-gray-400">({it.reviewCount || 0})</span>
        </div>

        <div className="flex justify-between items-center text-[10px] text-gray-400 font-bold uppercase tracking-wider">
          <span>{it.city}</span>
          <span>{new Date(it.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
    </Link>
  )
}
