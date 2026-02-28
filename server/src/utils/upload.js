import { v2 as cloudinary } from "cloudinary"
import ImageKit from "imagekit"
import multer from "multer"

const storage = multer.memoryStorage()
export const upload = multer({ storage })

let ik = null
export const initUploads = () => {
  if (process.env.IMAGEKIT_URL_ENDPOINT && process.env.IMAGEKIT_PUBLIC_KEY && process.env.IMAGEKIT_PRIVATE_KEY) {
    ik = new ImageKit({
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
      urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
    })
  } else {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    })
  }
}

export const uploadBuffer = async (buffer, folder = "listings") => {
  if (ik) {
    const res = await ik.upload({
      file: buffer,
      fileName: `listing_${Date.now()}.jpg`,
      folder
    })
    return { secure_url: res.url, fileId: res.fileId }
  }
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder }, (err, result) => {
      if (err) return reject(err)
      resolve({ secure_url: result.secure_url, fileId: result.public_id })
    })
    stream.end(buffer)
  })
}

export const deleteRemote = async (fileId) => {
  if (!fileId) return
  if (ik) {
    try {
      await ik.deleteFile(fileId)
    } catch {}
    return
  }
  try {
    await cloudinary.uploader.destroy(fileId)
  } catch {}
}
