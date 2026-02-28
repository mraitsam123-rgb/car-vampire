import { useState } from "react"
import { createListing, uploadImages } from "../lib/api.js"

export default function PostAd() {
  const token = localStorage.getItem("accessToken")
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({ title: "", price: "", make: "", model: "", year: "", city: "", description: "" })
  const [images, setImages] = useState([])
  const [uploaded, setUploaded] = useState([])
  const [done, setDone] = useState(null)
  const onNext = () => setStep(step + 1)
  const onPrev = () => setStep(step - 1)
  const onUpload = async (files) => {
    const r = await uploadImages(token, files)
    setUploaded(r.urls)
  }
  const onSubmit = async () => {
    const payload = { ...form, price: Number(form.price), year: Number(form.year), images: uploaded }
    const r = await createListing(token, payload)
    setDone(r)
  }
  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="text-xl font-semibold mb-4">Post an Ad</div>
      {done ? (
        <div className="bg-white border rounded p-4">Created</div>
      ) : (
        <div className="bg-white border rounded p-4 space-y-4">
          {step === 1 && (
            <div className="grid gap-3">
              <input className="border rounded px-3 py-2" placeholder="Title" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} />
              <input className="border rounded px-3 py-2" placeholder="Price" value={form.price} onChange={e=>setForm({...form,price:e.target.value})} />
              <div className="flex justify-end"><button className="px-4 py-2 bg-indigo-600 text-white rounded" onClick={onNext}>Next</button></div>
            </div>
          )}
          {step === 2 && (
            <div className="grid gap-3">
              <input className="border rounded px-3 py-2" placeholder="Make" value={form.make} onChange={e=>setForm({...form,make:e.target.value})} />
              <input className="border rounded px-3 py-2" placeholder="Model" value={form.model} onChange={e=>setForm({...form,model:e.target.value})} />
              <input className="border rounded px-3 py-2" placeholder="Year" value={form.year} onChange={e=>setForm({...form,year:e.target.value})} />
              <input className="border rounded px-3 py-2" placeholder="City" value={form.city} onChange={e=>setForm({...form,city:e.target.value})} />
              <div className="flex justify-between">
                <button className="px-4 py-2 border rounded" onClick={onPrev}>Back</button>
                <button className="px-4 py-2 bg-indigo-600 text-white rounded" onClick={onNext}>Next</button>
              </div>
            </div>
          )}
          {step === 3 && (
            <div className="grid gap-3">
              <textarea className="border rounded px-3 py-2" rows="5" placeholder="Description" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} />
              <input type="file" multiple onChange={e=>{setImages(Array.from(e.target.files));}} />
              <button className="px-4 py-2 border rounded" onClick={() => onUpload(images)}>Upload Images</button>
              <div className="flex justify-between">
                <button className="px-4 py-2 border rounded" onClick={onPrev}>Back</button>
                <button className="px-4 py-2 bg-indigo-600 text-white rounded" onClick={onNext}>Next</button>
              </div>
            </div>
          )}
          {step === 4 && (
            <div className="grid gap-3">
              <div className="text-sm">Confirm and submit</div>
              <button className="px-4 py-2 bg-green-600 text-white rounded" onClick={onSubmit}>Submit</button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
