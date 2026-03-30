import { Router } from "express"
import { Chat } from "../models/Chat.js"
import { Message } from "../models/Message.js"
import { Listing } from "../models/Listing.js"

const router = Router()

router.post("/start", async (req, res) => {
  const { listingId, sellerId } = req.body
  const buyerId = req.user._id
  const chat = await Chat.findOneAndUpdate(
    { listingId, buyerId, sellerId },
    { $setOnInsert: { listingId, buyerId, sellerId } },
    { upsert: true, new: true }
  )
  res.json(chat)
})

router.get("/", async (req, res) => {
  const chats = await Chat.find({ $or: [{ buyerId: req.user._id }, { sellerId: req.user._id }] })
    .sort({ updatedAt: -1 })
    .populate("listingId", "title price images category")
    .populate("buyerId", "name avatar")
    .populate("sellerId", "name avatar")
  res.json(chats)
})

router.get("/:chatId/messages", async (req, res) => {
  const chat = await Chat.findById(req.params.chatId)
  if (!chat) return res.status(404).json({ error: "chat_not_found" })
  
  // Authorization check
  if (String(chat.buyerId) !== String(req.user._id) && String(chat.sellerId) !== String(req.user._id)) {
    return res.status(403).json({ error: "unauthorized" })
  }

  const messages = await Message.find({ chatId: req.params.chatId }).sort({ createdAt: 1 })
  res.json(messages)
})

router.post("/:chatId/messages", async (req, res) => {
  const chat = await Chat.findById(req.params.chatId)
  if (!chat) return res.status(404).json({ error: "chat_not_found" })

  // Authorization check
  if (String(chat.buyerId) !== String(req.user._id) && String(chat.sellerId) !== String(req.user._id)) {
    return res.status(403).json({ error: "unauthorized" })
  }

  const text = String(req.body.text || "").slice(0, 2000)
  const msg = await Message.create({ chatId: req.params.chatId, senderId: req.user._id, text })
  await Chat.findByIdAndUpdate(req.params.chatId, { 
    lastMessage: text.slice(0, 100),
    lastMessageAt: new Date() 
  })
  res.json(msg)
})

export default router
