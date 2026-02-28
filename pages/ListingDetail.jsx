import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import { fetchListing, toggleFavorite } from "../lib/api.js"

export default function ListingDetail() {
  const { id } = useParams()
  const [item, setItem] = useState(null)
  const token = localStorage.getItem("accessToken")
  const [showPhone, setShowPhone] = useState(false)
  useEffect(() => {
    fetchListing(id).then(setItem)
  }, [id])
  if (!item) return <div className="max-w-5xl mx-auto px-4 py-6">Loading...</div>
  return (
    <div className="max-w-5xl mx-auto px-4 py-6 grid grid-cols-12 gap-6">
      <div className="col-span-12 md:col-span-8">
        <div className="bg-white border rounded">
          <div className="aspect-video bg-gray-100 rounded-t overflow-hidden">
            {item.images?.[0] && (
              <img
                alt=""
                src={typeof item.images[0] === "string" ? item.images[0] : item.images[0]?.url}
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <div className="p-4">
            <div className="text-2xl font-semibold mb-1">{item.title}</div>
            <div className="text-indigo-600 text-xl font-semibold mb-4">Rs {item.price?.toLocaleString?.()}</div>
            <div className="prose max-w-none">{item.description}</div>
          </div>
        </div>
      </div>
      <div className="col-span-12 md:col-span-4 space-y-4">
        <div className="bg-white border rounded p-4">
          <div className="font-semibold mb-2">Seller</div>
          <div className="text-sm">{item?.sellerId?.name}</div>
          <div className="text-sm text-gray-500">{item?.sellerId?.city}</div>
          <div className="mt-3 flex gap-2">
            <Link to="/chats" className="px-3 py-2 bg-indigo-600 rounded text-white">Chat</Link>
            {token ? (
              showPhone ? <a href={`tel:${item?.sellerId?.phone || ""}`} className="px-3 py-2 border rounded">{item?.sellerId?.phone || "Call"}</a> : <button onClick={async ()=>{await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/auth/reveal-phone`,{method:"POST",headers:{Authorization:`Bearer ${token}`}});setShowPhone(true)}} className="px-3 py-2 border rounded">Reveal number</button>
            ) : (
              <Link to="/login" className="px-3 py-2 border rounded">Login to view</Link>
            )}
          </div>
          {token && (
            <button onClick={() => toggleFavorite(token, item._id)} className="mt-3 px-3 py-2 border rounded w-full">Save</button>
          )}
        </div>
        <div className="bg-white border rounded p-4">
          <div className="font-semibold mb-2">Specs</div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>Make</div><div>{item.make}</div>
            <div>Model</div><div>{item.model}</div>
            <div>Year</div><div>{item.year}</div>
            <div>City</div><div>{item.city}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
