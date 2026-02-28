import { Link, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { fetchListings } from "../lib/api.js"

export default function Home() {
  const [items, setItems] = useState([])
  const navigate = useNavigate()
  useEffect(() => {
    fetchListings({ limit: 8 }).then(r => setItems(r.items || []))
  }, [])
  return (
    <div>
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="text-2xl font-semibold mb-4">Find your next car</div>
          <div className="flex gap-2">
            <input className="flex-1 border rounded px-3 py-3" placeholder="Search cars" onKeyDown={(e)=>{if(e.key==='Enter'){navigate(`/listings?q=${encodeURIComponent(e.currentTarget.value)}`)}}} />
            <button className="px-4 py-3 bg-indigo-600 text-white rounded" onClick={()=>navigate(`/listings`)}>Search</button>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-4">
          <div className="text-lg font-semibold">Latest ads</div>
          <Link className="text-indigo-600" to="/listings">Browse all</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {items.map(it => (
            <Link key={it._id} to={`/listings/${it._id}`} className="bg-white rounded shadow-sm border hover:shadow">
              <div className="aspect-video bg-gray-100 rounded-t overflow-hidden">
                {it.images?.[0] && (
                  <img
                    alt=""
                    src={typeof it.images[0] === "string" ? it.images[0] : it.images[0]?.url}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div className="p-3">
                <div className="font-medium truncate">{it.title}</div>
                <div className="text-indigo-600 font-semibold">Rs {it.price?.toLocaleString?.()}</div>
                <div className="text-sm text-gray-500">{it.city} • {new Date(it.createdAt).toLocaleDateString()}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
