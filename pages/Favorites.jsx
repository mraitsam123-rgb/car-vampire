import { useEffect, useState } from "react"
import { fetchListings } from "../lib/api.js"
import { useUser } from "../context/UserContext.jsx"
import ListingCard from "../components/ListingCard.jsx"

export default function Favorites() {
  const { me } = useUser()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (me?.favorites?.length > 0) {
      // In a real app, you'd have an endpoint to fetch multiple IDs
      // For now, we fetch all and filter to ensure we have the full data
      fetchListings({ limit: 1000 })
        .then(res => {
          const favs = res.items.filter(it => me.favorites.includes(it._id))
          setItems(favs)
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [me?.favorites])

  return (
    <div className="bg-[#f7f8f8] min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-4 mb-8">
          <h1 className="text-3xl font-black text-indigo-900 uppercase italic">My Favorites ❤️</h1>
          <span className="bg-indigo-100 text-indigo-900 px-3 py-1 rounded-full text-xs font-black">
            {items.length} Ads
          </span>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-900"></div>
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white rounded-xl p-20 text-center border-2 border-dashed border-gray-100">
            <span className="text-6xl mb-4 block">💝</span>
            <h2 className="text-xl font-black text-gray-900 uppercase mb-2">No favorites yet</h2>
            <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest mb-6">
              Click the heart icon on any ad to save it here
            </p>
            <button 
              onClick={() => window.location.href = '/'}
              className="bg-indigo-900 text-white px-8 py-3 rounded-full font-black uppercase tracking-widest hover:bg-indigo-800 transition shadow-lg"
            >
              Start Exploring
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {items.map(it => <ListingCard key={it._id} it={it} />)}
          </div>
        )}
      </div>
    </div>
  )
}
