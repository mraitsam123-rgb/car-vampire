import { Message } from "./models/Message.js"
import { Chat } from "./models/Chat.js"
import jwt from "jsonwebtoken"

export const initSocketHandlers = (io) => {
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token
    if (!token) return next(new Error("unauthorized"))
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET)
      socket.userId = payload.sub
      next()
    } catch {
      next(new Error("unauthorized"))
    }
  })
  io.on("connection", (socket) => {
    socket.on("join", (chatId) => {
      socket.join(`chat:${chatId}`)
    })
    socket.on("message", async ({ chatId, text }) => {
      const msg = await Message.create({ chatId, senderId: socket.userId, text: String(text).slice(0, 2000) })
      await Chat.findByIdAndUpdate(chatId, { lastMessageAt: new Date() })
      io.to(`chat:${chatId}`).emit("message", msg)
    })
  })
}
