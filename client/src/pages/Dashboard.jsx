import { useEffect, useState } from "react"
import { fetchListings, getMe } from "../lib/api.js"
import { Link } from "react-router-dom"
import { useUser } from "../context/UserContext.jsx"
import ListingCard from "../components/ListingCard.jsx"

export default function Dashboard() {
  const { me, logout } = useUser()
  const [favorites, setFavorites] = useState([])
  const [myAds, setMyAds] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!me) return
    
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        // Fetch my ads
        const myAdsRes = await fetchListings({ sellerId: me.id || me._id, limit: 50 })
        setMyAds(myAdsRes.items || [])

        // Fetch favorite listings if any
        if (me.favorites && Array.isArray(me.favorites) && me.favorites.length > 0) {
          const favPromises = me.favorites.map(id => 
            fetch(`${import.meta.env.VITE_API_URL || ""}/api/listings/${id}`).then(r => r.ok ? r.json() : null)
          )
          const favResults = await Promise.all(favPromises)
          setFavorites(favResults.filter(f => f && !f.error))
        } else {
          setFavorites([])
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [me?.id, me?._id, me?.favorites?.length])

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this ad?")) return
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ""}/api/listings/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` }
      })
      if (res.ok) {
        setMyAds(myAds.filter(it => it._id !== id))
        toast.success("Ad deleted successfully")
      }
    } catch (err) {
      toast.error("Failed to delete ad")
    }
  }

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 py-20 flex justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-900"></div>
    </div>
  )

  return (
    <div className="bg-[#f7f8f8] min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-12 gap-8">
        
        {/* Left Sidebar */}
        <aside className="col-span-12 lg:col-span-4 space-y-6">
          <div className="bg-white border-2 border-gray-100 rounded-xl p-8 shadow-sm text-center">
            <div className="w-24 h-24 bg-indigo-100 rounded-full mx-auto flex items-center justify-center text-4xl font-black text-indigo-900 mb-4 border-4 border-white shadow-md overflow-hidden">
              {me?.avatar ? <img src={me.avatar} className="w-full h-full object-cover" /> : me?.name?.[0]}
            </div>
            <h2 className="text-2xl font-black text-indigo-900 uppercase tracking-tight italic">{me?.name}</h2>
            <p className="text-gray-500 text-sm mb-6 font-bold uppercase tracking-widest">Member since {new Date(me?.createdAt).getFullYear()}</p>
            <Link to={`/profile/${me?.id || me?._id}`} className="block w-full py-3 border-2 border-indigo-900 text-indigo-900 font-bold rounded-lg hover:bg-indigo-50 transition shadow-sm">View & Edit Profile</Link>
          </div>

          <div className="bg-white border-2 border-gray-100 rounded-xl p-6 shadow-sm">
            <h3 className="font-black text-indigo-900 uppercase text-[10px] tracking-widest mb-4 border-b pb-2">Quick Access</h3>
            <div className="space-y-2 text-sm font-bold text-gray-600">
              <Link to="/chats" className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition">
                <span className="text-xl">💬</span> My Chats
              </Link>
              <Link to="/post-ad" className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition">
                <span className="text-xl">➕</span> Post New Ad
              </Link>
              <button onClick={logout} className="w-full flex items-center gap-3 p-3 hover:bg-red-50 text-red-600 rounded-lg transition">
                <span className="text-xl">🚪</span> Logout
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="col-span-12 lg:col-span-8 space-y-8">
          
          {/* My Ads Section */}
          <section className="bg-white border-2 border-gray-100 rounded-xl p-8 shadow-sm">
            <div className="flex justify-between items-center mb-8 border-b pb-4">
              <h2 className="text-2xl font-black text-indigo-900 uppercase italic">My Ads ({myAds.length})</h2>
              <Link to="/post-ad" className="px-4 py-2 bg-indigo-900 text-white text-xs font-bold rounded-full hover:bg-indigo-800 transition shadow-md">Post New Ad</Link>
            </div>
            
            {myAds.length === 0 ? (
              <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                <div className="text-4xl mb-4">📦</div>
                <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">You haven't posted any ads yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {myAds.map(it => {
                  const diff = it.expiresAt ? new Date(it.expiresAt) - new Date() : 0
                  const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
                  return (
                    <div key={it._id} className="flex items-center gap-4 p-4 border-2 border-gray-50 rounded-xl hover:border-indigo-100 transition group shadow-sm">
                      <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden shrink-0 border">
                        <img src={typeof it.images?.[0] === 'string' ? it.images[0] : it.images?.[0]?.url} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-indigo-900 truncate uppercase tracking-tight">{it.title}</h4>
                        <div className="text-lg font-black text-gray-900">Rs {it.price?.toLocaleString()}</div>
                        {days > 0 && days <= 10 && (
                          <div className="mt-1 text-[10px] font-black text-red-600 uppercase flex items-center gap-1 bg-red-50 w-fit px-2 py-0.5 rounded-full">
                            <span>⚠️ Deleting in {days} {days === 1 ? 'day' : 'days'}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-2 shrink-0">
                        <Link to={`/listings/${it._id}`} className="px-4 py-1.5 bg-gray-100 text-indigo-900 text-xs font-bold rounded-full hover:bg-indigo-100 transition text-center">View</Link>
                        <button onClick={() => handleDelete(it._id)} className="px-4 py-1.5 text-red-600 text-xs font-bold rounded-full hover:bg-red-50 transition border border-red-100">Delete</button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </section>

          {/* Favorite Ads Section */}
          <section className="bg-white border-2 border-gray-100 rounded-xl p-8 shadow-sm">
            <div className="flex justify-between items-center mb-8 border-b pb-4">
              <h2 className="text-2xl font-black text-indigo-900 uppercase italic">My Favorites ({favorites.length})</h2>
              <Link to="/listings" className="text-xs font-bold text-indigo-600 hover:underline uppercase tracking-widest">Find More</Link>
            </div>
            
            {favorites.length === 0 ? (
              <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                <div className="text-4xl mb-4">❤️</div>
                <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">No favorite ads yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
                {favorites.map(it => (
                  <ListingCard key={it._id} it={it} />
                ))}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  )
}
