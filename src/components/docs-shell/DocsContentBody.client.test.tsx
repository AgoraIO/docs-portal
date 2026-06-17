import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DocsContentBody } from './DocsContentBody';

const useDocsContentMock = vi.fn();

vi.mock('@/lib/source.browser', () => ({
  useDocsContent: (...args: unknown[]) => useDocsContentMock(...args),
}));

describe('DocsContentBody', () => {
  beforeEach(() => {
    useDocsContentMock.mockReset();
  });

  it('wraps hydrated MDX content with the docs body styling hook', () => {
    useDocsContentMock.mockReturnValueOnce(<p>Install the Agora CLI.</p>);

    const { container } = render(
      <DocsContentBody contentPath="en/introduction/about-agora.mdx" />,
    );

    expect(container.querySelector('.docs-body')).toContainElement(
      screen.getByText('Install the Agora CLI.'),
    );
  });

  it('injects overview widgets only for approved editorial overview pages', () => {
    useDocsContentMock.mockReturnValueOnce(<p>Overview</p>);

    render(<DocsContentBody contentPath="en/introduction/about-agora.mdx" />);

    const [, options] = useDocsContentMock.mock.calls[0];
    expect(options.components.FeatureCard).toBeDefined();
    expect(options.components.OverviewSpotlightGrid).toBeDefined();
  });

  it('makes shared docs widgets available to regular docs pages without path allowlists', () => {
    useDocsContentMock.mockReturnValueOnce(<p>Regular page</p>);

    render(
      <DocsContentBody contentPath="en/realtime-media/rtc/android/reference/api-reference/index.md" />,
    );

    const [, options] = useDocsContentMock.mock.calls[0];
    expect(options.components.SolutionCard).toBeDefined();
    expect(options.components.FeatureCard).toBeDefined();
  });
});
