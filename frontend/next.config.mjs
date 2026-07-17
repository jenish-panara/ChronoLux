/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination:
          'https://chronolux-bgia.onrender.com//api/:path*',
      },
    ];
  },
};

export default nextConfig;
