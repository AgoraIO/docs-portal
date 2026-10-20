import { afterEach, beforeEach, expect, it, vi } from 'vitest';

const capture = vi.fn();
vi.mock('./posthog', () => ({ captureMeasurementEvent: capture }));

beforeEach(() => {
  vi.resetModules();
  vi.stubEnv('VITE_DOCS_REGION', 'cn');
  vi.stubEnv('VITE_DOCS_MEASUREMENT_ENABLED', 'true');
  capture.mockClear();
  sessionStorage.clear();
  window.name = '';
});
afterEach(() => vi.unstubAllEnvs());

it.each([
  ['global', 'true', '/en/introduction'],
  ['global', 'true', '/introduction'],
  ['global', 'true', '/zh-CN/introduction'],
  ['cn', 'true', '/en/introduction'],
  ['cn', 'true', '/en/search'],
  ['cn', 'true', '/api/search'],
  ['cn', 'false', '/zh-CN/introduction'],
  ['cn', 'false', '/search'],
])(
  'keeps measurement inert for region=%s enabled=%s path=%s',
  async (region, enabled, path) => {
    vi.stubEnv('VITE_DOCS_REGION', region);
    vi.stubEnv('VITE_DOCS_MEASUREMENT_ENABLED', enabled);
    window.history.replaceState({}, '', path);
    const { getDocsMeasurement, measurementEnabled } = await import(
      './measurement.client'
    );
    expect(measurementEnabled()).toBe(false);
    expect(getDocsMeasurement()).toBeUndefined();
    expect(window.name).toBe('');
    expect(sessionStorage.length).toBe(0);
    expect(capture).not.toHaveBeenCalled();
  },
);

it.each([
  '/zh-CN/introduction',
  '/introduction',
  '/zh-CN/search',
  '/search',
  '/search/',
  '/realtime-media/rtc/get-started',
  '/api-reference/rtc/web',
])('accepts a published CN route when explicitly enabled: %s', async (path) => {
  window.history.replaceState({}, '', path);
  const { measurementEnabled } = await import('./measurement.client');
  expect(measurementEnabled()).toBe(true);
});
