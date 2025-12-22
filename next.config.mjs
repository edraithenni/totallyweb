/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
       destination: 'http://backend:8080/api/:path*',
      },
      {
        source: '/static/src/:path*',   
        destination: '/src/:path*',    
      },
    ];
  },

  async headers() {
    return [
      {
        source: '/src/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
  },


  reactStrictMode: true,
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'be-Latn'],
  },
  
  assetPrefix: '',
  basePath: '',
};




export default nextConfig;