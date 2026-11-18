import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderDocsMdx } from '@/test/render-docs-mdx';
import { extractDocSearchContent } from '../search/algolia-records.server';

const prose = `
- 使用 21:9 的显示屏。
- 页面录制 SD:100 路。
- 联系 (mailto:support@agora.io)。

::literal-label[保留标签]{key="value"}

:::caution[注意]
保留提示框和 4:3 比例。
:::
`;

describe('literal colon text in the real docs pipeline', () => {
  it('preserves prose and leaf syntax while keeping container callouts', async () => {
    const { container } = await renderDocsMdx(prose);
    expect(screen.getByText('使用 21:9 的显示屏。')).toBeInTheDocument();
    expect(screen.getByText('页面录制 SD:100 路。')).toBeInTheDocument();
    expect(
      screen.getByText('联系 (mailto:support@agora.io)。'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('::literal-label[保留标签]{key="value"}'),
    ).toBeInTheDocument();
    expect(screen.getByText('保留提示框和 4:3 比例。')).toBeVisible();
    expect(container.querySelector('li > div')).toBeNull();
    expect(screen.getByText('注意')).toBeVisible();
    expect(
      screen.getByText('保留提示框和 4:3 比例。').closest('.prose-no-margin'),
    ).not.toBeNull();
  });

  it('retains the same text in searchable content', () => {
    const result = JSON.stringify(extractDocSearchContent(prose));
    expect(result).toContain('21:9');
    expect(result).toContain('SD:100');
    expect(result).toContain('mailto:support@agora.io');
  });
});
