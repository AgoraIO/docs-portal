import { readdirSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const docsRoot = join(process.cwd(), 'content/docs');

export function getStaticDocsPaths() {
  return collectMarkdownFiles(docsRoot)
    .map(markdownPathToDocUrl)
    .filter((url): url is string => Boolean(url))
    .sort((a, b) => a.localeCompare(b));
}

function collectMarkdownFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);

    if (entry.isDirectory()) {
      return collectMarkdownFiles(path);
    }

    return entry.isFile() && /\.(md|mdx)$/.test(entry.name) ? [path] : [];
  });
}

function markdownPathToDocUrl(path: string) {
  const segments = relative(docsRoot, path)
    .split(sep)
    .map((segment) => segment.replace(/\.(md|mdx)$/, ''));

  if (segments[0] !== 'en' && segments[0] !== 'zh-CN') {
    return null;
  }

  if (segments.at(-1) === 'index') {
    segments.pop();
  }

  return `/${segments.join('/')}`;
}
