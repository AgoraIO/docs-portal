import { docsContentRoute } from '../shared';
import { getDocsIndex } from './docs-index.server';

export function buildDocsLlmsIndex() {
  return getDocsIndex()
    .pages.map((page) => `- [${page.title}](${page.routePath})`)
    .join('\n');
}

export function buildDocsLlmsFullText() {
  return getDocsIndex()
    .pages.map((page) => serializeDocsLlmsPage(page))
    .join('\n\n');
}

export function getDocsMarkdownByContentPath(path: string) {
  const normalizedPath = path.replace(/\.md$/, '.mdx');
  const page = getDocsIndex().pages.find(
    (entry) => entry.contentPath === normalizedPath || entry.contentPath === path,
  );

  if (!page) {
    return null;
  }

  return serializeDocsLlmsPage(page);
}

function serializeDocsLlmsPage(page: {
  description?: string;
  markdownUrl: string;
  routePath: string;
  title: string;
}) {
  const lines = [`# ${page.title} (${page.routePath})`, ''];

  if (page.description) {
    lines.push(page.description, '');
  }

  lines.push(`- Source: ${toLlmsMarkdownUrl(page.markdownUrl)}`);

  return lines.join('\n').trim();
}

function toLlmsMarkdownUrl(markdownUrl: string) {
  return markdownUrl.replace('/content/docs', docsContentRoute);
}
