import { afterEach, describe, expect, it, vi } from 'vitest';
import { createScopedDocsFiles } from './docs-dev-scope';

describe('source config', () => {
  afterEach(() => {
    delete process.env.DOCS_DEV_SCOPE;
    vi.resetModules();
  });

  it('only includes meta.json and meta.yaml files in the meta collection', async () => {
    const { docs } = await import('../../source.config');

    expect(docs.meta.files).toEqual(['**/meta.{json,yaml}']);
  });

  it('creates scoped docs collection globs for a focused dev subtree', () => {
    expect(createScopedDocsFiles('en/ai/openai-realtime')).toEqual({
      docs: ['en/ai/openai-realtime/**/*.{mdx,md}'],
      meta: [
        'meta.{json,yaml}',
        'en/meta.{json,yaml}',
        'en/ai/meta.{json,yaml}',
        'en/ai/openai-realtime/**/meta.{json,yaml}',
      ],
    });
  });

  it('applies DOCS_DEV_SCOPE to the source config', async () => {
    process.env.DOCS_DEV_SCOPE = 'en/ai/openai-realtime';
    vi.resetModules();

    const scopedConfig = await import('../../source.config');

    expect(scopedConfig.docs.docs.files).toEqual([
      'en/ai/openai-realtime/**/*.{mdx,md}',
    ]);
    expect(scopedConfig.docs.meta.files).toEqual([
      'meta.{json,yaml}',
      'en/meta.{json,yaml}',
      'en/ai/meta.{json,yaml}',
      'en/ai/openai-realtime/**/meta.{json,yaml}',
    ]);
  });
});
