import { spawnSync } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  buildAuditReport,
  checkDocsUrl,
  crawlApiRefEntry,
  createLegacyRedirectCoverageChecker,
  deriveApiRefScope,
  extractApiRefEntriesFromMeta,
  extractLinksFromHtml,
  isCrawlableApiRefHtmlUrl,
  renderMarkdownReport,
  runApiRefDocsLinksAudit,
} from './audit-api-ref-docs-links.mjs';

function createDeferred<T = void>() {
  let resolve: (value: T | PromiseLike<T>) => void = () => {};
  let reject: (reason?: unknown) => void = () => {};
  const promise = new Promise<T>((promiseResolve, promiseReject) => {
    resolve = promiseResolve;
    reject = promiseReject;
  });

  return {
    promise,
    resolve,
    reject,
  };
}

describe('audit-api-ref-docs-links meta discovery', () => {
  it('extracts external api-ref entries with group context', () => {
    const meta = {
      pages: [
        {
          type: 'group',
          title: 'Voice & Video',
          pages: [
            {
              external: true,
              title: 'Web',
              href: 'https://api-ref.agora.io/en/video-sdk/web/4.x/index.html',
            },
            '[REST API](/en/api-reference/api-ref/rtc)',
          ],
        },
      ],
    };

    expect(extractApiRefEntriesFromMeta(meta)).toEqual([
      {
        groupTitle: 'Voice & Video',
        entryTitle: 'Web',
        entryUrl: 'https://api-ref.agora.io/en/video-sdk/web/4.x/index.html',
        scopeUrl: 'https://api-ref.agora.io/en/video-sdk/web/4.x/',
      },
    ]);
  });

  it('excludes api-ref entries from non-group parents', () => {
    const meta = {
      pages: [
        {
          title: 'Not a Group',
          pages: [
            {
              external: true,
              title: 'Web',
              href: 'https://api-ref.agora.io/en/video-sdk/web/4.x/index.html',
            },
          ],
        },
      ],
    };

    expect(extractApiRefEntriesFromMeta(meta)).toEqual([]);
  });

  it('excludes external entries that are not hosted on api-ref.agora.io', () => {
    const meta = {
      pages: [
        {
          type: 'group',
          title: 'Voice & Video',
          pages: [
            {
              external: true,
              title: 'Other',
              href: 'https://docs.agora.io/en/video-sdk/web/4.x/index.html',
            },
          ],
        },
      ],
    };

    expect(extractApiRefEntriesFromMeta(meta)).toEqual([]);
  });

  it('excludes api-ref entries that are not HTTPS default origin', () => {
    const meta = {
      pages: [
        {
          type: 'group',
          title: 'Voice & Video',
          pages: [
            {
              external: true,
              title: 'HTTP',
              href: 'http://api-ref.agora.io/en/video-sdk/web/4.x/index.html',
            },
            {
              external: true,
              title: 'Port',
              href: 'https://api-ref.agora.io:8443/en/video-sdk/web/4.x/index.html',
            },
            {
              external: true,
              title: 'Web',
              href: 'https://api-ref.agora.io/en/video-sdk/web/4.x/index.html',
            },
          ],
        },
      ],
    };

    expect(extractApiRefEntriesFromMeta(meta)).toEqual([
      {
        groupTitle: 'Voice & Video',
        entryTitle: 'Web',
        entryUrl: 'https://api-ref.agora.io/en/video-sdk/web/4.x/index.html',
        scopeUrl: 'https://api-ref.agora.io/en/video-sdk/web/4.x/',
      },
    ]);
  });

  it('derives a crawl scope from the entry URL directory', () => {
    expect(
      deriveApiRefScope(
        'https://api-ref.agora.io/en/chat-sdk/flutter/1.x/agora_chat_sdk/index.html',
      ),
    ).toBe('https://api-ref.agora.io/en/chat-sdk/flutter/1.x/agora_chat_sdk/');
  });

  it('derives a crawl scope without entry query or hash', () => {
    expect(
      deriveApiRefScope(
        'https://api-ref.agora.io/en/video-sdk/web/4.x/index.html?x=1#foo',
      ),
    ).toBe('https://api-ref.agora.io/en/video-sdk/web/4.x/');
  });
});

describe('audit-api-ref-docs-links crawling', () => {
  it('normalizes invalid concurrency values to the default worker count', () => {
    const result = spawnSync(
      process.execPath,
      [
        '--eval',
        `
          import { crawlApiRefEntry } from './scripts/audit-api-ref-docs-links.mjs';

          const pages = new Map([
            [
              'https://api-ref.agora.io/en/video-sdk/web/4.x/index.html',
              '<a href="https://docs.agora.io/en/video-sdk/web/start?platform=Web">Start</a>',
            ],
          ]);

          const fetchImpl = async (url) => {
            const body = pages.get(String(url));
            if (!body) {
              return new Response('', { status: 404 });
            }
            return new Response(body, {
              status: 200,
              headers: { 'content-type': 'text/html' },
            });
          };

          const report = await crawlApiRefEntry({
            entry: {
              groupTitle: 'Voice & Video',
              entryTitle: 'Web',
              entryUrl: 'https://api-ref.agora.io/en/video-sdk/web/4.x/index.html',
              scopeUrl: 'https://api-ref.agora.io/en/video-sdk/web/4.x/',
            },
            fetchImpl,
            concurrency: Number.NaN,
            timeoutMs: 1000,
          });

          if (
            report.pagesVisited !== 1 ||
            report.docsLinkOccurrences[0]?.docsSearch !== '?platform=Web'
          ) {
            process.exit(1);
          }
        `,
      ],
      {
        cwd: process.cwd(),
        encoding: 'utf8',
        timeout: 1000,
      },
    );

    expect(result.error).toBeUndefined();
    expect(result.status).toBe(0);
  });

  it('does not fetch an invalid API reference seed URL', async () => {
    let fetchCount = 0;
    const fetchImpl = async () => {
      fetchCount += 1;
      return new Response('', { status: 200 });
    };

    const report = await crawlApiRefEntry({
      entry: {
        groupTitle: 'Voice & Video',
        entryTitle: 'Web',
        entryUrl: 'http://api-ref.agora.io/en/video-sdk/web/4.x/index.html',
        scopeUrl: 'http://api-ref.agora.io/en/video-sdk/web/4.x/',
      },
      fetchImpl: fetchImpl as unknown as typeof fetch,
      timeoutMs: 1000,
    });

    expect(fetchCount).toBe(0);
    expect(report.pagesVisited).toBe(0);
    expect(report.pageErrors).toEqual([
      expect.objectContaining({
        sourceUrl: 'http://api-ref.agora.io/en/video-sdk/web/4.x/index.html',
        message: 'Invalid API reference seed URL',
      }),
    ]);
  });

  it('extracts crawl links and docs links from HTML', () => {
    const links = extractLinksFromHtml({
      html: `
        <a href="./interfaces/iagorartcclient.html#startproxyserver">Client</a>
        <a href="https://docs.agora.io/en/Interactive%20Broadcast/cloud_proxy_web_ng?platform=Web">Cloud Proxy</a>
      `,
      sourceUrl: 'https://api-ref.agora.io/en/video-sdk/web/4.x/index.html',
    });

    expect(links).toEqual([
      {
        href: './interfaces/iagorartcclient.html#startproxyserver',
        text: 'Client',
        resolvedUrl:
          'https://api-ref.agora.io/en/video-sdk/web/4.x/interfaces/iagorartcclient.html#startproxyserver',
      },
      {
        href: 'https://docs.agora.io/en/Interactive%20Broadcast/cloud_proxy_web_ng?platform=Web',
        text: 'Cloud Proxy',
        resolvedUrl:
          'https://docs.agora.io/en/Interactive%20Broadcast/cloud_proxy_web_ng?platform=Web',
      },
    ]);
  });

  it('decodes uppercase numeric entities and ignores invalid numeric entities without aborting extraction', () => {
    const links = extractLinksFromHtml({
      html: `
        <a href="https://docs.agora.io/en/foo?x=1&#X26;y=2">Cloud &#X26; Proxy</a>
        <a href="mailto:bad&#999999999999999999999;">Bad</a>
        <a href="https://docs.agora.io/en/ok">OK</a>
      `,
      sourceUrl: 'https://api-ref.agora.io/en/video-sdk/web/4.x/index.html',
    });

    expect(links).toEqual([
      {
        href: 'https://docs.agora.io/en/foo?x=1&y=2',
        text: 'Cloud & Proxy',
        resolvedUrl: 'https://docs.agora.io/en/foo?x=1&y=2',
      },
      {
        href: 'https://docs.agora.io/en/ok',
        text: 'OK',
        resolvedUrl: 'https://docs.agora.io/en/ok',
      },
    ]);
  });

  it('keeps crawling inside the API reference scope only', () => {
    expect(
      isCrawlableApiRefHtmlUrl({
        url: 'https://api-ref.agora.io/en/video-sdk/web/4.x/interfaces/client.html',
        scopeUrl: 'https://api-ref.agora.io/en/video-sdk/web/4.x/',
      }),
    ).toBe(true);

    expect(
      isCrawlableApiRefHtmlUrl({
        url: 'https://api-ref.agora.io/en/video-sdk/android/4.x/index.html',
        scopeUrl: 'https://api-ref.agora.io/en/video-sdk/web/4.x/',
      }),
    ).toBe(false);

    expect(
      isCrawlableApiRefHtmlUrl({
        url: 'ftp://api-ref.agora.io/en/video-sdk/web/4.x/interfaces/client.html',
        scopeUrl: 'https://api-ref.agora.io/en/video-sdk/web/4.x/',
      }),
    ).toBe(false);

    expect(
      isCrawlableApiRefHtmlUrl({
        url: 'https://api-ref.agora.io:8443/en/video-sdk/web/4.x/interfaces/client.html',
        scopeUrl: 'https://api-ref.agora.io/en/video-sdk/web/4.x/',
      }),
    ).toBe(false);
  });

  it('recursively crawls source pages and records docs link occurrences', async () => {
    const pages = new Map([
      [
        'https://api-ref.agora.io/en/video-sdk/web/4.x/index.html',
        '<a href="./interfaces/client.html">Client</a>',
      ],
      [
        'https://api-ref.agora.io/en/video-sdk/web/4.x/interfaces/client.html',
        '<a href="https://docs.agora.io/en/Interactive%20Broadcast/cloud_proxy_web_ng?platform=Web">Cloud Proxy</a>',
      ],
    ]);

    const fetchImpl = async (url: string) => {
      const body = pages.get(String(url));
      if (!body) {
        return new Response('', { status: 404 });
      }
      return new Response(body, {
        status: 200,
        headers: { 'content-type': 'text/html; charset=utf-8' },
      });
    };

    const report = await crawlApiRefEntry({
      entry: {
        groupTitle: 'Voice & Video',
        entryTitle: 'Web',
        entryUrl: 'https://api-ref.agora.io/en/video-sdk/web/4.x/index.html',
        scopeUrl: 'https://api-ref.agora.io/en/video-sdk/web/4.x/',
      },
      fetchImpl: fetchImpl as unknown as typeof fetch,
      concurrency: 1,
      timeoutMs: 1000,
    });

    expect(report.pagesVisited).toBe(2);
    expect(report.docsLinkOccurrences).toEqual([
      {
        groupTitle: 'Voice & Video',
        entryTitle: 'Web',
        entryUrl: 'https://api-ref.agora.io/en/video-sdk/web/4.x/index.html',
        sourceUrl:
          'https://api-ref.agora.io/en/video-sdk/web/4.x/interfaces/client.html',
        anchorText: 'Cloud Proxy',
        rawHref:
          'https://docs.agora.io/en/Interactive%20Broadcast/cloud_proxy_web_ng?platform=Web',
        resolvedDocsUrl:
          'https://docs.agora.io/en/Interactive%20Broadcast/cloud_proxy_web_ng?platform=Web',
        docsPathname: '/en/Interactive%20Broadcast/cloud_proxy_web_ng',
        docsSearch: '?platform=Web',
      },
    ]);
  });

  it('normalizes query and hash when deduplicating API reference crawl pages', async () => {
    const fetchedUrls: string[] = [];
    const pages = new Map([
      [
        'https://api-ref.agora.io/en/video-sdk/web/4.x/index.html',
        `
          <a href="./interfaces/client.html?a=1#one">Client one</a>
          <a href="./interfaces/client.html?b=2#two">Client two</a>
        `,
      ],
      [
        'https://api-ref.agora.io/en/video-sdk/web/4.x/interfaces/client.html',
        '<a href="https://docs.agora.io/en/video-sdk/web/cloud_proxy?platform=Web">Cloud Proxy</a>',
      ],
    ]);

    const fetchImpl = async (url: string) => {
      fetchedUrls.push(String(url));
      const body = pages.get(String(url));
      if (!body) {
        return new Response('', { status: 404 });
      }
      return new Response(body, {
        status: 200,
        headers: { 'content-type': 'text/html' },
      });
    };

    const report = await crawlApiRefEntry({
      entry: {
        groupTitle: 'Voice & Video',
        entryTitle: 'Web',
        entryUrl: 'https://api-ref.agora.io/en/video-sdk/web/4.x/index.html',
        scopeUrl: 'https://api-ref.agora.io/en/video-sdk/web/4.x/',
      },
      fetchImpl: fetchImpl as unknown as typeof fetch,
      concurrency: 1,
      timeoutMs: 1000,
    });

    expect(fetchedUrls).toEqual([
      'https://api-ref.agora.io/en/video-sdk/web/4.x/index.html',
      'https://api-ref.agora.io/en/video-sdk/web/4.x/interfaces/client.html',
    ]);
    expect(report.pagesVisited).toBe(2);
    expect(report.docsLinkOccurrences).toEqual([
      expect.objectContaining({
        sourceUrl:
          'https://api-ref.agora.io/en/video-sdk/web/4.x/interfaces/client.html',
        rawHref:
          'https://docs.agora.io/en/video-sdk/web/cloud_proxy?platform=Web',
        docsSearch: '?platform=Web',
      }),
    ]);
  });

  it('records page errors without stopping other same-scope pages', async () => {
    const pages = new Map([
      [
        'https://api-ref.agora.io/en/video-sdk/web/4.x/index.html',
        `
          <a href="./interfaces/missing.html">Missing</a>
          <a href="./interfaces/client.html">Client</a>
        `,
      ],
      [
        'https://api-ref.agora.io/en/video-sdk/web/4.x/interfaces/client.html',
        '<a href="https://docs.agora.io/en/video-sdk/web/join_channel?platform=Web">Join Channel</a>',
      ],
    ]);

    const fetchImpl = async (url: string) => {
      const body = pages.get(String(url));
      if (!body) {
        return new Response('not found', {
          status: 404,
          headers: { 'content-type': 'text/html' },
        });
      }
      return new Response(body, {
        status: 200,
        headers: { 'content-type': 'text/html' },
      });
    };

    const report = await crawlApiRefEntry({
      entry: {
        groupTitle: 'Voice & Video',
        entryTitle: 'Web',
        entryUrl: 'https://api-ref.agora.io/en/video-sdk/web/4.x/index.html',
        scopeUrl: 'https://api-ref.agora.io/en/video-sdk/web/4.x/',
      },
      fetchImpl: fetchImpl as unknown as typeof fetch,
      concurrency: 2,
      timeoutMs: 1000,
    });

    expect(report.pageErrors).toEqual([
      expect.objectContaining({
        sourceUrl:
          'https://api-ref.agora.io/en/video-sdk/web/4.x/interfaces/missing.html',
        status: 404,
      }),
    ]);
    expect(report.docsLinkOccurrences).toEqual([
      expect.objectContaining({
        sourceUrl:
          'https://api-ref.agora.io/en/video-sdk/web/4.x/interfaces/client.html',
        anchorText: 'Join Channel',
        docsSearch: '?platform=Web',
      }),
    ]);
  });
});

describe('audit-api-ref-docs-links report generation', () => {
  it('deduplicates docs URLs while preserving occurrences and summary counts', () => {
    const report = buildAuditReport({
      generatedAt: '2026-08-03T00:00:00.000Z',
      legacyRedirectCoverageChecker: createLegacyRedirectCoverageChecker([
        { source: '/en/Interactive Broadcast/cloud_proxy_web_ng' },
      ]),
      entries: [
        {
          entry: {
            groupTitle: 'Voice & Video',
            entryTitle: 'Web',
            entryUrl:
              'https://api-ref.agora.io/en/video-sdk/web/4.x/index.html',
          },
          pagesVisited: 2,
          docsLinkOccurrences: [
            {
              groupTitle: 'Voice & Video',
              entryTitle: 'Web',
              entryUrl:
                'https://api-ref.agora.io/en/video-sdk/web/4.x/index.html',
              sourceUrl:
                'https://api-ref.agora.io/en/video-sdk/web/4.x/index.html',
              anchorText: 'Cloud Proxy',
              rawHref:
                'https://docs.agora.io/en/Interactive%20Broadcast/cloud_proxy_web_ng?platform=Web',
              resolvedDocsUrl:
                'https://docs.agora.io/en/Interactive%20Broadcast/cloud_proxy_web_ng?platform=Web',
              docsPathname: '/en/Interactive%20Broadcast/cloud_proxy_web_ng',
              docsSearch: '?platform=Web',
              status: 200,
              finalUrl:
                'https://docs.agora.io/en/realtime-media/voice/cloud-proxy',
            },
            {
              groupTitle: 'Voice & Video',
              entryTitle: 'Web',
              entryUrl:
                'https://api-ref.agora.io/en/video-sdk/web/4.x/index.html',
              sourceUrl:
                'https://api-ref.agora.io/en/video-sdk/web/4.x/interfaces/client.html',
              anchorText: 'Cloud Proxy | guide',
              rawHref: './cloud-proxy',
              resolvedDocsUrl:
                'https://docs.agora.io/en/Interactive%20Broadcast/cloud_proxy_web_ng?platform=Web',
              docsPathname: '/en/Interactive%20Broadcast/cloud_proxy_web_ng',
              docsSearch: '?platform=Web',
            },
          ],
          pageErrors: [
            {
              sourceUrl:
                'https://api-ref.agora.io/en/video-sdk/web/4.x/missing.html',
              status: 404,
              message: 'Non-2xx response',
            },
          ],
        },
        {
          entry: {
            groupTitle: 'Chat',
            entryTitle: 'REST',
            entryUrl: 'https://api-ref.agora.io/en/chat-restful-api/index.html',
          },
          pagesVisited: 1,
          docsLinkOccurrences: [
            {
              groupTitle: 'Chat',
              entryTitle: 'REST',
              entryUrl:
                'https://api-ref.agora.io/en/chat-restful-api/index.html',
              sourceUrl:
                'https://api-ref.agora.io/en/chat-restful-api/index.html',
              anchorText: 'Chat webhook',
              rawHref: 'https://docs.agora.io/en/agora-chat/reference/webhook',
              resolvedDocsUrl:
                'https://docs.agora.io/en/agora-chat/reference/webhook',
              docsPathname: '/en/agora-chat/reference/webhook',
              docsSearch: '',
              error: 'fetch failed',
            },
          ],
          pageErrors: [],
        },
      ],
    });

    expect(report.summary).toEqual({
      apiReferenceEntries: 2,
      apiReferencePagesVisited: 3,
      docsLinkOccurrences: 3,
      uniqueDocsUrls: 2,
      pageErrors: 1,
    });
    expect(report.pageErrors).toEqual([
      {
        entryTitle: 'Web',
        entryUrl: 'https://api-ref.agora.io/en/video-sdk/web/4.x/index.html',
        groupTitle: 'Voice & Video',
        message: 'Non-2xx response',
        sourceUrl: 'https://api-ref.agora.io/en/video-sdk/web/4.x/missing.html',
        status: 404,
      },
    ]);
    expect(report.uniqueDocsLinks).toEqual([
      expect.objectContaining({
        resolvedDocsUrl:
          'https://docs.agora.io/en/Interactive%20Broadcast/cloud_proxy_web_ng?platform=Web',
        docsPathname: '/en/Interactive%20Broadcast/cloud_proxy_web_ng',
        docsSearch: '?platform=Web',
        legacyRedirectCovered: true,
        status: 200,
        finalUrl: 'https://docs.agora.io/en/realtime-media/voice/cloud-proxy',
        occurrences: [
          expect.objectContaining({ anchorText: 'Cloud Proxy' }),
          expect.objectContaining({ anchorText: 'Cloud Proxy | guide' }),
        ],
      }),
      expect.objectContaining({
        resolvedDocsUrl:
          'https://docs.agora.io/en/agora-chat/reference/webhook',
        docsPathname: '/en/agora-chat/reference/webhook',
        docsSearch: '',
        legacyRedirectCovered: false,
        error: 'fetch failed',
        occurrences: [expect.objectContaining({ anchorText: 'Chat webhook' })],
      }),
    ]);
  });

  it('keeps unique docs links under the public report key only', () => {
    const report = buildAuditReport({
      entries: [
        {
          entry: {
            groupTitle: 'Voice & Video',
            entryTitle: 'Web',
            entryUrl:
              'https://api-ref.agora.io/en/video-sdk/web/4.x/index.html',
          },
          pagesVisited: 1,
          docsLinkOccurrences: [
            {
              groupTitle: 'Voice & Video',
              entryTitle: 'Web',
              entryUrl:
                'https://api-ref.agora.io/en/video-sdk/web/4.x/index.html',
              sourceUrl:
                'https://api-ref.agora.io/en/video-sdk/web/4.x/index.html',
              anchorText: 'Start',
              rawHref: 'https://docs.agora.io/en/start',
              resolvedDocsUrl: 'https://docs.agora.io/en/start',
              docsPathname: '/en/start',
              docsSearch: '',
              status: 200,
            },
          ],
          pageErrors: [],
        },
      ],
    });

    expect(report.summary.uniqueDocsUrls).toBe(1);
    expect(report).toHaveProperty('uniqueDocsLinks');
    expect(report).not.toHaveProperty('uniqueDocsUrls');
  });

  it('does not expose internal status result fields on unique docs links', () => {
    const report = buildAuditReport({
      entries: [
        {
          entry: {
            groupTitle: 'Voice & Video',
            entryTitle: 'Web',
            entryUrl:
              'https://api-ref.agora.io/en/video-sdk/web/4.x/index.html',
          },
          pagesVisited: 1,
          docsLinkOccurrences: [
            {
              groupTitle: 'Voice & Video',
              entryTitle: 'Web',
              entryUrl:
                'https://api-ref.agora.io/en/video-sdk/web/4.x/index.html',
              sourceUrl:
                'https://api-ref.agora.io/en/video-sdk/web/4.x/index.html',
              anchorText: 'Start',
              rawHref: 'https://docs.agora.io/en/start',
              resolvedDocsUrl: 'https://docs.agora.io/en/start',
              docsPathname: '/en/start',
              docsSearch: '',
              status: 200,
            },
          ],
          pageErrors: [],
        },
      ],
    });

    expect(report.uniqueDocsLinks[0]).not.toHaveProperty('statusResult');
  });

  it('matches legacy redirect coverage against encoded and decoded paths', () => {
    const checker = createLegacyRedirectCoverageChecker([
      { source: '/en/Interactive Broadcast/cloud_proxy_web_ng' },
    ]);

    expect(
      checker(
        'https://docs.agora.io/en/Interactive%20Broadcast/cloud_proxy_web_ng?platform=Web',
      ),
    ).toBe(true);
    expect(
      checker(
        'https://docs.agora.io/en/Interactive Broadcast/cloud_proxy_web_ng?platform=Web',
      ),
    ).toBe(true);
    expect(checker('https://docs.agora.io/en/video-sdk/web/start')).toBe(false);
  });

  it('does not decode reserved path separators when matching legacy redirect coverage', () => {
    const checker = createLegacyRedirectCoverageChecker([
      { source: '/en/foo/bar' },
    ]);

    expect(checker('https://docs.agora.io/en/foo%2Fbar')).toBe(false);
  });

  it('canonicalizes percent escape case without decoding reserved path separators', () => {
    const checker = createLegacyRedirectCoverageChecker([
      { source: '/en/foo%2Fbar' },
    ]);
    const slashChecker = createLegacyRedirectCoverageChecker([
      { source: '/en/foo/bar' },
    ]);

    expect(checker('https://docs.agora.io/en/foo%2fbar')).toBe(true);
    expect(slashChecker('https://docs.agora.io/en/foo%2fbar')).toBe(false);
  });

  it('prefers one successful status result when grouping duplicate docs URLs', () => {
    const report = buildAuditReport({
      entries: [
        {
          entry: {
            groupTitle: 'Voice & Video',
            entryTitle: 'Web',
            entryUrl:
              'https://api-ref.agora.io/en/video-sdk/web/4.x/index.html',
          },
          pagesVisited: 1,
          docsLinkOccurrences: [
            {
              groupTitle: 'Voice & Video',
              entryTitle: 'Web',
              entryUrl:
                'https://api-ref.agora.io/en/video-sdk/web/4.x/index.html',
              sourceUrl:
                'https://api-ref.agora.io/en/video-sdk/web/4.x/index.html',
              anchorText: 'Old result',
              rawHref: 'https://docs.agora.io/en/old',
              resolvedDocsUrl: 'https://docs.agora.io/en/old',
              docsPathname: '/en/old',
              docsSearch: '',
              status: 404,
              error: 'not found',
            },
            {
              groupTitle: 'Voice & Video',
              entryTitle: 'Web',
              entryUrl:
                'https://api-ref.agora.io/en/video-sdk/web/4.x/index.html',
              sourceUrl:
                'https://api-ref.agora.io/en/video-sdk/web/4.x/client.html',
              anchorText: 'New result',
              rawHref: 'https://docs.agora.io/en/old',
              resolvedDocsUrl: 'https://docs.agora.io/en/old',
              docsPathname: '/en/old',
              docsSearch: '',
              status: 200,
              finalUrl: 'https://docs.agora.io/en/new',
            },
          ],
          pageErrors: [],
        },
      ],
    });

    expect(report.uniqueDocsLinks).toHaveLength(1);
    expect(report.uniqueDocsLinks[0]).toEqual(
      expect.objectContaining({
        status: 200,
        finalUrl: 'https://docs.agora.io/en/new',
      }),
    );
    expect(report.uniqueDocsLinks[0]).not.toHaveProperty('error');
  });

  it('prefers a successful status result with finalUrl over an earlier success without finalUrl', () => {
    const report = buildAuditReport({
      entries: [
        {
          entry: {
            groupTitle: 'Voice & Video',
            entryTitle: 'Web',
            entryUrl:
              'https://api-ref.agora.io/en/video-sdk/web/4.x/index.html',
          },
          pagesVisited: 1,
          docsLinkOccurrences: [
            {
              groupTitle: 'Voice & Video',
              entryTitle: 'Web',
              entryUrl:
                'https://api-ref.agora.io/en/video-sdk/web/4.x/index.html',
              sourceUrl:
                'https://api-ref.agora.io/en/video-sdk/web/4.x/index.html',
              anchorText: 'First success',
              rawHref: 'https://docs.agora.io/en/old',
              resolvedDocsUrl: 'https://docs.agora.io/en/old',
              docsPathname: '/en/old',
              docsSearch: '',
              status: 200,
            },
            {
              groupTitle: 'Voice & Video',
              entryTitle: 'Web',
              entryUrl:
                'https://api-ref.agora.io/en/video-sdk/web/4.x/index.html',
              sourceUrl:
                'https://api-ref.agora.io/en/video-sdk/web/4.x/client.html',
              anchorText: 'Second success',
              rawHref: 'https://docs.agora.io/en/old',
              resolvedDocsUrl: 'https://docs.agora.io/en/old',
              docsPathname: '/en/old',
              docsSearch: '',
              status: 200,
              finalUrl: 'https://docs.agora.io/en/new',
            },
          ],
          pageErrors: [],
        },
      ],
    });

    expect(report.uniqueDocsLinks).toHaveLength(1);
    expect(report.uniqueDocsLinks[0]).toEqual(
      expect.objectContaining({
        status: 200,
        finalUrl: 'https://docs.agora.io/en/new',
      }),
    );
  });

  it('renders a Markdown summary and occurrence table', () => {
    const markdown = renderMarkdownReport({
      generatedAt: '2026-08-03T00:00:00.000Z',
      summary: {
        apiReferenceEntries: 1,
        apiReferencePagesVisited: 2,
        docsLinkOccurrences: 1,
        uniqueDocsUrls: 1,
        pageErrors: 0,
      },
      uniqueDocsLinks: [
        {
          resolvedDocsUrl:
            'https://docs.agora.io/en/Interactive%20Broadcast/cloud_proxy_web_ng?platform=Web',
          docsPathname: '/en/Interactive%20Broadcast/cloud_proxy_web_ng',
          docsSearch: '?platform=Web',
          legacyRedirectCovered: true,
          status: 200,
          finalUrl: 'https://docs.agora.io/en/realtime-media/voice/cloud-proxy',
          occurrences: [
            {
              groupTitle: 'Voice & Video',
              entryTitle: 'Web',
              sourceUrl:
                'https://api-ref.agora.io/en/video-sdk/web/4.x/index.html',
              anchorText: 'Cloud Proxy | guide',
              rawHref:
                'https://docs.agora.io/en/Interactive%20Broadcast/cloud_proxy_web_ng?platform=Web',
            },
          ],
        },
      ],
      pageErrors: [],
    });

    expect(markdown).toContain('# API Reference docs.agora.io Link Audit');
    expect(markdown).toContain('Cloud Proxy \\| guide');
    expect(markdown).toContain('legacy redirect covered');
    expect(markdown).toContain(
      '| Voice & Video | Web | https://api-ref.agora.io/en/video-sdk/web/4.x/index.html | Cloud Proxy \\| guide | https://docs.agora.io/en/Interactive%20Broadcast/cloud_proxy_web_ng?platform=Web |',
    );
  });
});

describe('audit-api-ref-docs-links CLI orchestration', () => {
  it('checks a docs URL with HEAD and returns status plus final URL', async () => {
    const calls: unknown[] = [];
    const fetchImpl = async (url: string, init?: RequestInit) => {
      calls.push([url, init]);
      return {
        status: 200,
        url: 'https://docs.agora.io/en/realtime-media/voice/start',
      };
    };

    await expect(
      checkDocsUrl({
        url: 'https://docs.agora.io/en/voice-calling/start',
        fetchImpl: fetchImpl as unknown as typeof fetch,
        timeoutMs: 1000,
      }),
    ).resolves.toEqual({
      status: 200,
      finalUrl: 'https://docs.agora.io/en/realtime-media/voice/start',
    });
    expect(calls).toEqual([
      [
        'https://docs.agora.io/en/voice-calling/start',
        expect.objectContaining({
          method: 'HEAD',
          redirect: 'follow',
          signal: expect.any(AbortSignal),
        }),
      ],
    ]);
  });

  it('returns status 0 and the original URL when a docs URL check throws', async () => {
    const fetchImpl = async () => {
      throw new Error('network unavailable');
    };

    await expect(
      checkDocsUrl({
        url: 'https://docs.agora.io/en/missing',
        fetchImpl: fetchImpl as unknown as typeof fetch,
        timeoutMs: 1000,
      }),
    ).resolves.toEqual({
      status: 0,
      finalUrl: 'https://docs.agora.io/en/missing',
      error: 'network unavailable',
    });
  });

  it('runs the audit, writes JSON and Markdown reports, and applies docs URL status', async () => {
    const tempDir = await mkdtemp(path.join(tmpdir(), 'api-ref-docs-links-'));
    try {
      const metaPath = path.join(tempDir, 'meta.json');
      const outBase = path.join(tempDir, 'report');
      await writeFile(
        metaPath,
        JSON.stringify({
          pages: [
            {
              type: 'group',
              title: 'Voice & Video',
              pages: [
                {
                  external: true,
                  title: 'Web',
                  href: 'https://api-ref.agora.io/en/video-sdk/web/4.x/index.html',
                },
              ],
            },
          ],
        }),
      );

      const fetchCalls: Array<{ url: string; method: string }> = [];
      const fetchImpl = async (url: string, init?: RequestInit) => {
        fetchCalls.push({
          url: String(url),
          method: init?.method ?? 'GET',
        });

        if (init?.method === 'HEAD') {
          return {
            status: 301,
            url: 'https://docs.agora.io/en/realtime-media/voice/start',
          };
        }

        return new Response(
          '<a href="https://docs.agora.io/en/voice-calling/start?platform=Web">Start</a>',
          {
            status: 200,
            headers: { 'content-type': 'text/html; charset=utf-8' },
          },
        );
      };

      const report = await runApiRefDocsLinksAudit({
        metaPath,
        outBase,
        fetchImpl: fetchImpl as unknown as typeof fetch,
        concurrency: 1,
        timeoutMs: 1000,
      });

      expect(report.summary).toEqual({
        apiReferenceEntries: 1,
        apiReferencePagesVisited: 1,
        docsLinkOccurrences: 1,
        uniqueDocsUrls: 1,
        pageErrors: 0,
      });
      expect(report.uniqueDocsLinks).toEqual([
        expect.objectContaining({
          resolvedDocsUrl:
            'https://docs.agora.io/en/voice-calling/start?platform=Web',
          status: 301,
          finalUrl: 'https://docs.agora.io/en/realtime-media/voice/start',
          occurrences: [
            expect.objectContaining({
              status: 301,
              finalUrl: 'https://docs.agora.io/en/realtime-media/voice/start',
            }),
          ],
        }),
      ]);
      expect(report).toHaveProperty('uniqueDocsLinks');
      expect(report).not.toHaveProperty('uniqueDocsUrls');
      expect(fetchCalls).toEqual([
        {
          url: 'https://api-ref.agora.io/en/video-sdk/web/4.x/index.html',
          method: 'GET',
        },
        {
          url: 'https://docs.agora.io/en/voice-calling/start?platform=Web',
          method: 'HEAD',
        },
      ]);

      const jsonReport = JSON.parse(await readFile(`${outBase}.json`, 'utf8'));
      expect(jsonReport).toHaveProperty('uniqueDocsLinks');
      expect(jsonReport).not.toHaveProperty('uniqueDocsUrls');
      expect(jsonReport.uniqueDocsLinks[0]).toEqual(
        expect.objectContaining({
          status: 301,
          finalUrl: 'https://docs.agora.io/en/realtime-media/voice/start',
        }),
      );
      await expect(readFile(`${outBase}.md`, 'utf8')).resolves.toContain(
        '# API Reference docs.agora.io Link Audit',
      );
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  it('crawls API reference entries concurrently while preserving report order', async () => {
    const tempDir = await mkdtemp(path.join(tmpdir(), 'api-ref-docs-links-'));
    try {
      const firstEntryUrl =
        'https://api-ref.agora.io/en/video-sdk/web/4.x/index.html';
      const secondEntryUrl =
        'https://api-ref.agora.io/en/chat-sdk/web/1.x/index.html';
      const metaPath = path.join(tempDir, 'meta.json');
      const outBase = path.join(tempDir, 'report');
      await writeFile(
        metaPath,
        JSON.stringify({
          pages: [
            {
              type: 'group',
              title: 'Voice & Video',
              pages: [
                {
                  external: true,
                  title: 'Web',
                  href: firstEntryUrl,
                },
                {
                  external: true,
                  title: 'Chat Web',
                  href: secondEntryUrl,
                },
              ],
            },
          ],
        }),
      );

      const firstGetStarted = createDeferred();
      const firstGetRelease = createDeferred();
      const secondGetStarted = createDeferred();
      let firstGetReleased = false;
      let secondGetStartedBeforeFirstRelease = false;

      const fetchImpl = async (url: string, init?: RequestInit) => {
        if (init?.method === 'HEAD') {
          throw new Error('status checks should not run');
        }

        if (url === firstEntryUrl) {
          firstGetStarted.resolve();
          await firstGetRelease.promise;
          return new Response(
            '<a href="https://docs.agora.io/en/__api_ref_audit_test_uncovered_first">First</a>',
            {
              status: 200,
              headers: { 'content-type': 'text/html; charset=utf-8' },
            },
          );
        }

        if (url === secondEntryUrl) {
          secondGetStartedBeforeFirstRelease = !firstGetReleased;
          secondGetStarted.resolve();
          return new Response(
            '<a href="https://docs.agora.io/en/__api_ref_audit_test_uncovered_second">Second</a>',
            {
              status: 200,
              headers: { 'content-type': 'text/html; charset=utf-8' },
            },
          );
        }

        return new Response('', { status: 404 });
      };

      const auditPromise = runApiRefDocsLinksAudit({
        metaPath,
        outBase,
        fetchImpl: fetchImpl as unknown as typeof fetch,
        concurrency: 2,
        timeoutMs: 1000,
        checkDocsStatus: false,
      });

      await firstGetStarted.promise;
      const secondStartResult = await Promise.race([
        secondGetStarted.promise.then(() => 'started'),
        Promise.resolve().then(() => 'not-started'),
      ]);

      firstGetReleased = true;
      firstGetRelease.resolve();
      const report = await auditPromise;

      expect(secondStartResult).toBe('started');
      expect(secondGetStartedBeforeFirstRelease).toBe(true);
      expect(report.summary).toEqual({
        apiReferenceEntries: 2,
        apiReferencePagesVisited: 2,
        docsLinkOccurrences: 2,
        uniqueDocsUrls: 2,
        pageErrors: 0,
      });
      expect(report.uniqueDocsLinks).toEqual([
        expect.objectContaining({
          resolvedDocsUrl:
            'https://docs.agora.io/en/__api_ref_audit_test_uncovered_first',
          occurrences: [
            expect.objectContaining({
              entryTitle: 'Web',
              legacyRedirectCovered: false,
            }),
          ],
        }),
        expect.objectContaining({
          resolvedDocsUrl:
            'https://docs.agora.io/en/__api_ref_audit_test_uncovered_second',
          occurrences: [
            expect.objectContaining({
              entryTitle: 'Chat Web',
              legacyRedirectCovered: false,
            }),
          ],
        }),
      ]);
      await expect(readFile(`${outBase}.json`, 'utf8')).resolves.toContain(
        '"apiReferenceEntries": 2',
      );
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  it('deduplicates docs URL status checks across hash-only variants', async () => {
    const tempDir = await mkdtemp(path.join(tmpdir(), 'api-ref-docs-links-'));
    try {
      const metaPath = path.join(tempDir, 'meta.json');
      const outBase = path.join(tempDir, 'report');
      await writeFile(
        metaPath,
        JSON.stringify({
          pages: [
            {
              type: 'group',
              title: 'Voice & Video',
              pages: [
                {
                  external: true,
                  title: 'Web',
                  href: 'https://api-ref.agora.io/en/video-sdk/web/4.x/index.html',
                },
              ],
            },
          ],
        }),
      );

      const fetchCalls: Array<{ url: string; method: string }> = [];
      const fetchImpl = async (url: string, init?: RequestInit) => {
        fetchCalls.push({
          url: String(url),
          method: init?.method ?? 'GET',
        });

        if (init?.method === 'HEAD') {
          return {
            status: 200,
            url: 'https://docs.agora.io/en/foo',
          };
        }

        return new Response(
          `
            <a href="https://docs.agora.io/en/foo#a">Foo A</a>
            <a href="https://docs.agora.io/en/foo#b">Foo B</a>
          `,
          {
            status: 200,
            headers: { 'content-type': 'text/html; charset=utf-8' },
          },
        );
      };

      const report = await runApiRefDocsLinksAudit({
        metaPath,
        outBase,
        fetchImpl: fetchImpl as unknown as typeof fetch,
        concurrency: 1,
        timeoutMs: 1000,
      });

      expect(fetchCalls).toEqual([
        {
          url: 'https://api-ref.agora.io/en/video-sdk/web/4.x/index.html',
          method: 'GET',
        },
        {
          url: 'https://docs.agora.io/en/foo',
          method: 'HEAD',
        },
      ]);
      expect(report.summary).toEqual({
        apiReferenceEntries: 1,
        apiReferencePagesVisited: 1,
        docsLinkOccurrences: 2,
        uniqueDocsUrls: 2,
        pageErrors: 0,
      });
      expect(report.uniqueDocsLinks).toEqual([
        expect.objectContaining({
          resolvedDocsUrl: 'https://docs.agora.io/en/foo#a',
          status: 200,
          finalUrl: 'https://docs.agora.io/en/foo',
          occurrences: [
            expect.objectContaining({
              resolvedDocsUrl: 'https://docs.agora.io/en/foo#a',
              status: 200,
              finalUrl: 'https://docs.agora.io/en/foo',
            }),
          ],
        }),
        expect.objectContaining({
          resolvedDocsUrl: 'https://docs.agora.io/en/foo#b',
          status: 200,
          finalUrl: 'https://docs.agora.io/en/foo',
          occurrences: [
            expect.objectContaining({
              resolvedDocsUrl: 'https://docs.agora.io/en/foo#b',
              status: 200,
              finalUrl: 'https://docs.agora.io/en/foo',
            }),
          ],
        }),
      ]);
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  it('writes reports without requesting docs URL status when status checks are disabled', async () => {
    const tempDir = await mkdtemp(path.join(tmpdir(), 'api-ref-docs-links-'));
    try {
      const metaPath = path.join(tempDir, 'meta.json');
      const outBase = path.join(tempDir, 'report');
      await writeFile(
        metaPath,
        JSON.stringify({
          pages: [
            {
              type: 'group',
              title: 'Voice & Video',
              pages: [
                {
                  external: true,
                  title: 'Web',
                  href: 'https://api-ref.agora.io/en/video-sdk/web/4.x/index.html',
                },
              ],
            },
          ],
        }),
      );

      const fetchCalls: Array<{ url: string; method: string }> = [];
      const fetchImpl = async (url: string, init?: RequestInit) => {
        fetchCalls.push({
          url: String(url),
          method: init?.method ?? 'GET',
        });

        if (init?.method === 'HEAD') {
          throw new Error('status checks should not run');
        }

        return new Response(
          '<a href="https://docs.agora.io/en/video-sdk/web/start">Start</a>',
          {
            status: 200,
            headers: { 'content-type': 'text/html' },
          },
        );
      };

      const report = await runApiRefDocsLinksAudit({
        metaPath,
        outBase,
        fetchImpl: fetchImpl as unknown as typeof fetch,
        concurrency: 1,
        timeoutMs: 1000,
        checkDocsStatus: false,
      });

      expect(fetchCalls).toEqual([
        {
          url: 'https://api-ref.agora.io/en/video-sdk/web/4.x/index.html',
          method: 'GET',
        },
      ]);
      expect(report.uniqueDocsLinks[0]).not.toHaveProperty('status');
      await expect(readFile(`${outBase}.json`, 'utf8')).resolves.toContain(
        '"uniqueDocsLinks"',
      );
      await expect(readFile(`${outBase}.md`, 'utf8')).resolves.toContain(
        'https://docs.agora.io/en/video-sdk/web/start',
      );
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  it('exposes a package script for the API reference docs link audit', async () => {
    const packageJson = JSON.parse(await readFile('package.json', 'utf8'));

    expect(packageJson.scripts['api-ref:docs-links']).toBe(
      'node scripts/audit-api-ref-docs-links.mjs',
    );
  });
});
