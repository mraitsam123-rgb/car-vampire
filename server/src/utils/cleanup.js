import { Listing } from "../models/Listing.js"
import { deleteRemote } from "../utils/upload.js"

export const initCleanupJob = () => {
  // Run every 24 hours
  setInterval(async () => {
    try {
      console.log("Running expired listings cleanup...")
      
      // Find listings where expiresAt has passed but images haven't been cleaned up
      // Note: MongoDB TTL index handles the document deletion, 
      // but we need to catch them before they are gone or use a different approach.
      // Better approach: Find listings that are about to expire or have a 'pending_deletion' flag
      
      // To reliably delete images, we can't just rely on TTL because the doc vanishes.
      // Let's modify the strategy:
      // 1. We find listings where expiresAt < now
      // 2. We delete their images from ImageKit
      // 3. Then we let TTL delete the doc OR we delete it manually here.
      
      const now = new Date()
      const expiredListings = await Listing.find({ expiresAt: { $lte: now } })
      
      for (const listing of expiredListings) {
        console.log(`Cleaning up images for expired listing: ${listing._id}`)
        if (listing.images && listing.images.length > 0) {
          for (const img of listing.images) {
            if (img.fileId) {
              await deleteRemote(img.fileId)
            }
          }
        }
        // Manually delete since we're handling it
        await Listing.deleteOne({ _id: listing._id })
      }
      
      if (expiredListings.length > 0) {
        console.log(`Cleanup complete. Removed ${expiredListings.length} listings.`)
      }
    } catch (error) {
      console.error("Cleanup job error:", error)
    }
  }, 24 * 60 * 60 * 1000) 
}
