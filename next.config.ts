import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Optimize for ISR and database-driven content
  experimental: {
    // Enable partial prerendering for better ISR performance
    staleTimes: {
      dynamic: 30, // 30 seconds for dynamic routes
      static: 180, // 3 minutes for static routes
    },
  },
  // Configure caching headers for ISR optimization
  async headers() {
    return [
      {
        source: '/blog/:slug*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=3600, stale-while-revalidate=86400',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
      {
        source: '/api/blog/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=60, stale-while-revalidate=300',
          },
        ],
      },
    ];
  },
  // Configure redirects if needed for SEO
  async redirects() {
    return [
      // Example: redirect old blog URLs to new structure
      // {
      //   source: '/old-blog/:slug',
      //   destination: '/blog/:slug',
      //   permanent: true,
      // },
    ];
  },
};

export default nextConfig;
