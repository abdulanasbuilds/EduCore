import { z } from "zod";

const envSchema = z.object({
  // Required at runtime (must be valid URL/string)
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),

  // Functional (warn if missing)
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_PHONE_NUMBER: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),

  // Optional
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  
  // App Config
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  CRON_SECRET: z.string().min(32).optional(),
});

type Env = z.infer<typeof envSchema>;

const validateEnv = (): Env => {
  try {
    return envSchema.parse({
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
      TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
      TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
      TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER,
      RESEND_API_KEY: process.env.RESEND_API_KEY,
      CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
      CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
      CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
      UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
      UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
      CRON_SECRET: process.env.CRON_SECRET,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.issues.map(i => i.path.join('.')).join(', ');
      
      // During build time or if we are on the setup page, don't crash the entire process
      // just warn and return as any to avoid type errors in the rest of the app
      if (process.env.NODE_ENV === 'development' || typeof window !== 'undefined') {
          console.warn(`⚠️ Warning: Missing or invalid environment variables: ${missingVars}`);
          
          // Check for critical missing ones
          if (missingVars.includes('SUPABASE')) {
              console.error("CRITICAL: Supabase variables are missing. App will redirect to /setup");
          }

          if (!process.env.TWILIO_ACCOUNT_SID) console.warn("SMS notifications disabled (Missing TWILIO_ACCOUNT_SID)");
          if (!process.env.RESEND_API_KEY) console.warn("Email notifications disabled (Missing RESEND_API_KEY)");
          
          return process.env as unknown as Env;
      }
      
      throw new Error(`Invalid environment variables: ${missingVars}`);
    }
    throw error;
  }
};

export const env = validateEnv();
