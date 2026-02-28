import { Router } from "express"
import { z } from "zod"
import { User } from "../models/User.js"
import { hashPassword, signTokens, verifyPassword, authMiddleware } from "../utils/auth.js"

const router = Router()

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().optional(),
  city: z.string().optional()
})

router.post("/register", async (req, res) => {
  const parsed = registerSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: "invalid_input" })
  const { name, email, password, phone, city } = parsed.data
  const exists = await User.findOne({ email })
  if (exists) return res.status(409).json({ error: "email_taken" })
  const passwordHash = await hashPassword(password)
  const verifyToken = Math.random().toString(36).slice(2, 10)
  const user = await User.create({ name, email, passwordHash, phone, city, verifyToken, verifyExpires: new Date(Date.now() + 24 * 60 * 60 * 1000) })
  const tokens = signTokens(user)
  res.json({ user: { id: user._id, name, email, isVerified: user.isVerified }, devVerifyToken: verifyToken, ...tokens })
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
})

router.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: "invalid_input" })
  const { email, password } = parsed.data
  const user = await User.findOne({ email })
  if (!user) return res.status(401).json({ error: "invalid_credentials" })
  const ok = await verifyPassword(password, user.passwordHash)
  if (!ok) return res.status(401).json({ error: "invalid_credentials" })
  const tokens = signTokens(user)
  res.json({ user: { id: user._id, name: user.name, email }, ...tokens })
})

router.get("/me", authMiddleware, async (req, res) => {
  res.json({ user: req.user })
})

router.put("/me", authMiddleware, async (req, res) => {
  const { name, phone, city, address, avatar } = req.body
  const user = await User.findById(req.user._id)
  if (!user) return res.status(404).json({ error: "not_found" })
  
  if (name) user.name = name
  if (phone) user.phone = phone
  if (city) user.city = city
  if (address) user.address = address
  if (avatar) user.avatar = avatar
  
  await user.save()
  res.json({ user })
})

router.post("/verify", async (req, res) => {
  const { email, token } = req.body || {}
  const user = await User.findOne({ email, verifyToken: token, verifyExpires: { $gt: new Date() } })
  if (!user) return res.status(400).json({ error: "invalid_token" })
  user.isVerified = true
  user.verifyToken = undefined
  user.verifyExpires = undefined
  await user.save()
  res.json({ ok: true })
})

router.post("/reveal-phone", authMiddleware, async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { $inc: { phoneRevealCount: 1 } })
  const user = await User.findById(req.user._id).select("-passwordHash")
  res.json({ user })
})

router.post("/toggle-favorite", authMiddleware, async (req, res) => {
  const { listingId } = req.body
  const user = await User.findById(req.user._id)
  if (!user) return res.status(404).json({ error: "user_not_found" })
  
  const index = user.favorites.indexOf(listingId)
  if (index === -1) {
    user.favorites.push(listingId)
  } else {
    user.favorites.splice(index, 1)
  }
  
  await user.save()
  res.json({ favorites: user.favorites })
})

export default router
