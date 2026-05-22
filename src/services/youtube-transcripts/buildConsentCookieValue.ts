/**
 * Parses consent form hidden field `v` from EU consent interstitial HTML.
 */
export const buildConsentCookieValue = (html: string): string | null => {
  const match = /name="v"\s+value="([^"]*)"/.exec(html);
  if (!match?.[1]) {
    return null;
  }
  return `YES+${match[1]}`;
};
