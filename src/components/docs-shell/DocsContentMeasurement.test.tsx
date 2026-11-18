import { act, render, waitFor } from '@testing-library/react';
import { useRef } from 'react';
import { afterEach, expect, it, vi } from 'vitest';
import { PlatformPageProvider } from '@/components/mdx/PlatformTabsGroup';
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
afterEach(() => {
  vi.restoreAllMocks();
  localStorage.removeItem('docs-portal:platform:v1');
});

function Body() {
  const root = useRef<HTMLDivElement>(null);
  useMeasuredDocsBody(root);
  return <div ref={root}>Real body</div>;
}

it('rechecks actual body visibility after a new problem and does not duplicate views for answers', async () => {
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
  await waitFor(() =>
    expect(
      events.filter((event) => event.name === 'docs_content_viewed'),
    ).toHaveLength(1),
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
  await waitFor(() =>
    expect(
      events.filter((event) => event.name === 'docs_content_viewed'),
    ).toHaveLength(2),
  );
  expect(events.filter((e) => e.name === 'docs_journey_started')).toHaveLength(
    2,
  );
});

it('records only the painted platform after restoring a stored preference', async () => {
  const events: MeasurementEvent[] = [];
  let sequence = 0;
  measurement = createDocsMeasurement({
    emit: (event) => events.push(event),
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
  localStorage.setItem('docs-portal:platform:v1', 'ios');
  render(
    <PlatformPageProvider
      canonicalPlatform="android"
      defaultPlatform="android"
      platforms='["android","ios"]'
    >
      <DocsMeasurementContext
        value={{ contentType: 'mdx', contentPath: '/zh-CN/token' }}
      >
        <Body />
      </DocsMeasurementContext>
      ,
    </PlatformPageProvider>,
  );
  await act(
    () =>
      new Promise<void>((resolve) =>
        window.requestAnimationFrame(() =>
          window.requestAnimationFrame(() => resolve()),
        ),
      ),
  );
  expect(
    events
      .filter((event) => event.name === 'docs_content_viewed')
      .map((event) => event.properties.platform),
  ).toEqual(['ios']);
});
