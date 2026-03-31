import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import { getListing } from "../lib/api.js"
import { toast } from "react-hot-toast"

export default function Report() {
  const { id } = useParams()
  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getListing(id)
      .then(res => {
        if (!res) throw new Error("Not found")
        setItem(res)
      })
      .catch(() => toast.error("Ad not found"))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 py-20 flex justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-900"></div>
    </div>
  )

  if (!item) return (
    <div className="max-w-7xl mx-auto px-4 py-20 text-center">
      <h2 className="text-2xl font-black text-indigo-900 uppercase">Ad not found</h2>
      <Link to="/" className="text-sm font-bold text-indigo-600 hover:underline uppercase tracking-widest mt-4 inline-block">
        Return Home
      </Link>
    </div>
  )

  return (
    <div className="bg-[#f7f8f8] min-h-screen py-12">
      <div className="max-w-3xl mx-auto px-4">
        
        <div className="mb-8 border-b-2 border-gray-200 pb-4">
          <h1 className="text-3xl font-black text-red-600 uppercase italic">Report an Ad</h1>
          <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mt-1">
            Please provide details about why you are reporting this listing.
          </p>
        </div>

        <div className="grid gap-8 grid-cols-1 md:grid-cols-3">
          {/* Form Section */}
          <div className="md:col-span-2">
            <form 
              action="https://formspree.io/f/xwvwbklp" 
              method="POST"
              className="bg-white border-2 border-gray-100 rounded-xl p-8 shadow-sm space-y-6"
            >
              {/* Hidden read-only fields for context */}
              <input type="hidden" name="Ad_ID" value={"QB-" + item._id?.toString().slice(-6).toUpperCase()} />
              <input type="hidden" name="Ad_Owner" value={item.sellerId?.name || "Unknown"} />
              <input type="hidden" name="Ad_Title" value={item.title || ""} />
              <input type="hidden" name="Ad_Link" value={`${window.location.origin}/listings/${item._id}`} />
              <input type="hidden" name="_subject" value={`Report: QB-${item._id?.toString().slice(-6).toUpperCase()} - ${item.title}`} />
              <input type="hidden" name="_replyto" value="aitsamalis@gmail.com" />

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Full Name *</label>
                  <input required name="Reporter_Name" placeholder="Your Name" className="w-full border-2 border-gray-100 rounded-lg px-4 py-3 focus:border-red-600 focus:outline-none transition font-black" />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Contact Number *</label>
                  <input required name="Reporter_Phone" placeholder="+92 300 0000000" className="w-full border-2 border-gray-100 rounded-lg px-4 py-3 focus:border-red-600 focus:outline-none transition font-black" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Email Address *</label>
                <input required type="email" name="Reporter_Email" placeholder="you@example.com" className="w-full border-2 border-gray-100 rounded-lg px-4 py-3 focus:border-red-600 focus:outline-none transition font-black" />
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Subject *</label>
                <select required name="Report_Subject" className="w-full border-2 border-gray-100 rounded-lg px-4 py-3 focus:border-red-600 focus:outline-none transition font-black">
                  <option value="" disabled selected>Select a reason...</option>
                  <option value="Fake Listing / Scam">Fake Listing / Scam</option>
                  <option value="Inappropriate Content">Inappropriate Content</option>
                  <option value="Item Already Sold">Item Already Sold</option>
                  <option value="Duplicate Ad">Duplicate Ad</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Detailed Description *</label>
                <textarea required name="Report_Description" rows="5" placeholder="Please provide exact details to help us investigate..." className="w-full border-2 border-gray-100 rounded-lg px-4 py-3 focus:border-red-600 focus:outline-none transition font-black" />
              </div>

              <div className="bg-red-50 p-4 border-l-4 border-red-500 rounded-r text-[10px] text-red-900 font-bold uppercase tracking-widest mt-6">
                False reporting is against our guidelines. Please ensure your report is accurate.
              </div>

              <button 
                type="submit" 
                className="w-full py-4 bg-red-600 text-white font-black rounded hover:bg-red-700 transition shadow-lg uppercase tracking-widest text-sm"
              >
                Submit Report Form
              </button>
            </form>
          </div>

          {/* Ad Info Context Section */}
          <div className="md:col-span-1 space-y-4">
            <h3 className="font-black text-indigo-900 uppercase text-xs tracking-widest mb-4 border-b pb-2">You are Reporting</h3>
            
            <div className="bg-white border-2 border-gray-100 rounded-xl p-4 shadow-sm group">
              <div className="aspect-[4/3] relative bg-gray-50 overflow-hidden rounded mb-3">
                {item.images?.[0] ? (
                  <img 
                    src={typeof item.images[0] === 'string' ? item.images[0] : item.images[0]?.url} 
                    alt={item.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition" 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">No Image</div>
                )}
              </div>
              <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b pb-2 mb-2">
                ID: QB-{item._id?.toString().slice(-6).toUpperCase()}
              </div>
              <p className="font-black text-indigo-900 text-sm leading-tight mb-2 uppercase tracking-tight line-clamp-2">
                {item.title}
              </p>
              <p className="font-black text-indigo-600 mb-2">
                Rs {item.price?.toLocaleString()}
              </p>
              
              <div className="flex items-center gap-2 pt-3 border-t">
                 <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center font-black text-indigo-900 overflow-hidden shrink-0 text-[10px]">
                  {item.sellerId?.avatar ? (
                    <img src={item.sellerId.avatar} className="w-full h-full object-cover" />
                  ) : (
                    item.sellerId?.name?.[0]
                  )}
                </div>
                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest truncate">
                  Posted by {item.sellerId?.name}
                </div>
              </div>
            </div>

            <Link to={`/listings/${item._id}`} className="block w-full py-3 border-2 border-indigo-900 text-indigo-900 text-center font-black uppercase text-[10px] rounded hover:bg-indigo-50 transition tracking-widest">
              Cancel & Return to Ad
            </Link>
          </div>

        </div>
      </div>
    </div>
  )
}
