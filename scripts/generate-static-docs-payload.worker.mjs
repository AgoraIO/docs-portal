import { promises as fs } from 'node:fs';
import path from 'node:path';
import { llms } from 'fumadocs-core/source';
import {
  loadDocsPagePayload,
  loadDocsSearchIndex,
} from '../src/lib/docs-page.server.ts';
import { parseSidebarGroupMetadata } from '../src/lib/docs-tree.ts';
import { SUPPORTED_LOCALES } from '../src/lib/i18n/i18n-config.ts';
import { MACHINE_READABLE_LOCALE } from '../src/lib/machine-readable-docs.ts';
import { getOpenApiPrerenderPaths } from '../src/lib/openapi/lanes.ts';
import {
  getOpenApiMarkdownByContentPath,
  getOpenApiMarkdownPages,
} from '../src/lib/openapi/markdown.ts';
import {
  isKnownPlatform,
  normalizePlatformKey,
} from '../src/lib/platforms/registry.ts';
import { getContentDocsPrerenderPaths } from '../src/lib/prerender-content-routes.ts';
import { getAlgoliaDocsRecords } from '../src/lib/search/algolia-records.server.ts';
import { deriveRestAlias } from '../src/lib/search/external-refs.ts';
import { applyNavModel } from '../src/lib/search/nav-model.ts';
import { createSitemapXml, getSitemapUrls } from '../src/lib/sitemap.ts';
import {
  getLLMText,
  getPageMarkdownUrl,
  getPagePlatformKeys,
  getPlatformLLMText,
  canonicalSource as source,
} from '../src/lib/source.server.ts';
import { createStaticSeoManifest } from '../src/lib/static-seo.ts';

const repoRoot = process.cwd();
const outputRoot = path.join(repoRoot, 'public', '__static', 'docs');
const searchOutputRoot = path.join(
  repoRoot,
  'public',
  '__static',
  'docs-search',
);
const seoManifestPath = path.join(
  repoRoot,
  'public',
  '__static',
  'docs-seo.json',
);
const markdownOutputRoot = path.join(repoRoot, 'public');

export async function generateStaticDocsPayload() {
  await fs.rm(outputRoot, {
    force: true,
    recursive: true,
  });
  await fs.rm(searchOutputRoot, {
    force: true,
    recursive: true,
  });
  await removeGeneratedMachineReadableDocs();

  const allRoutes = Array.from(
    new Set([...getContentDocsPrerenderPaths(), ...getOpenApiPrerenderPaths()]),
  )
    .filter((route) => route !== '/')
    .sort();
  let generated = 0;
  const staticSeoPages = [];
  const breadcrumbsByUrl = new Map();
  const platformsByUrl = new Map();
  const externalByHref = new Map(); // href -> ExternalNavEntry (sidebar repeats per page; dedupe)

  for (const locale of SUPPORTED_LOCALES) {
    await writeSearchIndex(searchOutputRoot, {
      locale,
      pages: await loadDocsSearchIndex(locale),
    });

    const tabs = new Set();

    for (const route of allRoutes) {
      const parsed = parseRoute(route);
      if (parsed?.locale === locale) {
        tabs.add(parsed.tab);
      }
    }

    for (const tab of tabs) {
      const payload = await loadDocsPagePayload(locale, tab, []);
      if (payload) {
        await writePayload(outputRoot, {
          locale,
          payload,
          slugSegments: [],
          tab,
        });
        generated += 1;
      }
    }
  }

  for (const route of allRoutes) {
    const parsed = parseRoute(route);
    if (!parsed) {
      continue;
    }

    const payload = await loadDocsPagePayload(
      parsed.locale,
      parsed.tab,
      parsed.slugSegments,
    );

    if (!payload) {
      continue;
    }

    await writePayload(outputRoot, {
      locale: parsed.locale,
      payload,
      slugSegments: parsed.slugSegments,
      tab: parsed.tab,
    });
    if (!('redirectUrl' in payload)) {
      staticSeoPages.push({
        description: payload.description,
        title: payload.title,
        url: route,
      });
      // Breadcrumbs come from the per-page payload, which resolves the active
      // nav scope (dropdown/platform-group pages included) — the raw page tree
      // alone misses those. Drop the last crumb (the page itself) and keep the
      // ancestor titles. The api-reference tab's scoped breadcrumb omits its
      // tab-root crumb, so prepend the humanized tab label to match the other
      // tabs (which already carry a meaningful root) and the OpenAPI records.
      if (Array.isArray(payload.breadcrumb) && payload.breadcrumb.length > 0) {
        const ancestors = payload.breadcrumb
          .slice(0, -1)
          .map((item) => item.title);
        const tabLabel = humanizeTabLabel(parsed.tab);
        const breadcrumbs =
          parsed.tab === 'api-reference' && ancestors[0] !== tabLabel
            ? [tabLabel, ...ancestors]
            : ancestors;

        // Skip pages whose breadcrumb is only their own title (no ancestors);
        // overriding with `[]` would strip the base record's raw-slug fallback.
        if (breadcrumbs.length > 0) {
          breadcrumbsByUrl.set(route, breadcrumbs);
        }
      }
    }
    generated += 1;
  }

  // External api-ref links are synthetic search records, not real pages, so they
  // never appear in the payload loop. Harvest them (with nav ancestry + REST
  // alias) from the resolved page tree, which — unlike the per-page sidebar —
  // preserves the `external` flag and the group separators (see design §B).
  for (const locale of SUPPORTED_LOCALES) {
    harvestExternalEntriesFromPageTree(
      source.getPageTree(locale),
      externalByHref,
    );
  }

  for (const locale of SUPPORTED_LOCALES) {
    for (const page of source.getPages(locale)) {
      const declared = (Array.isArray(page.data?.platforms)
        ? page.data.platforms
        : []
      )
        .map(normalizePlatformKey)
        .filter(isKnownPlatform);
      const resolved = await getStaticPagePlatformKeys(page);
      const platforms = [...new Set([...declared, ...resolved])];
      if (platforms.length > 0) {
        platformsByUrl.set(page.url, platforms);
      }
    }
  }

  const baseRecords = await getAlgoliaDocsRecords();
  const algoliaRecords = applyNavModel(baseRecords, {
    breadcrumbsByUrl,
    platformsByUrl,
    externalEntries: [...externalByHref.values()],
    locale: 'en',
  });
  await fs.mkdir(searchOutputRoot, { recursive: true });
  await fs.writeFile(
    path.join(searchOutputRoot, 'algolia-records.json'),
    `${JSON.stringify(algoliaRecords)}\n`,
  );
  console.log(`Wrote ${algoliaRecords.length} Algolia records.`);

  await writeTextFile(
    seoManifestPath,
    `${JSON.stringify(createStaticSeoManifest({ pages: staticSeoPages }))}\n`,
  );
  console.log(`[static-payload] generated ${generated} payload files`);

  const markdownGenerated = await generateStaticMachineReadableDocs();
  console.log(
    `[static-payload] generated ${markdownGenerated} machine-readable files`,
  );
}

function parseRoute(route) {
  const [locale, tab, ...slugSegments] = route.split('/').filter(Boolean);

  if (!locale || !tab) {
    return null;
  }

  return {
    locale,
    slugSegments,
    tab,
  };
}

// Reduce a fumadocs page-tree node `name` (a string or a React element for
// OpenAPI method labels) to a plain title string.
function nodeTitle(name) {
  if (typeof name === 'string') {
    return name;
  }

  if (name && typeof name === 'object' && 'props' in name) {
    const children = name.props?.children;
    const parts = Array.isArray(children) ? children : [children];

    return parts
      .filter((part) => typeof part === 'string')
      .join('')
      .trim();
  }

  return '';
}

// Humanize a tab slug for the root breadcrumb crumb (e.g. `api-reference` ->
// `API Reference`), matching the label OpenAPI records already use.
function humanizeTabLabel(tab) {
  return tab
    .split('-')
    .map((word) =>
      word.toLowerCase() === 'api'
        ? 'API'
        : word.charAt(0).toUpperCase() + word.slice(1),
    )
    .join(' ');
}

function isExternalNode(node) {
  return Boolean(node.external) || /^https?:\/\//.test(node.url ?? '');
}

// Walk the resolved page tree collecting external api-ref links into
// `externalByHref` (deduped). Ancestry = humanized tab label + ancestor folder
// titles + the group's preceding separator title. The REST-API alias for an
// external group is derived from its sibling internal `/api-ref/` link (same
// separator group) via `deriveRestAlias`.
function harvestExternalEntriesFromPageTree(tree, externalByHref) {
  for (const tabFolder of tree.children ?? []) {
    if (tabFolder.type !== 'folder') {
      continue;
    }

    const tab = (tabFolder.$id ?? '').split(':').pop()?.split('/').pop() ?? '';
    collectExternalsAtLevel(
      tabFolder.children ?? [],
      [humanizeTabLabel(tab)],
      externalByHref,
    );
  }
}

function groupAliasFor(nodes) {
  const rest = nodes.find(
    (child) =>
      !isExternalNode(child) && (child.url ?? '').includes('/api-ref/'),
  );

  return rest?.url ? deriveRestAlias(rest.url) : undefined;
}

function collectExternalsAtLevel(children, ancestry, externalByHref) {
  // Segment this level's children by their preceding separator so each group's
  // title and its REST-API alias can be resolved from all of its members.
  const groups = [];
  let bucket = { title: '', nodes: [] };
  for (const child of children) {
    if (child.type === 'separator') {
      groups.push(bucket);
      bucket = {
        title: parseSidebarGroupMetadata(child.name).title,
        nodes: [],
      };
      continue;
    }
    bucket.nodes.push(child);
  }
  groups.push(bucket);

  for (const group of groups) {
    const groupAlias = groupAliasFor(group.nodes);
    const groupAncestry = group.title ? [...ancestry, group.title] : ancestry;

    for (const node of group.nodes) {
      if (isExternalNode(node)) {
        const href = node.url;
        const title = nodeTitle(node.name);
        if (href && title && !externalByHref.has(href)) {
          externalByHref.set(href, {
            title,
            href,
            ancestry: groupAncestry,
            restAlias: groupAlias,
          });
        }
        continue;
      }

      if (node.type === 'folder') {
        const folderTitle = nodeTitle(node.name);
        const folderAncestry = folderTitle
          ? [...groupAncestry, folderTitle]
          : groupAncestry;
        collectExternalsAtLevel(
          node.children ?? [],
          folderAncestry,
          externalByHref,
        );
      }
    }
  }
}

async function writePayload(root, { locale, payload, slugSegments, tab }) {
  const targetFile = path.join(
    root,
    locale,
    tab,
    slugSegments.length > 0 ? `${slugSegments.join('/')}.json` : 'index.json',
  );

  await fs.mkdir(path.dirname(targetFile), {
    recursive: true,
  });
  await fs.writeFile(targetFile, `${JSON.stringify(payload)}\n`);
}

async function writeSearchIndex(root, { locale, pages }) {
  const targetFile = path.join(root, `${locale}.json`);

  await fs.mkdir(path.dirname(targetFile), {
    recursive: true,
  });
  await fs.writeFile(targetFile, `${JSON.stringify(pages)}\n`);
}

async function removeGeneratedMachineReadableDocs() {
  await fs.rm(path.join(markdownOutputRoot, 'llms.txt'), { force: true });
  await fs.rm(path.join(markdownOutputRoot, 'llms-full.txt'), { force: true });
  await fs.rm(path.join(markdownOutputRoot, 'sitemap.xml'), { force: true });
  await fs.rm(path.join(markdownOutputRoot, MACHINE_READABLE_LOCALE), {
    force: true,
    recursive: true,
  });
}

async function generateStaticMachineReadableDocs() {
  const pages = source.getPages(MACHINE_READABLE_LOCALE);
  const openApiPages = await getOpenApiMarkdownPages();
  const openApiIndex = openApiPages
    .map((page) => `- [${page.title}](${page.url})`)
    .join('\n');
  let generated = 0;

  await writeTextFile(
    path.join(markdownOutputRoot, 'llms.txt'),
    `${llms(source).index(MACHINE_READABLE_LOCALE)}\n\n${openApiIndex}\n`,
  );
  generated += 1;

  const fullText = await Promise.all(pages.map(getStaticLLMText));
  await writeTextFile(
    path.join(markdownOutputRoot, 'llms-full.txt'),
    [...fullText, ...openApiPages.map((page) => page.markdown)].join('\n\n'),
  );
  generated += 1;

  await writeTextFile(
    path.join(markdownOutputRoot, 'sitemap.xml'),
    createSitemapXml(
      getSitemapUrls({
        openApiPages,
        pages,
      }),
    ),
  );
  generated += 1;

  for (const page of pages) {
    const markdown = await getStaticLLMText(page);
    const regularMarkdownUrl = `${page.url}.md`;

    await writePublicRouteFile(regularMarkdownUrl, markdown);
    generated += 1;

    generated += await writePlatformMarkdownFiles(page);
  }

  for (const page of openApiPages) {
    const contentPath = `${page.url.slice(1)}.md`;
    const markdown = await getOpenApiMarkdownByContentPath(contentPath);

    if (!markdown) {
      continue;
    }

    await writePublicRouteFile(`${page.url}.md`, markdown);
    generated += 1;
  }

  return generated;
}

async function writePlatformMarkdownFiles(page) {
  const platforms = await getStaticPagePlatformKeys(page);

  let generated = 0;

  for (const platform of platforms) {
    const normalizedPlatform = normalizePlatformKey(platform);

    if (!isKnownPlatform(normalizedPlatform)) {
      continue;
    }

    const markdown = await getStaticPlatformLLMText(page, normalizedPlatform);

    if (!markdown) {
      continue;
    }

    await writePublicRouteFile(
      getPageMarkdownUrl(page, normalizedPlatform).url,
      markdown,
    );
    generated += 1;
  }

  return generated;
}

async function getStaticLLMText(page) {
  try {
    return await getLLMText(page);
  } catch {
    return `# ${page.data.title ?? page.url} (${page.url})

${await readSourceMarkdown(page.path)}`;
  }
}

async function getStaticPagePlatformKeys(page) {
  try {
    return await getPagePlatformKeys(page);
  } catch {
    return getRawPagePlatformKeys(page);
  }
}

async function getStaticPlatformLLMText(page, platform) {
  try {
    return await getPlatformLLMText(page, platform);
  } catch {
    return buildRawPlatformLLMText(page, platform);
  }
}

async function buildRawPlatformLLMText(page, platform) {
  const raw = await readSourceMarkdown(page.path);
  const panelText = await readPlatformPanelMarkdown(page, platform);
  const body = panelText ?? selectRawStructuredPlatform(raw, platform);

  if (!body?.trim()) {
    return null;
  }

  return `# ${page.data.title ?? page.url} (${page.url}/${platform})

${body}`;
}

function getRawPagePlatformKeys(page) {
  const rawPlatforms = page.data.platforms;

  if (Array.isArray(rawPlatforms)) {
    return rawPlatforms.map(normalizePlatformKey).filter(isKnownPlatform);
  }

  return [];
}

async function readPlatformPanelMarkdown(page, platform) {
  if (!/\/index\.mdx?$/.test(page.path)) {
    return null;
  }

  for (const extension of ['mdx', 'md']) {
    const panelPath = page.path.replace(
      /index\.mdx?$/,
      `${platform}.${extension}`,
    );
    const text = await readSourceMarkdownIfExists(panelPath);

    if (text !== null) {
      return text;
    }
  }

  return null;
}

function selectRawStructuredPlatform(markdown, platform) {
  const blockPattern =
    /<PlatformStructured\s+platform=["']([^"']+)["'][^>]*>([\s\S]*?)<\/PlatformStructured>/g;
  const blocks = [...markdown.matchAll(blockPattern)];

  if (blocks.length === 0) {
    return null;
  }

  const shared = markdown.replace(blockPattern, '').trim();
  const selected = blocks
    .filter((match) => normalizePlatformKey(match[1] ?? '') === platform)
    .map((match) => match[2]?.trim() ?? '')
    .filter(Boolean);

  return [shared, ...selected].filter(Boolean).join('\n\n');
}

async function readSourceMarkdown(contentPath) {
  const text = await readSourceMarkdownIfExists(contentPath);

  if (text === null) {
    return '';
  }

  return text;
}

async function readSourceMarkdownIfExists(contentPath) {
  try {
    const text = await fs.readFile(
      path.join(repoRoot, 'content', 'docs', contentPath),
      'utf8',
    );

    return stripFrontmatter(text).trim();
  } catch (error) {
    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      error.code === 'ENOENT'
    ) {
      return null;
    }

    throw error;
  }
}

function stripFrontmatter(markdown) {
  return markdown.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '');
}

async function writePublicRouteFile(route, content) {
  const relativePath = route.split('/').filter(Boolean).join('/');
  await writeTextFile(path.join(markdownOutputRoot, relativePath), content);
}

async function writeTextFile(filePath, content) {
  await fs.mkdir(path.dirname(filePath), {
    recursive: true,
  });
  await fs.writeFile(
    filePath,
    content.endsWith('\n') ? content : `${content}\n`,
  );
}
