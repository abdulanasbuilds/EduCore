import { v2 as cloudinary } from "cloudinary";
import { env } from "@/lib/env";

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

export { cloudinary };

export interface UploadResult {
  public_id: string;
  secure_url: string;
  format: string;
  width?: number;
  height?: number;
}

export async function uploadImage(
  file: Buffer | string,
  options?: {
    folder?: string;
    publicId?: string;
    transformation?: object;
  }
): Promise<UploadResult | null> {
  try {
    return new Promise((resolve, reject) => {
      const uploadOptions = {
        folder: options?.folder || "educore",
        public_id: options?.publicId,
        transformation: options?.transformation,
        resource_type: "auto" as const,
      };

      if (typeof file === "string") {
        cloudinary.uploader.upload(file, uploadOptions, (error, result) => {
          if (error) reject(error);
          else resolve(result as UploadResult);
        });
      } else {
        cloudinary.uploader
          .upload_stream(uploadOptions, (error, result) => {
            if (error) reject(error);
            else resolve(result as UploadResult);
          })
          .end(file);
      }
    });
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    return null;
  }
}

export async function deleteImage(publicId: string): Promise<boolean> {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === "ok";
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    return false;
  }
}

export function getOptimizedUrl(
  publicId: string,
  options?: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: string | number;
  }
): string {
  return cloudinary.url(publicId, {
    transformation: [
      {
        width: options?.width || "auto",
        height: options?.height || "auto",
        crop: options?.crop || "fill",
        quality: options?.quality || "auto",
        fetch_format: "auto",
      },
    ],
  });
}