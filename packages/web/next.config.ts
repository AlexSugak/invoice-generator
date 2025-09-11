import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  async rewrites() {
    return [
      {
        // Handle NextAuth.js routes internally
        source: '/api/auth/:path*',
        destination: '/api/auth/:path*',
      },
      {
        source: '/api/:path*',
        destination: 'http://localhost:3001/api/:path*', // Proxy to backend
      },
    ];
  },
};

export default nextConfig;
