import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Docker image'ı .next/standalone'dan çalışır (bkz. Dockerfile).
  output: "standalone",
};

export default nextConfig;
