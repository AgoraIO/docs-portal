import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { compile } from '@mdx-js/mdx';
import { remarkHeading } from 'fumadocs-core/mdx-plugins';
import { describe, expect, it } from 'vitest';
import {
  isPermanentMovedDocsRedirect,
  resolveMovedDocsRedirect,
} from './docs-moved-redirects';
import { remarkNormalizeLegacyHeadingAnchors } from './mdx/remark-normalize-legacy-heading-anchors';
import { resolveZhCnProductIaRedirect } from './zh-cn-product-ia-redirects';

const canonicalPath = '/zh-CN/api-reference/rtc/restful/webhook/events';
const oldPaths = ['rtc/reference/events', 'rtc/webhook/events'] as const;

function docFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const file = join(directory, entry.name);
    if (entry.isDirectory()) return docFiles(file);
    return /\.(md|mdx)$/.test(entry.name) ? [file] : [];
  });
}

describe('RTC events deduplication', () => {
  it.each(oldPaths)(
    'redirects %s directly to the canonical API page',
    (path) => {
      expect(
        resolveZhCnProductIaRedirect(
          'zh-CN',
          'realtime-media',
          path.split('/'),
        ),
      ).toBe(canonicalPath);
    },
  );

  it.each(oldPaths)(
    'permanently redirects %s before static payload lookup',
    (path) => {
      expect(
        resolveMovedDocsRedirect('zh-CN', 'realtime-media', path.split('/')),
      ).toBe(canonicalPath);
      expect(
        isPermanentMovedDocsRedirect(
          'zh-CN',
          'realtime-media',
          path.split('/'),
        ),
      ).toBe(true);
      expect(
        resolveMovedDocsRedirect('en', 'realtime-media', path.split('/')),
      ).toBeNull();
      expect(
        isPermanentMovedDocsRedirect('en', 'realtime-media', path.split('/')),
      ).toBe(false);
    },
  );

  it.each(['vercel.base.json', 'vercel.json'])(
    'maintains direct HTTP 301 rules in %s',
    (file) => {
      const config = JSON.parse(readFileSync(file, 'utf8')) as {
        redirects: Array<{
          source: string;
          destination: string;
          statusCode: number;
        }>;
      };
      for (const path of oldPaths) {
        expect(
          config.redirects.filter(
            (rule) => rule.source === `/zh-CN/realtime-media/${path}`,
          ),
        ).toEqual([
          {
            source: `/zh-CN/realtime-media/${path}`,
            destination: canonicalPath,
            statusCode: 301,
          },
        ]);
      }
    },
  );

  it('removes only the duplicate article and keeps key concepts ungrouped', () => {
    expect(
      existsSync('content/docs/zh-CN/realtime-media/rtc/reference/events.mdx'),
    ).toBe(false);
    expect(existsSync(`content/docs${canonicalPath}.mdx`)).toBe(true);
    expect(
      existsSync(
        'content/docs/zh-CN/realtime-media/rtc/reference/key-concept.mdx',
      ),
    ).toBe(true);
    const meta = JSON.parse(
      readFileSync(
        'content/docs/zh-CN/realtime-media/rtc/reference/meta.json',
        'utf8',
      ),
    );
    expect(meta.pages).toContain('key-concept');
    expect(JSON.stringify(meta)).not.toContain('概念事件');
    expect(JSON.stringify(meta)).not.toContain('"events"');
  });

  it('leaves no Chinese article linking to the removed duplicate', () => {
    const staleFiles = docFiles('content/docs/zh-CN').filter((file) =>
      readFileSync(file, 'utf8').includes(
        '/zh-CN/realtime-media/rtc/reference/events',
      ),
    );
    expect(staleFiles).toEqual([]);
  });

  it('preserves both numeric and descriptive event anchors in the canonical article', async () => {
    const source = readFileSync(`content/docs${canonicalPath}.mdx`, 'utf8');
    const eventHeadings = [
      ...source.matchAll(/<a id="(\d+)"><\/a>\s*\n(### [^\n]+)/g),
    ];
    expect(eventHeadings.map((match) => match[1])).toEqual([
      '101',
      '102',
      '103',
      '104',
      '105',
      '106',
      '107',
      '108',
      '111',
      '112',
    ]);
    const result = String(
      await compile(eventHeadings.map((match) => match[0]).join('\n\n'), {
        jsx: true,
        remarkPlugins: [remarkHeading, remarkNormalizeLegacyHeadingAnchors],
      }),
    );
    for (const match of eventHeadings) {
      expect(result).toContain(`<a id="${match[1]}" />`);
    }
    expect(result).toContain('id="103-broadcaster-join-channel"');
    expect(result).toContain('id="104-broadcaster-leave-channel"');
  });
});
