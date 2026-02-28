import { Router } from "express"
import { authMiddleware } from "../utils/auth.js"
import { Favorite } from "../models/Favorite.js"
import { Listing } from "../models/Listing.js"

const router = Router()

router.post("/:listingId", authMiddleware, async (req, res) => {
  const listingId = req.params.listingId
  const exists = await Favorite.findOne({ userId: req.user._id, listingId })
  if (exists) {
    await Favorite.deleteOne({ _id: exists._id })
    return res.json({ saved: false })
  }
  await Favorite.create({ userId: req.user._id, listingId })
  res.json({ saved: true })
})

router.get("/", authMiddleware, async (req, res) => {
  const favorites = await Favorite.find({ userId: req.user._id }).populate({
    path: "listingId",
    model: Listing
  })
  res.json(favorites)
})

export default router
