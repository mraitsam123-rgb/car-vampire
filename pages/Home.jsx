import { Link, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { fetchListings } from "../lib/api.js"

const CATEGORIES = [
  { name: "Mobiles", icon: "📱" },
  { name: "Vehicles", icon: "🚗" },
  { name: "Property For Sale", icon: "🏠", slug: "Property" },
  { name: "Property For Rent", icon: "🏢", slug: "Property" },
  { name: "Electronics & Home Appliances", icon: "📺", slug: "Electronics" },
  { name: "Bikes", icon: "🏍️" },
  { name: "Business, Industrial & Agriculture", icon: "🚜", slug: "Business" },
  { name: "Services", icon: "🛠️" },
  { name: "Jobs", icon: "💼" },
  { name: "Animals", icon: "🐾" },
  { name: "Furniture & Home Decor", icon: "🛋️", slug: "Furniture" },
  { name: "Fashion & Beauty", icon: "👗", slug: "Fashion" },
]

export default function Home() {
  const [items, setItems] = useState([])
  const navigate = useNavigate()
  useEffect(() => {
    fetchListings({ limit: 12 }).then(r => setItems(r.items || []))
  }, [])

  return (
    <div className="bg-[#f7f8f8] min-h-screen">
      {/* Top Bar with Secondary Nav */}
      <div className="bg-white border-b py-2 px-4 hidden md:block">
        <div className="max-w-7xl mx-auto flex items-center gap-6 text-sm">
          <Link to="/" className="flex items-center gap-1 font-semibold text-indigo-900">
            <span className="w-6 h-6 bg-indigo-900 rounded-full"></span>
          </Link>
          <Link to="/listings?category=Vehicles" className="flex items-center gap-2 hover:text-indigo-600">
            <span>🚗</span> MOTOR
          </Link>
          <Link to="/listings?category=Property" className="flex items-center gap-2 hover:text-indigo-600">
            <span>🏠</span> PROPERTY
          </Link>
        </div>
      </div>

      {/* Main Search Bar */}
      <div className="bg-white sticky top-0 z-50 border-b">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row items-center gap-4">
          <Link to="/" className="text-2xl font-bold text-indigo-900 shrink-0">
            OLX
          </Link>
          
          <div className="flex-1 flex w-full gap-2">
            <div className="relative w-full md:w-64">
              <input 
                className="w-full border-2 border-indigo-900 rounded px-3 py-2 pl-10 focus:outline-none font-semibold" 
                placeholder="Pakistan" 
              />
              <span className="absolute left-3 top-2.5">📍</span>
            </div>
            
            <div className="flex-1 flex border-2 border-indigo-900 rounded overflow-hidden">
              <input 
                className="flex-1 px-4 py-2 focus:outline-none" 
                placeholder="Find Cars, Mobile Phones and more..." 
                onKeyDown={(e)=>{if(e.key==='Enter'){navigate(`/listings?q=${encodeURIComponent(e.currentTarget.value)}`)}}}
              />
              <button 
                className="bg-indigo-900 text-white px-6 py-2 hover:bg-indigo-800 transition"
                onClick={()=>navigate(`/listings`)}
              >
                🔍
              </button>
            </div>
          </div>

          <div className="flex items-center gap-6 shrink-0">
            <button className="text-2xl hover:text-indigo-600 transition">💬</button>
            <button className="text-2xl hover:text-indigo-600 transition relative">
              🔔
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">2</span>
            </button>
            <Link to="/login" className="font-bold border-b-2 border-indigo-900 hover:border-transparent transition">Login</Link>
            <Link to="/post-ad" className="flex items-center gap-1 px-4 py-2 rounded-full border-4 border-t-yellow-400 border-l-blue-400 border-r-indigo-600 border-b-green-400 font-bold hover:bg-gray-50 transition">
              <span className="text-xl">+</span> SELL
            </Link>
          </div>
        </div>
      </div>

      {/* Categories Bar */}
      <div className="bg-white border-b shadow-sm overflow-x-auto scrollbar-hide">
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-8 py-3 whitespace-nowrap text-sm font-semibold">
          <button className="flex items-center gap-2">ALL CATEGORIES ⌄</button>
          {CATEGORIES.slice(0, 7).map(cat => (
            <Link key={cat.name} to={`/listings?category=${cat.slug || cat.name}`} className="hover:text-indigo-600 transition">
              {cat.name}
            </Link>
          ))}
        </div>
      </div>

      {/* City Section - ONLY FOR LAHORE as seen in picture */}
      <div className="max-w-7xl mx-auto px-4 mt-10">
        <h2 className="text-xl font-bold mb-4 uppercase text-gray-800">Only for Lahore</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
          {items.slice(0, 6).map(it => (
             <Link key={it._id} to={`/listings/${it._id}`} className="bg-white rounded border hover:shadow-lg transition-shadow overflow-hidden group">
               <div className="aspect-[4/3] bg-gray-100 relative">
                 {it.images?.[0] ? (
                   <img src={typeof it.images[0] === 'string' ? it.images[0] : it.images[0]?.url} alt={it.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                 ) : (
                   <div className="w-full h-full flex items-center justify-center text-gray-300">No Image</div>
                 )}
               </div>
               <div className="p-2">
                 <div className="text-sm font-bold text-indigo-900">Rs {it.price?.toLocaleString()}</div>
                 <div className="text-[10px] text-gray-500 truncate">{it.title}</div>
               </div>
             </Link>
          ))}
        </div>
      </div>

      {/* Hero Banner Placeholder */}
      <div className="max-w-7xl mx-auto px-4 mt-6">
        <div className="bg-gradient-to-r from-indigo-900 to-indigo-700 h-48 md:h-64 rounded-lg flex items-center justify-center text-white text-3xl font-bold overflow-hidden shadow-lg">
          <div className="text-center p-6">
            <div className="text-sm uppercase tracking-widest mb-2 text-indigo-200">Featured Ads</div>
            Find the Best Deals in Pakistan
          </div>
        </div>
      </div>

      {/* Categories Icons Grid */}
      <div className="max-w-7xl mx-auto px-4 mt-10">
        <h2 className="text-2xl font-bold mb-6">All categories</h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-11 gap-4">
          {CATEGORIES.map(cat => (
            <Link key={cat.name} to={`/listings?category=${cat.slug || cat.name}`} className="flex flex-col items-center group">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-full flex items-center justify-center text-3xl shadow-sm group-hover:shadow-md transition border group-hover:border-indigo-600 mb-2">
                {cat.icon}
              </div>
              <span className="text-xs font-bold text-center group-hover:text-indigo-600 transition line-clamp-2 px-1">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Latest Listings */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Latest Recommendations</h2>
          <Link className="text-indigo-600 font-bold hover:underline" to="/listings">View More</Link>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {items.map(it => (
            <Link key={it._id} to={`/listings/${it._id}`} className="bg-white rounded border hover:shadow-lg transition-shadow overflow-hidden group">
              <div className="aspect-[4/3] bg-gray-100 relative">
                {it.images?.[0] ? (
                  <img
                    src={typeof it.images[0] === 'string' ? it.images[0] : it.images[0]?.url}
                    alt={it.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">No Image</div>
                )}
                <button className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-sm hover:text-red-500">
                  🤍
                </button>
              </div>
              <div className="p-3 border-l-4 border-transparent group-hover:border-yellow-400">
                <div className="text-lg font-bold">Rs {it.price?.toLocaleString()}</div>
                <div className="text-gray-600 text-sm line-clamp-1 mb-2">{it.title}</div>
                <div className="flex justify-between items-center text-[10px] text-gray-400 uppercase font-semibold">
                  <span>{it.city}</span>
                  <span>{new Date(it.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Mobile App Banner */}
      <div className="bg-gray-100 mt-12 py-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1">
            <h3 className="text-3xl font-bold mb-4 uppercase">Try the OLX app</h3>
            <p className="text-gray-600 mb-6">Buy, sell and find anything using the app on your mobile.</p>
          </div>
          <div className="h-px w-full md:w-px md:h-24 bg-gray-300"></div>
          <div className="flex gap-4">
            <div className="bg-black text-white px-4 py-2 rounded flex items-center gap-2 cursor-pointer">
              <span className="text-2xl">🍎</span>
              <div className="text-[10px]">Download on the <br/><span className="text-lg font-bold">App Store</span></div>
            </div>
            <div className="bg-black text-white px-4 py-2 rounded flex items-center gap-2 cursor-pointer">
              <span className="text-2xl">🤖</span>
              <div className="text-[10px]">Get it on <br/><span className="text-lg font-bold">Google Play</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
