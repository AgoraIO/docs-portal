import { describe, expect, it } from 'vitest';
import {
  filterMachineReadableDocsPages,
  getMachineReadableLocale,
  isMachineReadableDocsPath,
  isMachineReadableLocale,
  isPublicMarkdownLocale,
  MACHINE_READABLE_LOCALE,
  PUBLIC_MARKDOWN_LOCALES,
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

  it('allows English and Chinese public markdown page output', () => {
    expect(PUBLIC_MARKDOWN_LOCALES).toEqual(['en', 'zh-CN']);
    expect(isPublicMarkdownLocale('en')).toBe(true);
    expect(isPublicMarkdownLocale('zh-CN')).toBe(true);
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
});
