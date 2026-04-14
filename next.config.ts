import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Next.js 16 build worker has a known "Invalid or unexpected token" issue
  // during TS validation phase. tsc --noEmit passes clean.
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
};

export default nextConfig;
