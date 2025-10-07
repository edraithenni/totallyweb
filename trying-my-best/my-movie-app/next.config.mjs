/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: [
      'm.media-amazon.com',
      'via.placeholder.com',
      'ia.media-imdb.com'
      // добавьте другие домены, откуда загружаются постеры фильмов
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // разрешает все домены (для разработки)
      },
    ],
  },
  async rewrites() {
    return [
      // Если ваш бэкенд на другом домене, добавьте прокси
      {
        source: '/api/:path*',
        destination: 'http://localhost:3001/api/:path*', // ваш бэкенд URL
      },
    ]
  },
}

export default nextConfig