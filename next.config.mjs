/** @type {import('next').NextConfig} */
const nextConfig = {
  // 本番環境での最適化
  reactStrictMode: true,
  // 3Dアセットの最適化
  images: {
    domains: [],
  },
  // webpack設定の最適化
  webpack: (config, { isServer }) => {
    // クライアント側の最適化
    if (!isServer) {
      // PixiJSを最適化（必要に応じて外部化も可能）
      config.optimization = {
        ...config.optimization,
        // コード分割の最適化
        splitChunks: {
          ...config.optimization.splitChunks,
          cacheGroups: {
            ...config.optimization.splitChunks?.cacheGroups,
            // PixiJSを別チャンクに分離
            pixi: {
              test: /[\\/]node_modules[\\/](pixi\.js|pixi-filters)[\\/]/,
              name: "pixi",
              chunks: "all",
              priority: 10,
            },
            // Three.jsを別チャンクに分離
            three: {
              test: /[\\/]node_modules[\\/](three|@react-three)[\\/]/,
              name: "three",
              chunks: "all",
              priority: 10,
            },
          },
        },
      };
    }
    return config;
  },
  // 開発環境の最適化
  experimental: {
    // 並列コンパイルの有効化（Next.js 14.2以降）
    optimizePackageImports: ["pixi.js", "pixi-filters", "three"],
  },
};

export default nextConfig;

