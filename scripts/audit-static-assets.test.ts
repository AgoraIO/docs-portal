import { describe, expect, it } from 'vitest';
import {
  formatAuditReport,
  getDocRoute,
  isDocRoutePrerendered,
} from './audit-static-assets.mjs';

describe('audit-static-assets', () => {
  it('maps docs files to route paths', () => {
    expect(getDocRoute('en/ai/index.mdx')).toBe('/en/ai');
    expect(getDocRoute('en/ai/models/llm/dify.mdx')).toBe(
      '/en/ai/models/llm/dify',
    );
  });

  it('matches the current selective prerender policy for deep docs routes', () => {
    expect(isDocRoutePrerendered('/en/introduction')).toBe(true);
    expect(isDocRoutePrerendered('/en/ai/device-kit')).toBe(false);
    expect(isDocRoutePrerendered('/en/ai/device-kit/start-here/quickstart')).toBe(
      false,
    );
    expect(isDocRoutePrerendered('/en/ai/studio')).toBe(true);
    expect(isDocRoutePrerendered('/en/ai/studio/deploy/sip-trunk')).toBe(false);
    expect(isDocRoutePrerendered('/en/ai/models/llm')).toBe(true);
    expect(isDocRoutePrerendered('/en/ai/models/llm/dify')).toBe(false);
    expect(isDocRoutePrerendered('/en/api-reference/rtc/android')).toBe(true);
    expect(isDocRoutePrerendered('/en/api-reference/rtc/android/overview')).toBe(
      false,
    );
  });

  it('formats a readable report with grouped candidates', () => {
    const report = formatAuditReport({
      entries: [
        {
          assetPath: 'img/rtm2/create-project.png',
          docRefs: [],
          isReferencedByStaticOutput: false,
          size: 102824,
        },
        {
          assetPath: 'images/convo-ai-device-kit/power_on.png',
          docRefs: [
            {
              contentPath: 'en/ai/device-kit/start-here/quickstart.md',
              isBuilt: false,
              isPrerendered: false,
              routePath: '/en/ai/device-kit/start-here/quickstart',
            },
          ],
          isReferencedByStaticOutput: false,
          size: 131212,
        },
        {
          assetPath: 'images/conversational-ai/custom-llm-metadata-flow.svg',
          docRefs: [
            {
              contentPath: 'en/ai/custom-llm.mdx',
              isBuilt: true,
              isPrerendered: true,
              routePath: '/en/ai/custom-llm',
            },
          ],
          isReferencedByStaticOutput: false,
          size: 13604,
        },
      ],
      summary: {
        assetCount: 3,
        referencedByStaticOutputCount: 0,
        unreferencedByStaticOutputCount: 3,
        noDocsRefs: { bytes: 102824, count: 1 },
        onlyNonPrerenderedDocRefs: { bytes: 131212, count: 1 },
        hasPrerenderedDocRefs: { bytes: 13604, count: 1 },
      },
    });

    expect(report).toContain('# Static Asset Audit');
    expect(report).toContain('noDocsRefs: 1 (102824 bytes)');
    expect(report).toContain('img/rtm2/create-project.png (102824 bytes)');
    expect(report).toContain(
      'ref: /en/ai/device-kit/start-here/quickstart prerender=false built=false',
    );
    expect(report).toContain(
      'images/conversational-ai/custom-llm-metadata-flow.svg (13604 bytes)',
    );
  });
});
