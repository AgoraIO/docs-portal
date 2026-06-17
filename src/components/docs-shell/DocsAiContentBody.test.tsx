import { render, screen } from '@testing-library/react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DocsAiContentBody } from './DocsAiContentBody';

const useAiDocsContentMock = vi.fn();

vi.mock('@/lib/source.browser', () => ({
  useDocsContent: (...args: unknown[]) => useAiDocsContentMock(...args),
}));

describe('DocsAiContentBody', () => {
  beforeEach(() => {
    useAiDocsContentMock.mockReset();
  });

  it('wraps hydrated AI MDX content with the docs body styling hook', () => {
    useAiDocsContentMock.mockReturnValueOnce(<p>AI content</p>);

    const { container } = render(
      <DocsAiContentBody contentPath="en/ai/build/custom-llm.mdx" />,
    );

    expect(container.querySelector('.docs-body')).toContainElement(
      screen.getByText('AI content'),
    );
  });

  it('passes static-render MDX components to the server fallback path', () => {
    useAiDocsContentMock.mockImplementation((_contentPath, options) => {
      const components = options?.components as Record<string, React.ComponentType<any>>;
      const Tabs = components.Tabs;
      const TabsList = components.TabsList;
      const TabsTrigger = components.TabsTrigger;
      const TabsContent = components.TabsContent;

      return (
        <Tabs defaultValue="android">
          <TabsList>
            <TabsTrigger value="android">Android</TabsTrigger>
            <TabsTrigger value="ios">iOS</TabsTrigger>
          </TabsList>
          <TabsContent value="android">Android instructions</TabsContent>
          <TabsContent value="ios">iOS instructions</TabsContent>
        </Tabs>
      );
    });

    const html = renderToStaticMarkup(
      <DocsAiContentBody contentPath="en/ai/build/custom-llm.mdx" />,
    );

    expect(html).toContain('Android instructions');
    expect(html).not.toContain('iOS instructions');
  });
});
