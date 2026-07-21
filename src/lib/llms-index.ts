import type { PublishedDocsRoute } from './published-docs-routes';

const DEFAULT_MAX_CHARACTERS = 50_000;
const INDEX_DIRECTORY = '/llms';
const LINK_PATTERN = /\[([^\]]+)]\(([^)\s]+)\)/g;
const DISPLAY_NAME_OVERRIDES: Readonly<Record<string, string>> = {
  ai: 'AI',
  api: 'API',
  im: 'IM',
  rest: 'REST',
  rtc: 'RTC',
  rtm: 'RTM',
  sdk: 'SDK',
  uikit: 'UI Kit',
};

export type MachineReadableDocsIndexFile = {
  content: string;
  path: string;
};

type IndexEntry = {
  label: string;
  markdownUrl: string;
};

type IndexGroup = {
  label: string;
  slug: string;
};

export function createMachineReadableDocsIndexes({
  baseUrl,
  docsIndex,
  locale,
  maxCharacters = DEFAULT_MAX_CHARACTERS,
  publishedRoutes,
}: {
  baseUrl: string;
  docsIndex: string;
  locale: string;
  maxCharacters?: number;
  publishedRoutes: ReadonlyArray<PublishedDocsRoute>;
}): MachineReadableDocsIndexFile[] {
  const normalizedBaseUrl = baseUrl.replace(/\/+$/, '');
  const labelsByPath = extractLabelsByPath(docsIndex, locale);
  const entriesByGroup = new Map<string, IndexEntry[]>();
  const groupsBySlug = new Map<string, IndexGroup>();
  const seenMarkdownPaths = new Set<string>();

  for (const route of publishedRoutes) {
    if (
      !route.url.startsWith(`/${locale}/`) ||
      seenMarkdownPaths.has(route.markdownPath)
    ) {
      continue;
    }

    seenMarkdownPaths.add(route.markdownPath);
    const group = getIndexGroup(route.url, locale);
    const entries = entriesByGroup.get(group.slug) ?? [];

    groupsBySlug.set(group.slug, group);
    entries.push({
      label: getRouteLabel(route, labelsByPath),
      markdownUrl: `${normalizedBaseUrl}${route.markdownPath}`,
    });
    entriesByGroup.set(group.slug, entries);
  }

  const externalEntries = extractExternalEntries(docsIndex, normalizedBaseUrl);

  if (externalEntries.length > 0) {
    const externalGroup = {
      label: 'External API Reference',
      slug: 'external-api-reference',
    };

    groupsBySlug.set(externalGroup.slug, externalGroup);
    entriesByGroup.set(externalGroup.slug, externalEntries);
  }

  const sectionFiles = Array.from(entriesByGroup.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .flatMap(([slug, entries]) => {
      const group = groupsBySlug.get(slug);

      if (!group) {
        return [];
      }

      return createSectionFiles({
        entries: entries.sort((left, right) =>
          left.markdownUrl.localeCompare(right.markdownUrl),
        ),
        group,
        maxCharacters,
      });
    });
  const rootContent = renderRootIndex(sectionFiles, normalizedBaseUrl);

  assertWithinLimit('/llms.txt', rootContent, maxCharacters);

  return [{ content: rootContent, path: '/llms.txt' }, ...sectionFiles];
}

export async function validateMachineReadableDocsArtifacts({
  artifactExists,
  baseUrl,
  files,
  locale,
  publishedRoutes,
}: {
  artifactExists: (path: string) => boolean | Promise<boolean>;
  baseUrl: string;
  files: ReadonlyArray<MachineReadableDocsIndexFile>;
  locale: string;
  publishedRoutes: ReadonlyArray<PublishedDocsRoute>;
}) {
  const normalizedBaseUrl = baseUrl.replace(/\/+$/, '');
  const root = files.find((file) => file.path === '/llms.txt');
  const sections = files.filter((file) => file.path !== '/llms.txt');

  if (!root) {
    throw new Error('Missing machine-readable docs root index /llms.txt.');
  }

  assertSameTargets(
    'root index references',
    extractLinkTargets(root.content),
    sections.map((file) => `${normalizedBaseUrl}${file.path}`),
  );
  assertSameTargets(
    'published Markdown references',
    sections
      .flatMap((file) => extractLinkTargets(file.content))
      .filter((target) => isSameOrigin(target, normalizedBaseUrl)),
    publishedRoutes
      .filter((route) => route.url.startsWith(`/${locale}/`))
      .map((route) => `${normalizedBaseUrl}${route.markdownPath}`),
  );

  const artifactPaths = new Set([
    ...files.map((file) => file.path),
    ...publishedRoutes
      .filter((route) => route.url.startsWith(`/${locale}/`))
      .map((route) => route.markdownPath),
  ]);

  for (const path of artifactPaths) {
    if (!(await artifactExists(path))) {
      throw new Error(`Missing machine-readable docs artifact at ${path}.`);
    }
  }
}

function createSectionFiles({
  entries,
  group,
  maxCharacters,
}: {
  entries: IndexEntry[];
  group: IndexGroup;
  maxCharacters: number;
}) {
  const chunks: IndexEntry[][] = [];
  let current: IndexEntry[] = [];

  for (const entry of entries) {
    const candidate = [...current, entry];

    if (
      current.length > 0 &&
      renderSectionIndex(group.label, candidate).length > maxCharacters
    ) {
      chunks.push(current);
      current = [entry];
      continue;
    }

    current = candidate;
  }

  if (current.length > 0) {
    chunks.push(current);
  }

  return chunks.map((chunk, index) => {
    const suffix = chunks.length > 1 ? `-${index + 1}` : '';
    const label =
      chunks.length > 1 ? `${group.label} ${index + 1}` : group.label;
    const path = `${INDEX_DIRECTORY}/${group.slug}${suffix}.txt`;
    const content = renderSectionIndex(label, chunk);

    assertWithinLimit(path, content, maxCharacters);

    return { content, path };
  });
}

function renderRootIndex(
  sectionFiles: MachineReadableDocsIndexFile[],
  baseUrl: string,
) {
  return [
    '# Agora Documentation',
    '',
    '> Machine-readable indexes for the complete documentation published on this site.',
    '',
    '## Documentation indexes',
    '',
    ...sectionFiles.map((file) => {
      const title = getSectionTitle(file.content);
      return `- [${title}](${baseUrl}${file.path})`;
    }),
    '',
  ].join('\n');
}

function renderSectionIndex(label: string, entries: IndexEntry[]) {
  return [
    `# ${label}`,
    '',
    '> Machine-readable Agora documentation pages in this section.',
    '',
    '## Documentation',
    '',
    ...entries.map((entry) => `- [${entry.label}](${entry.markdownUrl})`),
    '',
  ].join('\n');
}

function extractLabelsByPath(docsIndex: string, locale: string) {
  const labels = new Map<string, string>();

  for (const match of docsIndex.matchAll(LINK_PATTERN)) {
    const label = match[1]?.trim();
    const target = match[2];

    if (label && target?.startsWith(`/${locale}/`)) {
      labels.set(target.replace(/\.md$/, ''), label);
    }
  }

  return labels;
}

function extractExternalEntries(docsIndex: string, baseUrl: string) {
  const entries = new Map<string, IndexEntry>();

  for (const match of docsIndex.matchAll(LINK_PATTERN)) {
    const label = match[1]?.trim();
    const target = match[2];

    if (
      !label ||
      !target ||
      !/^https?:\/\//.test(target) ||
      isSameOrigin(target, baseUrl)
    ) {
      continue;
    }

    entries.set(target, { label, markdownUrl: target });
  }

  return Array.from(entries.values()).sort((left, right) =>
    left.markdownUrl.localeCompare(right.markdownUrl),
  );
}

function extractLinkTargets(markdown: string) {
  return Array.from(
    markdown.matchAll(LINK_PATTERN),
    (match) => match[2],
  ).filter((target): target is string => Boolean(target));
}

function isSameOrigin(target: string, baseUrl: string) {
  try {
    return new URL(target).origin === new URL(baseUrl).origin;
  } catch {
    return false;
  }
}

function assertSameTargets(
  label: string,
  actual: string[],
  expected: string[],
) {
  const actualSorted = [...actual].sort();
  const expectedSorted = [...new Set(expected)].sort();

  if (
    actualSorted.length !== expectedSorted.length ||
    actualSorted.some((target, index) => target !== expectedSorted[index])
  ) {
    throw new Error(`Machine-readable docs ${label} do not match.`);
  }
}

function getRouteLabel(
  route: PublishedDocsRoute,
  labelsByPath: ReadonlyMap<string, string>,
) {
  const canonicalLabel = labelsByPath.get(route.canonicalPath);
  const fallback = titleCase(
    route.canonicalPath.split('/').filter(Boolean).at(-1) ?? 'Documentation',
  );
  const label = canonicalLabel ?? fallback;

  return route.platform ? `${label} (${titleCase(route.platform)})` : label;
}

function getIndexGroup(url: string, expectedLocale: string): IndexGroup {
  const [, locale, tab, area, product] = url.split('/');
  const segments =
    tab === 'realtime-media'
      ? [tab, area]
      : tab === 'api-reference' && area === 'api-ref'
        ? [tab, area, product]
        : [tab];
  const normalizedSegments = segments.filter(Boolean) as string[];

  if (locale !== expectedLocale || normalizedSegments.length === 0) {
    return { label: 'Documentation', slug: 'documentation' };
  }

  return {
    label: normalizedSegments.map(titleCase).join(' '),
    slug: normalizedSegments.join('-'),
  };
}

function titleCase(value: string) {
  return value
    .split('-')
    .filter(Boolean)
    .map(
      (part) =>
        DISPLAY_NAME_OVERRIDES[part] ??
        part.charAt(0).toUpperCase() + part.slice(1),
    )
    .join(' ');
}

function getSectionTitle(content: string) {
  return content.match(/^# (.+)$/m)?.[1] ?? 'Documentation';
}

function assertWithinLimit(
  path: string,
  content: string,
  maxCharacters: number,
) {
  if (content.length > maxCharacters) {
    throw new Error(
      `Machine-readable docs index ${path} is ${content.length} characters; maximum is ${maxCharacters}.`,
    );
  }
}
