/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/admin/customers/:path*',
        destination: '/admin',
        permanent: false,
      },
      {
        source: '/admin/inquiries/:path*',
        destination: '/admin',
        permanent: false,
      },
      {
        source: '/admin/inventory/:path*',
        destination: '/admin',
        permanent: false,
      },
      {
        source: '/admin/settings/:path*',
        destination: '/admin',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
