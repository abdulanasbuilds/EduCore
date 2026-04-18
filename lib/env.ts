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
  NEXT_PUBLIC_APP_URL: z.string().optional().default("http://localhost:3000"),
  CRON_SECRET: z.string().optional(),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
})

// Parse without throwing — build must always succeed
const parsed = envSchema.safeParse(process.env)

// Export whatever we got (may have undefined values)
export const env = parsed.success ? parsed.data : ({} as z.infer<typeof envSchema>)

// Feature flags — true only if the key actually exists
export const features = {
  smsEnabled: !!(env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN),
  emailEnabled: !!env.RESEND_API_KEY,
  imageUploadEnabled: !!env.CLOUDINARY_CLOUD_NAME,
  rateLimitEnabled: !!env.UPSTASH_REDIS_REST_URL,
  supabaseEnabled: !!(env.NEXT_PUBLIC_SUPABASE_URL && env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
}

// Runtime check function — call this inside server actions and API routes
// NOT at module level
export function requireEnv() {
  if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error(
      "Supabase environment variables missing. " +
      "Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY " +
      "to your hosting platform environment variables."
    )
  }
}
