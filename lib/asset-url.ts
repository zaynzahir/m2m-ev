/**
 * Root-relative URL for files in `public/`. Use for `next/image` `src` and `<img>`.
 */
export function publicAssetUrl(path: string): string {
  return path.startsWith("/") ? path : `/${path}`;
}
