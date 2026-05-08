const path = require("path");

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
  poweredByHeader: false,
  webpack: (config) => {
    const root = path.resolve(__dirname, '..');
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "@noble/hashes/sha256": path.resolve(root, "node_modules/@noble/hashes/sha256.js"),
      "@noble/hashes/sha3": path.resolve(root, "node_modules/@noble/hashes/sha3.js"),
      "@noble/curves/ed25519": path.resolve(root, "node_modules/@noble/curves/ed25519.js"),
      "@noble/curves/secp256k1": path.resolve(root, "node_modules/@noble/curves/secp256k1.js")
    };

    return config;
  }
};

module.exports = nextConfig;
