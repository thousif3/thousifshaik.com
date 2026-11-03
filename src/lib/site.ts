export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://thousifshaik.com";

/** Trim to a search-snippet length at a word boundary. */
export function clip(text: string, max = 155): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  return cut.slice(0, cut.lastIndexOf(" ")).replace(/[.,;:]$/, "") + "…";
}
