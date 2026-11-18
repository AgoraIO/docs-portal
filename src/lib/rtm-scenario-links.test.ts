import { existsSync, readFileSync } from 'node:fs';
import { remarkHeading } from 'fumadocs-core/mdx-plugins';
import type { Folder, Root as PageTreeRoot } from 'fumadocs-core/page-tree';
import type { Root } from 'mdast';
import remarkGfm from 'remark-gfm';
import remarkMdx from 'remark-mdx';
import remarkParse from 'remark-parse';
import { unified } from 'unified';
import { visit } from 'unist-util-visit';
import { describe, expect, it } from 'vitest';
import {
  processPlatformMarkdown,
  selectPlatformMarkdown,
} from '@/test/platform-markdown';
import { docsMetaSchema } from './docs-meta-schema';
import {
  getScopedNavScopeSidebarNodes,
  resolveDocsNavScope,
} from './docs-nav-scope';
import { extractStructuredPlatformTabs } from './platforms/processed-text';
import type { PlatformKey } from './platforms/registry';
import { createPublishedDocsRoutes } from './published-docs-routes';

function selectScenario(scenario: string, platform: PlatformKey) {
  return selectPlatformMarkdown(
    readFileSync(
      `content/docs/zh-CN/realtime-media/rtm/best-practice/${scenario}.mdx`,
      'utf8',
    ),
    platform,
  );
}

const parser = unified().use(remarkParse).use(remarkMdx).use(remarkGfm);
const routeCache = new Map<string, boolean>();

function isPublishedRoute(pathname: string) {
  if (routeCache.has(pathname)) return routeCache.get(pathname);
  const direct = `content/docs${pathname}.mdx`;
  if (existsSync(direct)) {
    routeCache.set(pathname, true);
    return true;
  }
  const canonical = pathname.slice(0, pathname.lastIndexOf('/'));
  const file = `content/docs${canonical}.mdx`;
  if (!existsSync(file)) return false;
  const source = readFileSync(file, 'utf8');
  const tabs = extractStructuredPlatformTabs(processPlatformMarkdown(source));
  const routes = createPublishedDocsRoutes({
    canonicalPaths: [canonical],
    platformPages: [{ url: canonical, platforms: tabs?.platforms ?? [] }],
  });
  const found = routes.some((route) => route.url === pathname);
  routeCache.set(pathname, found);
  return found;
}

describe('published RTM scenario link destinations', () => {
  it.each(['web', 'android', 'ios', 'cpp', 'swift', 'harmonyos'] as const)(
    'resolves authored links in both %s scenarios through real platform coverage',
    (platform) => {
      for (const scenario of ['voice-room', 'one-to-one-call']) {
        const source = selectScenario(scenario, platform);
        const tree = parser.parse(source) as Root;
        const urls: string[] = [];
        visit(tree, 'link', (node) => {
          urls.push(node.url);
        });
        // The parser excludes fenced C++ lambdas such as [captures](TYPE).
        expect(urls).not.toContain('RTM_ERROR_CODE');
        for (const href of urls) {
          if (!href.startsWith('/zh-CN/')) continue;
          const url = new URL(href, 'https://local.invalid');
          expect(isPublishedRoute(url.pathname), href).toBe(true);
        }
      }
    },
  );
});

describe('RTM User Storage fragment destinations', () => {
  it.each(['android', 'ios', 'cpp', 'swift', 'harmonyos'])(
    'targets the rendered setUserMetadata member on %s',
    async (platform) => {
      const scenario = selectScenario('voice-room', platform as PlatformKey);
      const links: string[] = [];
      visit(parser.parse(scenario), 'link', (node) => {
        if (node.url.includes('/storage#')) links.push(node.url);
      });
      expect(links).toHaveLength(1);
      const target = new URL(links[0], 'https://local.invalid');
      const content = readFileSync(
        `content/docs${target.pathname}.mdx`,
        'utf8',
      ).replace(/^---\n[\s\S]*?---\n/, '');
      const processor = unified()
        .use(remarkParse)
        .use(remarkMdx)
        .use(remarkGfm)
        .use(remarkHeading);
      const tree = await processor.run(processor.parse(content));
      const members: string[] = [];
      visit(tree, 'heading', (node) => {
        if (node.data?.hProperties?.id === target.hash.slice(1)) {
          members.push(
            node.children
              .map((child) => ('value' in child ? child.value : ''))
              .join(''),
          );
        }
      });
      expect(members).toEqual(['setUserMetadata']);
    },
  );
});

describe('RTM scenario sidebar', () => {
  it('shows exactly two scenarios with all six platform variants', () => {
    const raw = JSON.parse(
      readFileSync('content/docs/zh-CN/realtime-media/rtm/meta.json', 'utf8'),
    );
    const scenarioGroup = raw.pages.find(
      (page: { title?: string }) => page.title === '场景实践',
    );
    expect(scenarioGroup.pages).toEqual([
      'best-practice/voice-room',
      'best-practice/one-to-one-call',
    ]);
    const pages = (scenarioGroup.pages as string[]).map((path) => {
      const content = readFileSync(
        `content/docs/zh-CN/realtime-media/rtm/${path}.mdx`,
        'utf8',
      );
      const tabs = extractStructuredPlatformTabs(
        processPlatformMarkdown(content),
      );
      expect(tabs?.platforms).toEqual([
        'android',
        'ios',
        'web',
        'harmonyos',
        'cpp',
        'swift',
      ]);
      const name = content.match(/^title:\s*(.*)$/m)?.[1];
      const expected = path.endsWith('/voice-room')
        ? '语聊房场景'
        : '1V1 呼叫邀请场景';
      expect(name).toBe(expected);
      return {
        type: 'page' as const,
        name: name ?? '',
        url: `/zh-CN/realtime-media/rtm/${path}`,
      };
    });
    const root: PageTreeRoot = {
      name: 'Docs',
      children: [
        {
          type: 'folder',
          name: '中文',
          children: [
            {
              type: 'folder',
              name: '实时音视频',
              index: {
                type: 'page',
                name: '实时音视频',
                url: '/zh-CN/realtime-media',
              },
              children: [
                {
                  $id: 'rtm',
                  type: 'folder',
                  name: '实时消息 RTM',
                  index: {
                    type: 'page',
                    name: '实时消息 RTM',
                    url: '/zh-CN/realtime-media/rtm',
                  },
                  children: [{ type: 'separator', name: '场景实践' }, ...pages],
                },
              ],
            },
          ],
        },
      ],
    };
    const meta = docsMetaSchema.parse(raw);
    const getNodeMeta = (node: Folder | PageTreeRoot) =>
      node.$id === 'rtm' ? meta : undefined;
    const scope = resolveDocsNavScope({
      activePath: pages[0].url,
      getNodeMeta,
      root,
      tab: 'realtime-media',
    });
    if (!scope) throw new Error('Missing RTM product navigation scope');
    const sidebar = getScopedNavScopeSidebarNodes({
      getNodeMeta,
      navScope: scope,
    });
    const group = sidebar.find(
      (node) => node.type === 'section' && node.title === '场景实践',
    );
    if (group?.type !== 'section')
      throw new Error('Missing scenario sidebar section');
    expect(group.children).toHaveLength(2);
    expect(new Set(group.children.map((node) => node.title)).size).toBe(2);
    for (const [index, node] of group.children.entries()) {
      const page = pages[index];
      expect(node.url).toBe(page.url);
      expect(node.title).toBe(page.name);
    }
  });
});
