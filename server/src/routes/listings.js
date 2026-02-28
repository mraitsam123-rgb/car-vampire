import { Router } from "express"
import { z } from "zod"
import { authMiddleware } from "../utils/auth.js"
import { Listing } from "../models/Listing.js"
import { upload, initUploads, uploadBuffer, deleteRemote } from "../utils/upload.js"

const router = Router()
initUploads()

const createSchema = z.object({
  category: z.enum(["Vehicles", "Property", "Mobiles", "Electronics", "Bikes", "Business", "Services", "Jobs", "Animals", "Furniture", "Fashion"]),
  subCategory: z.string().optional(),
  title: z.string().min(3),
  price: z.number(),
  city: z.string(),
  location: z.string().optional(),
  description: z.string().min(10),
  
  // Dynamic fields based on category
  make: z.string().optional(),
  model: z.string().optional(),
  year: z.number().optional(),
  mileage: z.number().optional(),
  engine: z.string().optional(),
  transmission: z.string().optional(),
  fuelType: z.string().optional(),
  condition: z.string().optional(),
  registeredCity: z.string().optional(),

  propertyType: z.string().optional(),
  area: z.string().optional(),
  bedrooms: z.number().optional(),
    bathrooms: z.number().optional(),
    isFurnished: z.boolean().optional(),
    phone: z.string().optional(),
    showWhatsApp: z.boolean().optional(),
    isWhatsApp: z.boolean().optional()
  })

router.post("/", authMiddleware, async (req, res) => {
  const parsed = createSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: "invalid_input" })
  let payload = { ...parsed.data, sellerId: req.user._id }
  if (Array.isArray(req.body.images)) {
    payload.images = req.body.images.map((x) => (typeof x === "string" ? { url: x } : x))
  }
  const listing = await Listing.create(payload)
  res.json(listing)
})

router.post("/upload", authMiddleware, upload.array("images", 8), async (req, res) => {
  if (!req.files?.length) return res.status(400).json({ error: "no_files" })
  const uploads = await Promise.all(req.files.map(f => uploadBuffer(f.buffer, "listings")))
  res.json({ urls: uploads.map(u => u.secure_url), files: uploads.map(u => ({ url: u.secure_url, fileId: u.fileId })) })
})

router.post("/:id/images", authMiddleware, upload.array("images", 8), async (req, res) => {
  const listing = await Listing.findById(req.params.id)
  if (!listing) return res.status(404).json({ error: "not_found" })
  if (String(listing.sellerId) !== String(req.user._id)) return res.status(403).json({ error: "forbidden" })
  if (!req.files?.length) return res.status(400).json({ error: "no_files" })
  const uploads = await Promise.all(req.files.map(f => uploadBuffer(f.buffer, "listings")))
  listing.images.push(...uploads.map(u => ({ url: u.secure_url, fileId: u.fileId })))
  await listing.save()
  res.json({ images: listing.images })
})

router.delete("/:id/images/:fileId", authMiddleware, async (req, res) => {
  const listing = await Listing.findById(req.params.id)
  if (!listing) return res.status(404).json({ error: "not_found" })
  if (String(listing.sellerId) !== String(req.user._id)) return res.status(403).json({ error: "forbidden" })
  const { fileId } = req.params
  await deleteRemote(fileId)
  listing.images = listing.images.filter((img) => img.fileId !== fileId)
  await listing.save()
  res.json({ images: listing.images })
})

router.put("/:id/images", authMiddleware, async (req, res) => {
  const listing = await Listing.findById(req.params.id)
  if (!listing) return res.status(404).json({ error: "not_found" })
  if (String(listing.sellerId) !== String(req.user._id)) return res.status(403).json({ error: "forbidden" })
  const order = Array.isArray(req.body.order) ? req.body.order : []
  if (!order.length) return res.status(400).json({ error: "invalid_order" })
  const map = new Map(listing.images.map(img => [img.fileId || img.url, img]))
  listing.images = order.map(key => map.get(key)).filter(Boolean)
  await listing.save()
  res.json({ images: listing.images })
})
router.get("/", async (req, res) => {
  const {
    q,
    category,
    sellerId,
    make,
    model,
    city,
    transmission,
    fuelType,
    minPrice,
    maxPrice,
    minYear,
    maxYear,
    minMileage,
    maxMileage,
    sort = "newest",
    page = 1,
    limit = 20
  } = req.query
  const filter = { status: "active" }
  if (q) {
    const regex = new RegExp(q, "i")
    filter.$or = [
      { title: regex }, 
      { description: regex }, 
      { category: regex },
      { make: regex },
      { model: regex },
      { city: regex }
    ]
  }
  if (category) filter.category = category
  if (sellerId) filter.sellerId = sellerId
  if (make) filter.make = make
  if (model) filter.model = model
  if (city) filter.city = new RegExp(city, "i") // Case insensitive city search
  if (transmission) filter.transmission = transmission
  if (fuelType) filter.fuelType = fuelType
  if (minPrice || maxPrice) filter.price = { ...(minPrice && { $gte: Number(minPrice) }), ...(maxPrice && { $lte: Number(maxPrice) }) }
  if (minYear || maxYear) filter.year = { ...(minYear && { $gte: Number(minYear) }), ...(maxYear && { $lte: Number(maxYear) }) }
  if (minMileage || maxMileage) filter.mileage = { ...(minMileage && { $gte: Number(minMileage) }), ...(maxMileage && { $lte: Number(maxMileage) }) }
  const sortMap = { newest: { createdAt: -1 }, "price-asc": { price: 1 }, "price-desc": { price: -1 } }
  const sortObj = sortMap[sort] || sortMap.newest
  const skip = (Number(page) - 1) * Number(limit)
  const [items, total] = await Promise.all([
    Listing.find(filter).sort(sortObj).skip(skip).limit(Number(limit)),
    Listing.countDocuments(filter)
  ])
  res.json({ items, total, page: Number(page), pages: Math.ceil(total / Number(limit)) })
})

router.get("/:id", async (req, res) => {
  const item = await Listing.findById(req.params.id).populate("sellerId", "name city phone avatar")
  if (!item) return res.status(404).json({ error: "not_found" })
  res.json(item)
})

router.put("/:id", authMiddleware, async (req, res) => {
  const listing = await Listing.findById(req.params.id)
  if (!listing) return res.status(404).json({ error: "not_found" })
  if (String(listing.sellerId) !== String(req.user._id)) return res.status(403).json({ error: "forbidden" })
  Object.assign(listing, req.body)
  await listing.save()
  res.json(listing)
})

router.delete("/:id", authMiddleware, async (req, res) => {
  const listing = await Listing.findById(req.params.id)
  if (!listing) return res.status(404).json({ error: "not_found" })
  if (String(listing.sellerId) !== String(req.user._id)) return res.status(403).json({ error: "forbidden" })
  await listing.deleteOne()
  res.json({ ok: true })
})

export default router
