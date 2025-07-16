/** @type {import('next').NextConfig} */
const bloggieSiteConfig = {
  experimental: {
    optimizePackageImports: ['lucide-react', '@heroicons/react'],
    
  },
  
  serverExternalPackages: ['firebase-admin'],

  images: {
    // Allow images from these trusted domains
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com', // Google profile pics
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com', // Firebase storage
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com', // Unsplash for stock images
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com', // Cloudinary for image uploads
      },
    ],
    // Modern image formats 
    formats: ['image/avif', 'image/webp'],
    // Cache images for 1 year 
    minimumCacheTTL: 31536000, // 1 year in seconds
    // Allow SVG 
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },


  compiler: {
    // console.log('NODE_ENV:', process.env.NODE_ENV); 
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // PWA and SEO headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Security headers
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          // Performance headers
          {
            key: 'X-Robots-Tag',
            value: 'index, follow'
          },
        ],
      },
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ],
      },
      {
        source: '/sitemap.xml',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, s-maxage=86400'
          }
        ],
      },
      {
        source: '/robots.txt',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, s-maxage=86400'
          }
        ],
      },
    ];
  },

  // Redirects for SEO
  async redirects() {
    return [
      {
        source: '/blog',
        destination: '/home',
        permanent: true,
      },
      {
        source: '/blogs',
        destination: '/home',
        permanent: true,
      },
    ];
  },

  // Enable static generation for better SEO
  output: 'standalone',
  
  // Webpack optimizations
  webpack: (config: any, { dev, isServer }: { dev: boolean; isServer: boolean }) => {
    // Optimize bundle size
    if (!dev && !isServer) {
      config.optimization.splitChunks.cacheGroups = {
        ...config.optimization.splitChunks.cacheGroups,
        firebase: {
          name: 'firebase',
          test: /[\\/]node_modules[\\/](firebase|@firebase)[\\/]/,
          chunks: 'all',
          priority: 10,
        },
        framer: {
          name: 'framer-motion',
          test: /[\\/]node_modules[\\/]framer-motion[\\/]/,
          chunks: 'all',
          priority: 10,
        },
      };
    }
    return config;
  },
}

module.exports = bloggieSiteConfig