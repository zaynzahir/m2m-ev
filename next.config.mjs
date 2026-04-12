import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** GitHub Pages serves the app under https://USER.github.io/REPO/ — set in CI only. */
const staticExport = process.env.STATIC_EXPORT === "true";
const basePath = process.env.BASE_PATH?.trim() || "";

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  ...(staticExport ? { output: "export" } : {}),
  ...(basePath ? { basePath } : {}),
  /** GitHub Pages + static export: directory-style URLs avoid 404 on refresh. */
  ...(staticExport ? { trailingSlash: true } : {}),
  ...(staticExport ? { images: { unoptimized: true } } : {}),
  /**
   * Pin Turbopack to this app when another lockfile exists on the Desktop.
   * Mapbox's default `dist/mapbox-gl.js` is a UMD/AMD bundle; Turbopack tries to
   * resolve AMD `require(...)` calls and fails with "Can't resolve <dynamic>".
   * The published ESM build bundles cleanly.
   */
  turbopack: {
    root: __dirname,
    resolveAlias: {
      // Relative to project root — Turbopack mishandles absolute paths here.
      "mapbox-gl": "./node_modules/mapbox-gl/dist/esm-min/mapbox-gl.js",
    },
  },
  transpilePackages: ["mapbox-gl", "@solana/web3.js"],
  /**
   * Do NOT list @solana/web3.js in serverExternalPackages — webpack can emit a
   * truncated vendor chunk path (`vendor-chunks/@solana.js`) and ENOENT at runtime.
   *
   * Dev: disable persistent webpack cache + use polling — reduces ETIMEDOUT reads
   * when the project lives on iCloud Desktop, network volumes, or heavy AV scan.
   */
  webpack: (config, { dev }) => {
    if (dev) {
      config.cache = false;
      config.watchOptions = {
        ...config.watchOptions,
        poll: 2000,
        aggregateTimeout: 300,
      };
    }
    config.resolve = config.resolve ?? {};
    config.resolve.alias = {
      ...config.resolve.alias,
      "@solana/web3.js": path.join(__dirname, "node_modules/@solana/web3.js"),
    };
    return config;
  },
};

export default nextConfig;
