import { describe, expect, it, vi } from 'vitest';
import {
  createMachineReadableEntryArtifact,
  filterMachineReadableDocsPages,
  getMachineReadableEntryRoute,
  getMachineReadableLocale,
  isMachineReadableDocsPath,
  isMachineReadableLocale,
  MACHINE_READABLE_LOCALE,
} from './machine-readable-docs';

describe('machine-readable docs filters', () => {
  it('allows only English docs in machine-readable feeds', () => {
    expect(MACHINE_READABLE_LOCALE).toBe('en');
    expect(getMachineReadableLocale('global')).toBe('en');
    expect(getMachineReadableLocale('cn')).toBe('zh-CN');
    expect(isMachineReadableLocale('en')).toBe(true);
    expect(isMachineReadableLocale('zh-CN')).toBe(false);
    expect(isMachineReadableDocsPath('/en/introduction/about-agora')).toBe(
      true,
    );
    expect(isMachineReadableDocsPath('/zh-CN/introduction/about-agora')).toBe(
      false,
    );
  });

  it('filters page collections by path or url', () => {
    expect(
      filterMachineReadableDocsPages([
        { path: 'en/ai/index.mdx' },
        { path: 'zh-CN/ai/index.mdx' },
        { url: '/en/api-reference/api-ref/conversational-ai/join' },
        { url: '/zh-CN/api-reference/api-ref/conversational-ai/join' },
      ]),
    ).toEqual([
      { path: 'en/ai/index.mdx' },
      { url: '/en/api-reference/api-ref/conversational-ai/join' },
    ]);
  });

  it('publishes an English entry alias only for the global deployment', () => {
    expect(getMachineReadableEntryRoute('global')).toEqual({
      markdownPath: '/en.md',
      sourcePath: '/en/introduction',
    });
    expect(getMachineReadableEntryRoute('cn')).toBeNull();
  });

  it('builds the English entry artifact from the configured docs home', async () => {
    const renderMarkdown = vi.fn(async (page: { body: string }) => page.body);

    await expect(
      createMachineReadableEntryArtifact({
        pages: [
          { body: '# Introduction', url: '/en/introduction' },
          { body: '# Other page', url: '/en/other' },
        ],
        region: 'global',
        renderMarkdown,
      }),
    ).resolves.toEqual({
      content: '# Introduction',
      path: '/en.md',
    });
    expect(renderMarkdown).toHaveBeenCalledOnce();
  });

  it('does not build an entry artifact for the CN deployment', async () => {
    const renderMarkdown = vi.fn(async () => '# Chinese introduction');

    await expect(
      createMachineReadableEntryArtifact({
        pages: [{ url: '/zh-CN/introduction' }],
        region: 'cn',
        renderMarkdown,
      }),
    ).resolves.toBeNull();
    expect(renderMarkdown).not.toHaveBeenCalled();
  });
});
