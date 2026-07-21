import { isMachineReadableDocsPath } from './machine-readable-docs';

const MARKDOWN_LINK_PATTERN = /\]\((\/[^)\s]+)\)/g;

export function createMarkdownLlmsIndex({
  baseUrl,
  docsIndex,
  openApiPages,
}: {
  baseUrl: string;
  docsIndex: string;
  openApiPages: ReadonlyArray<{ title: string; url: string }>;
}) {
  const openApiIndex = openApiPages
    .map((page) => `- [${page.title}](${page.url})`)
    .join('\n');
  const index = `${docsIndex}\n\n${openApiIndex}\n`;

  return index.replace(MARKDOWN_LINK_PATTERN, (match, target: string) => {
    if (!isMachineReadableDocsPath(target) || target.endsWith('.md')) {
      return match;
    }

    return `](${new URL(`${target}.md`, baseUrl).toString()})`;
  });
}
