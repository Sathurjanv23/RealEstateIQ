/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // 'standalone' output bundles the minimal Node.js server — required for Docker
  output: 'standalone',
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  },
  images: {
    remotePatterns: [
      // Unsplash demo images
      { protocol: 'https', hostname: 'images.unsplash.com' },
      // Cloudinary production images
      { protocol: 'https', hostname: 'res.cloudinary.com' },
    ],
  },
};

module.exports = nextConfig;
