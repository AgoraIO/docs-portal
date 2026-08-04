import { describe, expect, it } from 'vitest';
import {
  classifyAuditEntry,
  parseApiRefDocsLinksReport,
  renderTriageMarkdown,
} from './triage-api-ref-docs-redirects.mjs';

const sampleReport = `# API Reference docs.agora.io Link Audit

Generated at: 2026-08-03T13:47:30.731Z

## Summary

| Metric | Count |
| --- | ---: |
| Unique docs.agora.io URLs | 3 |
| Page errors | 1 |

## Unique docs.agora.io URLs

### 1. https://docs.agora.io/en/video-calling/troubleshooting/error-codes

- Path: /en/video-calling/troubleshooting/error-codes
- Query:
- Legacy redirect: legacy redirect covered
- HTTP status: 200
- Final URL: https://docs.agora.io/en/realtime-media/video/reference/error-codes
- Error:

| Group | Entry | Source API Reference page | Anchor text | Raw href |
| --- | --- | --- | --- | --- |
| Voice & Video | Android | https://api-ref.agora.io/en/video-sdk/android/4.x/API/foo.html | Error codes | https://docs.agora.io/en/video-calling/troubleshooting/error-codes |

### 2. https://docs.agora.io/en/help/integration-issues/set_enabled_set_muted

- Path: /en/help/integration-issues/set_enabled_set_muted
- Query:
- Legacy redirect: legacy redirect missing
- HTTP status: 404
- Final URL: https://docs.agora.io/en/help/integration-issues/set_enabled_set_muted
- Error:

| Group | Entry | Source API Reference page | Anchor text | Raw href |
| --- | --- | --- | --- | --- |
| Voice & Video | Web | https://api-ref.agora.io/en/video-sdk/web/4.x/interfaces/ilocalaudiotrack.html | What are the differences between setEnabled and setMuted? | https://docs.agora.io/en/help/integration-issues/set_enabled_set_muted |
| Voice & Video | Web | https://api-ref.agora.io/en/video-sdk/web/4.x/interfaces/ilocaltrack.html | What are the differences between setEnabled and setMuted? | https://docs.agora.io/en/help/integration-issues/set_enabled_set_muted |

### 3. https://docs.agora.io/en/Interactive%20Broadcast/cloud_proxy_web_ng?platform=Web

- Path: /en/Interactive%20Broadcast/cloud_proxy_web_ng
- Query: ?platform=Web
- Legacy redirect: legacy redirect covered
- HTTP status: 404
- Final URL: https://docs.agora.io/en/Interactive%20Broadcast/cloud_proxy_web_ng?platform=Web
- Error:

| Group | Entry | Source API Reference page | Anchor text | Raw href |
| --- | --- | --- | --- | --- |
| Voice & Video | Web | https://api-ref.agora.io/en/video-sdk/web/4.x/interfaces/iagorartc.html | Cloud Proxy | https://docs.agora.io/en/Interactive%20Broadcast/cloud_proxy_web_ng?platform=Web |

## Page Errors

| Group | Entry | Source API Reference page | Status | Message |
| --- | --- | --- | --- | --- |
| Voice & Video | React.js | https://api-ref.agora.io/en/video-sdk/reactjs/2.x//createScreenVideoTrack.html | 404 | Non-2xx response |
`;

describe('triage-api-ref-docs-redirects', () => {
  it('parses unique URL blocks and page errors', () => {
    const parsed = parseApiRefDocsLinksReport(sampleReport);

    expect(parsed.uniqueUrls).toHaveLength(3);
    expect(parsed.pageErrors).toEqual([
      {
        group: 'Voice & Video',
        entry: 'React.js',
        sourceApiReferencePage:
          'https://api-ref.agora.io/en/video-sdk/reactjs/2.x//createScreenVideoTrack.html',
        status: '404',
        message: 'Non-2xx response',
      },
    ]);
    expect(parsed.uniqueUrls[1]).toMatchObject({
      url: 'https://docs.agora.io/en/help/integration-issues/set_enabled_set_muted',
      path: '/en/help/integration-issues/set_enabled_set_muted',
      query: '',
      legacyRedirect: 'legacy redirect missing',
      httpStatus: '404',
      finalUrl:
        'https://docs.agora.io/en/help/integration-issues/set_enabled_set_muted',
    });
    expect(parsed.uniqueUrls[1].occurrences).toHaveLength(2);
  });

  it('classifies report rows into default triage decisions', () => {
    expect(
      classifyAuditEntry({
        httpStatus: '404',
        legacyRedirect: 'legacy redirect missing',
      }),
    ).toEqual({
      confidence: 'needs-review',
      decision: 'needs-target-from-owner',
      proposedTarget: '',
    });

    expect(
      classifyAuditEntry({
        httpStatus: '404',
        legacyRedirect: 'legacy redirect covered',
      }),
    ).toEqual({
      confidence: 'needs-review',
      decision: 'fix-existing-redirect',
      proposedTarget: '',
    });

    expect(
      classifyAuditEntry({
        httpStatus: '200',
        legacyRedirect: 'legacy redirect covered',
      }),
    ).toEqual({
      confidence: 'n/a',
      decision: 'ignore-valid',
      proposedTarget: '',
    });
  });

  it('renders a complete triage table with source-page-error rows', () => {
    const parsed = parseApiRefDocsLinksReport(sampleReport);
    const markdown = renderTriageMarkdown(parsed, {
      generatedAt: '2026-08-03T14:00:00.000Z',
      sourceReportPath: 'docs/agents/reports/2026-08-03-api-ref-docs-links.md',
    });

    expect(markdown).toContain(
      '| Legacy URL | Occurrences | Status | Legacy redirect | Source API refs | Anchor texts | Proposed target | Decision | Confidence | Evidence | Notes |',
    );
    for (const snippet of [
      'https://docs.agora.io/en/help/integration-issues/set_enabled_set_muted',
      'https://api-ref.agora.io/en/video-sdk/web/4.x/interfaces/ilocalaudiotrack.html',
      'https://api-ref.agora.io/en/video-sdk/web/4.x/interfaces/ilocaltrack.html',
      'needs-target-from-owner',
      'needs-review',
      'Owner target required before adding a 301.',
      'https://api-ref.agora.io/en/video-sdk/reactjs/2.x//createScreenVideoTrack.html',
      'source-page-error',
      'Source API Reference page returned 404: Non-2xx response.',
      'Not a docs redirect candidate.',
    ]) {
      expect(markdown).toContain(snippet);
    }
  });
});
