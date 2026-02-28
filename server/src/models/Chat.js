import mongoose from "mongoose"

const chatSchema = new mongoose.Schema(
  {
    listingId: { type: mongoose.Schema.Types.ObjectId, ref: "Listing", required: true, index: true },
    buyerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    lastMessageAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
)
chatSchema.index({ listingId: 1, buyerId: 1, sellerId: 1 }, { unique: true })
export const Chat = mongoose.model("Chat", chatSchema)
