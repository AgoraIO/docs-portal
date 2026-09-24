import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const dateReleaseNotes = [
  {
    path: 'content/docs/en/realtime-media/agora-analytics/reference/release-notes.mdx',
    latest: '202308',
  },
  {
    path: 'content/docs/en/realtime-media/cloud-recording/reference/release-notes.mdx',
    latest: '20250627',
  },
  {
    path: 'content/docs/en/realtime-media/media-pull/reference/release-notes.mdx',
    latest: '202212',
  },
  {
    path: 'content/docs/en/realtime-media/rtmp-gateway/reference/release-notes.mdx',
    latest: '2025528',
  },
  {
    path: 'content/docs/en/realtime-media/transcoding/reference/release-notes.mdx',
    latest: '20260908',
  },
] as const;

describe('Date-based release notes', () => {
  it.each(dateReleaseNotes)(
    'keeps the latest release open when older dates are expanded in $path',
    ({ path, latest }) => {
      const releaseNotes = readFileSync(resolve(process.cwd(), path), 'utf8');

      expect(releaseNotes).toContain(
        `<Accordions type="multiple" defaultValue="${latest}">`,
      );
    },
  );
});
