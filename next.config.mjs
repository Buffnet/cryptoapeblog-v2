import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Your Next.js config here
  webpack: (config) => {
    // Handle the import map as a module
    config.module.rules.push({
      test: /importMap\.js$/,
      type: 'javascript/auto',
    })
    return config
  }
}

export default withPayload(nextConfig)