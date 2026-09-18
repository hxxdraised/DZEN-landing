import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["parochial-unconceded-gwyn.ngrok-free.dev"],
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
