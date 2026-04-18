import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // Required for Netlify deployment
  output: undefined, // Do NOT set to 'export' or 'standalone' for Netlify
  
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

  // Suppress specific build warnings that don't affect functionality
  typescript: {
    ignoreBuildErrors: false,
  },
  
  eslint: {
    ignoreDuringBuilds: false,
  },

  experimental: {
    // Required for Next.js 15 server actions
    serverActions: {
      allowedOrigins: ["localhost:3000"],
    },
  },
}

export default nextConfig
