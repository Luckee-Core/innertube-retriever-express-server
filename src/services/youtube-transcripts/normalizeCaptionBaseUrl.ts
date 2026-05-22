/**
 * Normalizes caption track URL for transcript download (matches youtube-transcript-api behavior).
 */
export const normalizeCaptionBaseUrl = (baseUrl: string): string => {
  let url = baseUrl.replace('&fmt=srv3', '').replace('?fmt=srv3&', '?').replace('?fmt=srv3', '');
  if (url.includes('&exp=xpe')) {
    return url;
  }
  return url;
};
