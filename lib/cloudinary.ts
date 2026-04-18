import { v2 as cloudinary } from "cloudinary"
import { env, features } from "@/lib/env"

if (features.imageUploadEnabled) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true,
  })
}

export async function uploadImage(
  file: string,
  folder: string
): Promise<{ url: string; publicId: string } | null> {
  if (!features.imageUploadEnabled) {
    console.warn("Image upload disabled — Cloudinary not configured")
    return null
  }

  try {
    const result = await cloudinary.uploader.upload(file, {
      folder,
      resource_type: "auto",
    })
    return {
      url: result.secure_url,
      publicId: result.public_id,
    }
  } catch (error: any) {
    console.error("Cloudinary upload failed:", error.message)
    return null
  }
}

export async function deleteImage(publicId: string): Promise<boolean> {
  if (!features.imageUploadEnabled) return false
  
  try {
    await cloudinary.uploader.destroy(publicId)
    return true
  } catch (error: any) {
    console.error("Cloudinary delete failed:", error.message)
    return false
  }
}
