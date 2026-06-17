import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('./DocsAiContentBody.client', () => ({
  DocsAiContentBodyClient: ({ contentPath }: { contentPath: string }) => (
    <div data-testid="docs-ai-content-body-client">{contentPath}</div>
  ),
}));

describe('DocsAiContentBodyHydrated', () => {
  it('renders the client AI docs body with the requested content path', async () => {
    const { DocsAiContentBodyHydrated } = await import(
      './DocsAiContentBodyHydrated'
    );

    render(<DocsAiContentBodyHydrated contentPath="en/ai/build/custom-llm.mdx" />);

    expect(await screen.findByTestId('docs-ai-content-body-client')).toHaveTextContent(
      'en/ai/build/custom-llm.mdx',
    );
  });
});
