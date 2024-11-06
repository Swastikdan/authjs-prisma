import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.*',
        port: '',
        pathname: '**',
      },
    ],
  },
  // https://nextjs.org/docs/api-reference/next.config.js/ignoring-type-errors
  typescript: {
    ignoreBuildErrors: true,
  },

  // https://nextjs.org/docs/api-reference/next.config.js/ignoring-eslint
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
