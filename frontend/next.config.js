/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_51OOjkHHjmmO4wBIV1098jWl03aGpqqtdQUlIeRBmcYAmgt93cO2RTa4AzmEZdDCL26wzzPle0GakCFWHCq2eTwCN00o1yZqRv',
  },
  images: {
    domains: ['localhost', 'i.ibb.co'],
  },
}

module.exports = nextConfig
