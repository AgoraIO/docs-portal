import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';
import { isKnownPlatform, normalizePlatformKey } from './platforms/registry';

const DOCS_ROOT = 'content/docs';
const DOC_FILE_EXTENSION = /\.(md|mdx)$/;
const INDEX_FILE_NAME = /^index\.(md|mdx)$/;
const ROUTE_GROUP_SEGMENT = /^\(.+\)$/;

export function getContentDocsPrerenderPaths(root = DOCS_ROOT) {
  if (!existsSync(root)) {
    return [];
  }

  const platformPanelFiles = getImplicitPlatformPanelFiles(root);

  return walkDocFiles(root)
    .filter((filePath) => !platformPanelFiles.has(filePath))
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

function getImplicitPlatformPanelFiles(root: string) {
  const panelFiles = new Set<string>();

  for (const filePath of walkDocFiles(root)) {
    const fileName = filePath.split(sep).at(-1);

    if (!fileName || !INDEX_FILE_NAME.test(fileName)) {
      continue;
    }

    const frontmatter = readFrontmatter(readFileSync(filePath, 'utf8'));

    if (!frontmatter || frontmatter.layout !== 'platform-group') {
      continue;
    }

    for (const platform of frontmatter.platforms) {
      for (const extension of ['mdx', 'md']) {
        const panelPath = join(dirname(filePath), `${platform}.${extension}`);

        if (existsSync(panelPath)) {
          panelFiles.add(panelPath);
        }
      }
    }
  }

  return panelFiles;
}

function readFrontmatter(value: string) {
  const match = value.match(/^---\r?\n([\s\S]*?)\r?\n---/);

  if (!match) {
    return null;
  }

  const data = match[1] ?? '';
  const layout = data.match(/^layout:\s*['"]?([^'"\n]+)['"]?\s*$/m)?.[1];
  const platforms = readStringArrayFrontmatterValue(data, 'platforms')
    .map(normalizePlatformKey)
    .filter((platform) => isKnownPlatform(platform));

  return {
    layout,
    platforms,
  };
}

function readStringArrayFrontmatterValue(data: string, key: string) {
  const inline = data.match(
    new RegExp(`^${key}:\\s*\\[([^\\]]*)\\]\\s*$`, 'm'),
  );

  if (inline) {
    return inline[1]
      .split(',')
      .map((item) => item.trim().replace(/^['"]|['"]$/g, ''))
      .filter(Boolean);
  }

  const block = data.match(
    new RegExp(`^${key}:\\s*\\r?\\n((?:\\s+-\\s+[^\\n]+\\r?\\n?)+)`, 'm'),
  );

  if (!block) {
    return [];
  }

  return block[1]
    .split(/\r?\n/)
    .map((line) => line.match(/^\s+-\s+(.+?)\s*$/)?.[1] ?? '')
    .map((item) => item.trim().replace(/^['"]|['"]$/g, ''))
    .filter(Boolean);
}
