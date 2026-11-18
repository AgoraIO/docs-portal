import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { zhCnFaqDataset } from '@/components/faq/faq-dataset';
import { filterFaqs } from '@/components/faq/faq-filter';
import {
  processPlatformMarkdown,
  selectPlatformMarkdown,
} from '@/test/platform-markdown';
import { resolvePlatformContext } from '../platforms/context';
import { extractStructuredPlatformTabs } from '../platforms/processed-text';
import {
  buildPlatformPathname,
  resolvePlatformRoutePage,
} from '../platforms/route';
import { getCnFaqMetadata } from './cn-faq-metadata';

const guide = readFileSync(
  'content/docs/zh-CN/realtime-media/rtm/build/state-and-attributes/presence-basic.mdx',
  'utf8',
);

const url = '/zh-CN/reference/faq/product/rtm2_user_online_status';

describe('RTM online-status FAQ discovery', () => {
  it.each(['Android', 'iOS', 'Swift', 'C++', 'HarmonyOS'])(
    'finds the question using the real %s product and platform filters',
    (platform) => {
      expect(zhCnFaqDataset.platforms).toContain(platform);
      const results = filterFaqs(
        zhCnFaqDataset.items,
        { platform, product: '实时消息', query: '在线状态' },
        zhCnFaqDataset,
      );
      expect(results.some((item) => item.href === url)).toBe(true);
    },
  );

  it('exports the exact five SDK identities to search', () => {
    const metadata = getCnFaqMetadata(url);
    expect(metadata?.products).toContain('rtm');
    expect(metadata?.platform).toEqual([
      'android',
      'ios',
      'swift',
      'cpp',
      'harmonyos',
    ]);
  });

  it.each(['JavaScript', 'Unity', 'Flutter'])(
    'keeps the native-only answer out of the %s platform results',
    (platform) => {
      const results = filterFaqs(
        zhCnFaqDataset.items,
        { platform, product: '实时消息', query: '在线状态' },
        zhCnFaqDataset,
      );
      expect(results.some((item) => item.href === url)).toBe(false);
    },
  );
});

describe('RTM online-status guide entrances', () => {
  it.each(['android', 'ios', 'cpp', 'swift', 'harmonyos'] as const)(
    'links the %s reference to a visible example and result contract',
    (platform) => {
      const api = readFileSync(
        `content/docs/zh-CN/api-reference/rtm/${platform}/presence.mdx`,
        'utf8',
      );
      const href = api.match(/\]\(([^)]+\/presence-basic\/[^)]+)\)/)?.[1];
      expect(href).toBeDefined();
      if (!href) throw new Error('Missing platform-specific Presence entrance');
      const [pathname, anchor] = href.split('#');
      expect(pathname).toBe(
        buildPlatformPathname(
          '/zh-CN/realtime-media/rtm/build/state-and-attributes/presence-basic',
          platform,
        ),
      );
      const visible = selectPlatformMarkdown(guide, platform);
      expect(visible).toContain(`[#${anchor}]`);
      expect(visible).toContain('userB');
      expect(visible).toContain('结果与错误处理');
      expect(visible).toContain('调用失败');
    },
  );

  it('keeps the FAQ entrance on Android and the unsupported Web body intact', () => {
    const faq = readFileSync(
      'content/docs/zh-CN/reference/faq/product/rtm2_user_online_status.mdx',
      'utf8',
    );
    expect(faq).toContain('/presence-basic/android#query-user-online-status');
    expect(selectPlatformMarkdown(guide, 'web')).not.toContain(
      '## 查询用户在线状态',
    );
  });
});

describe('RTM shared API limits platform coverage', () => {
  const limits = readFileSync(
    'content/docs/zh-CN/realtime-media/rtm/reference/usage-limits-and-errors/api-limits.mdx',
    'utf8',
  );
  const processed = processPlatformMarkdown(limits);

  it('retains all nine published product platforms and the Web canonical route', () => {
    const tabs = extractStructuredPlatformTabs(processed);
    expect(tabs?.canonicalPlatform).toBe('web');
    expect(tabs?.defaultPlatform).toBe('android');
    expect(
      resolvePlatformContext({
        availablePlatforms: tabs?.platforms,
        defaultPlatform: tabs?.defaultPlatform,
        requestedPlatform: 'web',
      }).selectedPlatform,
    ).toBe('web');
    expect(new Set(tabs?.platforms)).toEqual(
      new Set([
        'web',
        'android',
        'ios',
        'cpp',
        'swift',
        'harmonyos',
        'mini-program',
        'unity',
        'flutter',
      ]),
    );
  });

  it.each(['web', 'unity', 'flutter', 'mini-program'] as const)(
    'retains a resolvable %s entrance without the native-only method',
    async (platform) => {
      const result = await resolvePlatformRoutePage({
        locale: 'zh-CN',
        tab: 'realtime-media',
        slugSegments: [
          'rtm',
          'reference',
          'usage-limits-and-errors',
          'api-limits',
          platform,
        ],
        source: { getPage: () => ({ id: 'api-limits' }) },
        readProcessedText: async () => processed,
        extractPlatformTabs: extractStructuredPlatformTabs,
      });
      expect(result?.platform).toBe(platform);
      const visible = selectPlatformMarkdown(limits, platform);
      expect(visible).toContain('RTM 将客户端 API 按功能分为若干操作类别');
      expect(visible).not.toContain('getUserOnlineStatus');
    },
  );
});
