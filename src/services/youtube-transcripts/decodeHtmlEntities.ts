/**
 * Decodes a small set of HTML entities found in YouTube caption XML.
 */
export const decodeHtmlEntities = (input: string): string => {
  return input
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
};
