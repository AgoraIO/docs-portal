const DOC_FILE_GLOB = '**/*.{mdx,md}';
const META_FILE_GLOB = 'meta.{json,yaml}';

export type ScopedDocsFiles = {
  docs: string[];
  meta: string[];
};

export function createScopedDocsFiles(scope: string): ScopedDocsFiles | null {
  const segments = normalizeScope(scope);

  if (segments.length === 0) {
    return null;
  }

  const scopePath = segments.join('/');
  const meta = [META_FILE_GLOB];

  for (let index = 0; index < segments.length - 1; index += 1) {
    meta.push(`${segments.slice(0, index + 1).join('/')}/${META_FILE_GLOB}`);
  }

  meta.push(`${scopePath}/**/${META_FILE_GLOB}`);

  return {
    docs: [`${scopePath}/${DOC_FILE_GLOB}`],
    meta,
  };
}

function normalizeScope(scope: string) {
  return scope
    .split('/')
    .map((segment) => segment.trim())
    .filter(Boolean)
    .filter((segment) => segment !== '.' && segment !== '..');
}
