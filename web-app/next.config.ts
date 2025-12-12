import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  pageExtensions: ["mdx", "tsx", "ts", "jsx", "js"],
  typescript: {
    ignoreBuildErrors: true,
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://127.0.0.1:8000/api/:path*",
      },
    ];
  },
  async headers() {
    if (process.env.NODE_ENV !== "production") {
      return [];
    }
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; script-src 'self' 'unsafe-eval' blob:; connect-src 'self' http://127.0.0.1:8000; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline'; frame-ancestors 'self';",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
