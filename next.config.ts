import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['192.168.1.151'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co', pathname: '/storage/v1/object/public/**' },
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'http', hostname: '192.168.1.151' },
    ],
  },
};

export default nextConfig;
