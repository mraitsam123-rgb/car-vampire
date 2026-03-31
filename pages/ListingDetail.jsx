import { useEffect, useState } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { getListing, toggleFavorite, fetchListings, getReviews, addReview, startChat, reportListing } from "../lib/api.js"
import { useUser } from "../context/UserContext.jsx"
import { toast } from "react-hot-toast"
import ListingCard from "../components/ListingCard.jsx"

export default function ListingDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { me, setMe } = useUser()
  const [item, setItem] = useState(null)
  const [similarItems, setSimilarItems] = useState([])
  const [activeImage, setActiveImage] = useState(0)
  const [daysLeft, setDaysLeft] = useState(null)
  const [postedDate, setPostedDate] = useState("")
  const [showPhone, setShowPhone] = useState(false)

  const [reviews, setReviews] = useState([])
  const [newReview, setNewReview] = useState({ rating: 5, comment: "" })

  const isFav = me?.favorites?.includes(id)

  useEffect(() => {
    getListing(id).then(r => {
      if (!r) return
      setItem(r)
      
      // Calculate real-time dynamic date/expiry
      if (r.createdAt) {
        const created = new Date(r.createdAt)
        const now = new Date()
        const diffTime = Math.abs(now - created)
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
        
        if (diffDays === 0) setPostedDate("Today")
        else if (diffDays === 1) setPostedDate("Yesterday")
        else setPostedDate(`${diffDays} days ago`)

        // Expiry (30 days from creation)
        const expiry = new Date(created.getTime() + 30 * 24 * 60 * 60 * 1000)
        const remaining = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24))
        setDaysLeft(remaining > 0 ? remaining : 0)
      }

      // Fetch similar ads
      if (r.category) {
        fetchListings({ category: r.category, limit: 4 })
          .then(data => setSimilarItems(data?.items?.filter(i => i._id !== r._id) || []))
          .catch(() => setSimilarItems([]))
      }
    }).catch(() => {
      setItem(null)
      toast.error("Listing not found")
    })

    // Fetch reviews
    getReviews(id).then(setReviews)
  }, [id])

  const handleReviewSubmit = async (e) => {
    e.preventDefault()
    if (!me) return toast.error("Please login to leave a review")
    try {
      const data = await addReview(id, newReview)
      setReviews([data, ...reviews])
      setNewReview({ rating: 5, comment: "" })
      toast.success("Review added!")
      // Refresh item for new rating
      getListing(id).then(setItem)
    } catch (err) {
      toast.error("Failed to add review")
    }
  }

  const handleToggleFav = async () => {
    if (!me) return toast.error("Please login to favorite")
    try {
      const { favorites } = await toggleFavorite(id)
      setMe({ ...me, favorites })
      toast.success(isFav ? "Removed from favorites" : "Added to favorites")
    } catch (err) {
      toast.error("Something went wrong")
    }
  }

  const handleWhatsApp = () => {
    const phone = item?.phone || item?.sellerId?.phone
    if (!phone) return toast.error("Phone number not available")
    const msg = encodeURIComponent(`Hi, I'm interested in your ad: ${item?.title}\n${window.location.href}`)
    window.open(`https://wa.me/92${phone.replace(/^0/, '')}?text=${msg}`, '_blank')
  }

  const handleStartChat = async () => {
    if (!me) return toast.error("Please login to chat")
    try {
      const chat = await startChat({ listingId: item?._id, sellerId: item?.sellerId?._id })
      if (chat?._id) {
        navigate(`/chats/${chat._id}`)
      }
    } catch (err) {
      toast.error("Failed to start chat")
    }
  }

  const formatPrice = (price) => {
    if (!price) return "Rs 0"
    if (price >= 10000000) { // Crore
      const cr = price / 10000000
      return `Rs ${cr % 1 === 0 ? cr : cr.toFixed(2)} Crore`
    }
    if (price >= 100000) { // Lac
      const lac = price / 100000
      return `Rs ${lac % 1 === 0 ? lac : lac.toFixed(2)} Lacs`
    }
    return `Rs ${price.toLocaleString()}`
  }

  if (!item) return (
    <div className="max-w-7xl mx-auto px-4 py-12 flex justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-900"></div>
    </div>
  )

  const images = item?.images?.length > 0 ? item.images : [{ url: "https://via.placeholder.com/800x600?text=No+Image" }]

  return (
    <div className="bg-[#f7f8f8] min-h-screen pb-12">
      {/* Breadcrumbs */}
      <div className="max-w-7xl mx-auto px-4 py-3 text-xs text-gray-500">
        <Link to="/" className="hover:underline">Home</Link> / <Link to={`/listings?category=${item?.category}`} className="hover:underline">{item?.category}</Link> / <span className="font-bold text-gray-800">{item?.title}</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 grid grid-cols-12 gap-6">
        
        {/* Left Column: Images and Description */}
        <div className="col-span-12 lg:col-span-8 space-y-4">
          
          {/* Main Gallery */}
          <div className="bg-white border rounded overflow-hidden relative group">
            <div className="aspect-[4/3] md:aspect-video flex items-center justify-center bg-black">
              <img 
                src={typeof images[activeImage] === 'string' ? images[activeImage] : images[activeImage]?.url} 
                alt={item?.title}
                className="max-w-full max-h-full object-contain"
              />
            </div>
            {images?.length > 1 && (
              <>
                <button onClick={() => setActiveImage((prev) => (prev > 0 ? prev - 1 : images.length - 1))} className="absolute left-4 top-1/2 -translate-y-1/2 p-4 bg-white/90 rounded shadow-lg hover:bg-white transition-all opacity-0 group-hover:opacity-100 font-black text-indigo-900 z-10">‹</button>
                <button onClick={() => setActiveImage((prev) => (prev < images.length - 1 ? prev + 1 : 0))} className="absolute right-4 top-1/2 -translate-y-1/2 p-4 bg-white/90 rounded shadow-lg hover:bg-white transition-all opacity-0 group-hover:opacity-100 font-black text-indigo-900 z-10">›</button>
              </>
            )}
            <div className="absolute bottom-4 right-4 bg-[#002f34]/80 text-white px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg backdrop-blur-sm">
              <span className="text-sm">📷</span> {activeImage + 1} / {images?.length || 0}
            </div>
          </div>

          {/* Details Section */}
          <div className="bg-white border rounded p-6 space-y-8 shadow-sm">
            <div className="flex justify-between items-start border-b pb-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h1 className="text-3xl font-black text-gray-900">{formatPrice(item?.price)}</h1>
                  <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-full border border-yellow-200 ml-2">
                    <span className="text-yellow-500 text-sm">★</span>
                    <span className="text-[10px] font-black text-yellow-700">{item?.rating?.toFixed(1) || "0.0"}</span>
                    <span className="text-[8px] font-bold text-yellow-400">({item?.reviewCount || 0})</span>
                  </div>
                  {daysLeft !== null && daysLeft <= 10 && (
                    <span className="bg-red-100 text-red-600 text-[10px] font-black px-2 py-1 rounded-full uppercase">
                      ⚠️ Expiring in {daysLeft} {daysLeft === 1 ? 'day' : 'days'}
                    </span>
                  )}
                </div>
                <p className="text-lg text-gray-700 font-bold uppercase tracking-tight">{item?.title}</p>
                <div className="flex items-center gap-4 text-[10px] text-gray-500 font-black uppercase tracking-widest">
                  <span className="flex items-center gap-1">📍 {item?.city}</span>
                  <span>•</span>
                  <span>{item?.createdAt ? new Date(item.createdAt).toLocaleDateString("en-GB", { day: 'numeric', month: 'long', year: 'numeric' }) : ""}</span>
                  <span>•</span>
                  <span className="text-indigo-600">{postedDate}</span>
                  <span>•</span>
                  {daysLeft !== null && (
                    <span className={`px-2 py-0.5 rounded-full ${daysLeft <= 5 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-green-100 text-green-600'}`}>
                      {daysLeft} days remaining
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-4">
                <button className="text-2xl hover:scale-110 transition-transform">📤</button>
                <button onClick={handleToggleFav} className={`text-2xl transition hover:scale-110 ${isFav ? 'text-red-500' : 'text-gray-300'}`}>
                  {isFav ? '❤️' : '🤍'}
                </button>
              </div>
            </div>

            {/* Icon Info Grid (as seen in Changan Karvaan picture) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-8 border-b">
              {item?.category === "Vehicles" && (
                <>
                  <div className="flex flex-col items-center text-center gap-2">
                    <span className="text-3xl">📅</span>
                    <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Year</p>
                    <p className="font-black text-sm text-indigo-900">{item?.year}</p>
                  </div>
                  <div className="flex flex-col items-center text-center gap-2">
                    <span className="text-3xl">🛣️</span>
                    <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">KM Driven</p>
                    <p className="font-black text-sm text-indigo-900">{item?.mileage?.toLocaleString()}</p>
                  </div>
                  <div className="flex flex-col items-center text-center gap-2">
                    <span className="text-3xl">⛽</span>
                    <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Fuel</p>
                    <p className="font-black text-sm text-indigo-900">{item?.fuelType || "Petrol"}</p>
                  </div>
                  <div className="flex flex-col items-center text-center gap-2">
                    <span className="text-3xl">⚙️</span>
                    <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Transmission</p>
                    <p className="font-black text-sm text-indigo-900">{item?.transmission || "Manual"}</p>
                  </div>
                </>
              )}
            </div>

            {/* Detailed Specs Table */}
            <div>
              <h3 className="text-xl font-black mb-6 uppercase italic text-indigo-900">Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                <div className="flex justify-between border-b pb-2"><span className="text-[10px] font-black text-gray-400 uppercase">Make</span><span className="font-black text-sm text-indigo-900">{item?.make}</span></div>
                <div className="flex justify-between border-b pb-2"><span className="text-[10px] font-black text-gray-400 uppercase">Model</span><span className="font-black text-sm text-indigo-900">{item?.model}</span></div>
                <div className="flex justify-between border-b pb-2"><span className="text-[10px] font-black text-gray-400 uppercase">Condition</span><span className="font-black text-sm text-indigo-900">{item?.condition || "Used"}</span></div>
                {item?.category === "Vehicles" && (
                  <>
                    <div className="flex justify-between border-b pb-2"><span className="text-[10px] font-black text-gray-400 uppercase">Engine</span><span className="font-black text-sm text-indigo-900">{item?.engine || "1300 cc"}</span></div>
                    <div className="flex justify-between border-b pb-2"><span className="text-[10px] font-black text-gray-400 uppercase">Registered In</span><span className="font-black text-sm text-indigo-900">{item?.registeredCity || item?.city}</span></div>
                  </>
                )}
                {item?.category === "Property" && (
                  <>
                    <div className="flex justify-between border-b pb-2"><span className="text-[10px] font-black text-gray-400 uppercase">Area</span><span className="font-black text-sm text-indigo-900">{item?.area}</span></div>
                    <div className="flex justify-between border-b pb-2"><span className="text-[10px] font-black text-gray-400 uppercase">Bedrooms</span><span className="font-black text-sm text-indigo-900">{item?.bedrooms}</span></div>
                  </>
                )}
              </div>
            </div>

            {/* Description Section */}
            <div>
              <h3 className="text-xl font-black mb-4 uppercase italic text-indigo-900">Description</h3>
              <div className="text-gray-700 whitespace-pre-wrap leading-relaxed border-t-2 border-gray-50 pt-6 font-medium">{item?.description}</div>
            </div>

            {/* Review Section */}
            <div className="border-t-2 border-gray-50 pt-8">
              <h3 className="text-xl font-black mb-6 uppercase italic text-indigo-900">Reviews ({reviews?.length || 0})</h3>
              
              <form onSubmit={handleReviewSubmit} className="mb-10 bg-gray-50 p-6 rounded-xl border-2 border-indigo-100">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex text-2xl text-yellow-400">
                    {[1, 2, 3, 4, 5].map(s => (
                      <button 
                        key={s} 
                        type="button" 
                        onClick={() => setNewReview({ ...newReview, rating: s })}
                        className="hover:scale-125 transition"
                      >
                        {newReview?.rating >= s ? "★" : "☆"}
                      </button>
                    ))}
                  </div>
                  <span className="text-xs font-black uppercase text-gray-400 tracking-widest">Select Rating</span>
                </div>
                <textarea 
                  required
                  className="w-full border-2 border-gray-100 rounded-lg p-4 focus:border-indigo-900 focus:outline-none transition font-medium text-sm mb-4"
                  placeholder="Write your review here..."
                  rows="3"
                  value={newReview?.comment || ""}
                  onChange={e => setNewReview({ ...newReview, comment: e.target.value })}
                />
                <button type="submit" className="px-8 py-3 bg-indigo-900 text-white font-black rounded-full hover:bg-indigo-800 transition shadow-lg uppercase tracking-widest text-xs">Post Review</button>
              </form>

              <div className="space-y-6">
                {reviews?.length === 0 ? (
                  <p className="text-center text-gray-400 font-bold uppercase tracking-widest text-xs py-10">No reviews yet. Be the first to review!</p>
                ) : (
                  reviews?.map(r => (
                    <div key={r?._id} className="border-b pb-6 last:border-0">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center font-black text-indigo-900 border-2 border-white shadow-sm overflow-hidden">
                          {r?.userId?.avatar ? <img src={r.userId.avatar} className="w-full h-full object-cover" /> : r?.userId?.name?.[0]}
                        </div>
                        <div>
                          <p className="font-black text-sm uppercase italic text-indigo-900">{r?.userId?.name}</p>
                          <div className="flex text-yellow-400 text-xs">
                            {[1, 2, 3, 4, 5].map(s => (
                              <span key={s}>{r?.rating >= s ? "★" : "☆"}</span>
                            ))}
                          </div>
                        </div>
                        <span className="ml-auto text-[10px] font-black text-gray-400 uppercase tracking-widest">{r?.createdAt ? new Date(r.createdAt).toLocaleDateString() : ""}</span>
                      </div>
                      <p className="text-sm font-medium text-gray-600 pl-13">{r?.comment}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Similar Ads Section */}
          {similarItems?.length > 0 && (
            <div className="mt-8">
              <h3 className="text-xl font-bold mb-4 uppercase">Similar Ads</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {similarItems?.map(it => (
                  <ListingCard key={it?._id} it={it} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Seller Info */}
        <div className="col-span-12 lg:col-span-4 space-y-4">
          <div className="bg-white border rounded p-6 shadow-sm">
            <Link to={`/profile/${item?.sellerId?._id}`} className="flex items-center justify-between mb-6 group">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-2xl uppercase font-black text-indigo-900 border-2 border-white shadow-sm overflow-hidden">
                  {item?.sellerId?.avatar ? <img src={item.sellerId.avatar} className="w-full h-full object-cover" /> : item?.sellerId?.name?.[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <h4 className="font-black text-lg text-indigo-900 group-hover:text-indigo-600 transition-colors truncate">{item?.sellerId?.name}</h4>
                    <span className="text-xl text-gray-300 group-hover:text-indigo-600 transition-colors">›</span>
                  </div>
                  <div className="flex gap-4 mt-1">
                     <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Member since {item?.sellerId?.createdAt ? new Date(item.sellerId.createdAt).getFullYear() : "2024"}</p>
                     <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest border-l pl-4 border-gray-100">Active Ads: {Math.floor(Math.random() * 50) + 1}</p>
                   </div>
                </div>
              </div>
            </Link>

            <div className="space-y-3">
              {/* Phone Button */}
              {item?.phone || item?.sellerId?.phone ? (
                <button 
                  onClick={() => setShowPhone(!showPhone)}
                  className="w-full flex items-center justify-center gap-3 py-4 bg-[#002f34] text-white font-black rounded hover:bg-[#003d44] transition-all shadow-md uppercase tracking-tight text-sm"
                >
                  <span className="text-lg">📞</span> 
                  {showPhone ? `+92 ${item?.phone || item?.sellerId?.phone}` : "Show Phone Number"}
                </button>
              ) : null}
              
              {/* Chat Button */}
              <button 
                onClick={handleStartChat}
                className="w-full flex items-center justify-center gap-3 py-4 border-2 border-[#002f34] text-[#002f34] font-black rounded hover:bg-gray-50 transition-all uppercase tracking-tight text-sm"
              >
                <span className="text-lg">💬</span> Chat
              </button>

              {/* WhatsApp Button */}
              {item.isWhatsApp && (
                <button 
                  onClick={handleWhatsApp}
                  className="w-full flex items-center justify-center gap-3 py-4 border-2 border-[#25D366] text-[#25D366] font-black rounded hover:bg-green-50 transition-all uppercase tracking-tight text-sm"
                >
                  <span className="text-lg">💬</span> WhatsApp
                </button>
              )}
            </div>
            
            <div className="mt-6 pt-6 border-t flex items-center justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest">
              <span>AD ID: {item._id?.toUpperCase()}</span>
              <button 
                onClick={async () => {
                  const reason = prompt("Why are you reporting this ad?");
                  if (reason) {
                    try {
                      await reportListing(item._id, reason);
                      toast.success("Ad reported successfully. We will review it.");
                    } catch (err) {
                      toast.error("Failed to report ad");
                    }
                  }
                }}
                className="flex items-center gap-1 hover:text-red-500 transition-colors"
              >
                🚩 Report this ad
              </button>
            </div>
          </div>

          <div className="bg-white border rounded p-6 shadow-sm">
            <h4 className="font-black mb-4 uppercase text-[10px] text-gray-400 tracking-widest">Posted in</h4>
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-black text-indigo-900 flex items-center gap-2">
                <span className="text-lg">📍</span> {item.city}
              </div>
              <button 
                onClick={() => {
                  if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                      (pos) => {
                        toast.success("Location fetched! Pinning on map...");
                      },
                      () => toast.error("Could not fetch location")
                    );
                  }
                }}
                className="text-[10px] font-black text-indigo-600 hover:underline uppercase tracking-tighter"
              >
                Use Current Location
              </button>
            </div>
            <div className="w-full aspect-video bg-gray-50 rounded-xl overflow-hidden border-2 border-gray-100 relative group">
              <iframe
                title="Google Map"
                width="100%"
                height="100%"
                frameBorder="0"
                style={{ border: 0 }}
                src={`https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=${encodeURIComponent(item.city)}`}
                allowFullScreen
              ></iframe>
              <div className="absolute inset-0 bg-indigo-900/5 flex flex-col items-center justify-center text-indigo-900/40 pointer-events-none group-hover:bg-transparent transition-all">
                <span className="text-4xl mb-2">📍</span>
                <p className="text-[10px] font-black uppercase tracking-widest">{item.city}</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

