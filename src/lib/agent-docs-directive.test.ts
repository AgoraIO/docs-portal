import { describe, expect, it } from 'vitest';
import {
  AGENT_DOCS_DIRECTIVE,
  withAgentDocsDirective,
} from './agent-docs-directive';

describe('agent docs directive', () => {
  it('places the llms.txt discovery link immediately after the page title', () => {
    expect(withAgentDocsDirective('# Quickstart\n\nStart here.')).toBe(
      `# Quickstart\n\n${AGENT_DOCS_DIRECTIVE}\n\nStart here.`,
    );
  });

  it('does not duplicate an existing directive', () => {
    const markdown = `# Quickstart\n\n${AGENT_DOCS_DIRECTIVE}\n\nStart here.`;

    expect(withAgentDocsDirective(markdown)).toBe(markdown);
  });
});
