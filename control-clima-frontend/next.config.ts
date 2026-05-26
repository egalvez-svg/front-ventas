import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  allowedDevOrigins: ["localhost:3000", "127.0.0.1:3000", "172.29.144.1:3000", "192.168.100.36:3000"],
};

export default nextConfig;
