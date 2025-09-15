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
    domains: ['localhost'],
  },
  experimental: {
    // Optimize build performance
    cpus: 2,
    webpackBuildWorker: true,
  },
  // Optimize for production deployment
  output: 'standalone',
  swcMinify: true,
  poweredByHeader: false,
  generateEtags: false,
  
  // API routes configuration
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: process.env.NEXT_PUBLIC_API_URL 
          ? `${process.env.NEXT_PUBLIC_API_URL}/api/:path*` 
          : '/api/:path*',
      },
    ]
  },
}

export default nextConfig
