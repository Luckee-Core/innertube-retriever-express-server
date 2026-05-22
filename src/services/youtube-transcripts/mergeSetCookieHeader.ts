type CookieJar = Record<string, string>;

/**
 * Merges a single Set-Cookie header value into a simple jar (first path segment only).
 */
export const mergeSetCookieHeader = (jar: CookieJar, setCookie: string | null): void => {
  if (!setCookie) {
    return;
  }
  const first = setCookie.split(';')[0]?.trim();
  if (!first) {
    return;
  }
  const eq = first.indexOf('=');
  if (eq <= 0) {
    return;
  }
  const name = first.slice(0, eq).trim();
  const value = first.slice(eq + 1).trim();
  jar[name] = value;
};

export const cookieJarToHeader = (jar: CookieJar): string => {
  return Object.entries(jar)
    .map(([k, v]) => `${k}=${v}`)
    .join('; ');
};

export type { CookieJar };
