import {
  DOC_VERSION_SCOPES,
  getDocVersionIndexPath,
  resolveDocVersion,
} from './doc-versions';
import type { MachineReadableDocsIndexFile } from './llms-index';
import { MACHINE_READABLE_LOCALE } from './machine-readable-docs';

/** Fixed version exports work for browsers, CLI clients and agents alike. */
export async function getDocVersionBulkExports(): Promise<
  MachineReadableDocsIndexFile[]
> {
  const [{ canonicalSource: source, getLLMText }, { getOpenApiMarkdownPages }] =
    await Promise.all([
      import('./source.server'),
      import('./openapi/markdown'),
    ]);
  const openApiPages = await getOpenApiMarkdownPages();
  const docs = await Promise.all(
    source
      .getPages(MACHINE_READABLE_LOCALE)
      .filter((page) => page.type !== 'openapi' && resolveDocVersion(page.url))
      .map(async (page) => ({
        url: page.url,
        markdown: await getLLMText(page),
      })),
  );
  const pages = [...docs, ...openApiPages];
  return DOC_VERSION_SCOPES.flatMap((scope) =>
    scope.versions.map((version) => ({
      path: getDocVersionIndexPath(scope, version).replace(
        /\.txt$/,
        '-full.txt',
      ),
      content: [
        `# ${scope.label} — ${version.label}`,
        `> Only ${version.label} documentation is included in this export.`,
        ...pages
          .filter((page) => {
            const context = resolveDocVersion(page.url);
            return (
              context?.scope.id === scope.id &&
              context.version.id === version.id
            );
          })
          .sort((a, b) => a.url.localeCompare(b.url))
          .map((page) => page.markdown),
      ].join('\n\n'),
    })),
  );
}
