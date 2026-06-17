import { beforeEach, describe, expect, it, vi } from 'vitest';
import { preloadDocsContent, useDocsContent } from './source.browser';

const preloadDocsSectionContentMock = vi.fn();
const preloadApiReferenceContentMock = vi.fn();
const useDocsSectionContentMock = vi.fn();
const useApiReferenceContentMock = vi.fn();

vi.mock('./source.docs.browser', () => ({
  preloadDocsSectionContent: (...args: unknown[]) =>
    preloadDocsSectionContentMock(...args),
  useDocsSectionContent: (...args: unknown[]) => useDocsSectionContentMock(...args),
}));

vi.mock('./source.api-reference.browser', () => ({
  preloadApiReferenceContent: (...args: unknown[]) =>
    preloadApiReferenceContentMock(...args),
  useApiReferenceContent: (...args: unknown[]) =>
    useApiReferenceContentMock(...args),
}));

describe('source.browser', () => {
  beforeEach(() => {
    preloadDocsSectionContentMock.mockReset();
    preloadApiReferenceContentMock.mockReset();
    useDocsSectionContentMock.mockReset();
    useApiReferenceContentMock.mockReset();
  });

  it('preloads api-reference content through the api-reference loader', async () => {
    preloadApiReferenceContentMock.mockResolvedValueOnce(undefined);

    await preloadDocsContent(
      'en/api-reference/conversational-ai/rest-api/agent/history.mdx',
    );

    expect(preloadApiReferenceContentMock).toHaveBeenCalledWith(
      'en/api-reference/conversational-ai/rest-api/agent/history.mdx',
    );
    expect(preloadDocsSectionContentMock).not.toHaveBeenCalled();
  });

  it('preloads non-api docs content through the docs-section loader', async () => {
    preloadDocsSectionContentMock.mockResolvedValueOnce(undefined);

    await preloadDocsContent('en/ai/build/custom-llm.mdx');

    expect(preloadDocsSectionContentMock).toHaveBeenCalledWith(
      'en/ai/build/custom-llm.mdx',
    );
    expect(preloadApiReferenceContentMock).not.toHaveBeenCalled();
  });

  it('renders api-reference content through the api-reference loader', () => {
    useApiReferenceContentMock.mockReturnValueOnce('api-content');

    const content = useDocsContent(
      'en/api-reference/conversational-ai/rest-api/agent/history.mdx',
    );

    expect(content).toBe('api-content');
    expect(useApiReferenceContentMock).toHaveBeenCalledWith(
      'en/api-reference/conversational-ai/rest-api/agent/history.mdx',
      undefined,
    );
    expect(useDocsSectionContentMock).not.toHaveBeenCalled();
  });

  it('renders non-api docs content through the docs-section loader', () => {
    useDocsSectionContentMock.mockReturnValueOnce('docs-content');

    const content = useDocsContent('en/introduction/about-agora.mdx');

    expect(content).toBe('docs-content');
    expect(useDocsSectionContentMock).toHaveBeenCalledWith(
      'en/introduction/about-agora.mdx',
      undefined,
    );
    expect(useApiReferenceContentMock).not.toHaveBeenCalled();
  });
});
