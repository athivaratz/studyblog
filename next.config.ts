import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Removed 'output: export' - using server-side rendering for auth support
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
};

export default nextConfig;
