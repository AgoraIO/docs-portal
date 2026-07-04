import { compile } from '@mdx-js/mdx';
import { remarkDirectiveAdmonition } from 'fumadocs-core/mdx-plugins';
import remarkDirective from 'remark-directive';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createScopedDocsFiles } from './docs-dev-scope';
import { directiveCalloutTypes } from './mdx/directive-callouts';

async function compileDirectiveCallout(
  directive: string,
  types: Record<string, string>,
) {
  return String(
    await compile(`:::${directive}\nCallout body.\n:::`, {
      format: 'mdx',
      jsx: true,
      remarkPlugins: [
        remarkDirective,
        [
          remarkDirectiveAdmonition,
          {
            types,
          },
        ],
      ],
    }),
  );
}

describe('source config', () => {
  afterEach(() => {
    delete process.env.DOCS_DEV_SCOPE;
    vi.resetModules();
  });

  it(
    'uses canonical docs and meta collection globs by default',
    async () => {
      const { docs } = await import('../../source.config');

      expect(docs.docs.files).toEqual(['**/*.{md,mdx}']);
      expect(docs.meta.files).toEqual(['**/meta.{json,yaml}']);
    },
    30000,
  );

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

  it('maps directive callout aliases to supported Fumadocs callout types', async () => {
    const expectedTypes = {
      caution: 'warning',
      danger: 'error',
      error: 'error',
      info: 'info',
      note: 'info',
      ok: 'success',
      success: 'success',
      tip: 'success',
      warn: 'warning',
      warning: 'warning',
    };

    expect(directiveCalloutTypes).toEqual(expectedTypes);

    await Promise.all(
      Object.entries(expectedTypes).map(async ([directive, calloutType]) => {
        const compiled = await compileDirectiveCallout(
          directive,
          directiveCalloutTypes,
        );

        expect(compiled).toContain(`<CalloutContainer type="${calloutType}">`);
      }),
    );
  });
});
