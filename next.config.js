/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: "/notebook",
  assetPrefix: "/notebook",
  webpack: (config, {isServer, webpack}) => {
    if (!isServer) {
      // Handle Node.js built-in modules for browser builds
      config.resolve.fallback = {
        ...config.resolve.fallback,
        path: false,
        util: false,
      };

      // Ignore node: scheme imports completely
      // eslint-linter-browserify handles these internally at runtime
      config.plugins.push(
        new webpack.IgnorePlugin({
          resourceRegExp: /^node:(path|util)$/,
        })
      );
    }
    return config;
  },
};

export default nextConfig;
