import type { NextConfig } from "next";

/**
 * Deploy en subdominio `salesintelligence.verymuch.ai` → NO uses `basePath` aquí.
 * (Si usaras path en el dominio principal, entonces sí: basePath: '/salesintelligence'.)
 */
const nextConfig: NextConfig = {
  devIndicators: false,
};

export default nextConfig;
