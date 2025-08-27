import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  assetPrefix: "./",
  images: {
    unoptimized: true,
  },
  webpack: (config) => {
    config.optimization.runtimeChunk = false;
    return config;
  },
};

export default nextConfig;
