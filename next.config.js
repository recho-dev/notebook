/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: "/notebook",
  assetPrefix: "/notebook",
};

export default nextConfig;

import {initOpenNextCloudflareForDev} from "@opennextjs/cloudflare";

initOpenNextCloudflareForDev();
