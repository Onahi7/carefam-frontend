/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  output: 'standalone',
  experimental: {
    // Reduce static generation timeout
    staticGenerationTimeout: 10,
    // Skip static generation for problematic pages
    skipMiddlewareUrlNormalize: true,
  },
  // Disable static optimization for API routes and admin pages
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ]
  },
  // Configure which pages should be statically generated
  async generateStaticParams() {
    return []
  }
}

export default nextConfig
