import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configurações do Next.js
  experimental: {
    reactCompiler: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'v0.blob.com', // Placeholder para Vercel Blob futuramente
      },
    ],
  },
}

export default withPayload(nextConfig)
