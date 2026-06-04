import { existsSync, readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const DOCS_ROOT = 'content/docs';
const DOC_FILE_EXTENSION = /\.(md|mdx)$/;
const INDEX_FILE_NAME = /^index\.(md|mdx)$/;
const ROUTE_GROUP_SEGMENT = /^\(.+\)$/;

export function getContentDocsPrerenderPaths(root = DOCS_ROOT) {
  if (!existsSync(root)) {
    return [];
  }

  return walkDocFiles(root)
    .map((filePath) => getContentDocRoute(root, filePath))
    .filter((path): path is string => path !== null)
    .sort();
}

function walkDocFiles(root: string) {
  const files: string[] = [];
  const entries = readdirSync(root).sort();

  for (const entry of entries) {
    const entryPath = join(root, entry);
    const stats = statSync(entryPath);

    if (stats.isDirectory()) {
      files.push(...walkDocFiles(entryPath));
      continue;
    }

    if (stats.isFile() && DOC_FILE_EXTENSION.test(entry)) {
      files.push(entryPath);
    }
  }

  return files;
}

function getContentDocRoute(root: string, filePath: string) {
  const segments = relative(root, filePath).split(sep);
  const fileName = segments.at(-1);

  if (!fileName) {
    return null;
  }

  if (INDEX_FILE_NAME.test(fileName)) {
    segments.pop();
  } else {
    segments[segments.length - 1] = fileName.replace(DOC_FILE_EXTENSION, '');
  }

  return `/${segments.filter((segment) => segment && !ROUTE_GROUP_SEGMENT.test(segment)).join('/')}`;
}
