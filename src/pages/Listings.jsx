import { useEffect, useMemo, useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { fetchListings } from "../lib/api.js"
import ListingCard from "../components/ListingCard.jsx"

export default function Listings() {
  const { search } = useLocation()
  const navigate = useNavigate()
  const qs = useMemo(() => Object.fromEntries(new URLSearchParams(search)), [search])
  const [data, setData] = useState({ items: [], total: 0, page: 1, pages: 1 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetchListings({ ...qs }).then(r => setData(r)).finally(() => setLoading(false))
  }, [search])

  const updateFilter = (key, val) => {
    const params = new URLSearchParams(search)
    if (val) params.set(key, val)
    else params.delete(key)
    params.set('page', '1') // Reset to page 1 on filter change
    navigate(`/listings?${params.toString()}`)
  }
  return (
    <div className="bg-[#f7f8f8] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-12 gap-6">
        <aside className="col-span-12 md:col-span-3">
          <div className="bg-white border-2 border-gray-100 rounded-lg p-6 space-y-6 shadow-sm">
            <div className="text-lg font-bold text-indigo-900 border-b pb-2">Filters</div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Location</label>
                <input 
                  className="w-full border-2 border-gray-100 rounded px-3 py-2 focus:border-indigo-900 focus:outline-none transition" 
                  placeholder="Any City" 
                  value={qs.city || ""}
                  onChange={(e) => updateFilter('city', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Category</label>
                <select 
                  className="w-full border-2 border-gray-100 rounded px-3 py-2 focus:border-indigo-900 focus:outline-none transition"
                  value={qs.category || ""}
                  onChange={(e) => updateFilter('category', e.target.value)}
                >
                  <option value="">All Categories</option>
                  <option value="Vehicles">Vehicles</option>
                  <option value="Property">Property</option>
                  <option value="Mobiles">Mobiles</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Bikes">Bikes</option>
                  <option value="Business">Business</option>
                  <option value="Services">Services</option>
                  <option value="Jobs">Jobs</option>
                  <option value="Animals">Animals</option>
                  <option value="Furniture">Furniture</option>
                  <option value="Fashion">Fashion</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Price Range</label>
                <div className="flex gap-2">
                  <input 
                    type="number" 
                    className="w-1/2 border-2 border-gray-100 rounded px-2 py-2 text-sm focus:border-indigo-900 focus:outline-none transition" 
                    placeholder="Min" 
                    value={qs.minPrice || ""}
                    onChange={(e) => updateFilter('minPrice', e.target.value)}
                  />
                  <input 
                    type="number" 
                    className="w-1/2 border-2 border-gray-100 rounded px-2 py-2 text-sm focus:border-indigo-900 focus:outline-none transition" 
                    placeholder="Max" 
                    value={qs.maxPrice || ""}
                    onChange={(e) => updateFilter('maxPrice', e.target.value)}
                  />
                </div>
              </div>
            </div>

            <button 
              onClick={() => navigate('/listings')}
              className="w-full py-2 text-sm font-bold text-indigo-900 border-2 border-indigo-900 rounded hover:bg-indigo-50 transition"
            >
              Clear All
            </button>
          </div>
        </aside>

        <section className="col-span-12 md:col-span-9">
          <div className="bg-white border-2 border-gray-100 rounded-lg p-4 mb-6 flex items-center justify-between shadow-sm">
            <div className="text-sm font-bold text-gray-500">
              {data.total} ads found {qs.city && `in ${qs.city}`}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Sort by:</span>
              <select 
                className="border-none bg-transparent font-bold text-indigo-900 focus:ring-0 cursor-pointer text-sm"
                value={qs.sort || "newest"}
                onChange={(e) => updateFilter('sort', e.target.value)}
              >
                <option value="newest">Newest</option>
                <option value="price-asc">Lowest Price</option>
                <option value="price-desc">Highest Price</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="bg-gray-100 animate-pulse rounded-lg aspect-[4/5]"></div>
              ))}
            </div>
          ) : data.items.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-gray-200 rounded-xl p-20 text-center space-y-4">
              <div className="text-6xl">🔍</div>
              <h3 className="text-2xl font-extrabold text-indigo-900">Oops! No results found</h3>
              <p className="text-gray-500 max-w-md mx-auto">We couldn't find anything matching your filters. Try adjusting your search or category.</p>
              <button 
                onClick={() => navigate('/listings')}
                className="px-8 py-3 bg-indigo-900 text-white font-bold rounded-full hover:bg-indigo-800 transition shadow-lg"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {data.items.map(it => (
                <ListingCard key={it._id} it={it} />
              ))}
            </div>
          )}
          
          {/* Pagination */}
          {data.pages > 1 && (
            <div className="mt-12 flex justify-center gap-2">
              {Array.from({ length: data.pages }).map((_, i) => (
                <button 
                  key={i} 
                  onClick={() => updateFilter('page', i + 1)}
                  className={`w-10 h-10 font-bold rounded-lg transition ${Number(qs.page || 1) === i + 1 ? 'bg-indigo-900 text-white shadow-md' : 'bg-white text-indigo-900 hover:bg-indigo-50 border-2 border-gray-100'}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
