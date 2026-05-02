/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  devIndicators: false,
  outputFileTracingExcludes: {
    '*': ['./packages/**/*'],
  },
}

export default nextConfig
