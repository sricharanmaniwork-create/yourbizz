import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel handles output optimization automatically; only enable `standalone`
  // if you're self-hosting with Docker. Comment out for Vercel deployment.
  // output: "standalone",
  reactStrictMode: true,
  // Surface TS errors during build so we never deploy broken code.
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
