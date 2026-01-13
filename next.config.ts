import type { NextConfig } from "next";
import { execSync } from "child_process";

// Get git commit hash at build time
let gitCommit = "dev";
try {
  gitCommit = execSync("git rev-parse --short HEAD").toString().trim();
} catch {
  // Ignore if not in a git repo
}

const buildTime = new Date().toISOString();

const nextConfig: NextConfig = {
  output: "standalone",
  env: {
    NEXT_PUBLIC_BUILD_TIME: buildTime,
    NEXT_PUBLIC_GIT_COMMIT: gitCommit,
  },
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
