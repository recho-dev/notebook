import path from "path";
import {fileURLToPath} from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

      // Replace node: scheme imports with empty module stubs
      // eslint-linter-browserify references these but they're not needed in browser
      const emptyModulePath = path.resolve(__dirname, "webpack-empty-module.js");

      config.plugins.push(
        new webpack.NormalModuleReplacementPlugin(/^node:path$/, (resource) => {
          resource.request = emptyModulePath;
        }),
      );

      config.plugins.push(
        new webpack.NormalModuleReplacementPlugin(/^node:util$/, (resource) => {
          resource.request = emptyModulePath;
        }),
      );
    }
    return config;
  },
};

export default nextConfig;
