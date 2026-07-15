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
      {
        protocol: 'https',
        hostname: '**.pexels.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.pixabay.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.freepik.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.cloudinary.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'imgur.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.imgur.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        // Vercel Blob storage — uploaded images live at <store>.public.blob.vercel-storage.com
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
        port: '',
        pathname: '/**',
      },
    ],
    // Allow unoptimized images for data URLs (base64) from file uploads
    unoptimized: false,
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    // Serve modern formats to cut bytes
    formats: ['image/avif', 'image/webp'],
    // Cache optimized images for 31 days — blob/article images rarely change
    minimumCacheTTL: 2678400,
    // Fewer candidate widths → fewer distinct transformations to bill/cache
    deviceSizes: [640, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 96, 256],
    // Single quality level keeps the number of variants down
    qualities: [75, 85],
  },
  // Enable Cache Components (PPR) for Next.js 16
  cacheComponents: true,
  // Optimize for ISR and database-driven content
  experimental: {
    // Configure stale times for router cache
    staleTimes: {
      dynamic: 30, // 30 seconds for dynamic routes
      static: 180, // 3 minutes for static routes
    },
  },
  // Configure caching headers for ISR optimization
  async headers() {
    return [
      {
        // Baseline security headers applied to every route
        source: '/:path*',
        headers: [
          // Clickjacking protection
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          // Prevent MIME sniffing
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Limit referrer leakage
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // Cross-origin isolation (allow OAuth/payment popups to keep working)
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin-allow-popups' },
          // Force HTTPS for 2 years, including subdomains
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          // Lock down powerful features not used by the app
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()',
          },
        ],
      },
      {
        source: '/articles/:slug*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=3600, stale-while-revalidate=3600',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
      {
        source: '/products/:slug*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=300, stale-while-revalidate=3600',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
      {
        source: '/events/:slug*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=300, stale-while-revalidate=3600',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
      {
        source: '/api/articles-public/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=60, stale-while-revalidate=300',
          },
        ],
      },
      {
        source: '/api/products-public/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=60, stale-while-revalidate=300',
          },
        ],
      },
      {
        source: '/api/events-public/:path*',
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
      {
        source: '/blog',
        destination: '/articles',
        permanent: true,
      },
      {
        source: '/blog/:slug*',
        destination: '/articles/:slug*',
        permanent: true,
      },
    ];
  },
  // Rewrite /favicon.ico to the dynamically-generated icon so tools that
  // request the ICO path directly (e.g. Vercel dashboard) get our brand icon.
  async rewrites() {
    return [
      {
        source: '/favicon.ico',
        destination: '/icon',
      },
    ];
  },
};

export default nextConfig;
