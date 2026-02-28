import mongoose from "mongoose"

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI || "mongodb://127.0.0.1:27017/garage"
  const dbName = process.env.MONGODB_DB || process.env.MONGO_DB || "garage"
  try {
    console.log("Connecting to MongoDB...")
    await mongoose.connect(uri, {
      dbName,
      serverSelectionTimeoutMS: Number(process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS) || 10000
    })
    console.log("MongoDB Connected ✅")
  } catch (error) {
    console.error("MongoDB Connection Error ❌", error)
    process.exit(1)
  }
}
