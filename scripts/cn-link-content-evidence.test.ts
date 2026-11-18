// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { docsContentEvidence } from './lib/cn-link-audit/content-evidence.mjs';

const document = (
  body = '<p id="start"><a href="/next">正文</a></p>',
  heading = '介绍',
  origin = 'https://local.example',
  bundle = 'local',
) =>
  `<!doctype html><html><head><title>介绍 | Docs</title><link rel="canonical" href="${origin}/introduction"><script src="/assets/${bundle}.js"></script></head><body><article><header><h1>${heading}</h1></header><div data-static-docs-body>${body}</div></article></body></html>`;

describe('documentation content evidence', () => {
  it('ignores deployment origin and global bundles while retaining canonical path and document heading', () => {
    const local = docsContentEvidence(document());
    const remote = docsContentEvidence(
      document(undefined, undefined, 'https://staging.example', 'remote'),
    );
    expect(local).toMatchObject({
      hasDocsBody: true,
      contentTitle: '介绍',
      canonicalPath: '/introduction',
    });
    expect(local.contentDigest).toMatch(/^[a-f0-9]{64}$/);
    expect(remote).toEqual(local);
  });

  it.each([
    '<p id="start"><a href="/different">正文</a></p>',
    '<p id="start"><a href="/next">不同正文</a></p>',
    '<p id="different"><a href="/next">正文</a></p>',
    '<p id="start"><a href="/next">正文</a><img src="/changed.png"></p>',
  ])('binds every body link, text, ID, and resource (%s)', (body) => {
    expect(docsContentEvidence(document(body)).contentDigest).not.toBe(
      docsContentEvidence(document()).contentDigest,
    );
  });

  it('binds the actual article heading outside the static body', () => {
    expect(
      docsContentEvidence(document(undefined, '另一个文档')).contentDigest,
    ).not.toBe(docsContentEvidence(document()).contentDigest);
  });

  it('preserves exact code and HTML bytes within document content', () => {
    expect(
      docsContentEvidence(document('<pre><code>a  b</code></pre>'))
        .contentDigest,
    ).not.toBe(
      docsContentEvidence(document('<pre><code>a b</code></pre>'))
        .contentDigest,
    );
    expect(
      docsContentEvidence(document('<p>&#65;</p>')).contentDigest,
    ).not.toBe(docsContentEvidence(document('<p>A</p>')).contentDigest);
  });

  it.each([
    '',
    '<!-- comment --><script>bootstrap()</script>',
    '<div data-testid="docs-content-skeleton">Loading</div>',
    '<span data-slot="skeleton"></span>',
  ])('refuses empty and skeleton bodies (%s)', (body) => {
    expect(docsContentEvidence(document(body)).hasDocsBody).toBe(false);
  });

  it('refuses an application shell without a docs body', () => {
    expect(
      docsContentEvidence('<title>Docs</title><div id="root"></div>')
        .hasDocsBody,
    ).toBe(false);
  });
});
