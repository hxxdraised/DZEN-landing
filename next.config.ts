import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  allowedDevOrigins: ["parochial-unconceded-gwyn.ngrok-free.dev"],
  poweredByHeader: false,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
