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
    // Join personal room for global notifications
    socket.join(`user:${socket.userId}`)

    socket.on("join", (chatId) => {
      socket.join(`chat:${chatId}`)
    })
    socket.on("message", async ({ chatId, text }) => {
      const chat = await Chat.findById(chatId)
      if (!chat) return
      
      // Authorization check for socket message
      if (String(chat.buyerId) !== String(socket.userId) && String(chat.sellerId) !== String(socket.userId)) {
        return
      }

      const msg = await Message.create({ chatId, senderId: socket.userId, text: String(text).slice(0, 2000) })
      await Chat.findByIdAndUpdate(chatId, { 
        lastMessage: String(text).slice(0, 100), 
        lastMessageAt: new Date() 
      })
      
      // Emit to room for real-time chat window update
      io.to(`chat:${chatId}`).emit("message", msg)
      
      // Update event for both participants to refresh their inbox lists
      const updateData = {
        chatId,
        lastMessage: msg.text,
        updatedAt: msg.createdAt,
        senderId: socket.userId
      }
      io.to(`user:${chat.buyerId}`).to(`user:${chat.sellerId}`).emit("chat_update", updateData)
      
      // Notification logic: Emit to the OTHER user's personal room
      const otherUserId = String(chat.buyerId) === String(socket.userId) ? chat.sellerId : chat.buyerId
      io.to(`user:${otherUserId}`).emit("notification", {
        type: "message",
        chatId,
        text: String(text).slice(0, 50),
        senderId: socket.userId
      })
    })
  })
}
