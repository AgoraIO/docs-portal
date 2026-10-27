import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { useState } from 'react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { DocsFeedbackForm } from './DocsFeedbackForm';

const { report } = vi.hoisted(() => ({ report: vi.fn() }));
vi.mock('@/lib/analytics/posthog', () => ({
  captureDocsFeedbackSubmission: report,
}));
beforeEach(() => {
  report.mockReset().mockResolvedValue(true);
  window.history.replaceState(
    {},
    '',
    '/realtime-media/rtc?token=secret#section',
  );
});
afterEach(() => vi.restoreAllMocks());

function FeedbackHarness({ helpfulness }: { helpfulness: 'yes' | 'no' }) {
  const [expanded, setExpanded] = useState(true);
  return (
    <>
      <button type="button" onClick={() => setExpanded(true)}>
        展开
      </button>
      <DocsFeedbackForm
        id="test-feedback"
        expanded={expanded}
        onCollapse={() => setExpanded(false)}
        helpfulness={helpfulness}
      />
    </>
  );
}

it('shows optional comments before selecting reasons and preserves each branch draft', () => {
  const { rerender } = render(<FeedbackHarness helpfulness="yes" />);
  expect(screen.getAllByRole('checkbox')).toHaveLength(5);
  expect(screen.getByRole('textbox')).toBeVisible();
  expect(screen.getByRole('textbox')).not.toBeRequired();
  expect(screen.queryByText(/补充体验评价/)).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('checkbox', { name: '示例实用' }));
  fireEvent.change(screen.getByRole('textbox'), {
    target: { value: '正向说明' },
  });
  fireEvent.click(screen.getByRole('button', { name: '收起' }));
  fireEvent.click(screen.getByRole('button', { name: '展开' }));
  expect(screen.getByRole('checkbox', { name: '示例实用' })).toBeChecked();
  rerender(<FeedbackHarness helpfulness="no" />);
  expect(screen.getAllByRole('checkbox')).toHaveLength(6);
  expect(screen.getByRole('textbox')).toBeVisible();
  expect(screen.getByRole('textbox')).toHaveValue('');
  fireEvent.change(screen.getByRole('textbox'), {
    target: { value: '负向说明' },
  });
  rerender(<FeedbackHarness helpfulness="yes" />);
  expect(screen.getByRole('textbox')).toHaveValue('正向说明');
  expect(screen.getByRole('checkbox', { name: '示例实用' })).toBeChecked();
  expect(report).not.toHaveBeenCalled();
});

it('reports reason-only feedback once and locks the submitted form', async () => {
  const open = vi.spyOn(window, 'open').mockReturnValue(null);
  render(<FeedbackHarness helpfulness="yes" />);
  fireEvent.click(screen.getByRole('checkbox', { name: '示例实用' }));
  const submit = screen.getByRole('button', { name: '提交' });
  fireEvent.click(submit);
  fireEvent.click(submit);
  await screen.findByText('补充反馈已提交，谢谢！');
  expect(report).toHaveBeenCalledTimes(1);
  expect(report.mock.calls[0][0]).toMatchObject({
    helpfulness: 'yes',
    reasons: ['useful_examples'],
    details: '',
    pagePath: '/realtime-media/rtc',
  });
  expect(open).not.toHaveBeenCalled();
  expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
  expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  expect(
    screen.queryByRole('button', { name: '提交' }),
  ).not.toBeInTheDocument();
});

it.each([
  ['yes', false],
  ['yes', true],
  ['no', false],
  ['no', true],
] as const)(
  'reports comments with their page and optional reasons (%s, selected=%s)',
  async (helpfulness, selected) => {
    const replace = vi.fn();
    const popup = {
      opener: 'parent',
      closed: false,
      location: { replace },
      close: vi.fn(),
    };
    vi.spyOn(window, 'open').mockReturnValue(popup as unknown as Window);
    render(<FeedbackHarness helpfulness={helpfulness} />);
    if (selected)
      fireEvent.click(
        screen.getByRole('checkbox', {
          name: helpfulness === 'yes' ? '示例实用' : '内容错误或过时',
        }),
      );
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: '  示例反馈\n第二行说明  ' },
    });
    fireEvent.click(screen.getByRole('button', { name: '提交并前往 GitHub' }));
    await waitFor(() => expect(replace).toHaveBeenCalledTimes(1));
    const payload = report.mock.calls[0][0];
    expect(payload).toMatchObject({
      reasons: selected
        ? [helpfulness === 'yes' ? 'useful_examples' : 'incorrect_or_outdated']
        : [],
      details: '示例反馈\n第二行说明',
      helpfulness,
      pagePath: '/realtime-media/rtc',
    });
    const body = new URL(replace.mock.calls[0][0]).searchParams.get('body');
    expect(body).toContain(
      selected
        ? helpfulness === 'yes'
          ? '示例实用'
          : '内容错误或过时'
        : '未选择',
    );
    expect(body).toContain('示例反馈\n第二行说明');
    expect(body).not.toContain('token=secret');
    expect(popup.opener).toBeNull();
    expect(screen.getByRole('status')).toHaveTextContent('补充反馈已提交');
    expect(screen.getByRole('status')).toHaveTextContent('GitHub');
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  },
);

it('keeps a manual GitHub continuation link when the browser blocks a new tab', async () => {
  vi.spyOn(window, 'open').mockReturnValue(null);
  render(<FeedbackHarness helpfulness="no" />);
  fireEvent.change(screen.getByRole('textbox'), {
    target: { value: '需要补充说明' },
  });
  fireEvent.click(screen.getByRole('button', { name: '提交并前往 GitHub' }));
  const link = await screen.findByRole('link', {
    name: '在 GitHub 创建 Issue',
  });
  expect(
    new URL(link.getAttribute('href') ?? '').searchParams.get('body'),
  ).toContain('需要补充说明');
  fireEvent.click(link);
  expect(report).toHaveBeenCalledTimes(1);
});

it.each(['yes', 'no'] as const)(
  'does not submit empty optional fields (%s)',
  (helpfulness) => {
    render(<FeedbackHarness helpfulness={helpfulness} />);
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: '  \n ' },
    });
    expect(
      screen.queryByRole('button', { name: /^提交/ }),
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '收起' }));
    expect(report).not.toHaveBeenCalled();
  },
);

it('does not report hidden negative comments or reasons on a positive submission', async () => {
  const open = vi.spyOn(window, 'open').mockReturnValue(null);
  const { rerender } = render(<FeedbackHarness helpfulness="no" />);
  fireEvent.click(screen.getByRole('checkbox', { name: '内容错误或过时' }));
  fireEvent.change(screen.getByRole('textbox'), {
    target: { value: '负向说明' },
  });
  rerender(<FeedbackHarness helpfulness="yes" />);
  expect(
    screen.queryByRole('button', { name: '提交' }),
  ).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('checkbox', { name: '示例实用' }));
  fireEvent.click(screen.getByRole('button', { name: '提交' }));
  await screen.findByText('补充反馈已提交，谢谢！');
  expect(report.mock.calls[0][0]).toMatchObject({
    reasons: ['useful_examples'],
    details: '',
  });
  expect(open).not.toHaveBeenCalled();
});

it('retains failed drafts and uses the same id for an unchanged retry', async () => {
  report.mockResolvedValueOnce(false).mockResolvedValueOnce(true);
  render(<FeedbackHarness helpfulness="no" />);
  fireEvent.click(screen.getByRole('checkbox', { name: '找不到所需内容' }));
  fireEvent.click(screen.getByRole('button', { name: '提交' }));
  await screen.findByRole('alert');
  expect(
    screen.getByRole('checkbox', { name: '找不到所需内容' }),
  ).toBeChecked();
  fireEvent.click(screen.getByRole('button', { name: '提交' }));
  await screen.findByText('补充反馈已提交，谢谢！');
  expect(report.mock.calls[0][0].id).toBe(report.mock.calls[1][0].id);
});

it('prevents changing the form while a submission is pending', async () => {
  let complete: (value: boolean) => void = () => {};
  report.mockImplementation(
    () =>
      new Promise<boolean>((resolve) => {
        complete = resolve;
      }),
  );
  render(<FeedbackHarness helpfulness="no" />);
  fireEvent.click(screen.getByRole('checkbox', { name: '其他' }));
  fireEvent.click(screen.getByRole('button', { name: '提交' }));
  expect(screen.getByRole('checkbox', { name: '其他' })).toBeDisabled();
  expect(screen.getByRole('textbox')).toBeDisabled();
  expect(screen.getByRole('button', { name: '提交中…' })).toBeDisabled();
  await act(async () => complete(true));
  await screen.findByText('补充反馈已提交，谢谢！');
});
