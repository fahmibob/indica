import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ensure the TSV data file is bundled into serverless functions on Vercel
  outputFileTracingIncludes: {
    '/api/**': ['./public/data/**'],
  },
};

export default nextConfig;
