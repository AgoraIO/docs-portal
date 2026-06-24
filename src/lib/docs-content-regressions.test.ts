import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { compile } from '@mdx-js/mdx';
import { describe, expect, it } from 'vitest';

const docsRoot = resolve(process.cwd(), 'content/docs/en');

describe('docs content regressions', () => {
  it('keeps agora analytics call inspector headings free of inline raw anchors', () => {
    const source = readFileSync(
      resolve(
        process.cwd(),
        'content/docs/en/solutions/agora-analytics/build/call-search.md',
      ),
      'utf8',
    );

    expect(source).not.toMatch(/^#{1,6} .*<a name=".*"><\/a>/m);
  });

  it('compiles the realtime video quickstart without MDX tag nesting errors', async () => {
    const source = readFileSync(
      resolve(process.cwd(), 'content/docs/en/realtime-media/video/index.mdx'),
      'utf8',
    );

    await expect(
      compile(source, {
        jsx: true,
      }),
    ).resolves.toBeDefined();
  });

  it('does not leave legacy videoURL placeholders in MDX content', () => {
    const sources = [
      'realtime-media/cloud-recording/build/receive-notifications.mdx',
      'realtime-media/transcoding/build/receive-ncs-events.md',
      'solutions/interactive-live-streaming/build/receive-notifications.mdx',
      'solutions/interactive-live-streaming/build/virtual-background.mdx',
    ].map((relativePath) => {
      return readFileSync(resolve(docsRoot, relativePath), 'utf8');
    });

    for (const source of sources) {
      expect(source).not.toContain('src={videoURL}');
    }
  });

  it('preserves explicit table cell line breaks in processed markdown', async () => {
    const { source } = await import('./source.server');
    const page = source.getPage(['ai', 'get-started', 'test-mdx-comps'], 'en');

    expect(page).toBeDefined();
    expect(page?.type).toBe('docs');

    if (!page || !('getText' in page.data)) {
      throw new Error('Expected test MDX page to expose processed markdown.');
    }

    const processed = await page.data.getText('processed');

    expect(processed).toContain(
      'Default value includes all users.<br />An empty array excludes all audio streams.',
    );
  });

  it('keeps parameter table lists and callouts in the media push type definition page', async () => {
    const { source } = await import('./source.server');
    const page = source.getPage(
      ['realtime-media', 'media-push', 'reference', 'restful-type-definition'],
      'en',
    );

    expect(page).toBeDefined();
    expect(page?.type).toBe('docs');

    if (!page || !('getText' in page.data)) {
      throw new Error(
        'Expected media push type definition page to expose processed markdown.',
      );
    }

    const processed = await page.data.getText('processed');

    expect(processed).toContain('`LC-AAC` (Default): MPEG-4 AAC LC');
    expect(processed).toContain('<CalloutContainer type="info">');
    expect(processed).toContain(
      '`volumes.rtcStreamUid` needs to exist in the `rtcStreamUids` array',
    );
  });
});
