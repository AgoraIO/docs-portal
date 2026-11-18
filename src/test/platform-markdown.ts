import remarkDirective from 'remark-directive';
import remarkGfm from 'remark-gfm';
import remarkMdx from 'remark-mdx';
import remarkParse from 'remark-parse';
import remarkStringify from 'remark-stringify';
import { unified } from 'unified';
import { buildPlatformMarkdownText } from '../lib/platforms/processed-text';
import type { PlatformKey } from '../lib/platforms/registry';
import { remarkPlatformContent } from '../lib/platforms/remark-platform-content';

const processor = unified()
  .use(remarkParse)
  .use(remarkMdx)
  .use(remarkGfm)
  .use(remarkDirective)
  .use(remarkPlatformContent)
  .use(remarkStringify);
const cache = new Map<string, string>();

export function processPlatformMarkdown(source: string) {
  if (!cache.has(source)) {
    const body = source.replace(/^---\n[\s\S]*?\n---\n/, '');
    cache.set(source, String(processor.processSync(body)));
  }
  return cache.get(source) as string;
}

export function selectPlatformMarkdown(source: string, platform: PlatformKey) {
  return buildPlatformMarkdownText(processPlatformMarkdown(source), platform);
}
