const DOCS_SOURCE_BASE_URL =
  'https://github.com/AgoraIO/docs-portal/blob/main/content/docs/';
const DOCS_EDIT_BASE_URL =
  'https://github.com/AgoraIO/docs-portal/edit/main/content/docs/';

export type DocsSourceLinks = {
  editUrl: string;
  viewUrl: string;
};

export function getDocsSourceLinks(contentPath?: string) {
  if (!contentPath) {
    return null;
  }

  const normalizedPath = contentPath
    .split('/')
    .filter((segment) => segment && segment !== '.' && segment !== '..')
    .join('/');

  if (!normalizedPath) {
    return null;
  }

  return {
    editUrl: `${DOCS_EDIT_BASE_URL}${normalizedPath}`,
    viewUrl: `${DOCS_SOURCE_BASE_URL}${normalizedPath}`,
  } satisfies DocsSourceLinks;
}
