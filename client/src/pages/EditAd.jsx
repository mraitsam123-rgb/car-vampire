import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { updateListing, uploadImages, getListing } from "../lib/api.js"
import { toast } from "react-hot-toast"
import { useUser } from "../context/UserContext.jsx"

const CATEGORIES = [
  { name: "Mobiles", icon: "/logos/mobile logo.png" },
  { name: "Vehicles", icon: "/logos/car logo.png" },
  { name: "Property", icon: "/logos/property.png" },
  { name: "Electronics", icon: "/logos/electronics logo.png" },
  { name: "Bikes", icon: "/logos/bike logo.png" },
  { name: "Business", icon: "/logos/bussiness logo.png" },
  { name: "Services", icon: "/logos/services logo.png" },
  { name: "Jobs", icon: "/logos/jobs logo.png" },
  { name: "Animals", icon: "/logos/animals logo.png" },
  { name: "Furniture", icon: "/logos/furniture logo.png" },
  { name: "Fashion", icon: "/logos/fashion logo.png" },
]

const CAR_MAKES = {
  Toyota: ["Corolla", "Civic", "Prado", "Land Cruiser", "Hilux", "Vitz", "Yaris", "Fortuner"],
  Honda: ["Civic", "City", "Vezel", "BR-V", "Accord", "CR-V"],
  Suzuki: ["Alto", "Mehran", "Cultus", "Wagon R", "Swift", "Bolan", "Every", "Liana"],
  Hyundai: ["Elantra", "Tucson", "Sonata", "Santa Fe"],
  Kia: ["Sportage", "Picanto", "Stonic", "Sorento"],
  Changan: ["Alsvin", "Karvaan"],
  MG: ["HS", "ZS", "MG5"]
}

const MOBILE_BRANDS = ["Apple", "Samsung", "Vivo", "Oppo", "Infinix", "Xiaomi", "Realme", "Tecno", "Google", "Huawei"]

const PROPERTY_TYPES = ["House", "Flat", "Plot", "Commercial", "Other"]

export default function EditAd() {
  const { id } = useParams()
  const { me } = useUser()
  const [step, setStep] = useState(1)
  const [category, setCategory] = useState("")
  const [form, setForm] = useState({
    title: "", price: "", city: "", location: "", description: "",
    make: "", model: "", customModel: "", year: "", mileage: "", engine: "",
    fuelType: "Petrol", transmission: "Manual", condition: "Used",
    brand: "", storage: "128GB",
    propertyType: "House", area: "", bedrooms: "1",
    phone: "", showPhone: true, isWhatsApp: true
  })
  const [images, setImages] = useState([])
  const [uploading, setUploading] = useState(false)
  const navigate = useNavigate()
  const token = localStorage.getItem("accessToken")

  useEffect(() => {
    if (!id) return
    const fetchAd = async () => {
      try {
        const ad = await getListing(id)
        if (ad.sellerId._id !== (me?.id || me?._id)) {
          toast.error("You are not authorized to edit this ad")
          navigate("/dashboard")
          return
        }
        setCategory(ad.category)
        setForm({
          title: ad.title || "", price: ad.price || "", city: ad.city || "", location: ad.location || "", description: ad.description || "",
          make: ad.make || "", model: CAR_MAKES[ad.make]?.includes(ad.model) ? ad.model : "Other", customModel: !CAR_MAKES[ad.make]?.includes(ad.model) ? ad.model : "", year: ad.year || "", mileage: ad.mileage || "", engine: ad.engine || "", 
          fuelType: ad.fuelType || "Petrol", transmission: ad.transmission || "Manual", condition: ad.condition || "Used",
          brand: ad.brand || "", storage: ad.storage || "128GB",
          propertyType: ad.propertyType || "House", area: ad.area || "", bedrooms: ad.bedrooms || "1",
          phone: ad.phone || "", showPhone: ad.showWhatsApp !== undefined ? ad.showWhatsApp : true, isWhatsApp: ad.isWhatsApp !== undefined ? ad.isWhatsApp : true
        })
        setImages(ad.images || [])
        setStep(2) // Jump straight to edit details
      } catch (err) {
        toast.error("Failed to load ad details")
        navigate(-1)
      }
    }
    if (me) fetchAd()
  }, [id, me, navigate])

  const handleUpload = async (e) => {
    setUploading(true)
    try {
      const res = await uploadImages(token, e.target.files)
      setImages([...images, ...res.files])
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!token) return toast.error("Please login to post an ad")
    if (!images || images?.length === 0) {
      toast.error("Please upload at least one image")
      return
    }
    if (!form?.phone || form?.phone?.length < 7) {
      toast.error("Please enter a valid phone number")
      return
    }

    setUploading(true)
    try {
      const payload = {
        ...form,
        category,
        model: form.model === "Other" ? form.customModel : form.model,
        price: Number(form.price),
        year: form.year ? Number(form.year) : undefined,
        mileage: form.mileage ? Number(form.mileage) : undefined,
        bedrooms: form.bedrooms ? Number(form.bedrooms) : undefined,
        images: images,
        sellerId: me?.id || me?._id
      }
      const data = await updateListing(id, payload)
      if (data?._id) {
        toast.success("Ad updated successfully!")
        navigate(`/listings/${data._id}`)
      }
    } catch (err) {
      toast.error(err.message || "Failed to post ad")
    } finally {
      setUploading(false)
    }
  }

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser")
      return
    }
    toast.loading("Fetching location...", { id: "gps" })
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json`)
          const data = await res.json()
          const city = data.address?.city || data.address?.town || data.address?.state || "Unknown"
          setForm({ ...form, city: city, location: data.display_name })
          toast.success("Location acquired", { id: "gps" })
        } catch (e) {
          setForm({ ...form, city: "Current Location", location: `${pos.coords.latitude},${pos.coords.longitude}` })
          toast.success("Coordinates acquired", { id: "gps" })
        }
      },
      () => toast.error("Failed to get location", { id: "gps" })
    )
  }

  if (step === 1) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold text-center mb-8 uppercase">Edit Your Ad</h1>
        <div className="bg-white border-2 border-gray-100 rounded-xl p-8 shadow-sm">
          <h2 className="font-black text-indigo-900 mb-8 uppercase tracking-widest text-sm">CHOOSE A CATEGORY</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {CATEGORIES.map(cat => (
              <button 
                key={cat.name}
                onClick={() => { setCategory(cat.name); setStep(2) }}
                className="flex flex-col items-center p-6 border-2 border-gray-50 rounded-xl hover:border-indigo-600 hover:bg-indigo-50 transition-all group"
              >
                <div className="w-16 h-16 mb-4 flex items-center justify-center">
                  <img src={cat.icon} alt={cat.name} className="w-full h-full object-contain group-hover:scale-110 transition-transform" />
                </div>
                <span className="text-[10px] font-black text-gray-500 group-hover:text-indigo-900 uppercase tracking-widest">{cat.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex items-center gap-4 mb-10">
        <button onClick={() => setStep(1)} className="text-2xl hover:text-indigo-600 transition">←</button>
        <h1 className="text-2xl font-black text-indigo-900 uppercase italic">Edit your details</h1>
      </div>

      <div className="grid grid-cols-12 gap-8">
        <form onSubmit={handleSubmit} className="col-span-12 lg:col-span-8 bg-white border-2 border-gray-100 rounded-xl p-8 space-y-10 shadow-sm">
          {/* Category Display */}
          <div className="flex items-center justify-between border-b-2 border-gray-50 pb-6">
            <div>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Selected Category</span>
              <div className="font-black text-indigo-900 flex items-center gap-2">
                <img src={CATEGORIES.find(c => c.name === category)?.icon} alt={category} className="w-6 h-6 object-contain" />
                {category}
              </div>
            </div>
            <button type="button" onClick={() => setStep(1)} className="text-xs font-black text-indigo-600 hover:underline uppercase">Change</button>
          </div>

          {/* Image Upload Grid */}
          <div className="space-y-4">
            <h3 className="font-black text-indigo-900 uppercase text-xs tracking-widest">Upload Photos</h3>
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-7 gap-3">
              <label className="aspect-square border-2 border-dashed border-indigo-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-indigo-50 transition group">
                <span className="text-2xl text-indigo-400 group-hover:scale-125 transition-transform">+</span>
                <input type="file" multiple hidden onChange={handleUpload} disabled={uploading} />
              </label>
              {images?.map(img => (
                <div key={img?.fileId} className="aspect-square border-2 border-gray-100 rounded-xl overflow-hidden relative group">
                  <img src={img?.url} className="w-full h-full object-cover" />
                  <button type="button" onClick={()=>setImages(images.filter(i=>i?.fileId!==img?.fileId))} className="absolute top-1 right-1 bg-red-500 text-white w-5 h-5 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity">×</button>
                </div>
              ))}
              {Array.from({ length: Math.max(0, 14 - (images?.length || 0) - 1) }).map((_, i) => (
                <div key={i} className="aspect-square border-2 border-gray-100 rounded-xl flex items-center justify-center text-gray-200 bg-gray-50/50">
                  📷
                </div>
              ))}
            </div>
            <p className="text-[9px] font-bold text-gray-400 uppercase italic">For the cover picture we recommend using the landscape mode.</p>
          </div>

          {/* Ad Details */}
          <div className="space-y-6 pt-6 border-t-2 border-gray-50">
            <h3 className="font-black text-indigo-900 uppercase text-xs tracking-widest">Item Details</h3>
            
            {category === "Vehicles" && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Make *</label>
                    <select required className="w-full border-2 border-gray-100 rounded-lg px-4 py-3 focus:border-indigo-900 focus:outline-none transition" value={form.make} onChange={e=>setForm({...form, make: e.target.value, model: ""})}>
                      <option value="">Select Make</option>
                      {Object.keys(CAR_MAKES).map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Model *</label>
                    <select required className="w-full border-2 border-gray-100 rounded-lg px-4 py-3 focus:border-indigo-900 focus:outline-none transition" value={form.model} onChange={e=>setForm({...form, model: e.target.value})} disabled={!form.make}>
                      <option value="">Select Model</option>
                      {form.make && CAR_MAKES[form.make].map(m => <option key={m} value={m}>{m}</option>)}
                      <option value="Other">I did not find my variant</option>
                    </select>
                  </div>
                </div>
                {form.model === "Other" && (
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Custom Variant *</label>
                    <input required type="text" placeholder="Enter your vehicle variant" className="w-full border-2 border-gray-100 rounded-lg px-4 py-3 focus:border-indigo-900 focus:outline-none transition" value={form.customModel} onChange={e=>setForm({...form, customModel: e.target.value})} />
                  </div>
                )}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Year *</label>
                    <input required type="number" placeholder="2024" className="w-full border-2 border-gray-100 rounded-lg px-4 py-3 focus:border-indigo-900 focus:outline-none transition" value={form.year} onChange={e=>setForm({...form, year: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Fuel Type *</label>
                    <select required className="w-full border-2 border-gray-100 rounded-lg px-4 py-3 focus:border-indigo-900 focus:outline-none transition" value={form.fuelType} onChange={e=>setForm({...form, fuelType: e.target.value})}>
                      <option value="Petrol">Petrol</option>
                      <option value="Diesel">Diesel</option>
                      <option value="Hybrid">Hybrid</option>
                      <option value="Electric">Electric</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Transmission *</label>
                    <select required className="w-full border-2 border-gray-100 rounded-lg px-4 py-3 focus:border-indigo-900 focus:outline-none transition" value={form.transmission} onChange={e=>setForm({...form, transmission: e.target.value})}>
                      <option value="Manual">Manual</option>
                      <option value="Automatic">Automatic</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Mileage (KM) *</label>
                    <input required type="number" placeholder="50000" className="w-full border-2 border-gray-100 rounded-lg px-4 py-3 focus:border-indigo-900 focus:outline-none transition" value={form.mileage} onChange={e=>setForm({...form, mileage: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Engine Capacity *</label>
                    <input required type="text" placeholder="1300 cc" className="w-full border-2 border-gray-100 rounded-lg px-4 py-3 focus:border-indigo-900 focus:outline-none transition" value={form.engine || ""} onChange={e=>setForm({...form, engine: e.target.value})} />
                  </div>
                </div>
              </div>
            )}

            {category === "Mobiles" && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Brand *</label>
                    <select required className="w-full border-2 border-gray-100 rounded-lg px-4 py-3 focus:border-indigo-900 focus:outline-none transition" value={form.brand} onChange={e=>setForm({...form, brand: e.target.value})}>
                      <option value="">Select Brand</option>
                      {MOBILE_BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Storage *</label>
                    <select required className="w-full border-2 border-gray-100 rounded-lg px-4 py-3 focus:border-indigo-900 focus:outline-none transition" value={form.storage} onChange={e=>setForm({...form, storage: e.target.value})}>
                      <option value="32GB">32GB</option>
                      <option value="64GB">64GB</option>
                      <option value="128GB">128GB</option>
                      <option value="256GB">256GB</option>
                      <option value="512GB">512GB</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {category === "Property" && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Property Type *</label>
                    <select required className="w-full border-2 border-gray-100 rounded-lg px-4 py-3 focus:border-indigo-900 focus:outline-none transition" value={form.propertyType} onChange={e=>setForm({...form, propertyType: e.target.value})}>
                      {PROPERTY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Bedrooms *</label>
                    <select required className="w-full border-2 border-gray-100 rounded-lg px-4 py-3 focus:border-indigo-900 focus:outline-none transition" value={form.bedrooms} onChange={e=>setForm({...form, bedrooms: e.target.value})}>
                      {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Area (e.g. 5 Marla, 1 Kanal) *</label>
                  <input required placeholder="5 Marla" className="w-full border-2 border-gray-100 rounded-lg px-4 py-3 focus:border-indigo-900 focus:outline-none transition" value={form.area} onChange={e=>setForm({...form, area: e.target.value})} />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase mb-3">Condition *</label>
              <div className="flex gap-4">
                {["New", "Used"].map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setForm({...form, condition: c})}
                    className={`px-8 py-2 rounded-full border-2 font-black text-[10px] uppercase transition-all ${form.condition === c ? 'bg-indigo-900 border-indigo-900 text-white shadow-lg' : 'bg-white border-gray-100 text-gray-400 hover:border-indigo-200'}`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t-2 border-gray-50">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Ad Title *</label>
                <input required className="w-full border-2 border-gray-100 rounded-lg px-4 py-3 focus:border-indigo-900 focus:outline-none transition" value={form.title} onChange={e=>setForm({...form, title: e.target.value})} maxLength={70} />
                <p className="text-[9px] text-gray-400 mt-1 font-bold">Mention the key features of your item (e.g. brand, model, age, type)</p>
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Description *</label>
                <textarea required className="w-full border-2 border-gray-100 rounded-lg px-4 py-3 h-40 focus:border-indigo-900 focus:outline-none transition" value={form.description} onChange={e=>setForm({...form, description: e.target.value})} />
                <p className="text-[9px] text-gray-400 mt-1 font-bold">Include condition, features and reason for selling</p>
              </div>
            </div>
          </div>

          {/* Location & Price */}
          <div className="space-y-6 pt-6 border-t-2 border-gray-50">
            <h3 className="font-black text-indigo-900 uppercase text-xs tracking-widest">Location & Price</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-[10px] font-black text-gray-400 uppercase">City / Location *</label>
                  <button type="button" onClick={handleGetCurrentLocation} className="text-[10px] font-black text-indigo-600 hover:underline uppercase flex items-center gap-1">
                    📍 Use Current Location
                  </button>
                </div>
                <input required placeholder="Select location" className="w-full border-2 border-gray-100 rounded-lg px-4 py-3 focus:border-indigo-900 focus:outline-none transition mb-2" value={form.city} onChange={e=>setForm({...form, city: e.target.value})} />
                {form.location && <p className="text-xs text-green-600 font-black">GPS: {form.location}</p>}
              </div>
              <div className="col-span-2">
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Price *</label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 font-black text-gray-400">Rs</span>
                  <input required type="number" placeholder="Enter Price" className="w-full border-2 border-gray-100 rounded-lg pl-12 pr-4 py-3 focus:border-indigo-900 focus:outline-none transition font-black" value={form.price} onChange={e=>setForm({...form, price: e.target.value})} />
                </div>
              </div>
            </div>
          </div>

          {/* Seller Details */}
          <div className="space-y-6 pt-6 border-t-2 border-gray-50">
            <h3 className="font-black text-indigo-900 uppercase text-xs tracking-widest">Review your details</h3>
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
              <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center font-black text-indigo-900 border-2 border-white shadow-sm overflow-hidden">
                {me?.avatar ? <img src={me.avatar} className="w-full h-full object-cover" /> : me?.name?.[0]}
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Seller Name</p>
                <p className="font-black text-indigo-900 uppercase">{me?.name}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Phone Number *</label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 font-black text-gray-400">+92</span>
                  <input required placeholder="300 1234567" className="w-full border-2 border-gray-100 rounded-lg pl-12 pr-4 py-3 focus:border-indigo-900 focus:outline-none transition font-black" value={form.phone} onChange={e=>setForm({...form, phone: e.target.value})} />
                </div>
              </div>
              <div className="flex items-center justify-between p-4 border-2 border-gray-50 rounded-xl">
                <div>
                  <p className="font-black text-indigo-900 text-xs uppercase">Show my phone number</p>
                  <p className="text-[9px] text-gray-400 font-bold uppercase">Buyers will be able to call you directly</p>
                </div>
                <button 
                  type="button"
                  onClick={() => setForm({...form, showPhone: !form.showPhone})}
                  className={`w-12 h-6 rounded-full transition-all relative ${form.showPhone ? 'bg-indigo-900' : 'bg-gray-200'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${form.showPhone ? 'right-1' : 'left-1'}`}></div>
                </button>
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={uploading}
            className="w-full py-5 bg-[#002f34] text-white font-black rounded hover:bg-[#003d44] transition-all shadow-xl uppercase tracking-widest text-sm disabled:opacity-50"
          >
            {uploading ? "Updating Photos..." : "Update Ad"}
          </button>
        </form>

        {/* Sidebar Help */}
        <aside className="hidden lg:block lg:col-span-4">
          <div className="bg-indigo-900 text-white rounded-xl p-8 sticky top-24 space-y-6 shadow-xl">
            <h4 className="text-xl font-black uppercase italic italic border-b border-indigo-800 pb-4">Need help?</h4>
            <ul className="space-y-4 text-sm font-bold text-indigo-200">
              <li className="flex gap-3"><span>✅</span> Use clear photos of your item.</li>
              <li className="flex gap-3"><span>✅</span> Be descriptive in your title.</li>
              <li className="flex gap-3"><span>✅</span> Set a fair price for faster sales.</li>
              <li className="flex gap-3"><span>✅</span> Respond to chats quickly.</li>
            </ul>
            <div className="pt-6 border-t border-indigo-800">
              <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400">You can always come back to change your ad details later.</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
