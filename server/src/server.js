import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import dotenv from "dotenv"
import { connectDB } from "./utils/db.js"
import { initUploads } from "./utils/upload.js"
import { initCleanupJob } from "./utils/cleanup.js"
import authRoutes from "./routes/auth.js"
import listingRoutes from "./routes/listings.js"
import chatRoutes from "./routes/chats.js"
import { authMiddleware } from "./utils/auth.js"
import { loginLimiter } from "./utils/ratelimit.js"
import path from "path"
import { fileURLToPath } from "url"
import fs from "fs"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config()
connectDB()
initUploads()
initCleanupJob()
const app = express()

// Trust proxy for Hugging Face/Vercel (required for express-rate-limit)
app.set("trust proxy", 1)

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173", credentials: true }))
app.use(express.json({ limit: "10mb" }))
app.use(cookieParser())

// Serve static files if build exists
const distPath = path.resolve(__dirname, "../client/dist")
const distPathAlternative = path.resolve(__dirname, "../../client/dist")
const finalDistPath = fs.existsSync(distPath) ? distPath : (fs.existsSync(distPathAlternative) ? distPathAlternative : distPath)

if (fs.existsSync(finalDistPath)) {
  console.log("Serving static files from:", finalDistPath)
  app.use(express.static(finalDistPath))
} else {
  console.warn("Warning: Static build directory not found at:", finalDistPath)
}

app.use("/api/auth/login", loginLimiter)
app.use("/api/auth", authRoutes)
app.use("/api/listings", listingRoutes)
app.use("/api/chats", authMiddleware, chatRoutes)
app.get("/api/health", (req, res) => res.json({ ok: true }))

// Fallback to index.html for SPA
app.get("*", (req, res) => {
  const indexPath = path.join(finalDistPath, "index.html")
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath)
  } else {
    res.status(404).send(`Cannot GET ${req.url} (Static build not found). Please run 'npm run build' in the client folder. (Checked paths: ${distPath}, ${distPathAlternative})`)
  }
})

export default app
