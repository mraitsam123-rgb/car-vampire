import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useUser } from "../context/UserContext.jsx"
import { updateMe } from "../lib/api.js"
import { toast } from "react-hot-toast"

export default function Profile() {
  const { id } = useParams()
  const { me, updateMe: setGlobalMe } = useUser()
  const navigate = useNavigate()
  const [profileUser, setProfileUser] = useState(null)
  const [userAds, setUserAds] = useState([])
  const [activeAdsCount, setActiveAdsCount] = useState(0)
  const [favAds, setFavAds] = useState([])
  const [activeTab, setActiveTab] = useState("info") // 'info', 'ads', 'favorites'
  const [formData, setFormData] = useState({ name: "", phone: "", city: "", address: "", avatar: "" })
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Determine profile identity
    let isCurrent = false;
    if (me && (me.id === id || me._id === id)) {
      isCurrent = true;
      setProfileUser(me)
      setFormData({
        name: me.name || "",
        phone: me.phone || "",
        city: me.city || "",
        address: me.address || "",
        avatar: me.avatar || ""
      })
    } else {
      // In a real app we would fetch the other user's public profile here
      // For now we'll just show what we can and rely on ads fetch.
      // We assume public listings will give us some hints.
    }

    // Fetch user ads
    const loadListings = async () => {
      try {
        const { fetchListings, getListing } = await import("../lib/api.js")
        const res = await fetchListings({ sellerId: id, limit: 100 })
        const ads = res?.items || []
        setUserAds(ads)
        setActiveAdsCount(ads.filter(ad => ad.status === 'active' || ad.expiresAt > new Date().toISOString()).length)

        if (isCurrent && me.favorites?.length > 0) {
           const favPromises = me.favorites.map(fid => {
             const actualId = typeof fid === 'object' ? (fid._id || fid.id) : fid;
             return getListing(actualId).catch(() => null)
           })
           const favResults = await Promise.all(favPromises)
           setFavAds(favResults.filter(f => f && !f.error))
        }
      } catch (err) {
        console.error("Failed to load user ads for profile", err)
      }
    }
    loadListings()
  }, [me, id])

  const isOwnProfile = me && (me.id === id || me._id === id)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await updateMe(formData)
      if (res.error) throw new Error(res.error)
      
      // Update context and force immediate state refresh
      const updatedUser = { 
        ...me, 
        ...res.user, 
        id: res.user.id || res.user._id 
      }
      setGlobalMe(updatedUser)
      setProfileUser(updatedUser)
      
      toast.success("Profile updated successfully")
      setIsEditing(false)
    } catch (err) {
      toast.error(err.message || "Failed to update profile")
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData({ ...formData, avatar: reader.result })
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="bg-[#f7f8f8] min-h-screen py-10">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="h-32 bg-[#002f34] relative">
            <div className="absolute -bottom-16 left-8 flex items-end gap-6 w-full">
              <div className="relative group shrink-0">
                <div className="w-32 h-32 rounded-full border-4 border-white bg-indigo-100 flex items-center justify-center text-4xl font-bold text-indigo-900 overflow-hidden shadow-lg">
                  {formData.avatar ? (
                    <img src={formData.avatar} className="w-full h-full object-cover" />
                  ) : (
                    formData.name?.[0] || profileUser?.name?.[0] || "U"
                  )}
                </div>
                {isEditing && (
                  <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white text-xs font-bold uppercase">Change</span>
                    <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
                  </label>
                )}
              </div>
              <div className="pb-2 flex-1 flex flex-col justify-end">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tight leading-none">{formData.name || profileUser?.name || "User Profile"}</h1>
                </div>
                <p className="text-sm text-gray-500 font-bold uppercase tracking-widest mt-1">
                  Total Ads: <span className="text-indigo-900">{userAds.length}</span> • Active Ads: <span className="text-green-600">{activeAdsCount}</span>
                </p>
              </div>
            </div>
          </div>

          <div className="pt-24 px-8 pb-10">
            {/* Tabs */}
            <div className="flex gap-6 border-b mb-8">
              <button 
                onClick={() => setActiveTab("info")}
                className={`pb-4 text-sm font-black uppercase tracking-widest transition-all ${activeTab === 'info' ? 'text-indigo-900 border-b-2 border-indigo-900' : 'text-gray-400 hover:text-gray-600'}`}
              >
                Information
              </button>
              {isOwnProfile && (
                <button 
                  onClick={() => setActiveTab("favorites")}
                  className={`pb-4 text-sm font-black uppercase tracking-widest transition-all ${activeTab === 'favorites' ? 'text-indigo-900 border-b-2 border-indigo-900' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  Favorites ({favAds.length})
                </button>
              )}
            </div>

            {activeTab === 'info' && (
              <>
            <div className="flex justify-between items-center mb-8 border-b pb-4">
              <h2 className="text-xl font-black text-indigo-900 uppercase italic">Personal Information</h2>
              {isOwnProfile && !isEditing && (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="px-6 py-2 border-2 border-indigo-900 text-indigo-900 font-bold rounded-full hover:bg-indigo-50 transition"
                >
                  Edit Profile
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Full Name</label>
                  <input 
                    type="text" 
                    disabled={!isEditing}
                    className="w-full border-2 border-gray-100 rounded-lg px-4 py-3 focus:border-indigo-900 focus:outline-none transition font-semibold disabled:bg-gray-50"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Phone Number</label>
                  <div className="flex">
                    <span className="bg-gray-100 border-2 border-r-0 border-gray-100 rounded-l-lg px-3 py-3 font-bold text-gray-500">+92</span>
                    <input 
                      type="text" 
                      disabled={!isEditing}
                      className="w-full border-2 border-gray-100 rounded-r-lg px-4 py-3 focus:border-indigo-900 focus:outline-none transition font-semibold disabled:bg-gray-50"
                      placeholder="3001234567"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">City</label>
                  <input 
                    type="text" 
                    disabled={!isEditing}
                    className="w-full border-2 border-gray-100 rounded-lg px-4 py-3 focus:border-indigo-900 focus:outline-none transition font-semibold disabled:bg-gray-50"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Address</label>
                  <input 
                    type="text" 
                    disabled={!isEditing}
                    className="w-full border-2 border-gray-100 rounded-lg px-4 py-3 focus:border-indigo-900 focus:outline-none transition font-semibold disabled:bg-gray-50"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
              </div>

              {isEditing && (
                <div className="flex gap-4 pt-6">
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="flex-1 bg-indigo-900 text-white font-bold py-4 rounded-xl hover:bg-indigo-800 transition shadow-lg disabled:opacity-50"
                  >
                    {loading ? "Saving..." : "Save Changes"}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setIsEditing(false)}
                    className="flex-1 border-2 border-gray-200 text-gray-500 font-bold py-4 rounded-xl hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </form>
            </>
            )}

            {activeTab === 'favorites' && isOwnProfile && (
              <div className="space-y-4">
                <h2 className="text-xl font-black text-indigo-900 uppercase italic mb-6">Saved Ads</h2>
                {favAds.length === 0 ? (
                  <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No favorites yet.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {favAds.map(ad => {
                      const ListingCard = require("../components/ListingCard.jsx").default;
                      return <ListingCard key={ad._id} it={ad} />
                    })}
                  </div>
                )}
                
                <div className="mt-8">
                  <button 
                    onClick={() => navigate('/favorites')}
                    className="px-6 py-2 border-2 border-indigo-900 text-indigo-900 font-bold rounded-full hover:bg-indigo-50 transition w-full uppercase tracking-widest text-xs"
                  >
                    View All Favorites Full Page
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
