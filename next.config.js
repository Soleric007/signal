/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['pusher']
  },
  images: {
    domains: ['api.dicebear.com']
  }
}

module.exports = nextConfig
