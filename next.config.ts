import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  serverExternalPackages: ['@napi-rs/canvas'],
  images: {
    unoptimized: true,
    remotePatterns: [
{
        protocol: 'https',
        hostname: 'zylnqwcbqlkvpfykxqrv.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
    localPatterns: [
{
        pathname: '/images/**',
      },
      {
        pathname: '/uploads/**',
      },
      {
        pathname: '/api/properties/imagenes/watermark/**',
      },
    ],
  },
};

export default nextConfig;
