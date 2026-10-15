import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "app.notion.com",
        pathname: "/image/**",
      },
    ],
  },
};

export default nextConfig;
