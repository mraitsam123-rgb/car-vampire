import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import { fetchListing, toggleFavorite } from "../lib/api.js"

export default function ListingDetail() {
  const { id } = useParams()
  const [item, setItem] = useState(null)
  const [similarItems, setSimilarItems] = useState([])
  const [activeImage, setActiveImage] = useState(0)
  const token = localStorage.getItem("accessToken")
  const [showPhone, setShowPhone] = useState(false)

  useEffect(() => {
    fetchListing(id).then(r => {
      setItem(r)
      // Fetch similar ads in the same category
      fetch(`${import.meta.env.VITE_API_URL || ""}/api/listings?category=${r.category}&limit=4`)
        .then(res => res.json())
        .then(data => setSimilarItems(data.items?.filter(i => i._id !== r._id) || []))
    })
  }, [id])

  if (!item) return (
    <div className="max-w-7xl mx-auto px-4 py-12 flex justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-900"></div>
    </div>
  )

  const images = item.images?.length > 0 ? item.images : [{ url: "https://via.placeholder.com/800x600?text=No+Image" }]

  return (
    <div className="bg-[#f7f8f8] min-h-screen pb-12">
      {/* Breadcrumbs */}
      <div className="max-w-7xl mx-auto px-4 py-3 text-xs text-gray-500">
        <Link to="/" className="hover:underline">Home</Link> / <Link to={`/listings?category=${item.category}`} className="hover:underline">{item.category}</Link> / <span className="font-bold text-gray-800">{item.title}</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 grid grid-cols-12 gap-6">
        
        {/* Left Column: Images and Description */}
        <div className="col-span-12 lg:col-span-8 space-y-4">
          
          {/* Main Gallery */}
          <div className="bg-white border rounded overflow-hidden relative group">
            <div className="aspect-[4/3] md:aspect-video flex items-center justify-center bg-black">
              <img 
                src={typeof images[activeImage] === 'string' ? images[activeImage] : images[activeImage]?.url} 
                alt={item.title}
                className="max-w-full max-h-full object-contain"
              />
            </div>
            {images.length > 1 && (
              <>
                <button onClick={() => setActiveImage((prev) => (prev > 0 ? prev - 1 : images.length - 1))} className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/80 rounded shadow hover:bg-white transition opacity-0 group-hover:opacity-100">←</button>
                <button onClick={() => setActiveImage((prev) => (prev < images.length - 1 ? prev + 1 : 0))} className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/80 rounded shadow hover:bg-white transition opacity-0 group-hover:opacity-100">→</button>
              </>
            )}
            <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded text-sm font-bold">
              {activeImage + 1} / {images.length}
            </div>
          </div>

          {/* Details Section */}
          <div className="bg-white border rounded p-6 space-y-8">
            <div className="flex justify-between items-start border-b pb-6">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold text-gray-900">Rs {item.price?.toLocaleString()}</h1>
                <p className="text-lg text-gray-700 font-medium">{item.title}</p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">📍 {item.city}</span>
                  <span>•</span>
                  <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex gap-4">
                <button className="text-2xl hover:text-indigo-600 transition">📤</button>
                <button className="text-2xl hover:text-red-500 transition">🤍</button>
              </div>
            </div>

            {/* Icon Info Grid (as seen in Changan Karvaan picture) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-6 bg-gray-50 rounded-lg px-6">
              {item.category === "Vehicles" && (
                <>
                  <div className="flex flex-col items-center text-center gap-1">
                    <span className="text-2xl">📅</span>
                    <p className="text-[10px] text-gray-500 uppercase font-bold">Year</p>
                    <p className="font-bold text-sm">{item.year}</p>
                  </div>
                  <div className="flex flex-col items-center text-center gap-1">
                    <span className="text-2xl">🛣️</span>
                    <p className="text-[10px] text-gray-500 uppercase font-bold">KM Driven</p>
                    <p className="font-bold text-sm">{item.mileage?.toLocaleString()}</p>
                  </div>
                  <div className="flex flex-col items-center text-center gap-1">
                    <span className="text-2xl">⛽</span>
                    <p className="text-[10px] text-gray-500 uppercase font-bold">Fuel</p>
                    <p className="font-bold text-sm">{item.fuelType || "Petrol"}</p>
                  </div>
                  <div className="flex flex-col items-center text-center gap-1">
                    <span className="text-2xl">⚙️</span>
                    <p className="text-[10px] text-gray-500 uppercase font-bold">Transmission</p>
                    <p className="font-bold text-sm">{item.transmission || "Manual"}</p>
                  </div>
                </>
              )}
            </div>

            {/* Detailed Specs Table */}
            <div>
              <h3 className="text-xl font-bold mb-6 border-b pb-2">Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                <div className="flex justify-between border-b pb-2"><span className="text-gray-500">Make</span><span className="font-semibold">{item.make}</span></div>
                <div className="flex justify-between border-b pb-2"><span className="text-gray-500">Model</span><span className="font-semibold">{item.model}</span></div>
                <div className="flex justify-between border-b pb-2"><span className="text-gray-500">Condition</span><span className="font-semibold">{item.condition || "Used"}</span></div>
                {item.category === "Vehicles" && (
                  <>
                    <div className="flex justify-between border-b pb-2"><span className="text-gray-500">Engine</span><span className="font-semibold">{item.engine || "1300 cc"}</span></div>
                    <div className="flex justify-between border-b pb-2"><span className="text-gray-500">Registered In</span><span className="font-semibold">{item.registeredCity || item.city}</span></div>
                  </>
                )}
                {item.category === "Property" && (
                  <>
                    <div className="flex justify-between border-b pb-2"><span className="text-gray-500">Area</span><span className="font-semibold">{item.area}</span></div>
                    <div className="flex justify-between border-b pb-2"><span className="text-gray-500">Bedrooms</span><span className="font-semibold">{item.bedrooms}</span></div>
                  </>
                )}
              </div>
            </div>

            {/* Features Section */}
            <div>
              <h3 className="text-xl font-bold mb-6 border-b pb-2">Features</h3>
              <div className="flex flex-wrap gap-3">
                {["ABS", "Airbags", "AM/FM Radio", "Power Windows", "Power Steering", "USB & Aux Connect"].map(feat => (
                  <span key={feat} className="px-4 py-2 bg-gray-100 rounded-full text-sm font-semibold text-gray-700">{feat}</span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-3">Description</h3>
              <div className="text-gray-700 whitespace-pre-wrap leading-relaxed border-t pt-4">{item.description}</div>
            </div>
          </div>

          {/* Similar Ads Section */}
          {similarItems.length > 0 && (
            <div className="mt-8">
              <h3 className="text-xl font-bold mb-4 uppercase">Similar Ads</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {similarItems.map(it => (
                  <Link key={it._id} to={`/listings/${it._id}`} className="bg-white rounded border hover:shadow-lg transition-shadow overflow-hidden group">
                    <div className="aspect-[4/3] bg-gray-100 relative">
                      {it.images?.[0] ? (
                        <img src={typeof it.images[0] === 'string' ? it.images[0] : it.images[0]?.url} alt={it.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">No Image</div>
                      )}
                    </div>
                    <div className="p-3">
                      <div className="text-lg font-bold text-indigo-900">Rs {it.price?.toLocaleString()}</div>
                      <div className="text-xs text-gray-600 truncate">{it.title}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Seller Info */}
        <div className="col-span-12 lg:col-span-4 space-y-4">
          <div className="bg-white border rounded p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-2xl uppercase font-bold text-indigo-900">
                {item.sellerId?.avatar ? <img src={item.sellerId.avatar} className="w-full h-full rounded-full object-cover" /> : item.sellerId?.name?.[0]}
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Seller</p>
                <h4 className="font-bold text-lg">{item.sellerId?.name}</h4>
                <p className="text-sm text-gray-500">Member since {new Date(item.sellerId?.createdAt || Date.now()).getFullYear()}</p>
              </div>
            </div>

            <div className="space-y-3">
              {showPhone ? (
                <a href={`tel:${item.sellerId?.phone}`} className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-900 text-white font-bold rounded hover:bg-indigo-800 transition">
                  📞 {item.sellerId?.phone}
                </a>
              ) : (
                <button 
                  onClick={() => setShowPhone(true)}
                  className="w-full flex items-center justify-center gap-2 py-3 border-2 border-indigo-900 text-indigo-900 font-bold rounded hover:bg-indigo-50 transition"
                >
                  📞 Show Phone Number
                </button>
              )}
              
              <Link to={`/chats?listingId=${item._id}`} className="w-full flex items-center justify-center gap-2 py-3 border-2 border-indigo-900 text-indigo-900 font-bold rounded hover:bg-indigo-50 transition">
                💬 Chat with Seller
              </Link>
            </div>
          </div>

          <div className="bg-white border rounded p-6">
            <h4 className="font-bold mb-4 uppercase text-sm text-gray-500">Posted in</h4>
            <div className="text-sm font-bold text-gray-800 mb-2">📍 {item.city}</div>
            <div className="w-full h-48 bg-gray-100 rounded flex items-center justify-center text-gray-400">
              Map View Placeholder
            </div>
          </div>

          <button 
            onClick={() => toggleFavorite(token, item._id)}
            className="w-full flex items-center justify-center gap-2 py-3 text-indigo-900 font-bold hover:bg-gray-100 transition rounded"
          >
            🤍 Save Ad
          </button>
        </div>

      </div>
    </div>
  )
}
