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

    // Fix for pdfjs-dist webpack bundling issues
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      crypto: false,
    };

    // Handle pdfjs-dist specifically - exclude from bundling
    config.externals = config.externals || [];
    config.externals.push({
      'pdfjs-dist': 'commonjs pdfjs-dist'
    });

    // Ignore problematic modules in pdfjs-dist
    config.plugins = config.plugins || [];
    config.plugins.push(
      new config.webpack.IgnorePlugin({
        resourceRegExp: /pdfjs-dist\/legacy\/build\/pdf\.worker\.js$/,
      })
    );

    return config;
  }
};

module.exports = nextConfig;
