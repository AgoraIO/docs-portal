import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { i18n } from '@/lib/i18n/i18n';
import { DocsPageFeedback } from './DocsPageFeedback';

const { capture, report, opened, prompted, issueClicked } = vi.hoisted(() => ({
  capture: vi.fn(),
  report: vi.fn(),
  opened: vi.fn(),
  prompted: vi.fn(),
  issueClicked: vi.fn(),
}));
vi.mock('@/lib/analytics/posthog', () => ({
  captureDocsFeedbackOpened: opened,
  captureDocsFeedbackPrompted: prompted,
  captureDocsFeedbackIssueClicked: issueClicked,
  captureDocsPageFeedback: capture,
  captureDocsFeedbackSubmission: report,
}));
vi.mock('@/lib/analytics/measurement', () => ({
  getDocsMeasurement: () => undefined,
}));
beforeEach(() => {
  capture.mockClear();
  opened.mockClear();
  prompted.mockClear();
  issueClicked.mockClear();
  report.mockReset().mockResolvedValue(true);
});
afterEach(() => vi.restoreAllMocks());

it('expands follow-up feedback below the votes without opening a modal', async () => {
  render(
    <I18nextProvider i18n={i18n}>
      <DocsPageFeedback locale="zh-CN" />
    </I18nextProvider>,
  );
  expect(
    screen.getAllByRole('button').map((button) => button.textContent),
  ).toEqual(['有', '没有']);
  const yes = screen.getByRole('button', { name: '有' });
  const no = screen.getByRole('button', { name: '没有' });
  expect(yes).toHaveClass('h-8', 'rounded-md', 'px-3', 'text-xs');
  fireEvent.click(no);
  expect(screen.getByRole('region', { name: '改进反馈' })).toBeVisible();
  expect(no).toHaveAttribute('aria-pressed', 'true');
  expect(screen.getByText('这个页面有帮助吗？')).toBeVisible();
  expect(screen.queryByText(/已记录/)).not.toBeInTheDocument();
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(no).not.toHaveAttribute('aria-haspopup');
  expect(no.getAttribute('aria-controls')).toBe(screen.getByRole('region').id);
  expect(screen.getByTestId('docs-feedback')).toContainElement(
    screen.getByRole('region'),
  );
  expect(capture).toHaveBeenCalledExactlyOnceWith({
    locale: 'zh-CN',
    value: 'no',
  });
  fireEvent.click(no);
  expect(screen.queryByRole('region')).not.toBeInTheDocument();
  expect(no).toHaveAttribute('aria-pressed', 'true');
  fireEvent.click(no);
  expect(screen.getByRole('region', { name: '改进反馈' })).toBeVisible();
  expect(capture).toHaveBeenCalledTimes(1);
  expect(
    screen.queryByRole('radiogroup', { name: '这篇文档是否有帮助' }),
  ).not.toBeInTheDocument();
  fireEvent.change(screen.getByRole('textbox'), {
    target: { value: '保留这份反馈草稿' },
  });
  fireEvent.click(screen.getByRole('button', { name: '收起' }));
  await waitFor(() =>
    expect(screen.queryByRole('region')).not.toBeInTheDocument(),
  );
  await waitFor(() => expect(no).toHaveFocus());
  expect(no).toHaveAttribute('aria-pressed', 'true');
  fireEvent.click(no);
  expect(screen.getByRole('textbox')).toHaveValue('保留这份反馈草稿');
  expect(capture).toHaveBeenCalledTimes(1);
  fireEvent.click(yes);
  expect(screen.getByRole('region', { name: '正向反馈' })).toBeVisible();
  expect(screen.getByRole('checkbox', { name: '示例实用' })).toBeVisible();
  expect(
    screen.queryByRole('checkbox', { name: '内容错误或过时' }),
  ).not.toBeInTheDocument();
  expect(capture).toHaveBeenCalledTimes(2);
  expect(capture).toHaveBeenLastCalledWith({ locale: 'zh-CN', value: 'yes' });
  expect(yes).toHaveTextContent('有');
  expect(screen.queryByText(/已记录/)).not.toBeInTheDocument();
  expect(screen.getByRole('textbox')).toBeVisible();
  expect(screen.getByRole('textbox')).toHaveValue('');
  expect(
    screen.queryByRole('button', { name: '提交' }),
  ).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('checkbox', { name: '示例实用' }));
  fireEvent.click(screen.getByRole('button', { name: '提交' }));
  expect(yes).toBeDisabled();
  expect(no).toBeDisabled();
  await screen.findByText('补充反馈已提交，谢谢！');
  const first = structuredClone(report.mock.calls[0][0]);
  expect(first).toMatchObject({
    helpfulness: 'yes',
    reasons: ['useful_examples'],
  });
  expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
  fireEvent.click(yes);
  expect(screen.getByRole('checkbox', { name: '示例实用' })).not.toBeChecked();
  expect(
    screen.queryByRole('button', { name: '提交' }),
  ).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('checkbox', { name: '示例实用' }));
  fireEvent.click(screen.getByRole('button', { name: '提交' }));
  await screen.findByText('补充反馈已提交，谢谢！');
  expect(report).toHaveBeenCalledTimes(2);
  expect(report.mock.calls[1][0].id).not.toBe(first.id);
  expect(report.mock.calls[0][0]).toEqual(first);
  expect(capture).toHaveBeenCalledTimes(2);
  expect(screen.queryByText('开始新问题')).not.toBeInTheDocument();
  expect(opened).not.toHaveBeenCalled();
  expect(issueClicked).not.toHaveBeenCalled();
});

it.each(['yes', 'no'] as const)(
  'supports the English inline %s flow, retry, and GitHub follow-up',
  async (value) => {
    report.mockResolvedValueOnce(false).mockResolvedValue(true);
    render(
      <I18nextProvider i18n={i18n}>
        <DocsPageFeedback locale="en" />
      </I18nextProvider>,
    );
    expect(
      screen.getAllByRole('button').map((button) => button.textContent),
    ).toEqual(['Yes', 'No']);
    const button = screen.getByRole('button', {
      name: value === 'yes' ? 'Yes' : 'No',
    });
    fireEvent.click(button);
    expect(opened).toHaveBeenCalledExactlyOnceWith({ locale: 'en', value });
    expect(button).toHaveAttribute('aria-expanded', 'true');
    expect(button).toHaveAttribute('data-variant', 'default');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getAllByRole('checkbox')).toHaveLength(
      value === 'yes' ? 5 : 6,
    );
    const reason =
      value === 'yes' ? 'Useful examples' : 'Incorrect or outdated content';
    fireEvent.click(screen.getByRole('checkbox', { name: reason }));
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'Please add a complete example.' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Collapse' }));
    expect(opened).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(button).toHaveFocus());
    fireEvent.click(button);
    expect(opened).toHaveBeenCalledTimes(2);
    expect(screen.getByRole('textbox')).toHaveValue(
      'Please add a complete example.',
    );
    expect(screen.getByRole('checkbox', { name: reason })).toBeChecked();
    expect(capture).toHaveBeenCalledExactlyOnceWith({ locale: 'en', value });
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
    expect(button).toBeDisabled();
    expect(await screen.findByRole('alert')).toHaveTextContent(
      "Couldn't submit your feedback.",
    );
    expect(screen.getByRole('textbox')).toHaveValue(
      'Please add a complete example.',
    );
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
    await screen.findByText('Thanks for your feedback.');
    expect(report.mock.calls[0][0]).toEqual(report.mock.calls[1][0]);
    expect(report.mock.calls[1][0]).toMatchObject({
      locale: 'en',
      helpfulness: value,
    });
    const url = new URL(
      screen
        .getByRole('link', { name: 'Create a GitHub issue' })
        .getAttribute('href') ?? '',
    );
    expect(url.searchParams.get('title')).toMatch(/^Docs feedback:/);
    expect(url.searchParams.get('body')).toContain(reason);
    expect(url.searchParams.get('body')).toContain(
      'Please add a complete example.',
    );
    expect(issueClicked).not.toHaveBeenCalled();
    const issueLink = screen.getByRole('link', {
      name: 'Create a GitHub issue',
    });
    issueLink.addEventListener('click', (event) => event.preventDefault());
    fireEvent.click(issueLink);
    expect(issueClicked).toHaveBeenCalledExactlyOnceWith({
      locale: 'en',
      value,
      feedbackId: report.mock.calls[1][0].id,
    });
    expect(report).toHaveBeenCalledTimes(2);
    expect(screen.getByTestId('docs-feedback').textContent).not.toMatch(
      /[\u4e00-\u9fff]/,
    );
    fireEvent.click(button);
    expect(screen.getByRole('checkbox', { name: reason })).not.toBeChecked();
    expect(screen.getByRole('textbox')).toHaveValue('');
    expect(
      screen.queryByRole('button', { name: 'Submit' }),
    ).not.toBeInTheDocument();
  },
);

it('tracks English exposure once only after the feedback enters the viewport', async () => {
  let top = window.innerHeight + 100;
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(
    () => ({
      width: 100,
      height: 100,
      top,
      bottom: top + 100,
      left: 0,
      right: 100,
      x: 0,
      y: top,
      toJSON: () => ({}),
    }),
  );
  render(
    <I18nextProvider i18n={i18n}>
      <DocsPageFeedback locale="en" />
    </I18nextProvider>,
  );
  await new Promise<void>((resolve) =>
    window.requestAnimationFrame(() => resolve()),
  );
  expect(prompted).not.toHaveBeenCalled();
  top = 0;
  document.dispatchEvent(new Event('visibilitychange'));
  await waitFor(() =>
    expect(prompted).toHaveBeenCalledExactlyOnceWith({ locale: 'en' }),
  );
  document.dispatchEvent(new Event('visibilitychange'));
  await new Promise<void>((resolve) =>
    window.requestAnimationFrame(() => resolve()),
  );
  expect(prompted).toHaveBeenCalledTimes(1);
});

it('tracks switching and reopening English forms but not collapsing them', () => {
  render(
    <I18nextProvider i18n={i18n}>
      <DocsPageFeedback locale="en" />
    </I18nextProvider>,
  );
  const yes = screen.getByRole('button', { name: 'Yes' });
  const no = screen.getByRole('button', { name: 'No' });
  fireEvent.click(yes);
  fireEvent.click(yes);
  expect(opened).toHaveBeenCalledTimes(1);
  fireEvent.click(yes);
  fireEvent.click(no);
  fireEvent.click(no);
  expect(opened.mock.calls.map(([input]) => input.value)).toEqual([
    'yes',
    'yes',
    'no',
  ]);
  expect(capture.mock.calls.map(([input]) => input.value)).toEqual([
    'yes',
    'no',
  ]);
});
