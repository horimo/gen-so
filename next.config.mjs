/** @type {import('next').NextConfig} */
const nextConfig = {
  // 本番環境での最適化
  reactStrictMode: true,
  // 3Dアセットの最適化
  images: {
    domains: [],
  },
};

export default nextConfig;

