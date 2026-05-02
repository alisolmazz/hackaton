import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "your-supabase-domain.supabase.co",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/fastapi/:path*",
        destination: "http://localhost:8000/:path*", // Proxy to FastAPI Backend
      },
    ];
  },
};

export default nextConfig;
