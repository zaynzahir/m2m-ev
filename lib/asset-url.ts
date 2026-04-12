/**
 * URLs for files in `public/`. When the app uses Next.js `basePath` (e.g. GitHub Pages
 * at /repo-name/), absolute paths like `/supported-vehicles/x.png` would 404 — they must
 * be prefixed. `NEXT_PUBLIC_BASE_PATH` is set in next.config.mjs from `BASE_PATH`.
 */
export function publicAssetUrl(path: string): string {
  const prefix = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${prefix}${normalized}`;
}
