import { describe, expect, it } from 'vitest';
import { loadDocsPagePayload } from './docs-page.server';

type SidebarNode = {
  children?: SidebarNode[];
  title?: string;
};

function collectTitles(nodes: SidebarNode[]): string[] {
  return nodes.flatMap((node) => [
    ...(node.title ? [node.title] : []),
    ...collectTitles(node.children ?? []),
  ]);
}

async function loadApiReferenceSidebar(slugs: string[]) {
  const payload = await loadDocsPagePayload('zh-CN', 'api-reference', slugs);
  if (!payload || 'redirectUrl' in payload) {
    throw new Error(
      `expected docs payload for /zh-CN/api-reference/${slugs.join('/')}`,
    );
  }
  return payload.sidebar as SidebarNode[];
}

describe('API Center scoped sidebars', () => {
  it('keeps hidden implementation roots out of the Reference sidebar', async () => {
    const sidebar = await loadApiReferenceSidebar(['overview']);
    const titles = collectTitles(sidebar);

    expect(titles.filter((title) => title === 'API 参考')).toHaveLength(1);
    expect(titles.filter((title) => title === '实时互动 RTC')).toHaveLength(1);
    expect(titles.filter((title) => title === '实时消息 RTM')).toHaveLength(1);
    expect(titles).not.toContain('Whiteboard SDK');
  });

  it('uses the generated RTC Android current-version categories', async () => {
    const sidebar = await loadApiReferenceSidebar([
      'rtc',
      'android',
      'rtc-api-overview',
    ]);
    const titles = collectTitles(sidebar);

    expect(titles).toEqual(
      expect.arrayContaining([
        'API 概览',
        'Full SDK API 列表',
        '初始化相关',
        '音频功能',
        '视频功能',
      ]),
    );
    expect(titles).not.toContain('参考概览');
  });

  it.each([
    [
      'Android',
      ['android', 'overview'],
      ['WhiteSdk', 'WhiteRoom', 'Player', 'Displayer'],
    ],
    [
      'iOS',
      [
        'ios',
        'docs',
        'headers',
        'agora-interactive-whiteboard-objective-c-overview',
      ],
      ['WhiteSdk', 'WhiteRoom', 'WhitePlayer', 'WhiteDisplayer'],
    ],
  ])('uses the Whiteboard SDK %s class directory', async (_platform, route, expected) => {
    const sidebar = await loadApiReferenceSidebar([
      'whiteboard',
      'whiteboard-sdk',
      ...route,
    ]);
    const titles = collectTitles(sidebar);

    expect(titles).toEqual(expect.arrayContaining(expected));
    expect(titles).not.toContain('参考概览');
  });

  it('keeps the four Flexible Classroom Web API nodes', async () => {
    const sidebar = await loadApiReferenceSidebar([
      'flexible-classroom',
      'web',
      'api-reference',
      'classroom-sdk',
    ]);
    const titles = collectTitles(sidebar);

    expect(titles).toEqual(
      expect.arrayContaining([
        'Classroom SDK API',
        'Proctor SDK API',
        'FcrUIScene API',
        'Edu Store API',
      ]),
    );
  });
});
