import { describe, expect, it } from 'vitest';
import {
  buildDocsLlmsFullText,
  buildDocsLlmsIndex,
  getDocsMarkdownByContentPath,
} from './docs-index-llms.server';

describe('docs index llms helpers', () => {
  it('builds a markdown index for ordinary docs pages', () => {
    const markdown = buildDocsLlmsIndex();

    expect(markdown).toContain('(/en/ai/custom-llm)');
    expect(markdown).toContain('(/en/introduction)');
  });

  it('builds full llms text entries for ordinary docs pages', () => {
    const markdown = buildDocsLlmsFullText();

    expect(markdown).toContain('(/en/ai/custom-llm)');
    expect(markdown).toContain('- Source: /llms.mdx/docs/en/ai/custom-llm.md');
  });

  it('returns markdown by content path for ordinary docs pages', () => {
    const markdown = getDocsMarkdownByContentPath('en/ai/custom-llm.md');

    expect(markdown).toContain('(/en/ai/custom-llm)');
    expect(markdown).toContain('- Source: /llms.mdx/docs/en/ai/custom-llm.md');
  });
});
