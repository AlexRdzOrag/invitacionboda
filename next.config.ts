import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // If your GitHub Pages repo is https://username.github.io/repo-name/
  // uncomment and set basePath:
  // basePath: '/repo-name',
};

export default nextConfig;
