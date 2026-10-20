import { afterEach, beforeEach, expect, it, vi } from 'vitest';

const capture = vi.fn();
vi.mock('./posthog', () => ({ captureMeasurementEvent: capture }));

beforeEach(() => {
  vi.resetModules();
  vi.stubEnv('VITE_DOCS_REGION', 'cn');
  vi.stubEnv('VITE_DOCS_MEASUREMENT_ENABLED', 'true');
  capture.mockClear();
  localStorage.clear();
  sessionStorage.clear();
  window.name = '';
});

it.each(['same_tab', 'new_tab'])(
  'restores a prefixless target left by the previous runtime: %s',
  async (mode) => {
    const token = 'f30a35a2-d5a8-4cb0-8079-9ec39db6e5d1';
    const now = Date.now();
    const attribution = {
      journey: {
        id: 'previous-journey',
        started: now,
        active: now,
        sampled: false,
      },
      searchId: 'previous-search',
      resultsViewId: 'previous-results',
      target: '/realtime-media/rtc/get-started',
      expires: now + 60000,
    };
    const path = '/zh-CN/realtime-media/rtc/get-started/';
    if (mode === 'new_tab') {
      localStorage.setItem(`docs-from-${token}`, JSON.stringify(attribution));
      window.history.replaceState({}, '', `${path}?docs_from=${token}`);
    } else {
      sessionStorage.setItem('docs-result-target', JSON.stringify(attribution));
      window.history.replaceState({}, '', path);
    }
    const { getDocsMeasurement } = await import('./measurement.client');
    expect(
      getDocsMeasurement()?.viewContent({ path, contentType: 'mdx' }),
    ).toMatchObject({
      canonical_path: '/zh-CN/realtime-media/rtc/get-started',
      search_id: 'previous-search',
      results_view_id: 'previous-results',
      attribution_status: 'search_result',
    });
    expect(window.location.search).toBe('');
  },
);
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
