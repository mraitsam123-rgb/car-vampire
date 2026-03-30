import { Router } from "express"
import { authMiddleware } from "../utils/auth.js"
import { Notification } from "../models/Notification.js"

const router = Router()

// Get all notifications for user
router.get("/", authMiddleware, async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .populate("senderId", "name avatar")
      .sort({ createdAt: -1 })
      .limit(20)
    res.json(notifications)
  } catch (err) {
    res.status(500).json({ error: "server_error" })
  }
})

// Mark notification as read
router.put("/:id/read", authMiddleware, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { isRead: true },
      { new: true }
    )
    if (!notification) return res.status(404).json({ error: "not_found" })
    res.json(notification)
  } catch (err) {
    res.status(500).json({ error: "server_error" })
  }
})

// Mark all notifications as read
router.put("/read-all", authMiddleware, async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.user._id, isRead: false }, { isRead: true })
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: "server_error" })
  }
})

export default router
