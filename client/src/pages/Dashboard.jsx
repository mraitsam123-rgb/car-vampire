import { useEffect, useState } from "react"
import { fetchListings, getListing, deleteListing } from "../lib/api.js"
import { Link } from "react-router-dom"
import { useUser } from "../context/UserContext.jsx"
import ListingCard from "../components/ListingCard.jsx"
import { toast } from "react-hot-toast"

export default function Dashboard() {
  const { me, logout } = useUser()
  const [favorites, setFavorites] = useState([])
  const [myAds, setMyAds] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!me?.id && !me?._id) return
    
    const loadData = async () => {
      try {
        setLoading(true)
        // Fetch my ads
        const myAdsRes = await fetchListings({ sellerId: me?.id || me?._id, limit: 50 })
        setMyAds(myAdsRes?.items || [])

        // Fetch favorite listings if any
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
        console.error("Dashboard load error", err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [me?.id, me?._id, me?.favorites?.length])

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this ad?")) return
    try {
      await deleteListing(id)
      setMyAds(myAds.filter(it => it._id !== id))
      toast.success("Ad deleted successfully")
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
            <p className="text-gray-500 text-sm mb-6 font-bold uppercase tracking-widest">Member since {me?.createdAt ? new Date(me.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : "May 2026"}</p>
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
            <div className="flex items-center justify-between mb-8 border-b-2 border-gray-50 pb-4">
              <h3 className="text-xl font-black text-indigo-900 uppercase italic">My Ads ({myAds?.length || 0})</h3>
              <Link to="/post-ad" className="text-xs font-black text-indigo-600 hover:underline uppercase tracking-widest">Post Another Ad</Link>
            </div>
            
            <div className="space-y-4">
              {myAds?.length === 0 ? (
                <div className="py-12 text-center">
                  <div className="text-6xl mb-4">📉</div>
                  <p className="text-gray-400 font-bold uppercase tracking-tight">You haven't posted any ads yet.</p>
                  <Link to="/post-ad" className="inline-block mt-4 text-indigo-600 font-black uppercase text-xs hover:underline">Click here to start selling</Link>
                </div>
              ) : (
                myAds?.map(it => (
                  <div key={it._id} className="flex items-center gap-4 p-4 border-2 border-gray-50 rounded-xl hover:border-indigo-100 transition group">
                    <div className="w-24 h-24 rounded-lg bg-gray-50 overflow-hidden shrink-0">
                      <img 
                        src={typeof it.images?.[0] === 'string' ? it.images[0] : it.images?.[0]?.url || "https://via.placeholder.com/150"} 
                        className="w-full h-full object-cover group-hover:scale-110 transition duration-500" 
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-black text-indigo-900 truncate uppercase tracking-tight">{it.title}</h4>
                      <p className="text-indigo-600 font-black">Rs {it.price?.toLocaleString()}</p>
                      <div className="flex items-center gap-2 mt-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        <span>{it.city}</span>
                        <span>•</span>
                        <span>{it.createdAt ? new Date(it.createdAt).toLocaleDateString() : ""}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 shrink-0">
                      <Link to={`/listings/${it._id}`} className="px-4 py-1.5 bg-gray-100 text-indigo-900 text-xs font-bold rounded-full hover:bg-indigo-100 transition text-center">View</Link>
                      <button onClick={() => handleDelete(it._id)} className="px-4 py-1.5 text-red-600 text-xs font-bold rounded-full hover:bg-red-50 transition border border-red-100">Delete</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Favorite Ads Section */}
          <section className="bg-white border-2 border-gray-100 rounded-xl p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8 border-b-2 border-gray-50 pb-4">
              <h3 className="text-xl font-black text-indigo-900 uppercase italic">Saved Ads ({favorites?.length || 0})</h3>
              <Link to="/listings" className="text-xs font-black text-indigo-600 hover:underline uppercase tracking-widest">Explore More</Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {favorites?.length === 0 ? (
                <div className="col-span-full py-12 text-center">
                  <div className="text-6xl mb-4">❤️</div>
                  <p className="text-gray-400 font-bold uppercase tracking-tight">You haven't saved any ads yet.</p>
                </div>
              ) : (
                favorites?.map(it => <ListingCard key={it._id} it={it} />)
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}
