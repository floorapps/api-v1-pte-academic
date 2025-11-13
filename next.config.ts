import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Enable Next.js 16 Cache Components (opt-in caching model)
  cacheComponents: true,

  // Enable React Compiler for automatic memoization
  reactCompiler: true,

  // Allow remote icons/assets used by PTE data
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    // Optimize image loading
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },

  // Compiler options
  compiler: {
    // Remove console logs in production (except errors and warnings)
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn', 'info'],
    } : false,
  },

  // TypeScript configuration
  typescript: {
    // Enable type checking during build
    ignoreBuildErrors: false,
  },

  // Disable source maps in production for security and smaller builds
  productionBrowserSourceMaps: false,

  // Output configuration for standalone builds (optimal for Docker/serverless)
  output: process.env.BUILD_STANDALONE === 'true' ? 'standalone' : undefined,

  // Compression
  compress: true,

  // Power optimizations for Vercel
  poweredByHeader: false,

  // Headers for security, caching, and performance
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=60, stale-while-revalidate=120',
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  // Webpack configuration with caching
  webpack: (config, { dev, isServer }) => {
    // Enable persistent caching for faster builds
    config.cache = {
      type: 'filesystem',
      buildDependencies: {
        config: [__filename],
      },
      cacheDirectory: '.next/cache/webpack',
      compression: 'gzip',
      hashAlgorithm: 'md4',
    };

    // Optimize for production
    if (!dev) {
      // Tree shaking optimization
      config.optimization = {
        ...config.optimization,
        usedExports: true,
        sideEffects: true,
        minimize: true,
        // Split chunks for better caching
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            // Vendor chunk for node_modules
            vendor: {
              name: 'vendor',
              chunks: 'all',
              test: /node_modules/,
              priority: 20,
            },
            // Common chunk for shared code
            common: {
              name: 'common',
              minChunks: 2,
              chunks: 'all',
              priority: 10,
              reuseExistingChunk: true,
              enforce: true,
            },
            // React chunk
            react: {
              test: /[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/,
              name: 'react',
              chunks: 'all',
              priority: 30,
            },
          },
        },
      };
    }

    // Improve build performance
    config.infrastructureLogging = {
      level: 'error',
    };

    // Important: return the modified config
    return config;
  },

  // Redirects (add your custom redirects here)
  async redirects() {
    return [
      // Example: redirect old routes to new ones
      // {
      //   source: '/old-route',
      //   destination: '/new-route',
      //   permanent: true,
      // },
    ];
  },
};

export default nextConfig;