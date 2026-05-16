import { env } from "./env"

/**
 * School branding configuration derived from environment variables.
 * Used throughout the application to ensure white-labeling.
 */
export const schoolConfig = {
  name: env.NEXT_PUBLIC_SCHOOL_NAME || "School Portal",
  tagline: env.NEXT_PUBLIC_SCHOOL_TAGLINE || "",
  logoUrl: env.NEXT_PUBLIC_SCHOOL_LOGO_URL || "",
  primaryColor: env.NEXT_PUBLIC_SCHOOL_PRIMARY_COLOR || "#1e3a5f",
  accentColor: env.NEXT_PUBLIC_SCHOOL_ACCENT_COLOR || "#16a34a",
  phone: env.NEXT_PUBLIC_SCHOOL_PHONE || "",
  email: env.NEXT_PUBLIC_SCHOOL_EMAIL || "",
  address: env.NEXT_PUBLIC_SCHOOL_ADDRESS || "",
  whatsapp: env.NEXT_PUBLIC_SCHOOL_WHATSAPP || "",
}
