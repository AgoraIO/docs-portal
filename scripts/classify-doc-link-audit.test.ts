import { describe, expect, it } from 'vitest';
import {
  classifyDocLinkStats,
  formatClassificationReport,
} from './classify-doc-link-audit.mjs';

describe('classifyDocLinkStats', () => {
  it('classifies strict failures into exclusive cleanup buckets', () => {
    const stats = {
      docsFiles: 7,
      invalidInternalLinks: [
        {
          href: 'missing',
          reason: 'missing-internal-path',
          sourcePath: 'en/ai/index.mdx',
          target: '/en/ai/missing',
        },
        {
          href: '#missing-heading',
          reason: 'missing-hash-anchor',
          sourcePath: 'en/realtime-media/video/quickstart.mdx',
          target: '#missing-heading',
        },
        {
          href: '/video-calling/get-started/old-page',
          reason: 'missing-internal-path',
          sourcePath: 'en/api-reference/index.mdx',
          target: '/video-calling/get-started/old-page',
        },
        {
          href: '/zh-CN/api-reference/rtc/android/playback/rte-player',
          reason: 'missing-internal-path',
          sourcePath: 'zh-CN/api-reference/rtc/android/index.mdx',
          target: '/zh-CN/api-reference/rtc/android/playback/rte-player',
        },
        {
          href: '../../../../api-reference/rtc/android/(current)',
          reason: 'missing-internal-path',
          sourcePath: 'en/realtime-media/video/reference/release-notes.mdx',
          target: '/en/api-reference/rtc/android/(current',
        },
        {
          href: '{{Global.API_REF_ANDROID_ROOT}}/class_irtcengine.html',
          reason: 'missing-internal-path',
          sourcePath:
            'en/realtime-media/video/build/authenticate-users/authentication-workflow.mdx',
          target:
            '/en/realtime-media/video/build/authenticate-users/{{Global.API_REF_ANDROID_ROOT}}/class_irtcengine.html',
        },
        {
          href: '/en/realtime-media/whiteboard/build/enable-whiteboard.md#setup',
          reason: 'missing-internal-path',
          sourcePath: 'en/api-reference/api-ref/whiteboard/file-conversion.md',
          target:
            '/en/realtime-media/whiteboard/build/enable-whiteboard.md#setup',
        },
        {
          href: '../missing.mdx',
          reason: 'missing-internal-path',
          sourcePath: 'en/api-reference/api-ref/whiteboard/file-conversion.md',
          target: '/en/api-reference/api-ref/missing',
        },
      ],
      apiReferenceMacroLinks: [{ href: '{{Global.API_REF_ANDROID_ROOT}}/foo' }],
      missingHashLinks: [{ href: '#missing-heading' }],
      missingRelativeMarkdownLinks: [{ href: '../missing.mdx' }],
      missingRootLinks: [],
      relativeMarkdownLinks: [
        { href: '../join.md', resolution: 'openapi-route' },
      ],
      resolvedRelativeMarkdownLinks: [{ href: '../join.md' }],
      rootLinks: [
        {
          href: '/video-calling/token-authentication/deploy-token-server',
          resolution: 'route',
        },
        {
          href: '/en/api-reference/api-ref/rtc/query',
          resolution: 'openapi-route',
        },
        { href: '/en/realtime-media/rtc', resolution: 'redirect' },
      ],
      skippedRootLinks: [{ href: '/en/api-reference/rtc/android/overview' }],
      totalLinks: 7,
    };

    const classification = classifyDocLinkStats(stats, {
      routePaths: new Set([
        '/en/realtime-media/whiteboard/build/enable-whiteboard',
      ]),
    });

    expect(classification.buckets['true-missing-internal-route'].count).toBe(1);
    expect(classification.buckets['missing-hash-anchor'].count).toBe(1);
    expect(classification.buckets['stale-legacy-docs-path'].count).toBe(1);
    expect(classification.buckets['hosted-api-reference-route'].count).toBe(1);
    expect(
      classification.buckets['current-version-api-reference-alias'].count,
    ).toBe(1);
    expect(
      classification.buckets['current-version-api-reference-alias']
        .safeAutomatedCount,
    ).toBe(0);
    expect(classification.buckets['unresolved-template-variable'].count).toBe(
      1,
    );
    expect(classification.buckets['md-mdx-route-normalization'].count).toBe(2);
    expect(
      classification.buckets['md-mdx-route-normalization'].safeAutomatedCount,
    ).toBe(1);
    expect(classification.fixBuckets).toEqual({
      auditScriptFix: 2,
      contentFixManualReview: 6,
    });
    expect(classification.intentionalRoutes).toMatchObject({
      apiReferenceMacroLinks: 1,
      generatedOpenApiRoutes: 2,
      hostedReferenceSkipped: 1,
      knownRedirectRoutes: 1,
      legacyPathsAlreadyResolved: 1,
      routeResolvedRelativeMarkdownLinks: 1,
    });
    expect(classification.launchGates).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          auditScriptCandidates: 0,
          blockingInvalidLinks: 1,
          label: 'Voice Agent',
          status: 'blocked',
        }),
        expect.objectContaining({
          auditScriptCandidates: 0,
          blockingInvalidLinks: 3,
          label: 'RTC Voice/Video',
          status: 'blocked',
        }),
      ]),
    );

    const report = formatClassificationReport(classification, {
      maxSamples: 1,
    });

    expect(report).toContain('Audit-script-fix candidates: 2');
    expect(report).toContain('Content-fix/manual-review candidates: 6');
    expect(report).toContain('| Voice Agent |');
  });

  it('allows a launch gate when all scoped failures are audit-policy candidates', () => {
    const classification = classifyDocLinkStats({
      invalidInternalLinks: [
        {
          href: '/en/api-reference/rtc/android/channel',
          reason: 'missing-internal-path',
          sourcePath: 'en/realtime-media/video/quickstart.mdx',
          target: '/en/api-reference/rtc/android/channel',
        },
      ],
    });

    expect(classification.launchGates).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          auditScriptCandidates: 1,
          blockingInvalidLinks: 1,
          contentManualCandidates: 0,
          label: 'RTC Voice/Video',
          status: 'pass',
        }),
      ]),
    );
  });
});
