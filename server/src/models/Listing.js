import mongoose from "mongoose"
import slugify from "slugify"

const listingSchema = new mongoose.Schema(
  {
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    category: { 
      type: String, 
      required: true, 
      enum: ["Vehicles", "Property", "Mobiles", "Electronics", "Bikes", "Business", "Services", "Jobs", "Animals", "Furniture", "Fashion"],
      index: true 
    },
    subCategory: { type: String, index: true },
    title: { type: String, required: true },
    price: { type: Number, required: true, index: true },
    city: { type: String, required: true, index: true },
    location: { type: String },
    description: { type: String, required: true },
    
    // Vehicle specific fields
    make: { type: String, index: true },
    model: { type: String, index: true },
    year: { type: Number, index: true },
    mileage: { type: Number, index: true },
    engine: { type: String },
    transmission: { type: String, index: true },
    fuelType: { type: String, index: true },
    condition: { type: String }, // Used, New
    registeredCity: { type: String },

    // Property specific fields
    propertyType: { type: String }, // House, Flat, Plot, Shop
    area: { type: String }, // e.g., 5 Marla, 1 Kanal
    bedrooms: { type: Number },
    bathrooms: { type: Number },
    isFurnished: { type: Boolean },
    phone: { type: String },

    images: [
      new mongoose.Schema(
        {
          url: { type: String, required: true },
          fileId: { type: String }
        },
        { _id: false }
      )
    ],
    status: { type: String, default: "active", index: true },
    slug: { type: String },
    expiresAt: { 
      type: Date, 
      default: () => new Date(+new Date() + 30*24*60*60*1000), 
      index: { expires: 0 } 
    }
  },
  { timestamps: { createdAt: "createdAt" } }
)

listingSchema.index({ title: "text", description: "text" })

listingSchema.pre("save", function (next) {
  const parts = [this.city, this.make, this.model, String(this._id)]
  this.slug = slugify(parts.filter(Boolean).join("-"), { lower: true, strict: true })
  next()
})

export const Listing = mongoose.model("Listing", listingSchema)
