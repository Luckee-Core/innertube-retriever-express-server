import { decodeHtmlEntities } from './decodeHtmlEntities';
import type { YoutubeTranscriptSegment } from './types';

const STRIP_TAGS = /<[^>]+>/g;

/**
 * Parses YouTube timedtext XML (`<transcript><text ...>`) into segments.
 */
export const parseCaptionXmlToSegments = (xml: string): YoutubeTranscriptSegment[] => {
  const segments: YoutubeTranscriptSegment[] = [];
  const re = /<text\b([^>]*)>([\s\S]*?)<\/text>/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(xml)) !== null) {
    const attrBlock = match[1];
    const inner = match[2] ?? '';
    const startM = /start="([^"]+)"/i.exec(attrBlock);
    const durM = /dur="([^"]+)"/i.exec(attrBlock);
    const start = startM ? Number.parseFloat(startM[1]) : 0;
    const duration = durM ? Number.parseFloat(durM[1]) : 0;
    const text = decodeHtmlEntities(inner.replace(STRIP_TAGS, '').replace(/\s+/g, ' ').trim());
    if (text.length > 0) {
      segments.push({ text, start, duration });
    }
  }
  return segments;
};
