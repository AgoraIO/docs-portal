import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

type MetaPage = string | { pages?: MetaPage[] };

const hiddenPagesByMeta = {
  'content/docs/zh-CN/realtime-media/rtc/build/video/meta.json': [
    'advanced-beauty-460',
    'advanced-beauty-legacy',
  ],
  'content/docs/zh-CN/realtime-media/usage-analytics/reference/meta.json': [
    'concept-rtm',
  ],
  'content/docs/zh-CN/realtime-media/whiteboard/fastboard-sdk/meta.json': [
    'reference/qps-pricing',
  ],
  'content/docs/zh-CN/realtime-media/whiteboard/whiteboard-sdk/meta.json': [
    'reference/qps-pricing',
  ],
  'content/docs/zh-CN/solutions/chatroom/sdk/reference/meta.json': ['api'],
  'content/docs/zh-CN/solutions/game-voice/meta.json': ['reference/billing'],
  'content/docs/zh-CN/solutions/ppt-transcoding/reference/meta.json': [
    'slide-api',
  ],
} as const;

function collectPageEntries(pages: MetaPage[]): string[] {
  return pages.flatMap((page) =>
    typeof page === 'string' ? [page] : collectPageEntries(page.pages ?? []),
  );
}

describe('legacy-hidden Chinese navigation pages', () => {
  it.each(Object.entries(hiddenPagesByMeta))(
    'keeps the legacy-hidden pages hidden in %s',
    (metaPath, pageNames) => {
      const meta = JSON.parse(
        readFileSync(join(process.cwd(), metaPath), 'utf8'),
      ) as { pages: MetaPage[] };
      const entries = collectPageEntries(meta.pages);

      for (const pageName of pageNames) {
        expect(entries).toContain(`!${pageName}`);
        expect(entries).not.toContain(pageName);
      }
    },
  );
});
