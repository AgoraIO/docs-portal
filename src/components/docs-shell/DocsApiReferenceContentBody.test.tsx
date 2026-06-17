import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DocsApiReferenceContentBody } from './DocsApiReferenceContentBody';

const useApiReferenceContentMock = vi.fn();

vi.mock('@/lib/source.api-reference.browser', () => ({
  useApiReferenceContent: (...args: unknown[]) =>
    useApiReferenceContentMock(...args),
}));

describe('DocsApiReferenceContentBody', () => {
  beforeEach(() => {
    useApiReferenceContentMock.mockReset();
  });

  it('wraps hydrated API reference MDX content with the docs body styling hook', () => {
    useApiReferenceContentMock.mockReturnValueOnce(<p>Agent history</p>);

    const { container } = render(
      <DocsApiReferenceContentBody contentPath="en/api-reference/conversational-ai/rest-api/agent/history.mdx" />,
    );

    expect(container.querySelector('.docs-body')).toContainElement(
      screen.getByText('Agent history'),
    );
  });

  it('keeps API reference widget registrations available for recipe pages', () => {
    useApiReferenceContentMock.mockReturnValueOnce(<p>Recipes</p>);

    render(
      <DocsApiReferenceContentBody contentPath="en/api-reference/recipes/index.mdx" />,
    );

    const [, options] = useApiReferenceContentMock.mock.calls[0];
    expect(options.components.RecipesCatalog).toBeDefined();
    expect(options.components.FeatureCard).toBeDefined();
  });
});
