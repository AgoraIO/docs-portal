import { describe, expect, it } from 'vitest';
import { normalizeDocsHref } from './docs-link-normalize';

describe('normalizeDocsHref', () => {
  it('resolves relative markdown links from the source content path', () => {
    expect(
      normalizeDocsHref('get-started/quickstart.md', {
        contentPath: 'en/ai/index.md',
      }),
    ).toEqual({ href: '/en/ai/get-started/quickstart', kind: 'internal-doc' });
  });

  it('collapses index.md targets to their directory route', () => {
    expect(
      normalizeDocsHref('studio/index.md', {
        contentPath: 'en/ai/index.md',
      }),
    ).toEqual({ href: '/en/ai/studio', kind: 'internal-doc' });
  });

  it('resolves parent traversal and preserves search and hash', () => {
    expect(
      normalizeDocsHref(
        '../api-reference/conversational-ai/rest-api/index.md?view=all#start',
        { contentPath: 'en/ai/index.md' },
      ),
    ).toEqual({
      href: '/en/api-reference/conversational-ai/rest-api?view=all#start',
      kind: 'internal-doc',
    });
  });

  it('leaves non-doc links unchanged', () => {
    expect(
      normalizeDocsHref('#overview', { contentPath: 'en/ai/index.md' }),
    ).toEqual({ href: '#overview', kind: 'hash' });

    expect(
      normalizeDocsHref('https://example.com/page.md', {
        contentPath: 'en/ai/index.md',
      }),
    ).toEqual({ href: 'https://example.com/page.md', kind: 'external' });

    expect(
      normalizeDocsHref('./diagram.png', { contentPath: 'en/ai/index.md' }),
    ).toEqual({ href: './diagram.png', kind: 'relative-asset' });
  });
});
