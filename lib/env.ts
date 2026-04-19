import { z } from "zod"

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),

  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_PHONE_NUMBER: z.string().optional(),

  RESEND_API_KEY: z.string().optional(),

  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),

  UPSTASH_REDIS_REST_URL: z.string().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),

  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  CRON_SECRET: z.string().optional(),

  NODE_ENV: z.enum(["development", "production", "test"]).optional(),
})

const result = envSchema.safeParse(process.env)
const data = result.success ? result.data : {}

export const env = {
  NEXT_PUBLIC_SUPABASE_URL: data.NEXT_PUBLIC_SUPABASE_URL || "",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: data.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
  SUPABASE_SERVICE_ROLE_KEY: data.SUPABASE_SERVICE_ROLE_KEY || "",
  TWILIO_ACCOUNT_SID: data.TWILIO_ACCOUNT_SID || "",
  TWILIO_AUTH_TOKEN: data.TWILIO_AUTH_TOKEN || "",
  TWILIO_PHONE_NUMBER: data.TWILIO_PHONE_NUMBER || "",
  RESEND_API_KEY: data.RESEND_API_KEY || "",
  CLOUDINARY_CLOUD_NAME: data.CLOUDINARY_CLOUD_NAME || "",
  CLOUDINARY_API_KEY: data.CLOUDINARY_API_KEY || "",
  CLOUDINARY_API_SECRET: data.CLOUDINARY_API_SECRET || "",
  UPSTASH_REDIS_REST_URL: data.UPSTASH_REDIS_REST_URL || "",
  UPSTASH_REDIS_REST_TOKEN: data.UPSTASH_REDIS_REST_TOKEN || "",
  NEXT_PUBLIC_APP_URL: data.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  CRON_SECRET: data.CRON_SECRET || "",
  NODE_ENV: data.NODE_ENV || "development",
}

export const features = {
  supabaseEnabled: !!(data.NEXT_PUBLIC_SUPABASE_URL && data.NEXT_PUBLIC_SUPABASE_ANON_KEY),
  smsEnabled: !!(data.TWILIO_ACCOUNT_SID && data.TWILIO_AUTH_TOKEN),
  emailEnabled: !!data.RESEND_API_KEY,
  imageUploadEnabled: !!data.CLOUDINARY_CLOUD_NAME,
  rateLimitEnabled: !!data.UPSTASH_REDIS_REST_URL,
}

export function requireSupabase() {
  if (!features.supabaseEnabled) {
    throw new Error(
      "Supabase not configured. " +
      "Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY " +
      "environment variables to your hosting platform."
    )
  }
  return true
}