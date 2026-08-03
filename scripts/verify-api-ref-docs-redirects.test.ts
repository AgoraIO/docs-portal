import { describe, expect, it } from 'vitest';
import {
  parseTriageRows,
  verifyApiRefRedirectTriage,
} from './verify-api-ref-docs-redirects.mjs';

const triageMarkdown = `# API Reference docs.agora.io Redirect Triage

## Triage

| Legacy URL | Occurrences | Status | Legacy redirect | Source API refs | Anchor texts | Proposed target | Decision | Confidence | Evidence | Notes |
| --- | ---: | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| https://docs.agora.io/en/path-only/legacy | 3 | 404 | legacy redirect missing | https://api-ref.agora.io/source-a.html | Path only | /en/current/path-only | add-301 | high | target verified | preserve query |
| https://docs.agora.io/en/pipe/legacy | 1 | 404 | legacy redirect missing | https://api-ref.agora.io/source-pipe.html | Audio \\| Video | /en/current/pipe | add-301 | high | target verified | escaped pipe |
| https://docs.agora.io/en/query/legacy?platform=Web | 2 | 404 | legacy redirect missing | https://api-ref.agora.io/source-b.html | Query | /en/current/query-web | add-301 | high | target verified | query encoded in target |
| https://docs.agora.io/en/hash/legacy?platform=Android#old-anchor | 1 | 404 | legacy redirect missing | https://api-ref.agora.io/source-c.html | Hash | /en/current/hash#new-anchor | add-301 | high | target verified | hash redirect |
| https://docs.agora.io/en/hash/legacy?platform=Android#old_anchor | 1 | 404 | legacy redirect missing | https://api-ref.agora.io/source-c.html | Hash | /en/current/hash#new-anchor | add-301 | high | target verified | merged hash redirect |
| https://docs.agora.io/en/covered/legacy?platform=Web | 2 | 404 | legacy redirect covered | https://api-ref.agora.io/source-d.html | Covered |  | fix-existing-redirect | needs-review | inspect existing rule | covered but still 404 |
| https://docs.agora.io/en/missing/target | 1 | 404 | legacy redirect missing | https://api-ref.agora.io/source-e.html | Missing |  | needs-target-from-owner | needs-review | no target | owner target required |
`;

const redirectsConfig = {
  rules: [
    {
      legacyUrl: 'https://docs.agora.io/en/path-only/legacy',
      legacyPath: '/en/path-only/legacy',
      target: '/en/current/path-only',
      preserveSearch: true,
    },
    {
      legacyUrl: 'https://docs.agora.io/en/query/legacy?platform=Web',
      legacyPath: '/en/query/legacy',
      legacySearch: '?platform=Web',
      target: '/en/current/query-web',
      preserveSearch: false,
    },
    {
      legacyUrl: 'https://docs.agora.io/en/pipe/legacy',
      legacyPath: '/en/pipe/legacy',
      target: '/en/current/pipe',
      preserveSearch: true,
    },
    {
      legacyUrl:
        'https://docs.agora.io/en/hash/legacy?platform=Android#old-anchor',
      legacyPath: '/en/hash/legacy',
      legacySearch: '?platform=Android',
      target: '/en/current/hash#new-anchor',
      preserveSearch: false,
    },
  ],
};

const staticRedirects = [
  {
    p: '/en/path-only/legacy',
    t: '/en/current/path-only',
  },
  {
    p: '/en/query/legacy',
    q: '?platform=Web',
    s: 0,
    t: '/en/current/query-web',
  },
  {
    p: '/en/pipe/legacy',
    t: '/en/current/pipe',
  },
  {
    p: '/en/hash/legacy',
    q: '?platform=Android',
    s: 0,
    t: '/en/current/hash#new-anchor',
  },
];

const bulkRedirects = [
  {
    source: '/en/path-only/legacy',
    destination: '/en/current/path-only',
    statusCode: 301,
    preserveQueryParams: true,
  },
  {
    source: '/en/hash/legacy',
    destination: '/en/current/hash#new-anchor',
    statusCode: 301,
    preserveQueryParams: false,
  },
  {
    source: '/en/pipe/legacy',
    destination: '/en/current/pipe',
    statusCode: 301,
    preserveQueryParams: true,
  },
];

const vercelConfig = {
  redirects: [
    {
      source: '/en/query/legacy',
      destination: '/en/current/query-web',
      has: [
        {
          type: 'query',
          key: 'platform',
          value: 'Web',
        },
      ],
      statusCode: 301,
    },
  ],
};

describe('verify-api-ref-docs-redirects', () => {
  it('parses triage rows with path, query, and hash split out', () => {
    expect(parseTriageRows(triageMarkdown)).toContainEqual({
      confidence: 'high',
      decision: 'add-301',
      legacyPath: '/en/hash/legacy',
      legacySearch: '?platform=Android',
      legacyUrl:
        'https://docs.agora.io/en/hash/legacy?platform=Android#old-anchor',
      proposedTarget: '/en/current/hash#new-anchor',
    });
    expect(parseTriageRows(triageMarkdown)).toContainEqual({
      confidence: 'high',
      decision: 'add-301',
      legacyPath: '/en/pipe/legacy',
      legacySearch: '',
      legacyUrl: 'https://docs.agora.io/en/pipe/legacy',
      proposedTarget: '/en/current/pipe',
    });
  });

  it('verifies add-301 rows exist in source, static, and production artifacts', () => {
    expect(
      verifyApiRefRedirectTriage({
        bulkRedirects,
        redirectsConfig,
        staticRedirects,
        triageMarkdown,
        vercelConfig,
      }),
    ).toEqual([]);
  });

  it('rejects unresolved rows that were added by path and query', () => {
    const result = verifyApiRefRedirectTriage({
      bulkRedirects,
      redirectsConfig: {
        rules: [
          ...redirectsConfig.rules,
          {
            legacyUrl:
              'https://docs.agora.io/en/missing/target#legacy-fragment',
            legacyPath: '/en/missing/target',
            target: '/en/current/wrong',
            preserveSearch: true,
          },
        ],
      },
      staticRedirects,
      triageMarkdown,
      vercelConfig,
    });

    expect(result).toContain(
      'Unresolved triage row must not be in redirects.json: https://docs.agora.io/en/missing/target',
    );
  });

  it('rejects Vercel bulk redirects that preserve removed legacy query strings', () => {
    const result = verifyApiRefRedirectTriage({
      bulkRedirects: [
        ...bulkRedirects,
        {
          source: '/en/query/legacy',
          destination: '/en/current/query-web',
          statusCode: 301,
          preserveQueryParams: true,
        },
      ],
      redirectsConfig,
      staticRedirects,
      triageMarkdown,
      vercelConfig: { redirects: [] },
    });

    expect(result).toContain(
      'Vercel redirect preserveQueryParams mismatch for https://docs.agora.io/en/query/legacy?platform=Web: expected false, got true',
    );
  });

  it('rejects query redirects that require extra query conditions', () => {
    const result = verifyApiRefRedirectTriage({
      bulkRedirects: bulkRedirects.filter(
        (rule) => rule.source !== '/en/hash/legacy',
      ),
      redirectsConfig,
      staticRedirects,
      triageMarkdown,
      vercelConfig: {
        redirects: [
          {
            source: '/en/query/legacy',
            destination: '/en/current/query-web',
            has: [
              {
                type: 'query',
                key: 'platform',
                value: 'Web',
              },
              {
                type: 'query',
                key: 'product',
                value: 'rtc',
              },
            ],
            statusCode: 301,
          },
          {
            source: '/en/hash/legacy',
            destination: '/en/current/hash#new-anchor',
            has: [
              {
                type: 'query',
                key: 'platform',
                value: 'Android',
              },
            ],
            statusCode: 301,
          },
        ],
      },
    });

    expect(result).toContain(
      'Vercel redirect artifact missing: https://docs.agora.io/en/query/legacy?platform=Web',
    );
  });

  it('rejects Vercel bulk redirects that strip preserved query strings', () => {
    const result = verifyApiRefRedirectTriage({
      bulkRedirects: bulkRedirects.map((rule) =>
        rule.source === '/en/path-only/legacy'
          ? { ...rule, preserveQueryParams: false }
          : rule,
      ),
      redirectsConfig,
      staticRedirects,
      triageMarkdown,
      vercelConfig,
    });

    expect(result).toContain(
      'Vercel redirect preserveQueryParams mismatch for https://docs.agora.io/en/path-only/legacy: expected true, got false',
    );
  });
});
