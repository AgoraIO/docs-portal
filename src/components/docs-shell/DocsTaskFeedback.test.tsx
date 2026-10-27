import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import {
  createDocsMeasurement,
  type DocsMeasurement,
  type MeasurementEvent,
} from '@/lib/analytics/docs-measurement';
import { DocsTaskFeedback } from './DocsTaskFeedback';

let measurement: DocsMeasurement;
let events: MeasurementEvent[];
vi.mock('@/lib/analytics/measurement', () => ({
  getDocsMeasurement: () => measurement,
  measurementEnabled: () => true,
}));
beforeEach(() => {
  events = [];
  let sequence = 0;
  measurement = createDocsMeasurement({
    emit: (event) => events.push(event),
    now: Date.now,
    random: () => 0,
    id: () => `id-${++sequence}`,
    environment: 'local',
    appRelease: 'test',
    entryPath: '/zh-CN/search',
  });
});
afterEach(() => vi.restoreAllMocks());

it('records visible questions only after opening from a search dialog', async () => {
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
    width: 100,
    height: 100,
    top: 0,
    bottom: 100,
    left: 0,
    right: 100,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  });
  render(
    <Dialog defaultOpen>
      <DialogContent aria-describedby={undefined}>
        <DialogTitle>搜索文档</DialogTitle>
        <DocsTaskFeedback surface="search_dialog" />
      </DialogContent>
    </Dialog>,
  );
  expect(
    events.filter((event) => event.name === 'docs_feedback_prompted'),
  ).toHaveLength(0);
  fireEvent.click(
    screen.getByRole('button', { name: /反馈查找体验|修改查找反馈/ }),
  );
  await waitFor(() =>
    expect(
      events.filter((event) => event.name === 'docs_feedback_prompted'),
    ).toHaveLength(3),
  );
  expect(
    events
      .filter((event) => event.name === 'docs_feedback_prompted')
      .every((event) => event.properties.feedback_source === 'manual'),
  ).toBe(true);
  fireEvent.click(screen.getByRole('button', { name: '完成' }));
  expect(screen.getByRole('dialog', { name: '搜索文档' })).toBeVisible();
});
it('only opens the questionnaire in a modal after clicking, even when sampled', () => {
  expect(measurement.current()?.sampled).toBe(true);
  render(<DocsTaskFeedback surface="content" />);
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(
    screen.queryByText('这次找到的信息解决你的问题了吗？'),
  ).not.toBeInTheDocument();
  fireEvent.click(
    screen.getByRole('button', { name: /反馈查找体验|修改查找反馈/ }),
  );
  expect(
    screen.getByRole('dialog', { name: '这次查找有帮助吗？' }),
  ).toBeVisible();
});

it('keeps answers when closing and reopening, without resubmitting them', async () => {
  render(<DocsTaskFeedback surface="content" />);
  const trigger = screen.getByRole('button', {
    name: /反馈查找体验|修改查找反馈/,
  });
  trigger.focus();
  fireEvent.click(trigger);
  fireEvent.click(screen.getByRole('radio', { name: '部分解决' }));
  fireEvent.click(screen.getByRole('button', { name: '完成' }));
  await waitFor(() =>
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
  );
  await waitFor(() => expect(trigger).toHaveFocus());
  fireEvent.click(trigger);
  expect(screen.getByRole('radio', { name: '部分解决' })).toHaveAttribute(
    'aria-checked',
    'true',
  );
  expect(
    events.filter((event) => event.name === 'docs_feedback_submitted'),
  ).toHaveLength(1);
  fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
  await waitFor(() =>
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
  );
});

it('allows independent answers, revisions and a new problem from a search error surface', () => {
  render(<DocsTaskFeedback surface="search_page" />);
  fireEvent.click(
    screen.getByRole('button', { name: /反馈查找体验|修改查找反馈/ }),
  );
  fireEvent.click(screen.getByRole('radio', { name: '未解决' }));
  fireEvent.click(screen.getByRole('radio', { name: '4 分' }));
  fireEvent.click(screen.getByRole('button', { name: '找不到' }));
  fireEvent.click(screen.getByRole('radio', { name: '解决' }));
  expect(
    events
      .filter((event) => event.name === 'docs_feedback_submitted')
      .map((event) => event.properties.response),
  ).toEqual(['not_resolved', '4', ['not_found'], 'resolved']);
  expect(screen.getByRole('status')).toHaveTextContent('谢谢反馈');
  fireEvent.click(screen.getByRole('button', { name: '开始新问题' }));
  expect(
    screen.getByRole('button', { name: /反馈查找体验|修改查找反馈/ }),
  ).toBeVisible();
  fireEvent.click(
    screen.getByRole('button', { name: /反馈查找体验|修改查找反馈/ }),
  );
  expect(screen.getByRole('radio', { name: '解决' })).toHaveAttribute(
    'aria-checked',
    'false',
  );
});
