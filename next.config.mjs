/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  compress: true,
  output: "standalone",
  serverExternalPackages: ["better-sqlite3"],
};

export default nextConfig;
