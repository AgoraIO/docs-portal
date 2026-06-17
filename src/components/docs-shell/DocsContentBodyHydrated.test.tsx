import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('./DocsContentBody.client', () => ({
  DocsContentBodyClient: ({ contentPath }: { contentPath: string }) => (
    <div data-testid="docs-content-body-client">{contentPath}</div>
  ),
}));

describe('DocsContentBodyHydrated', () => {
  it('renders the client docs body with the requested content path', async () => {
    const { DocsContentBodyHydrated } = await import('./DocsContentBodyHydrated');

    render(
      <DocsContentBodyHydrated contentPath="en/introduction/about-agora.mdx" />,
    );

    expect(
      await screen.findByTestId('docs-content-body-client'),
    ).toHaveTextContent('en/introduction/about-agora.mdx');
  });
});
