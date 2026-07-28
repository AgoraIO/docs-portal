import { fireEvent, render, screen } from '@testing-library/react';
import type { ComponentType } from 'react';
import { describe, expect, it } from 'vitest';
import { getMDXComponents } from '@/components/mdx';
import type { AppLocale } from './i18n/i18n-config';

const SOURCE_LOADER_TEST_TIMEOUT = 300_000;

async function renderDocsPage(slugs: string[], locale: AppLocale = 'en') {
  const { source } = await import('./source.server');
  const page = source.getPage(slugs, locale);

  expect(page).toBeDefined();
  expect(page?.type).toBe('docs');

  if (!page || !('load' in page.data)) {
    throw new Error(`Expected ${slugs.join('/')} to expose loadable MDX.`);
  }

  const loaded = await page.data.load();
  const Body = loaded.body as ComponentType<{
    components: ReturnType<typeof getMDXComponents>;
  }>;

  render(
    <Body
      components={getMDXComponents(
        {
          a: 'a',
          Link: 'a',
        },
        { contentPath: page.path },
      )}
    />,
  );
}

describe('docs content render regressions', () => {
  it(
    'renders IoT authentication code tabs as interactive MDX components',
    async () => {
      await renderDocsPage([
        'realtime-media',
        'iot',
        'build',
        'set-up-authentication-and-security',
        'authentication-workflow',
      ]);

      expect(
        screen.getAllByRole('tab', { name: 'Java' }).length,
      ).toBeGreaterThan(0);
      expect(
        screen.getAllByRole('tab', { name: 'Kotlin' }).length,
      ).toBeGreaterThan(0);
    },
    SOURCE_LOADER_TEST_TIMEOUT,
  );

  it(
    'renders stream channel Java and Kotlin code tabs',
    async () => {
      await renderDocsPage([
        'realtime-media',
        'rtm',
        'build',
        'work-with-channels',
        'stream-channel',
      ]);

      fireEvent.click(screen.getByRole('tab', { name: 'Android' }));

      expect(
        screen.getAllByRole('tab', { name: 'Java' }).length,
      ).toBeGreaterThan(0);
      expect(
        screen.getAllByRole('tab', { name: 'Kotlin' }).length,
      ).toBeGreaterThan(0);
    },
    SOURCE_LOADER_TEST_TIMEOUT,
  );

  it(
    'renders a Chinese page through the upgraded MDX component runtime',
    async () => {
      await renderDocsPage(['ai', 'get-started', 'quickstart'], 'zh-CN');

      expect(
        screen.getByRole('heading', { name: '安装 Agora skills' }),
      ).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Python' })).toBeInTheDocument();
      expect(
        screen.getByRole('tab', { name: 'TypeScript' }),
      ).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Go' })).toBeInTheDocument();
    },
    SOURCE_LOADER_TEST_TIMEOUT,
  );
});
