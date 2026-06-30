import { promises as fs } from 'node:fs';
import path from 'node:path';
import { llms } from 'fumadocs-core/source';
import {
  loadDocsPagePayload,
  loadDocsSearchIndex,
} from '../src/lib/docs-page.server.ts';
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
import { createSitemapXml, getSitemapUrls } from '../src/lib/sitemap.ts';
import {
  getLLMText,
  getPageMarkdownUrl,
  getPagePlatformKeys,
  getPlatformLLMText,
  canonicalSource as source,
} from '../src/lib/source.server.ts';
import {
  createRobotsTxt,
  createStaticSeoManifest,
} from '../src/lib/static-seo.ts';

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
    }
    generated += 1;
  }

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
  await fs.rm(path.join(markdownOutputRoot, 'robots.txt'), { force: true });
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

  await writeTextFile(
    path.join(markdownOutputRoot, 'robots.txt'),
    createRobotsTxt(),
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
