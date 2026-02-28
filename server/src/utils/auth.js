import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import { User } from "../models/User.js"

export const signTokens = (user) => {
  const accessToken = jwt.sign({ sub: user._id }, process.env.JWT_SECRET, { expiresIn: "15m" })
  const refreshToken = jwt.sign({ sub: user._id }, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" })
  return { accessToken, refreshToken }
}

export const authMiddleware = async (req, res, next) => {
  const bearer = req.headers.authorization || ""
  const token = bearer.startsWith("Bearer ") ? bearer.slice(7) : null
  if (!token) return res.status(401).json({ error: "unauthorized" })
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(payload.sub).select("-passwordHash")
    if (!user) return res.status(401).json({ error: "unauthorized" })
    req.user = user
    next()
  } catch {
    res.status(401).json({ error: "unauthorized" })
  }
}

export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(password, salt)
}

export const verifyPassword = async (password, hash) => {
  return bcrypt.compare(password, hash)
}
