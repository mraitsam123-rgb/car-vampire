import { useEffect, useState } from "react"
import { useUser } from "../context/UserContext.jsx"
import { getListing } from "../lib/api.js"
import ListingCard from "../components/ListingCard.jsx"
import { Link } from "react-router-dom"

export default function Favorites() {
  const { me } = useUser()
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!me?.id && !me?._id) {
      setLoading(false)
      return
    }
    
    const loadFavs = async () => {
      try {
        setLoading(true)
        if (me?.favorites && Array.isArray(me?.favorites) && me?.favorites?.length > 0) {
          const favPromises = me.favorites.map(id => {
            const actualId = typeof id === 'object' ? (id._id || id.id) : id;
            return getListing(actualId).catch(() => null)
          })
          const favResults = await Promise.all(favPromises)
          setFavorites(favResults.filter(f => f && !f.error))
        } else {
          setFavorites([])
        }
      } catch (err) {
        console.error("Failed to load favorites", err)
      } finally {
        setLoading(false)
      }
    }

    loadFavs()
  }, [me?.id, me?._id, me?.favorites?.length])

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 py-20 flex justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-900"></div>
    </div>
  )

  return (
    <div className="bg-[#f7f8f8] min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4">
        
        <div className="flex items-center justify-between mb-8 border-b-2 border-gray-200 pb-4">
          <div>
            <h1 className="text-3xl font-black text-indigo-900 uppercase italic">My Favorites</h1>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-1">
              You have {favorites.length} saved {favorites.length === 1 ? 'ad' : 'ads'}
            </p>
          </div>
          <Link to="/" className="px-6 py-2 bg-indigo-900 text-white font-black uppercase text-xs rounded-full hover:bg-indigo-800 transition tracking-widest shadow-lg">
            Back to Home
          </Link>
        </div>

        {favorites.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="text-6xl mb-4">❤️</div>
            <p className="text-gray-500 font-bold uppercase tracking-tight mb-4">You haven't saved any ads yet.</p>
            <Link to="/listings" className="text-indigo-600 font-black uppercase tracking-widest text-xs hover:underline">
              Browse Listings
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {favorites.map(it => (
              <ListingCard key={it._id} it={it} />
            ))}
          </div>
        )}

      </div>
    </div>
  )
}
