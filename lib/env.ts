import { z } from "zod"

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().optional(),
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
  NEXT_PUBLIC_SCHOOL_NAME: z.string().optional().default("School Portal"),
  NEXT_PUBLIC_SCHOOL_TAGLINE: z.string().optional().default(""),
  NEXT_PUBLIC_SCHOOL_LOGO_URL: z.string().optional().default(""),
  NEXT_PUBLIC_SCHOOL_PRIMARY_COLOR: z.string().optional().default("#1e3a5f"),
  NEXT_PUBLIC_SCHOOL_ACCENT_COLOR: z.string().optional().default("#16a34a"),
  NEXT_PUBLIC_SCHOOL_PHONE: z.string().optional().default(""),
  NEXT_PUBLIC_SCHOOL_EMAIL: z.string().optional().default(""),
  NEXT_PUBLIC_SCHOOL_ADDRESS: z.string().optional().default(""),
  NEXT_PUBLIC_SCHOOL_WHATSAPP: z.string().optional().default(""),
  DEMO_WHATSAPP: z.string().optional().default("233550357243"),
  DEMO_EMAIL: z.string().optional().default("abdulanassofficial@gmail.com"),
  CRON_SECRET: z.string().optional(),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
})

// Parse without throwing — build must always succeed
const result = envSchema.safeParse(process.env)
export const env = result.success ? result.data : ({} as z.infer<typeof envSchema>)

// Feature flags — true only when keys exist at runtime
export const features = {
  supabaseConfigured: !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL && 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ),
  smsEnabled: !!(
    process.env.TWILIO_ACCOUNT_SID && 
    process.env.TWILIO_AUTH_TOKEN
  ),
  emailEnabled: !!process.env.RESEND_API_KEY,
  imageUploadEnabled: !!process.env.CLOUDINARY_CLOUD_NAME,
  rateLimitEnabled: !!process.env.UPSTASH_REDIS_REST_URL,
}

// School branding — used everywhere instead of hardcoded names
export const schoolConfig = {
  name: process.env.NEXT_PUBLIC_SCHOOL_NAME ?? "School Portal",
  tagline: process.env.NEXT_PUBLIC_SCHOOL_TAGLINE ?? "",
  logoUrl: process.env.NEXT_PUBLIC_SCHOOL_LOGO_URL ?? "",
  primaryColor: process.env.NEXT_PUBLIC_SCHOOL_PRIMARY_COLOR ?? "#1e3a5f",
  accentColor: process.env.NEXT_PUBLIC_SCHOOL_ACCENT_COLOR ?? "#16a34a",
  phone: process.env.NEXT_PUBLIC_SCHOOL_PHONE ?? "",
  email: process.env.NEXT_PUBLIC_SCHOOL_EMAIL ?? "",
  address: process.env.NEXT_PUBLIC_SCHOOL_ADDRESS ?? "",
  whatsapp: process.env.NEXT_PUBLIC_SCHOOL_WHATSAPP ?? "",
}

// Demo page contact info — used for promotion
export const demoConfig = {
  whatsapp: process.env.DEMO_WHATSAPP ?? "233550357234",
  email: process.env.DEMO_EMAIL ?? "abdulanassofficial@gmail.com",
}
