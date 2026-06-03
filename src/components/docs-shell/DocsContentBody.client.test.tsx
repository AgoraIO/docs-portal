import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DocsContentBodyClient } from './DocsContentBody.client';

const useDocsContentMock = vi.fn();

vi.mock('@/lib/source.client', () => ({
  useDocsContent: (...args: unknown[]) => useDocsContentMock(...args),
}));

describe('DocsContentBodyClient', () => {
  beforeEach(() => {
    useDocsContentMock.mockReset();
  });

  it('wraps hydrated MDX content with the docs body styling hook', () => {
    useDocsContentMock.mockReturnValueOnce(<p>Install the Agora CLI.</p>);

    const { container } = render(
      <DocsContentBodyClient contentPath="en/ai/choose-your-path/quickstart-coding.mdx" />,
    );

    expect(container.querySelector('.docs-body')).toContainElement(
      screen.getByText('Install the Agora CLI.'),
    );
  });

  it('injects overview widgets only for approved editorial overview pages', () => {
    useDocsContentMock.mockReturnValueOnce(<p>Overview</p>);

    render(
      <DocsContentBodyClient contentPath="en/introduction/about-agora.mdx" />,
    );

    const [, options] = useDocsContentMock.mock.calls[0];
    expect(options.components.FeatureCard).toBeDefined();
    expect(options.components.OverviewSpotlightGrid).toBeDefined();
  });

  it('does not inject overview widgets into regular docs pages', () => {
    useDocsContentMock.mockReturnValueOnce(<p>Regular page</p>);

    render(
      <DocsContentBodyClient contentPath="en/ai/choose-your-path/quickstart-coding.mdx" />,
    );

    const [, options] = useDocsContentMock.mock.calls[0];
    expect(options.components.SolutionCard).toBeUndefined();
    expect(options.components.FeatureCard).toBeUndefined();
  });
});
