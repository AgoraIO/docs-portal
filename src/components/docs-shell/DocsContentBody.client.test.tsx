import { fireEvent, render, screen } from '@testing-library/react';
import type { ComponentType, ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DocsContentBody } from './DocsContentBody';

const useDocsContentMock = vi.fn();

vi.mock('@/lib/source.browser', () => ({
  useDocsContent: (...args: unknown[]) => useDocsContentMock(...args),
}));

describe('DocsContentBodyClient', () => {
  beforeEach(() => {
    useDocsContentMock.mockReset();
  });

  it('wraps hydrated MDX content with the docs body styling hook', () => {
    useDocsContentMock.mockReturnValueOnce(<p>Install the Agora CLI.</p>);

    const { container } = render(
      <DocsContentBody contentPath="en/ai/choose-your-path/quickstart-coding.mdx" />,
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

  it('injects page-specific recipe catalog widgets only for the recipes index', () => {
    useDocsContentMock.mockReturnValueOnce(<p>Recipes</p>);

    render(
      <DocsContentBody contentPath="en/api-reference/recipes/index.mdx" />,
    );

    const [, options] = useDocsContentMock.mock.calls[0];
    expect(options.components.RecipesCatalog).toBeDefined();
    expect(options.components.FeatureCard).toBeDefined();
  });

  it('makes shared docs widgets available to regular docs pages without path allowlists', () => {
    useDocsContentMock.mockReturnValueOnce(<p>Regular page</p>);

    render(
      <DocsContentBody contentPath="en/ai/choose-your-path/quickstart-coding.mdx" />,
    );

    const [, options] = useDocsContentMock.mock.calls[0];
    expect(options.components.SolutionCard).toBeDefined();
    expect(options.components.FeatureCard).toBeDefined();
  });

  it('shares accordion state across hydrated MDX content', () => {
    useDocsContentMock.mockImplementationOnce((_, options) => {
      const Accordions = options.components.Accordions as ComponentType<{
        children: ReactNode;
      }>;
      const Accordion = options.components.Accordion as ComponentType<{
        children: ReactNode;
        title: ReactNode;
      }>;

      return (
        <>
          <Accordions>
            <Accordion title="First dropdown">First body</Accordion>
          </Accordions>
          <Accordions>
            <Accordion title="Second dropdown">Second body</Accordion>
          </Accordions>
        </>
      );
    });

    render(
      <DocsContentBody contentPath="en/realtime-media/video/reference/security.mdx" />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'First dropdown' }));
    expect(screen.getByText('First body')).toBeVisible();

    fireEvent.click(screen.getByRole('button', { name: 'Second dropdown' }));

    expect(screen.queryByText('First body')).not.toBeInTheDocument();
    expect(screen.getByText('Second body')).toBeVisible();
  });
});
