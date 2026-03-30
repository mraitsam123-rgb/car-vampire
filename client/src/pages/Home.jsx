import { Link, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { fetchListings } from "../lib/api.js"
import ListingCard from "../components/ListingCard.jsx"

const CATEGORIES = [
  { name: "Mobiles", icon: "/logos/mobile logo.png" },
  { name: "Vehicles", icon: "/logos/car logo.png" },
  { name: "Property", icon: "/logos/property.png" },
  { name: "Electronics", icon: "/logos/electronics logo.png" },
  { name: "Bikes", icon: "/logos/bike logo.png" },
  { name: "Business", icon: "/logos/bussiness logo.png" },
  { name: "Services", icon: "/logos/services logo.png" },
  { name: "Jobs", icon: "/logos/jobs logo.png" },
  { name: "Animals", icon: "/logos/animals logo.png" },
  { name: "Furniture", icon: "/logos/furniture logo.png" },
  { name: "Fashion", icon: "/logos/fashion logo.png" },
]

export default function Home() {
  const [items, setItems] = useState([])
  const [location, setLocation] = useState("")
  const [query, setQuery] = useState("")
  const navigate = useNavigate()
  
  useEffect(() => {
    fetchListings({ limit: 24 }).then(r => setItems(r.items || []))
  }, [])

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (query) params.set('q', query)
    if (location) params.set('city', location)
    navigate(`/listings?${params.toString()}`)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch()
  }

  const getCategoryItems = (catName) => {
    const filtered = items?.filter(it => it.category === catName).slice(0, 4)
    return filtered?.length > 0 ? filtered : null
  }
  const cars = getCategoryItems("Vehicles")
  const property = getCategoryItems("Property")
  const mobiles = getCategoryItems("Mobiles")
  const electronics = getCategoryItems("Electronics")
  const bikes = getCategoryItems("Bikes")

  return (
    <div className="bg-[#f7f8f8] min-h-screen">
      {/* Top Bar with Secondary Nav */}
      <div className="bg-white border-b py-2 px-4 hidden md:block">
        <div className="max-w-7xl mx-auto flex items-center gap-6 text-sm">
          <Link to="/" className="flex items-center gap-1 font-semibold text-indigo-900">
            <span className="w-6 h-6 bg-indigo-900 rounded-full"></span>
          </Link>
          <Link to="/listings?category=Vehicles" className="flex items-center gap-2 hover:text-indigo-600 font-bold uppercase text-[10px]">
            <span>🚗</span> MOTORS
          </Link>
          <Link to="/listings?category=Property" className="flex items-center gap-2 hover:text-indigo-600 font-bold uppercase text-[10px]">
            <span>🏠</span> PROPERTY
          </Link>
        </div>
      </div>

      {/* Main Search Bar */}
      <div className="bg-white sticky top-0 z-50 border-b py-2">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center gap-4">
          <Link to="/" className="flex items-center gap-2 group">
            <img src="/logos/Colorful QuickBuy logo design.png" className="w-10 h-10 group-hover:scale-110 transition-transform duration-300" alt="QuickBuy Logo" />
            <span className="text-3xl font-black bg-gradient-to-r from-indigo-900 via-indigo-600 to-indigo-900 bg-clip-text text-transparent uppercase italic tracking-tighter">QuickBuy</span>
          </Link>
          
          <div className="flex-1 flex w-full gap-2">
            <div className="relative w-full md:w-72">
              <input 
                className="w-full border-2 border-[#002f34] rounded px-3 py-2 pl-10 focus:outline-none font-semibold text-sm h-12" 
                placeholder="Search Location (e.g. Lahore)" 
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <span className="absolute left-3 top-3.5">📍</span>
            </div>
            
            <div className="flex-1 flex border-2 border-[#002f34] rounded overflow-hidden h-12">
              <input 
                className="flex-1 px-4 py-2 focus:outline-none text-sm" 
                placeholder="Find Cars, Mobile Phones and more..." 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button 
                className="bg-[#002f34] text-white px-6 py-2 hover:bg-[#003d44] transition"
                onClick={handleSearch}
              >
                🔍
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* All Categories Grid */}
      <div className="max-w-7xl mx-auto px-4 mt-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-black text-[#002f34] uppercase italic">All Categories</h2>
          <Link to="/listings" className="text-xs font-black text-indigo-600 hover:underline uppercase tracking-widest">View All</Link>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-11 gap-4">
          {CATEGORIES.map(cat => (
            <Link 
              key={cat.name} 
              to={`/listings?category=${cat.name}`} 
              className="flex flex-col items-center text-center group"
            >
              <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center mb-2 shadow-sm border border-gray-100 group-hover:border-indigo-200 group-hover:shadow-md transition-all duration-300 p-2">
                <img src={cat.icon} alt={cat.name} className="w-12 h-12 object-contain group-hover:scale-110 transition duration-300" />
              </div>
              <span className="text-[10px] font-black text-gray-700 uppercase leading-tight group-hover:text-indigo-900 transition-colors">{cat.name}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Hero Banner */}
      <div className="max-w-7xl mx-auto px-4 mt-10">
        <div className="w-full h-48 md:h-64 rounded-xl overflow-hidden shadow-md border bg-[#002f34] flex items-center justify-between px-10 md:px-20 text-white relative">
          <div className="z-10 space-y-4">
            <h2 className="text-3xl md:text-5xl font-black uppercase italic italic">Sell anything,<br/>Buy everything</h2>
            <p className="text-sm md:text-lg font-bold text-indigo-200 uppercase tracking-widest">Pakistan's #1 Marketplace for Vehicles & Property</p>
            <Link to="/post-ad" className="inline-block bg-white text-[#002f34] px-8 py-3 rounded-full font-black uppercase tracking-widest hover:bg-indigo-50 transition shadow-xl">Start Selling Now</Link>
          </div>
          <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-[#003d44]/50 to-transparent"></div>
          <img 
            src="https://images.unsplash.com/photo-1560179707-f14e90ef3623?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
            className="absolute right-0 top-0 h-full w-1/3 object-cover opacity-50 md:opacity-100 mix-blend-overlay" 
            alt="Marketplace" 
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12 space-y-12">
        {cars && (
          <section>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black text-[#002f34] uppercase italic">Vehicles</h3>
              <Link to="/listings?category=Vehicles" className="text-xs font-black text-indigo-600 hover:underline uppercase tracking-widest">View More</Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {cars.map(it => <ListingCard key={it._id} it={it} />)}
            </div>
          </section>
        )}

        {property && (
          <section>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black text-[#002f34] uppercase italic">Property</h3>
              <Link to="/listings?category=Property" className="text-xs font-black text-indigo-600 hover:underline uppercase tracking-widest">View More</Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {property.map(it => <ListingCard key={it._id} it={it} />)}
            </div>
          </section>
        )}

        {mobiles && (
          <section>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black text-[#002f34] uppercase italic">Mobiles</h3>
              <Link to="/listings?category=Mobiles" className="text-xs font-black text-indigo-600 hover:underline uppercase tracking-widest">View More</Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {mobiles.map(it => <ListingCard key={it._id} it={it} />)}
            </div>
          </section>
        )}

        {bikes && (
          <section>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black text-[#002f34] uppercase italic">Bikes</h3>
              <Link to="/listings?category=Bikes" className="text-xs font-black text-indigo-600 hover:underline uppercase tracking-widest">View More</Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {bikes.map(it => <ListingCard key={it._id} it={it} />)}
            </div>
          </section>
        )}

        {/* Recommendations */}
        <section>
          <h2 className="text-xl font-black uppercase text-indigo-900 mb-4 border-b-2 border-indigo-900 pb-1">Fresh Recommendations</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {items.slice(0, 16).map(it => <ListingCard key={it._id} it={it} />)}
          </div>
        </section>
      </div>

      {/* Footer App Banner */}
      <div className="bg-indigo-900 py-16 mt-20">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center gap-16">
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-4xl md:text-6xl font-black text-white mb-6 uppercase italic italic tracking-tighter">Get the QuickBuy App</h3>
            <p className="text-indigo-200 text-lg md:text-xl font-bold uppercase tracking-widest">Buy, sell and find anything using the app on your mobile.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-6">
            <img src="https://www.olx.com.pk/assets/iconAppStore_noinline.a739345fb4c14b6e40397a0505e179c0.svg" className="h-14 cursor-pointer hover:scale-105 transition shadow-2xl" alt="App Store" />
            <img src="https://www.olx.com.pk/assets/iconGooglePlayStore_noinline.98928337859396cd039673f95b0cf5d8.svg" className="h-14 cursor-pointer hover:scale-105 transition shadow-2xl" alt="Google Play" />
          </div>
        </div>
      </div>
    </div>
  )
}
