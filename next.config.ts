import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "d1735p3aqhycef.cloudfront.net",
      },
    ],
  },
};

export default nextConfig;
