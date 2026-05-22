type VideoDetails = {
  title?: string;
  author?: string;
};

/**
 * Best-effort title/author from InnerTube player JSON.
 */
export const extractVideoDetailsFromPlayer = (playerJson: unknown): VideoDetails => {
  if (!playerJson || typeof playerJson !== 'object') {
    return {};
  }
  const root = playerJson as Record<string, unknown>;
  const vd = root.videoDetails as Record<string, unknown> | undefined;
  if (!vd) {
    return {};
  }
  const title = typeof vd.title === 'string' ? vd.title : undefined;
  const author = typeof vd.author === 'string' ? vd.author : undefined;
  return { title, author };
};
