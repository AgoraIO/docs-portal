import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { compile } from '@mdx-js/mdx';
import { describe, expect, it } from 'vitest';

const docsRoot = resolve(process.cwd(), 'content/docs/en');

describe('docs content regressions', () => {
  function expectListItemToContainNestedOrderedList(
    compiled: string,
    marker: string,
  ) {
    const markerIndex = compiled.indexOf(marker);
    expect(markerIndex).toBeGreaterThanOrEqual(0);

    const nestedListIndex = compiled.indexOf('<_components.ol>', markerIndex);
    const itemCloseIndex = compiled.indexOf('</_components.li>', markerIndex);

    expect(nestedListIndex).toBeGreaterThan(markerIndex);
    expect(nestedListIndex).toBeLessThan(itemCloseIndex);
  }

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

  it('keeps android broadcast streaming setup steps nested in ordered lists', async () => {
    const source = readFileSync(
      resolve(
        process.cwd(),
        'content/docs/en/realtime-media/broadcast-streaming/quickstart.mdx',
      ),
      'utf8',
    );

    const compiled = String(
      await compile(source, {
        jsx: true,
      }),
    );

    expectListItemToContainNestedOrderedList(
      compiled,
      'href="https://developer.android.com/studio/projects/create-project"',
    );
    expectListItemToContainNestedOrderedList(
      compiled,
      '{"Add a new activity to your project."}',
    );
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

  it('uses the local Flexible Classroom product architecture image asset', () => {
    const source = readFileSync(
      resolve(
        docsRoot,
        'solutions/flexible-classroom/reference/product-features.md',
      ),
      'utf8',
    );

    expect(source).toContain(
      '![Product Architecture](/images/flexible-classroom/product-architecture.png)',
    );
    expect(source).not.toContain(
      'https://web-cdn.agora.io/docs-files/1658392957746',
    );
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

  it('keeps IoT SDK compatibility table cells readable without raw HTML lists', async () => {
    const { source } = await import('./source.server');
    const page = source.getPage(
      ['solutions', 'iot', 'reference', 'communicate-with-rtc-sdk'],
      'en',
    );

    expect(page).toBeDefined();
    expect(page?.type).toBe('docs');

    if (!page || !('getText' in page.data)) {
      throw new Error('Expected IoT SDK page to expose processed markdown.');
    }

    const processed = await page.data.getText('processed');

    expect(processed).not.toContain('<ul>');
    expect(processed).not.toContain('<li>');
    expect(processed).toContain(
      'Native/third-party frameworks: Android, iOS/macOS, Windows, Electron, Unity, Flutter, React Native',
    );
    expect(processed).toContain(
      'Audio: G722, G711, Opus, AAC; Video: H.264, JPEG',
    );
  });

  it('renders media push layout images inside GFM table cells', async () => {
    const { source } = await import('./source.server');
    const page = source.getPage(
      ['realtime-media', 'media-push', 'reference', 'set-vertical-layout'],
      'en',
    );

    expect(page).toBeDefined();
    expect(page?.type).toBe('docs');

    if (!page || !('getText' in page.data)) {
      throw new Error(
        'Expected media push vertical layout page to expose processed markdown.',
      );
    }

    const processed = await page.data.getText('processed');

    expect(processed).toContain('| Number of people | Layout effect');
    expect(processed).toMatch(
      /\| 1\s+\| !\[1645770574489\]\(https:\/\/web-cdn\.agora\.io\/docs-files\/1645770574489\) \|/,
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

  it('renders IoT authentication code tabs as MDX components', async () => {
    const { source } = await import('./source.server');
    const page = source.getPage(
      ['solutions', 'iot', 'build', 'authentication-workflow'],
      'en',
    );

    expect(page).toBeDefined();
    expect(page?.type).toBe('docs');
    expect(page?.path).toBe(
      'en/solutions/iot/build/authentication-workflow.mdx',
    );

    if (!page || !('getText' in page.data)) {
      throw new Error(
        'Expected IoT authentication page to expose processed markdown.',
      );
    }

    const processed = await page.data.getText('processed');

    expect(processed).toContain('<CodeBlockTabs defaultValue="java">');
    expect(processed).toContain('<CodeBlockTab value="java">');
    expect(processed).toContain('<CodeBlockTab value="kotlin">');
    expect(processed).not.toContain('&lt;/CodeBlockTab&gt;');
    expect(processed).not.toContain('&lt;CodeBlockTab');
  });

  it('renders stream channel code tabs as MDX components', async () => {
    const { source } = await import('./source.server');
    const page = source.getPage(
      ['realtime-media', 'rtm', 'build', 'channels', 'stream-channel'],
      'en',
    );

    expect(page).toBeDefined();
    expect(page?.type).toBe('docs');
    expect(page?.path).toBe(
      'en/realtime-media/rtm/build/channels/stream-channel.mdx',
    );

    if (!page || !('getText' in page.data)) {
      throw new Error(
        'Expected stream channel page to expose processed markdown.',
      );
    }

    const processed = await page.data.getText('processed');

    expect(processed).toContain('<CodeBlockTabs defaultValue="java">');
    expect(processed).toContain('<CodeBlockTab value="java">');
    expect(processed).toContain('<CodeBlockTab value="kotlin">');
    expect(processed).not.toContain('&lt;/CodeBlockTab&gt;');
    expect(processed).not.toContain('&lt;CodeBlockTab');
  });
});
