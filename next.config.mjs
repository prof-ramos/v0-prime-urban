/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' }
    ],
    formats: ['image/avif', 'image/webp'],
  },
  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [{
          key: 'Content-Type',
          value: 'application/javascript; charset=utf-8',
        }],
      },
      {
        source: '/:all*(svg|jpg|jpeg|png|webp|avif|ico)',
        headers: [{
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable',
        }],
      },
      {
        source: '/_next/static/:path*',
        headers: [{
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable',
        }],
      },
      {
        source: '/imoveis/:path*',
        headers: [{
          key: 'Cache-Control',
          value: 'public, s-maxage=60, stale-while-revalidate=300'
        }],
      },
    ]
  },
}

export default nextConfig
