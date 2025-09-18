import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  async rewrites() {
    console.log('NODE_ENV', process.env.NODE_ENV);

    // In production, we don't need the proxy as containers communicate directly
    if (process.env.NODE_ENV === 'production') {
      return [];
    }

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
