/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // Electron loads from file:// protocol
  assetPrefix: process.env.NODE_ENV === 'production' ? './' : undefined,
};

module.exports = nextConfig;
