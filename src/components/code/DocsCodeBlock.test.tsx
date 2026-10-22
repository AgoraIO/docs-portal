import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { DocsCodeBlock } from './DocsCodeBlock';

afterEach(() => vi.restoreAllMocks());

it('copies every line of a collapsed example and announces the result', async () => {
  const source = Array.from({ length: 42 }, (_, i) => `line ${i + 1}`).join(
    '\n',
  );
  const writeText = vi.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: { writeText },
  });
  render(
    <DocsCodeBlock source={source} language="javascript" locale="zh-CN" />,
  );
  expect(
    screen.getByRole('button', { name: '展开全部 42 行' }),
  ).toHaveAttribute('aria-expanded', 'false');
  fireEvent.click(screen.getByRole('button', { name: '复制代码' }));
  await waitFor(() => expect(writeText).toHaveBeenCalledWith(source));
  expect(
    await screen.findByRole('button', { name: '已复制' }),
  ).toBeInTheDocument();
  expect(screen.getByRole('status')).toHaveTextContent('已复制');
  fireEvent.click(screen.getByRole('button', { name: '展开全部 42 行' }));
  expect(screen.getByRole('button', { name: '收起代码' })).toHaveAttribute(
    'aria-expanded',
    'true',
  );
});

it('reports clipboard failure instead of claiming success', async () => {
  const writeText = vi.fn().mockRejectedValue(new Error('Clipboard denied'));
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: { writeText },
  });
  render(<DocsCodeBlock source="npm install" language="bash" locale="zh-CN" />);
  fireEvent.click(screen.getByRole('button', { name: '复制代码' }));
  expect(
    await screen.findByRole('button', { name: '复制失败，请重试' }),
  ).toBeInTheDocument();
  expect(screen.getByRole('status')).toHaveTextContent('复制失败');
});

it('copies rendered code without line decorations or presentation directives', async () => {
  const writeText = vi.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: { writeText },
  });
  render(
    <DocsCodeBlock locale="zh-CN">
      <code>
        <span data-copy-ignore>42</span>
        {
          '// highlight-start\ncurl /api \\\n// highlight-end\n--data \'{"uid":"123"}\''
        }
      </code>
    </DocsCodeBlock>,
  );
  fireEvent.click(screen.getByRole('button', { name: '复制代码' }));
  await waitFor(() =>
    expect(writeText).toHaveBeenCalledWith(
      'curl /api \\\n--data \'{"uid":"123"}\'',
    ),
  );
});

it('reveals only the long example containing the incoming deep link', async () => {
  const source = Array.from({ length: 44 }, (_, i) => `line ${i + 1}`).join(
    '\n',
  );
  render(
    <>
      <DocsCodeBlock source={source} locale="zh-CN">
        <code>
          <span id="deep-code-line">last line</span>
        </code>
      </DocsCodeBlock>
      <DocsCodeBlock source={source} locale="zh-CN" />
    </>,
  );
  window.history.replaceState(null, '', '#deep-code-line');
  window.dispatchEvent(new HashChangeEvent('hashchange'));
  await waitFor(() =>
    expect(screen.getByRole('button', { name: '收起代码' })).toHaveAttribute(
      'aria-expanded',
      'true',
    ),
  );
  expect(
    screen.getByRole('button', { name: '展开全部 44 行' }),
  ).toHaveAttribute('aria-expanded', 'false');
  window.dispatchEvent(new Event('pagehide'));
  window.history.replaceState(null, '', window.location.pathname);
});

it('allows disabling line numbers and names its keyboard-scrollable code region', () => {
  const { container } = render(
    <DocsCodeBlock
      source={'first\nsecond'}
      language="json"
      lineNumbers={false}
      allowCopy={false}
      locale="zh-CN"
    />,
  );
  expect(container.querySelector('figure')).not.toHaveAttribute(
    'data-line-numbers',
  );
  expect(screen.getByRole('region', { name: 'JSON · 2 行' })).toHaveAttribute(
    'tabindex',
    '0',
  );
  expect(
    screen.queryByRole('button', { name: '复制代码' }),
  ).not.toBeInTheDocument();
});
