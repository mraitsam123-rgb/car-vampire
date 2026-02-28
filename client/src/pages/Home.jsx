import { Link, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { fetchListings } from "../lib/api.js"
import ListingCard from "../components/ListingCard.jsx"

const CATEGORIES = [
  { name: "Mobiles", icon: "https://www.olx.com.pk/assets/mobiles.8bc37032159080bd1d9439ca2148ad4a.png" },
  { name: "Vehicles", icon: "https://www.olx.com.pk/assets/vehicles.29eccf7119f1f0a05f884501a403079a.png" },
  { name: "Property For Sale", icon: "https://www.olx.com.pk/assets/property-for-sale.e3a39529944f54e803878f30ee94589d.png", slug: "Property" },
  { name: "Property For Rent", icon: "https://www.olx.com.pk/assets/property-for-rent.536340209930f9a9415668b31a3168d8.png", slug: "Property" },
  { name: "Electronics & Home Appliances", icon: "https://www.olx.com.pk/assets/electronics-home-appliances.964259e88383e742e97b415e9820524c.png", slug: "Electronics" },
  { name: "Bikes", icon: "https://www.olx.com.pk/assets/bikes.4273059434863f64024f28522e8ca92e.png" },
  { name: "Business, Industrial & Agriculture", icon: "https://www.olx.com.pk/assets/business-industrial-agriculture.704a6ff4f90117094258f1f7375a0651.png", slug: "Business" },
  { name: "Services", icon: "https://www.olx.com.pk/assets/services.0645f782c5a09b304c10a48545e8b417.png" },
  { name: "Jobs", icon: "https://www.olx.com.pk/assets/jobs.79e5058721447e7b572e811f586b8f10.png" },
  { name: "Animals", icon: "https://www.olx.com.pk/assets/animals.62d396440f8087796378f773b063806a.png" },
  { name: "Furniture & Home Decor", icon: "https://www.olx.com.pk/assets/furniture-home-decor.31a89c3664c01f60447387e02554d393.png", slug: "Furniture" },
  { name: "Fashion & Beauty", icon: "https://www.olx.com.pk/assets/fashion-beauty.dd29013233866b1a3e3519c23f6631b7.png", slug: "Fashion" },
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

  // Filter items by category for sections
  const getCategoryItems = (catName) => items.filter(it => it.category === catName).slice(0, 4)
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
      <div className="bg-[#f7f8f8] sticky top-0 z-50 border-b py-2">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center gap-4">
          <Link to="/" className="text-2xl font-bold text-indigo-900 shrink-0">
            OLX
          </Link>
          
          <div className="flex-1 flex w-full gap-2">
            <div className="relative w-full md:w-72">
              <input 
                className="w-full border-2 border-indigo-900 rounded px-3 py-2 pl-10 focus:outline-none font-semibold text-sm h-12" 
                placeholder="Search Location (e.g. Lahore)" 
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <span className="absolute left-3 top-3.5">📍</span>
            </div>
            
            <div className="flex-1 flex border-2 border-indigo-900 rounded overflow-hidden h-12">
              <input 
                className="flex-1 px-4 py-2 focus:outline-none text-sm" 
                placeholder="Find Cars, Mobile Phones and more..." 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button 
                className="bg-indigo-900 text-white px-6 py-2 hover:bg-indigo-800 transition"
                onClick={handleSearch}
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
          {CATEGORIES.slice(0, 10).map(cat => (
            <Link key={cat.name} to={`/listings?category=${cat.slug || cat.name}`} className="hover:text-indigo-600 transition text-[12px]">
              {cat.name}
            </Link>
          ))}
        </div>
      </div>

      {/* All Categories Grid */}
      <div className="max-w-7xl mx-auto px-4 mt-8">
        <h2 className="text-xl font-black text-indigo-900 uppercase italic mb-6">All Categories</h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-4">
          {CATEGORIES.map(cat => (
            <Link 
              key={cat.name} 
              to={`/listings?category=${cat.slug || cat.name}`} 
              className="flex flex-col items-center text-center group"
            >
              <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center mb-2 shadow-sm border border-gray-100 group-hover:border-indigo-200 transition p-2">
                <img src={cat.icon} alt={cat.name} className="w-12 h-12 object-contain group-hover:scale-110 transition" />
              </div>
              <span className="text-[10px] font-black text-gray-700 uppercase leading-tight group-hover:text-indigo-900">{cat.name}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Hero Banner */}
      <div className="max-w-7xl mx-auto px-4 mt-10">
        <div className="w-full h-48 md:h-64 rounded-xl overflow-hidden shadow-md border">
          <img 
            src="https://images.olx.com.pk/thumbnails/435111153-800x600.webp" 
            className="w-full h-full object-cover" 
            alt="Banner" 
            onError={(e) => {
              e.target.src = "https://www.olx.com.pk/assets/olx_app_banner_noinline.32f4a478c93393952d7962453f090d81.webp"
            }}
          />
        </div>
      </div>

      {/* Categorized Sections */}
      <div className="max-w-7xl mx-auto px-4 mt-10 space-y-12 pb-20">
        
        {/* Cars Section */}
        {cars.length > 0 && (
          <section>
            <div className="flex justify-between items-center mb-4 border-b-2 border-indigo-900 pb-1">
              <h2 className="text-xl font-black uppercase text-indigo-900">Cars</h2>
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
            <div className="flex justify-between items-center mb-4 border-b-2 border-indigo-900 pb-1">
              <h2 className="text-xl font-black uppercase text-indigo-900">Mobile Phones</h2>
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
            <div className="flex justify-between items-center mb-4 border-b-2 border-indigo-900 pb-1">
              <h2 className="text-xl font-black uppercase text-indigo-900">Houses & Plots</h2>
              <Link to="/listings?category=Property" className="text-indigo-600 font-bold text-sm hover:underline">View more</Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {property.map(it => <ListingCard key={it._id} it={it} />)}
            </div>
          </section>
        )}

        {/* Bikes Section */}
        {bikes.length > 0 && (
          <section>
            <div className="flex justify-between items-center mb-4 border-b-2 border-indigo-900 pb-1">
              <h2 className="text-xl font-black uppercase text-indigo-900">Bikes</h2>
              <Link to="/listings?category=Bikes" className="text-indigo-600 font-bold text-sm hover:underline">View more</Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
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
