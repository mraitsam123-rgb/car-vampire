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
  const [location, setLocation] = useState("")
  const navigate = useNavigate()
  
  useEffect(() => {
    fetchListings({ limit: 24 }).then(r => setItems(r.items || []))
  }, [])

  const handleLocationSearch = (e) => {
    if (e.key === 'Enter') {
      navigate(`/listings?city=${encodeURIComponent(location)}`)
    }
  }

  // Filter items by category for sections
  const getCategoryItems = (catName) => items.filter(it => it.category === catName).slice(0, 4)
  const cars = getCategoryItems("Vehicles")
  const property = getCategoryItems("Property")
  const mobiles = getCategoryItems("Mobiles")

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
      <div className="bg-[#f7f8f8] sticky top-0 z-50 border-b py-2">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center gap-4">
          <Link to="/" className="text-2xl font-bold text-indigo-900 shrink-0">
            OLX
          </Link>
          
          <div className="flex-1 flex w-full gap-2">
            <div className="relative w-full md:w-72">
              <input 
                className="w-full border-2 border-indigo-900 rounded px-3 py-2 pl-10 focus:outline-none font-semibold text-sm h-12" 
                placeholder="Search Location" 
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onKeyDown={handleLocationSearch}
              />
              <span className="absolute left-3 top-3.5">📍</span>
            </div>
            
            <div className="flex-1 flex border-2 border-indigo-900 rounded overflow-hidden h-12">
              <input 
                className="flex-1 px-4 py-2 focus:outline-none text-sm" 
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
        </div>
      </div>

      {/* Categories Bar */}
      <div className="bg-white border-b shadow-sm overflow-x-auto scrollbar-hide">
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-8 py-3 whitespace-nowrap text-sm font-bold uppercase">
          <button className="flex items-center gap-2 text-[12px]">ALL CATEGORIES ⌄</button>
          {CATEGORIES.slice(0, 8).map(cat => (
            <Link key={cat.name} to={`/listings?category=${cat.slug || cat.name}`} className="hover:text-indigo-600 transition text-[12px]">
              {cat.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Hero Banner */}
      <div className="max-w-7xl mx-auto px-4 mt-6">
        <div className="w-full h-48 md:h-64 rounded overflow-hidden shadow-sm">
          <img src="https://images.olx.com.pk/thumbnails/435111153-800x600.webp" className="w-full h-full object-cover" alt="Banner" />
        </div>
      </div>

      {/* Categorized Sections */}
      <div className="max-w-7xl mx-auto px-4 mt-10 space-y-12 pb-20">
        
        {/* Cars Section */}
        {cars.length > 0 && (
          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold uppercase text-gray-800">Cars</h2>
              <Link to="/listings?category=Vehicles" className="text-indigo-600 font-bold text-sm hover:underline">View more</Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {cars.map(it => <ListingCard key={it._id} it={it} />)}
            </div>
          </section>
        )}

        {/* Mobile Phones Section */}
        {mobiles.length > 0 && (
          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold uppercase text-gray-800">Mobile Phones</h2>
              <Link to="/listings?category=Mobiles" className="text-indigo-600 font-bold text-sm hover:underline">View more</Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {mobiles.map(it => <ListingCard key={it._id} it={it} />)}
            </div>
          </section>
        )}

        {/* Property Section */}
        {property.length > 0 && (
          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold uppercase text-gray-800">Houses & Plots</h2>
              <Link to="/listings?category=Property" className="text-indigo-600 font-bold text-sm hover:underline">View more</Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {property.map(it => <ListingCard key={it._id} it={it} />)}
            </div>
          </section>
        )}

        {/* Recommendations */}
        <section>
          <h2 className="text-xl font-bold uppercase text-gray-800 mb-4">Fresh Recommendations</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {items.slice(0, 12).map(it => <ListingCard key={it._id} it={it} />)}
          </div>
        </section>
      </div>

      {/* Footer App Banner */}
      <div className="bg-[#3a77ff1a] py-10 mt-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1">
            <h3 className="text-3xl font-extrabold text-indigo-900 mb-2 uppercase italic">Try the OLX app</h3>
            <p className="text-gray-600 text-lg">Buy, sell and find anything using the app on your mobile.</p>
          </div>
          <div className="flex gap-4">
            <img src="https://www.olx.com.pk/assets/iconAppStore_noinline.a739345fb4c14b6e40397a0505e179c0.svg" className="h-10 cursor-pointer" alt="App Store" />
            <img src="https://www.olx.com.pk/assets/iconGooglePlayStore_noinline.98928337859396cd039673f95b0cf5d8.svg" className="h-10 cursor-pointer" alt="Google Play" />
          </div>
        </div>
      </div>
    </div>
  )
}

function ListingCard({ it }) {
  return (
    <Link to={`/listings/${it._id}`} className="bg-white rounded border-2 border-gray-100 hover:border-indigo-200 transition shadow-sm group overflow-hidden">
      <div className="aspect-[4/3] relative bg-gray-50">
        {it.images?.[0] ? (
          <img 
            src={typeof it.images[0] === 'string' ? it.images[0] : it.images[0]?.url} 
            alt={it.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">No Image</div>
        )}
        <button className="absolute top-2 right-2 p-1.5 bg-white/80 rounded-full shadow hover:text-red-500 transition">🤍</button>
      </div>
      <div className="p-3">
        <div className="flex justify-between items-start mb-1">
          <div className="text-lg font-bold text-gray-900">Rs {it.price?.toLocaleString()}</div>
        </div>
        <div className="text-sm text-gray-600 line-clamp-1 mb-3">{it.title}</div>
        <div className="flex justify-between items-center text-[10px] text-gray-400 font-bold uppercase tracking-wider">
          <span>{it.city}</span>
          <span>{new Date(it.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
    </Link>
  )
}
