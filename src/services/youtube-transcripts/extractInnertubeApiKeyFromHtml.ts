/**
 * Extracts InnerTube API key embedded in the watch page HTML.
 */
export const extractInnertubeApiKeyFromHtml = (html: string): string | null => {
  const pattern = /"INNERTUBE_API_KEY":\s*"([a-zA-Z0-9_-]+)"/;
  const m = pattern.exec(html);
  return m?.[1] ?? null;
};
