import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Enable Next.js 16 Cache Components (opt-in caching model)
  cacheComponents: true,

  // Enable React Compiler for automatic memoization
  reactCompiler: true,

  // Enable source maps for error tracking in production
  productionBrowserSourceMaps: true,

  // Allow remote icons/assets used by PTE data
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'sgp1.digitaloceanspaces.com',
      },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'upload.wikimedia.org' },
      { protocol: 'https', hostname: 'i.imgur.com' },
      { protocol: 'https', hostname: 'images.pexels.com' },
      { protocol: 'https', hostname: 'picsum.photos' },
    ],
  },

  experimental: {
    // Faster dev restarts for large apps
    turbopackFileSystemCacheForDev: true,
  },

  // Custom webpack config for Rollbar
  webpack: (config, { isServer, webpack }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      }
    }
    return config
  },
}

export default nextConfig
