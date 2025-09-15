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
  

}

export default nextConfig
