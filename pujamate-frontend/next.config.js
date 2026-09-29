/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' }, // tighten to specific CDNs before production
    ],
  },
};

module.exports = nextConfig;
