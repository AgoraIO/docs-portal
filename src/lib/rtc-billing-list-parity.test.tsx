import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { renderDocsMdx } from '@/test/render-docs-mdx';

const pages = [
  'content/docs/zh-CN/realtime-media/rtc/reference/billing-strategy.mdx',
  'content/docs/zh-CN/realtime-media/rtc/reference/legacy-billing/billing-strategy-old.mdx',
];

describe.each(pages)('RTC billing list parity: %s', (file) => {
  const source = readFileSync(file, 'utf8');

  it('renders the two QPS conditions as sibling list items inside the pricing cell', async () => {
    const section = source
      .split('本地截图上传单价如下表所示：')[1]
      .split('**计费示例**')[0];
    const { container } = await renderDocsMdx(section);
    const row = Array.from(container.querySelectorAll('tbody tr')).find((row) =>
      row.textContent?.startsWith('QPS 超限费用'),
    );
    const cell = row?.querySelectorAll('td')[2];
    expect(cell?.textContent).toContain('每月免费额度为 500 QPS，其中：');
    expect(cell?.querySelectorAll('ul > li')).toHaveLength(2);
    expect(cell?.querySelector('li ul')).toBeNull();
    expect(cell?.querySelectorAll('li')[0].textContent).toBe(
      '月峰值 QPS ≤ 500 时，不收取 QPS 超限费用',
    );
    expect(cell?.querySelectorAll('li')[1].textContent).toBe(
      '月峰值 QPS > 500 时，超出部分按单价计费，每月根据月峰值 QPS 收取一次 QPS 超限费用',
    );
  });

  it('keeps both media-relay callout items at the same list level', async () => {
    const section = source
      .split('### 跨频道媒体流转发')[1]
      .split('- **时长用量**')[1]
      .split('- **单价**')[0];
    const { container } = await renderDocsMdx(`- **时长用量**${section}`);
    const firstItem = Array.from(container.querySelectorAll('li')).find(
      (item) =>
        item.textContent?.trim().startsWith('如果你将源媒体流一次性转发至 N'),
    );
    expect(firstItem).toBeDefined();
    expect(firstItem?.querySelector('ul')).toBeNull();
    expect(firstItem?.parentElement?.children).toHaveLength(2);
    expect(firstItem?.nextElementSibling?.textContent).toBe(
      '转发视频用量的档位和订阅集合分辨率无关，而是根据所转发的视频分辨率来决定。',
    );
  });
});
