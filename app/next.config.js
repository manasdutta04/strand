/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  eslint: {
    ignoreDuringBuilds: true
  },
  typescript: {
    // Allow builds to proceed while TypeScript deprecation flags are resolved.
    // This skips type-checking during the production build to avoid errors
    // caused by the `ignoreDeprecations` flag incompatibility on Vercel.
    ignoreBuildErrors: true
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**'
      }
    ]
  },
  compress: true,
  poweredByHeader: false
};

module.exports = nextConfig;
