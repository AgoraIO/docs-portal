import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AiMarkdown } from './AiMarkdown';

describe('AiMarkdown', () => {
  it('renders Markdown formatting and fenced code blocks', () => {
    render(
      <AiMarkdown>
        {
          '**参数说明**\n\n```typescript\nconst requestId = await manualSOS();\n```'
        }
      </AiMarkdown>,
    );

    expect(screen.getByText('参数说明').tagName).toBe('STRONG');
    expect(
      screen.getByText(/const requestId = await manualSOS/),
    ).toBeInTheDocument();
    expect(document.querySelector('pre')).toBeInTheDocument();
    expect(screen.queryByText('```typescript')).not.toBeInTheDocument();
  });

  it('does not execute raw HTML from the model answer', () => {
    render(
      <AiMarkdown>
        {'<script>window.__aiMarkdownWasExecuted = true</script>\n\nSafe text'}
      </AiMarkdown>,
    );

    expect(document.querySelector('script')).not.toBeInTheDocument();
    expect(screen.getByText('Safe text')).toBeInTheDocument();
  });
});
