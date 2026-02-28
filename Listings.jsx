import { useEffect, useMemo, useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { fetchListings } from "../lib/api.js"

export default function Listings() {
  const { search } = useLocation()
  const qs = useMemo(() => Object.fromEntries(new URLSearchParams(search)), [search])
  const [data, setData] = useState({ items: [], total: 0, page: 1, pages: 1 })
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    setLoading(true)
    fetchListings({ ...qs }).then(r => setData(r)).finally(() => setLoading(false))
  }, [search])
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-12 gap-6">
      <aside className="col-span-12 md:col-span-3">
        <div className="bg-white border rounded p-4 space-y-4">
          <div className="text-sm font-semibold">Filters</div>
          <form className="space-y-2">
            <input className="w-full border rounded px-3 py-2" placeholder="Make" name="make" />
            <input className="w-full border rounded px-3 py-2" placeholder="Model" name="model" />
            <input className="w-full border rounded px-3 py-2" placeholder="City" name="city" />
          </form>
        </div>
      </aside>
      <section className="col-span-12 md:col-span-9">
        <div className="flex items-center justify-between mb-3">
          <div className="text-lg font-semibold">Results</div>
          <select className="border rounded px-3 py-2">
            <option value="newest">Newest</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>
        {loading ? (
          <div className="p-6">Loading...</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {data.items.map(it => (
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
        )}
      </section>
    </div>
  )
}
