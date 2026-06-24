/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ['192.168.64.1'],
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:5000/api/:path*',
      },
    ];
  },
};

export default nextConfig;
