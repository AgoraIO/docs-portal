import { describe, expect, it } from 'vitest';
import { loadDocsPagePayload } from './docs-page.server';
import type { DocsSidebarNode } from './docs-tree';
import { source } from './source.server';

const productUrl = '/zh-CN/realtime-media/cloud-recording';
const eventPages = [
  ['接收 Webhook 事件', 'build/monitor-events/enable-ncs'],
  ['回调事件概览', 'reference/ncs-events'],
  ['录制服务事件', 'build/implement-core-features/service'],
  ['录制模块事件', 'build/implement-core-features/status'],
  ['上传模块事件', 'build/implement-core-features/uploading'],
  ['页面录制事件', 'build/implement-core-features/webpage'],
] as const;

function flattenNodes(nodes: DocsSidebarNode[]): DocsSidebarNode[] {
  return nodes.flatMap((node) =>
    node.type === 'section' ? [node, ...flattenNodes(node.children)] : [node],
  );
}

describe('cloud recording event navigation', () => {
  it('groups Webhook setup, overview, and event details under one task', async () => {
    const payload = await loadDocsPagePayload('zh-CN', 'realtime-media', [
      'cloud-recording',
      'build',
      'implement-core-features',
      'service',
    ]);

    if (!payload || 'redirectUrl' in payload) {
      throw new Error('expected a cloud recording docs page payload');
    }

    const nodes = flattenNodes(payload.sidebar);
    const taskOrder = [
      '开通与接入',
      '配置录制模式',
      '管理录制文件',
      '监听录制事件',
      '最佳实践',
    ];
    expect(
      nodes
        .filter(
          (node) => node.type === 'section' && taskOrder.includes(node.title),
        )
        .map((node) => node.title),
    ).toEqual(taskOrder);
    const eventGroups = nodes.filter(
      (node) => node.type === 'section' && node.title === '监听录制事件',
    );
    expect(eventGroups).toHaveLength(1);
    const group = eventGroups[0];
    if (group?.type !== 'section') {
      throw new Error('expected the recording event section');
    }

    expect(group.children).toEqual(
      eventPages.map(([title, path]) =>
        expect.objectContaining({
          title,
          type: 'page',
          url: `${productUrl}/${path}`,
        }),
      ),
    );
    for (const [, path] of eventPages) {
      expect(
        nodes.filter(
          (node) =>
            node.type === 'page' && node.url === `${productUrl}/${path}`,
        ),
      ).toHaveLength(1);
    }
  });

  it('preserves existing event article URLs', () => {
    for (const [title, path] of eventPages) {
      const page = source.getPage(
        ['realtime-media', 'cloud-recording', ...path.split('/')],
        'zh-CN',
      );
      expect(page?.url).toBe(`${productUrl}/${path}`);
      expect(page?.data.title).toBe(title);
    }
  });
});
