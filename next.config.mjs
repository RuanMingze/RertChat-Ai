/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  // 排除 packages 目录，不被 Next.js 编译
  outputFileTracingExcludes: {
    '*': ['./packages/**/*'],
  },
}

export default nextConfig
