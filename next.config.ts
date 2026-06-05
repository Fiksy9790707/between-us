import type { NextConfig } from "next";

const staticExport = process.env.STATIC_EXPORT === "true";
const standalone = process.env.STANDALONE === "true";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig: NextConfig = {
  output: staticExport ? "export" : standalone ? "standalone" : undefined,
  basePath: staticExport ? basePath : undefined,
  assetPrefix: staticExport ? basePath : undefined,
  images: {
    unoptimized: staticExport,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**"
      },
      {
        protocol: "http",
        hostname: "**"
      }
    ]
  }
};

export default nextConfig;
