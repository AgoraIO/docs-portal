import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';
import {
  createDocsMeasurement,
  type DocsMeasurement,
  type MeasurementEvent,
} from '@/lib/analytics/docs-measurement';
import { DocsTaskFeedback } from './DocsTaskFeedback';

let measurement: DocsMeasurement;
let events: MeasurementEvent[];
vi.mock('@/lib/analytics/measurement.client', () => ({
  getDocsMeasurement: () => measurement,
  measurementEnabled: () => true,
  invitationAllowed: () => false,
  markInvitationVisible: vi.fn(),
}));
beforeEach(() => {
  events = [];
  let sequence = 0;
  measurement = createDocsMeasurement({
    emit: (event) => events.push(event),
    now: Date.now,
    id: () => `id-${++sequence}`,
    environment: 'local',
    appRelease: 'test',
    entryPath: '/zh-CN/search',
  });
});
it('allows independent answers, revisions and a new problem from a search error surface', () => {
  render(<DocsTaskFeedback surface="search_page" />);
  fireEvent.click(
    screen.getByRole('button', { name: '反馈这次查找是否解决了问题' }),
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
    screen.getByRole('button', { name: '反馈这次查找是否解决了问题' }),
  ).toBeVisible();
  fireEvent.click(
    screen.getByRole('button', { name: '反馈这次查找是否解决了问题' }),
  );
  expect(screen.getByRole('radio', { name: '解决' })).toHaveAttribute(
    'aria-checked',
    'false',
  );
});
