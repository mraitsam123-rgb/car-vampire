import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { createListing, uploadImages } from "../lib/api.js"
import { toast } from "react-hot-toast"

const CATEGORIES = [
  { name: "Mobiles", icon: "📱" },
  { name: "Vehicles", icon: "🚗" },
  { name: "Property", icon: "🏠" },
  { name: "Electronics", icon: "📺" },
  { name: "Bikes", icon: "🏍️" },
  { name: "Business", icon: "🚜" },
  { name: "Services", icon: "🛠️" },
  { name: "Jobs", icon: "💼" },
  { name: "Animals", icon: "🐾" },
  { name: "Furniture", icon: "🛋️" },
  { name: "Fashion", icon: "👗" },
]

export default function PostAd() {
  const [step, setStep] = useState(1)
  const [category, setCategory] = useState("")
  const [form, setForm] = useState({
    title: "", price: "", city: "", description: "",
    make: "", model: "", year: "", mileage: "", 
    propertyType: "", area: "", bedrooms: "", phone: ""
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
        <div className="bg-white border rounded p-6">
          <h2 className="font-bold mb-6 text-gray-700">CHOOSE A CATEGORY</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {CATEGORIES.map(cat => (
              <button 
                key={cat.name}
                onClick={() => { setCategory(cat.name); setStep(2) }}
                className="flex flex-col items-center p-4 border rounded hover:border-indigo-600 hover:bg-indigo-50 transition group"
              >
                <span className="text-4xl mb-2">{cat.icon}</span>
                <span className="text-sm font-bold text-gray-600 group-hover:text-indigo-600">{cat.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => setStep(1)} className="text-2xl">←</button>
        <h1 className="text-2xl font-bold uppercase">Include some details</h1>
      </div>

      <form onSubmit={submit} className="bg-white border rounded p-8 space-y-6">
        <div className="border-b pb-4 mb-4">
          <span className="text-xs font-bold text-gray-400 uppercase">Selected Category</span>
          <div className="font-bold text-indigo-900">{category}</div>
        </div>

        <div className="space-y-4">
          <h3 className="font-bold text-lg">Ad Details</h3>
          <div>
            <label className="block text-sm font-bold mb-1">Ad title *</label>
            <input required className="w-full border rounded px-3 py-2" value={form.title} onChange={e=>setForm({...form, title: e.target.value})} maxLength={70} />
            <p className="text-[10px] text-gray-400 mt-1">Mention the key features of your item (e.g. brand, model, age, type)</p>
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">Description *</label>
            <textarea required className="w-full border rounded px-3 py-2 h-32" value={form.description} onChange={e=>setForm({...form, description: e.target.value})} />
          </div>
        </div>

        {category === "Vehicles" && (
          <div className="space-y-4 pt-4 border-t">
            <h3 className="font-bold text-lg">Vehicle Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <input placeholder="Make" className="border rounded px-3 py-2" value={form.make} onChange={e=>setForm({...form, make: e.target.value})} />
              <input placeholder="Model" className="border rounded px-3 py-2" value={form.model} onChange={e=>setForm({...form, model: e.target.value})} />
              <input placeholder="Year" type="number" className="border rounded px-3 py-2" value={form.year} onChange={e=>setForm({...form, year: e.target.value})} />
              <input placeholder="Mileage" type="number" className="border rounded px-3 py-2" value={form.mileage} onChange={e=>setForm({...form, mileage: e.target.value})} />
            </div>
          </div>
        )}

        {category === "Property" && (
          <div className="space-y-4 pt-4 border-t">
            <h3 className="font-bold text-lg">Property Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <select className="border rounded px-3 py-2" value={form.propertyType} onChange={e=>setForm({...form, propertyType: e.target.value})}>
                <option value="">Type</option>
                <option value="House">House</option>
                <option value="Flat">Flat</option>
                <option value="Plot">Plot</option>
              </select>
              <input placeholder="Area (e.g. 5 Marla)" className="border rounded px-3 py-2" value={form.area} onChange={e=>setForm({...form, area: e.target.value})} />
              <input placeholder="Bedrooms" type="number" className="border rounded px-3 py-2" value={form.bedrooms} onChange={e=>setForm({...form, bedrooms: e.target.value})} />
            </div>
          </div>
        )}

        <div className="space-y-4 pt-4 border-t">
          <h3 className="font-bold text-lg">Price & Contact</h3>
          <div className="grid grid-cols-2 gap-4">
            <input required type="number" placeholder="Price (Rs) *" className="border rounded px-3 py-2" value={form.price} onChange={e=>setForm({...form, price: e.target.value})} />
            <input required placeholder="City *" className="border rounded px-3 py-2" value={form.city} onChange={e=>setForm({...form, city: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1 text-indigo-900">Your Phone Number *</label>
            <div className="flex">
              <span className="inline-flex items-center px-3 border border-r-0 rounded-l bg-gray-50 text-gray-500 font-bold">+92</span>
              <input 
                required 
                type="tel"
                placeholder="3XXXXXXXXX" 
                className="w-full border rounded-r px-3 py-2 focus:ring-indigo-900 focus:border-indigo-900" 
                value={form.phone} 
                onChange={e=>setForm({...form, phone: e.target.value.replace(/\D/g, '')})} 
                maxLength={10}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t">
          <h3 className="font-bold text-lg">Upload Photos</h3>
          <div className="grid grid-cols-4 gap-2">
            {images.map(img => (
              <div key={img.fileId} className="aspect-square border rounded overflow-hidden relative">
                <img src={img.url} className="w-full h-full object-cover" />
                <button type="button" onClick={()=>setImages(images.filter(i=>i.fileId!==img.fileId))} className="absolute top-0 right-0 bg-black/50 text-white w-5 h-5 flex items-center justify-center">×</button>
              </div>
            ))}
            <label className="aspect-square border-2 border-dashed rounded flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50">
              <span className="text-2xl">+</span>
              <span className="text-[10px] font-bold">ADD PHOTO</span>
              <input type="file" multiple hidden onChange={handleUpload} disabled={uploading} />
            </label>
          </div>
        </div>

        <button 
          disabled={uploading}
          className="w-full bg-indigo-900 text-white font-bold py-4 rounded hover:bg-indigo-800 transition mt-8"
        >
          {uploading ? "Uploading..." : "POST NOW"}
        </button>
      </form>
    </div>
  )}
