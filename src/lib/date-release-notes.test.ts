import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const dateReleaseNotes = [
  {
    path: 'content/docs/en/realtime-media/agora-analytics/reference/release-notes.mdx',
  },
  {
    path: 'content/docs/en/realtime-media/cloud-recording/reference/release-notes.mdx',
  },
  {
    path: 'content/docs/en/realtime-media/media-pull/reference/release-notes.mdx',
  },
  {
    path: 'content/docs/en/realtime-media/rtmp-gateway/reference/release-notes.mdx',
  },
  {
    path: 'content/docs/en/realtime-media/transcoding/reference/release-notes.mdx',
  },
] as const;

describe('Date-based release notes', () => {
  it.each(dateReleaseNotes)(
    'keeps the latest release open when older dates are expanded in $path',
    ({ path }) => {
      const releaseNotes = readFileSync(resolve(process.cwd(), path), 'utf8');

      expect(releaseNotes).toMatch(
        /<Accordions type="multiple" openFirst>\s*<Accordion title="[^"]+" id="[^"]+" headingLevel=\{[234]\} value="[^"]+">/,
      );
    },
  );
});
