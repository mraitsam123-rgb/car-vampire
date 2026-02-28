import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { createListing, uploadImages } from "../lib/api.js"
import { toast } from "react-hot-toast"

const CATEGORIES = [
  { name: "Mobiles", icon: "https://www.olx.com.pk/assets/mobiles.8bc37032159080bd1d9439ca2148ad4a.png" },
  { name: "Vehicles", icon: "https://www.olx.com.pk/assets/vehicles.29eccf7119f1f0a05f884501a403079a.png" },
  { name: "Property", icon: "https://www.olx.com.pk/assets/property-for-sale.e3a39529944f54e803878f30ee94589d.png" },
  { name: "Electronics", icon: "https://www.olx.com.pk/assets/electronics-home-appliances.964259e88383e742e97b415e9820524c.png" },
  { name: "Bikes", icon: "https://www.olx.com.pk/assets/bikes.4273059434863f64024f28522e8ca92e.png" },
  { name: "Business", icon: "https://www.olx.com.pk/assets/business-industrial-agriculture.704a6ff4f90117094258f1f7375a0651.png" },
  { name: "Services", icon: "https://www.olx.com.pk/assets/services.0645f782c5a09b304c10a48545e8b417.png" },
  { name: "Jobs", icon: "https://www.olx.com.pk/assets/jobs.79e5058721447e7b572e811f586b8f10.png" },
  { name: "Animals", icon: "https://www.olx.com.pk/assets/animals.62d396440f8087796378f773b063806a.png" },
  { name: "Furniture", icon: "https://www.olx.com.pk/assets/furniture-home-decor.31a89c3664c01f60447387e02554d393.png" },
  { name: "Fashion", icon: "https://www.olx.com.pk/assets/fashion-beauty.dd29013233866b1a3e3519c23f6631b7.png" },
]

export default function PostAd() {
  const [step, setStep] = useState(1)
  const [category, setCategory] = useState("")
  const [form, setForm] = useState({
    title: "", price: "", city: "", description: "",
    make: "", model: "", year: "", mileage: "", 
    propertyType: "", area: "", bedrooms: "", phone: "",
    showWhatsApp: false
  })
  const [images, setImages] = useState([])
  const [uploading, setUploading] = useState(false)
  const navigate = useNavigate()
  const token = localStorage.getItem("accessToken")

  const handleUpload = async (e) => {
    setUploading(true)
    try {
      const res = await uploadImages(token, e.target.files)
      setImages([...images, ...res.files])
    } finally {
      setUploading(false)
    }
  }

  const submit = async (e) => {
    e.preventDefault()
    if (images.length === 0) {
      toast.error("Please upload at least one photo")
      return
    }
    if (!form.phone || form.phone.length < 10) {
      toast.error("Please enter a valid phone number")
      return
    }
    const loadingToast = toast.loading("Posting your ad...")
    try {
      const payload = { 
        ...form, 
        category, 
        price: Number(form.price),
        year: form.year ? Number(form.year) : undefined,
        mileage: form.mileage ? Number(form.mileage) : undefined,
        bedrooms: form.bedrooms ? Number(form.bedrooms) : undefined,
        images 
      }
      await createListing(token, payload)
      toast.success("Ad posted successfully!", { id: loadingToast })
      navigate("/")
    } catch (err) {
      toast.error("Failed to post ad. Please check all fields.", { id: loadingToast })
    }
  }

  if (step === 1) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold text-center mb-8 uppercase">Post Your Ad</h1>
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
        <h1 className="text-2xl font-black text-indigo-900 uppercase italic">Include some details</h1>
      </div>

      <div className="grid grid-cols-12 gap-8">
        <form onSubmit={submit} className="col-span-12 lg:col-span-8 bg-white border-2 border-gray-100 rounded-xl p-8 space-y-10 shadow-sm">
          {/* Category Display */}
          <div className="flex items-center justify-between border-b-2 border-gray-50 pb-6">
            <div>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Selected Category</span>
              <div className="font-black text-indigo-900 flex items-center gap-2">
                <span className="text-xl">{CATEGORIES.find(c => c.name === category)?.icon}</span>
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
              {images.map(img => (
                <div key={img.fileId} className="aspect-square border-2 border-gray-100 rounded-xl overflow-hidden relative group">
                  <img src={img.url} className="w-full h-full object-cover" />
                  <button type="button" onClick={()=>setImages(images.filter(i=>i.fileId!==img.fileId))} className="absolute top-1 right-1 bg-red-500 text-white w-5 h-5 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity">×</button>
                </div>
              ))}
              {Array.from({ length: Math.max(0, 14 - images.length - 1) }).map((_, i) => (
                <div key={i} className="aspect-square border-2 border-gray-50 rounded-xl flex items-center justify-center text-gray-200 bg-gray-50/50">
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
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Make *</label>
                  <input required placeholder="Select make" className="w-full border-2 border-gray-100 rounded-lg px-4 py-3 focus:border-indigo-900 focus:outline-none transition" value={form.make} onChange={e=>setForm({...form, make: e.target.value})} />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Model *</label>
                  <input required placeholder="Model" className="w-full border-2 border-gray-100 rounded-lg px-4 py-3 focus:border-indigo-900 focus:outline-none transition" value={form.model} onChange={e=>setForm({...form, model: e.target.value})} />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Year *</label>
                  <input required placeholder="Year" type="number" className="w-full border-2 border-gray-100 rounded-lg px-4 py-3 focus:border-indigo-900 focus:outline-none transition" value={form.year} onChange={e=>setForm({...form, year: e.target.value})} />
                </div>
              </div>
            )}

            <div className="space-y-4">
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
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">City *</label>
                <input required placeholder="Select location" className="w-full border-2 border-gray-100 rounded-lg px-4 py-3 focus:border-indigo-900 focus:outline-none transition" value={form.city} onChange={e=>setForm({...form, city: e.target.value})} />
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
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Your Name</label>
                <div className="font-black text-indigo-900 px-1">S. Attsam Shah</div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Phone Number *</label>
                <div className="flex">
                  <span className="inline-flex items-center px-4 border-2 border-r-0 border-gray-100 rounded-l-lg bg-gray-50 text-gray-500 font-black">+92</span>
                  <input 
                    required 
                    type="tel"
                    placeholder="3XXXXXXXXX" 
                    className="w-full border-2 border-gray-100 rounded-r-lg px-4 py-3 focus:border-indigo-900 focus:outline-none transition font-black" 
                    value={form.phone} 
                    onChange={e=>setForm({...form, phone: e.target.value.replace(/\D/g, '')})} 
                    maxLength={10}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-indigo-50/50 rounded-xl border-2 border-indigo-100">
                <span className="text-sm font-black text-indigo-900 uppercase tracking-tight">Show my phone number in ads</span>
                <button 
                  type="button"
                  onClick={() => setForm({...form, showWhatsApp: !form.showWhatsApp})}
                  className={`w-12 h-6 rounded-full transition-colors relative ${form.showWhatsApp ? 'bg-indigo-900' : 'bg-gray-300'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${form.showWhatsApp ? 'left-7' : 'left-1'}`}></div>
                </button>
              </div>
            </div>
          </div>

          <button 
            disabled={uploading}
            className="w-full bg-indigo-900 text-white font-black py-5 rounded-xl hover:bg-indigo-800 transition-all shadow-xl hover:shadow-indigo-900/20 uppercase tracking-widest mt-10 disabled:bg-gray-400"
          >
            {uploading ? "Uploading Photos..." : "Post Now"}
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
