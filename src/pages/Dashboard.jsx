import { useEffect, useState } from "react"
import { getFavorites, fetchListings } from "../lib/api.js"

export default function Dashboard() {
  const token = localStorage.getItem("accessToken")
  const [favorites, setFavorites] = useState([])
  const [myAds, setMyAds] = useState([])
  useEffect(() => {
    getFavorites(token).then(setFavorites)
    fetchListings({ limit: 12 }).then(r => setMyAds(r.items))
  }, [])
  return (
    <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-12 gap-6">
      <aside className="col-span-12 md:col-span-3">
        <div className="bg-white border rounded p-4">Profile</div>
      </aside>
      <section className="col-span-12 md:col-span-9 space-y-6">
        <div className="bg-white border rounded p-4">
          <div className="font-semibold mb-3">My Ads</div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {myAds.map(it => (<div key={it._id} className="border rounded p-3">{it.title}</div>))}
          </div>
        </div>
        <div className="bg-white border rounded p-4">
          <div className="font-semibold mb-3">Favorites</div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {favorites.map(f => (<div key={f._id} className="border rounded p-3">{f.listingId?.title}</div>))}
          </div>
        </div>
      </section>
    </div>
  )
}
