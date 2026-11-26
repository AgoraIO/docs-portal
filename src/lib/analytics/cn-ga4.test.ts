import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const origin = 'https://docs.shengwang.cn';

describe('CN production page views', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv('PROD', true);
    vi.stubEnv('VITE_DOCS_REGION', 'cn');
    vi.stubEnv('VITE_DOCS_ENVIRONMENT', 'production');
    vi.stubEnv('VITE_DOCS_MEASUREMENT_ENABLED', 'true');
    vi.stubGlobal('location', new URL('/introduction', origin));
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it.each([
    ['VITE_DOCS_REGION', 'global'],
    ['VITE_DOCS_ENVIRONMENT', 'staging'],
    ['VITE_DOCS_MEASUREMENT_ENABLED', 'false'],
  ])(
    'requires the production measurement settings (%s)',
    async (key, value) => {
      vi.stubEnv(key, value);
      const { cnGa4Enabled } = await import('./cn-ga4');
      expect(cnGa4Enabled).toBe(false);
    },
  );

  it.each([{ doNotTrack: '1' }, { globalPrivacyControl: true }])(
    'skips loading the tag when the browser opts out (%j)',
    async (signal) => {
      vi.stubGlobal('navigator', signal);
      const append = vi.spyOn(document.body, 'append');
      const { captureCnGa4PageView } = await import('./cn-ga4');
      captureCnGa4PageView(window.location.pathname);
      expect(append).not.toHaveBeenCalled();
    },
  );

  it('keeps previews out of the production stream', async () => {
    vi.stubGlobal('location', new URL('https://preview.example/introduction'));
    const append = vi.spyOn(document.body, 'append');
    const { captureCnGa4PageView } = await import('./cn-ga4');
    captureCnGa4PageView('/introduction');
    expect(append).not.toHaveBeenCalled();
  });

  it('queues one clean page view per path, including a return visit', async () => {
    const tagDocument = document.implementation.createHTMLDocument();
    const marker = tagDocument.createElement('meta');
    marker.name = 'cn-ga4';
    tagDocument.head.append(marker);
    const insertScript = vi
      .spyOn(tagDocument.head, 'append')
      .mockImplementation(() => {});
    const target = { document: tagDocument, dataLayer: [] as IArguments[] };
    const append = vi
      .spyOn(document.body, 'append')
      .mockImplementation((frame) => {
        if (!(frame instanceof HTMLIFrameElement))
          throw new Error('Expected iframe');
        Object.defineProperty(frame, 'contentWindow', { value: target });
        Object.defineProperty(frame, 'contentDocument', { value: tagDocument });
        frame.dispatchEvent(new Event('load'));
      });
    vi.spyOn(document, 'referrer', 'get').mockReturnValue(
      'https://search.example/?q=private',
    );
    const { captureCnGa4PageView } = await import('./cn-ga4');
    for (const path of [
      '/introduction',
      '/introduction?token=private#part',
      '/search?q=private',
      '/introduction',
    ]) {
      vi.stubGlobal('location', new URL(path, origin));
      captureCnGa4PageView(window.location.pathname);
    }
    await vi.waitFor(() => expect(target.dataLayer).toHaveLength(9));
    const commands = target.dataLayer.map((command) => Array.from(command));
    expect(append).toHaveBeenCalledTimes(1);
    expect(insertScript).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({
        src: 'https://www.googletagmanager.com/gtag/js?id=G-FX05ECXBR2',
      }),
    );
    expect(commands.filter(([key]) => key === 'event')).toEqual(
      Array(3).fill(['event', 'page_view', { send_to: 'G-FX05ECXBR2' }]),
    );
    expect(
      commands
        .filter(([key]) => key === 'set')
        .map(([, page]) => [page.page_location, page.page_referrer]),
    ).toEqual([
      [`${origin}/introduction`, 'https://search.example'],
      [`${origin}/search`, `${origin}/introduction`],
      [`${origin}/introduction`, `${origin}/search`],
    ]);
    expect(JSON.stringify(commands)).not.toContain('private');
  });
});
