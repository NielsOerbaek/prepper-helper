import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Use webpack instead of Turbopack for build
  turbopack: {},
  images: {
    remotePatterns: [],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  // Skip type checking during build for faster iteration
  // Run `npx tsc --noEmit` separately if needed
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
