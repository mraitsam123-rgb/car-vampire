import mongoose from "mongoose"

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    phone: { type: String },
    city: { type: String },
    avatar: { type: String },
    isVerified: { type: Boolean, default: false },
    verifyToken: { type: String },
    verifyExpires: { type: Date },
    role: { type: String, default: "user" },
    phoneRevealCount: { type: Number, default: 0 }
  },
  { timestamps: { createdAt: "createdAt" } }
)

export const User = mongoose.model("User", userSchema)
