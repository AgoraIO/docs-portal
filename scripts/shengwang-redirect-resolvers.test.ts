import { describe, expect, it } from 'vitest';
import {
  resolveApiReferenceRoute,
  resolveProductLeafRoute,
  resolveProductIaRedirect,
  resolveLegacyDocSourcePath,
  resolveLegacyHtmlSourcePath,
  resolveOpenApiLegacyPath,
} from './shengwang-redirect-resolvers.mjs';

describe('Shengwang redirect resolvers', () => {
  it('matches a legacy document leaf within the current product root', () => {
    expect(
      resolveProductLeafRoute(
        '/doc/analytics/general/overview/billing',
        new Set(['/zh-CN/realtime-media/usage-analytics/reference/billing']),
        { analytics: '/zh-CN/realtime-media/usage-analytics' },
      ),
    ).toBe('/zh-CN/realtime-media/usage-analytics/reference/billing');
  });

  it('converts platform-suffixed legacy MDX source paths into doc URLs', () => {
    expect(
      resolveLegacyDocSourcePath(
        'docs/one-to-one-live/rtm/api/rtc-api.android.mdx',
      ),
    ).toBe('/doc/one-to-one-live/android/rtm/api/rtc-api');
  });

  it('converts generated HTML source paths into legacy API paths', () => {
    expect(
      resolveLegacyHtmlSourcePath(
        'html-docs/flexible-classroom/Electron/interfaces/example.html',
      ),
    ).toBe('/api-ref/flexible-classroom/electron/interfaces/example');
  });

  it('maps a legacy operation path through the current OpenAPI registry', () => {
    expect(
      resolveOpenApiLegacyPath(
        '/doc/convoai/restful/convoai/operations/start-agent',
        [
          {
            id: 'convoai',
            routePrefix: 'api-reference/api-ref/conversational-ai',
            operations: {
              'start-agent': { routeLeaf: 'join' },
            },
          },
        ],
      ),
    ).toBe('/zh-CN/api-reference/api-ref/conversational-ai/join');
  });

  it('normalizes generated API platform and slug aliases', () => {
    expect(
      resolveApiReferenceRoute(
        '/api-ref/rtc/csharp/API/api_irtcengine_setexternalmediaprojection',
        new Set([
          '/zh-CN/api-reference/rtc/csharp-windows/api-irtcengine-setexternalmediaprojection',
        ]),
      ),
    ).toBe(
      '/zh-CN/api-reference/rtc/csharp-windows/api-irtcengine-setexternalmediaprojection',
    );
  });

  it('resolves a legacy product IA path through the current redirect table', () => {
    expect(
      resolveProductIaRedirect(
        '/doc/analytics/general/rtc/monitor',
        new Set(['/zh-CN/realtime-media/usage-analytics/build/monitor']),
        new Map([
          [
            'realtime-media/usage-analytics/rtc/monitor',
            '/zh-CN/realtime-media/usage-analytics/build/monitor',
          ],
        ]),
        Object.assign(
          { analytics: 'realtime-media/usage-analytics' },
          { platforms: new Set(['general']) },
        ),
      ),
    ).toBe('/zh-CN/realtime-media/usage-analytics/build/monitor');
  });
});
