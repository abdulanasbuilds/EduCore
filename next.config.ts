import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // Force dynamic rendering for all routes
  // Required because pages use Supabase auth at runtime
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000"],
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https", 
        hostname: "*.supabase.co",
      },
    ],
  },
  // Do NOT set output: 'export' — breaks server features
  // Do NOT set output: 'standalone' unless specifically needed
}

export default nextConfig
