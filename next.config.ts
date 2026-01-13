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
};

export default nextConfig;
