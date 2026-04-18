import { z } from "zod"

const envSchema = z.object({
  // Supabase — required, different per school deployment
  NEXT_PUBLIC_SUPABASE_URL: z.string().url({
    message: "NEXT_PUBLIC_SUPABASE_URL must be a valid URL. Get it from: Supabase Dashboard → Settings → API"
  }),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, {
    message: "NEXT_PUBLIC_SUPABASE_ANON_KEY is missing. Get it from: Supabase Dashboard → Settings → API"
  }),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, {
    message: "SUPABASE_SERVICE_ROLE_KEY is missing. Get it from: Supabase Dashboard → Settings → API → service_role"
  }),

  // Twilio — required for SMS/WhatsApp, different per school
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_PHONE_NUMBER: z.string().optional(),

  // Resend — required for email
  RESEND_API_KEY: z.string().optional(),

  // Cloudinary — for photos and documents
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),

  // Upstash Redis — for rate limiting SMS sends
  UPSTASH_REDIS_REST_URL: z.string().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),

  // App
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  CRON_SECRET: z.string().optional(),

  // Node environment
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
})

// Parse and validate
// During build time on some platforms, env vars might not be available
// We wrap it to handle the initial setup case gracefully
const getEnv = () => {
  const result = envSchema.safeParse(process.env)

  if (!result.success) {
    // If we are in a browser or it's a build, we might not want to crash immediately 
    // if the middleware is handling the redirect to /setup
    if (typeof window !== 'undefined') {
        return process.env as any;
    }

    const missing = result.error.errors.map(e => 
      `  ❌ ${e.path.join(".")}: ${e.message}`
    ).join("\n")
    
    console.error(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EDUCORE — ENVIRONMENT VARIABLES ERROR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
The following required variables are missing or invalid:

${missing}

HOW TO FIX:
  Local development: Add them to your .env.local file
  Vercel: Project → Settings → Environment Variables
  Cloudflare Pages: Project → Settings → Environment Variables
  Railway: Project → Variables tab
  Netlify: Site → Configuration → Environment Variables
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `)
    
    // In actual production execution, we should throw
    if (process.env.NODE_ENV === 'production' && !process.env.NEXT_PHASE) {
       throw new Error("Missing required environment variables. Check server logs.")
    }
    
    return process.env as any;
  }

  return result.data;
}

export const env = getEnv()

// Feature flags — automatically disabled if keys not provided
export const features = {
  smsEnabled: !!(env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN),
  emailEnabled: !!env.RESEND_API_KEY,
  imageUploadEnabled: !!env.CLOUDINARY_CLOUD_NAME,
  rateLimitEnabled: !!env.UPSTASH_REDIS_REST_URL,
}
