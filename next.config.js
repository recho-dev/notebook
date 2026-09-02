/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: "/notebook/:path*",
        destination: "/:path*",
        permanent: true,
      },
      {
        source: "/multiples",
        destination: "https://recho-multiples.vercel.app/",
        permanent: true,
      },
      {
        source: "/melody",
        destination: "https://recho-melody.vercel.app/",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
