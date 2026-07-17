/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://chronolux-bgia.onrender.com/api/:path*',
      },
    ];
  },

  // Performance optimizations
  compress: true, // Enable gzip compression
  swcMinify: true, // Use SWC minification (faster than Terser)

  // Image optimization
  images: {
    domains: ['images.pexels.com', 'images.unsplash.com', 'img.chrono24.com',
              'img.tatacliq.com', 'www.casio.com', 'seikowatches.co.in',
              'cdn1.ethoswatches.com', 'assets.ajio.com', 'gshock.casio.com'],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  },

  // Experimental features for better performance
  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
  },

  // Production optimizations
  productionBrowserSourceMaps: false,

  // Headers for caching
  async headers() {
    return [
      {
        source: '/:all*(svg|jpg|jpeg|png|ico|webp)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
