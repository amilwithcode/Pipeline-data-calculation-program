/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable legacy pages routing by only accepting "*.page.*" extensions
  // Our project uses the App Router under `src/app`, so this avoids
  // Next trying to pre-render files in `src/pages` built for react-router.
  pageExtensions: ["page.tsx", "page.ts", "page.jsx", "page.js"],
  experimental: {
    appDir: true,
  },
};

module.exports = nextConfig;

