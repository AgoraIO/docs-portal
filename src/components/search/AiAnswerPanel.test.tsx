import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { askDocumentQuestion } from '@/lib/ai-answer/client';
import type { AnswerResponse } from '@/lib/ai-answer/contracts';
import { AiAnswerPanel } from './AiAnswerPanel';
import { AnswerMarkdown } from './AnswerMarkdown';

vi.mock('@/lib/ai-answer/client', () => ({ askDocumentQuestion: vi.fn() }));
const result: AnswerResponse = {
  mode: 'local-demo',
  status: 'answered',
  answer: 'Token 示例\n\n```ts\n  join(token);\n```',
  citations: [
    { id: 'e1', title: 'Token 指南', url: '/zh-CN/realtime-media/rtc/token' },
  ],
};
afterEach(() => vi.resetAllMocks());
function submit(question = 'Token') {
  fireEvent.change(screen.getByRole('textbox', { name: '你的问题' }), {
    target: { value: question },
  });
  fireEvent.click(screen.getByRole('button', { name: '提问' }));
}
it('waits for explicit submission then renders local excerpts, code and citations', async () => {
  vi.mocked(askDocumentQuestion).mockResolvedValue(result);
  render(
    <AiAnswerPanel
      filters={{ product: 'rtc', platform: 'web', type: 'docs' }}
      onClose={vi.fn()}
    />,
  );
  expect(askDocumentQuestion).not.toHaveBeenCalled();
  submit();
  expect(
    await screen.findByRole('link', { name: 'Token 指南' }),
  ).toHaveAttribute('href', result.citations[0].url);
  expect(screen.getByText('join(token);').closest('code')).toHaveTextContent(
    'join(token);',
  );
  expect(screen.getByText(/本地文档摘录演示/)).toBeInTheDocument();
  expect(askDocumentQuestion).toHaveBeenCalledWith(
    { question: 'Token', product: 'rtc', platform: 'web', type: 'docs' },
    expect.any(AbortSignal),
  );
});
it('cancels and ignores a late response even if transport ignores its signal', async () => {
  let finish: (v: AnswerResponse) => void = () => {};
  vi.mocked(askDocumentQuestion).mockImplementation(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  );
  render(<AiAnswerPanel filters={{}} onClose={vi.fn()} />);
  submit();
  expect(screen.getByRole('status')).toHaveTextContent('正在查找文档');
  fireEvent.click(screen.getByRole('button', { name: '取消' }));
  expect(vi.mocked(askDocumentQuestion).mock.calls[0][1]?.aborted).toBe(true);
  await act(async () => finish(result));
  expect(
    screen.queryByRole('link', { name: 'Token 指南' }),
  ).not.toBeInTheDocument();
});
it('clears results and aborts pending work on filter change or unmount', async () => {
  vi.mocked(askDocumentQuestion).mockResolvedValue(result);
  const view = render(
    <AiAnswerPanel filters={{ platform: 'web' }} onClose={vi.fn()} />,
  );
  submit();
  await screen.findByRole('link', { name: 'Token 指南' });
  view.rerender(
    <AiAnswerPanel filters={{ platform: 'android' }} onClose={vi.fn()} />,
  );
  expect(
    screen.queryByRole('link', { name: 'Token 指南' }),
  ).not.toBeInTheDocument();
  vi.mocked(askDocumentQuestion).mockImplementation(
    () => new Promise(() => {}),
  );
  submit();
  view.unmount();
  expect(vi.mocked(askDocumentQuestion).mock.lastCall?.[1]?.aborted).toBe(true);
});
it('shows no evidence distinctly and supports retry after sanitized errors', async () => {
  vi.mocked(askDocumentQuestion)
    .mockRejectedValueOnce(new Error('secret upstream'))
    .mockResolvedValueOnce({
      ...result,
      status: 'no-evidence',
      answer: '没有足够依据',
      citations: [],
    });
  render(<AiAnswerPanel filters={{}} onClose={vi.fn()} />);
  submit();
  expect(await screen.findByRole('alert')).not.toHaveTextContent('secret');
  fireEvent.click(screen.getByRole('button', { name: '重试' }));
  expect(await screen.findByText('没有足够依据')).toBeInTheDocument();
  expect(screen.queryByRole('link')).not.toBeInTheDocument();
});
it('closes the panel and aborts active work', async () => {
  vi.mocked(askDocumentQuestion).mockImplementation(
    () => new Promise(() => {}),
  );
  const close = vi.fn();
  render(<AiAnswerPanel filters={{}} onClose={close} />);
  submit();
  fireEvent.click(screen.getByRole('button', { name: '关闭 AI 问答' }));
  expect(close).toHaveBeenCalled();
  await waitFor(() =>
    expect(vi.mocked(askDocumentQuestion).mock.lastCall?.[1]?.aborted).toBe(
      true,
    ),
  );
});
it('renders restricted markdown without scripts, images, or model-provided links', () => {
  const { container } = render(
    <AnswerMarkdown
      text={
        '# 标题\n\n**强调** [恶意链接](javascript:alert(1))\n\n<img src=x onerror=alert(1)>\n\n![图片](https://evil.test/x)\n\n```html\n<script>alert(1)</script>\n```'
      }
    />,
  );
  expect(container.querySelector('script,img,a')).toBeNull();
  expect(screen.getByText('强调').tagName).toBe('STRONG');
  expect(container.querySelector('code')).toHaveTextContent(
    '<script>alert(1)</script>',
  );
});

it('labels a Bailian response without claiming it is a local excerpt', async () => {
  vi.mocked(askDocumentQuestion).mockResolvedValue({
    ...result,
    mode: 'bailian',
  });
  render(<AiAnswerPanel filters={{}} onClose={vi.fn()} />);
  submit();
  await screen.findByRole('link', { name: 'Token 指南' });
  expect(screen.queryByText(/本地文档摘录演示/)).not.toBeInTheDocument();
  expect(screen.getByText(/百炼知识库与模型生成/)).toBeInTheDocument();
});

it('distinguishes local KB model answers from excerpt-only and hosted KB modes', async () => {
  vi.mocked(askDocumentQuestion).mockResolvedValue({
    ...result,
    mode: 'local-kb',
  });
  render(<AiAnswerPanel filters={{}} onClose={vi.fn()} />);
  submit();
  await screen.findByRole('link', { name: 'Token 指南' });
  expect(screen.getByText(/本地知识库检索，百炼模型生成/)).toBeInTheDocument();
  expect(screen.queryByText(/尚未调用/)).not.toBeInTheDocument();
});
