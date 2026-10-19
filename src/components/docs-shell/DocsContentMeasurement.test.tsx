import { act, render } from '@testing-library/react';
import { useRef } from 'react';
import { afterEach, expect, it, vi } from 'vitest';
import {
  createDocsMeasurement,
  type DocsMeasurement,
  type MeasurementEvent,
} from '@/lib/analytics/docs-measurement';
import {
  DocsMeasurementContext,
  useMeasuredDocsBody,
} from './DocsContentMeasurement';

let measurement: DocsMeasurement;
vi.mock('@/lib/analytics/measurement', () => ({
  getDocsMeasurement: () => measurement,
}));
afterEach(() => vi.restoreAllMocks());

function Body() {
  const root = useRef<HTMLDivElement>(null);
  useMeasuredDocsBody(root);
  return <div ref={root}>Real body</div>;
}

it('rechecks actual body visibility after a new problem and does not duplicate views for answers', () => {
  const events: MeasurementEvent[] = [];
  let sequence = 0;
  measurement = createDocsMeasurement({
    emit: (e) => events.push(e),
    now: Date.now,
    id: () => String(++sequence),
    environment: 'local',
    appRelease: 'test',
    entryPath: '/zh-CN/token',
  });
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
    <DocsMeasurementContext
      value={{ contentType: 'mdx', contentPath: '/zh-CN/token' }}
    >
      <Body />
    </DocsMeasurementContext>,
  );
  act(() => {
    measurement.feedback('resolution', 'resolved', 'content', 'manual');
  });
  expect(events.filter((e) => e.name === 'docs_content_viewed')).toHaveLength(
    1,
  );
  act(() => {
    measurement.reset();
  });
  expect(events.filter((e) => e.name === 'docs_content_viewed')).toHaveLength(
    2,
  );
  expect(events.filter((e) => e.name === 'docs_journey_started')).toHaveLength(
    2,
  );
});
