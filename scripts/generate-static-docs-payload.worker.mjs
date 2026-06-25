import { promises as fs } from 'node:fs';
import path from 'node:path';
import {
  loadDocsPagePayload,
  loadDocsSearchIndex,
} from '../src/lib/docs-page.server.ts';
import { SUPPORTED_LOCALES } from '../src/lib/i18n/i18n-config.ts';
import { getOpenApiPrerenderPaths } from '../src/lib/openapi/lanes.ts';
import { getContentDocsPrerenderPaths } from '../src/lib/prerender-content-routes.ts';

const repoRoot = process.cwd();
const outputRoot = path.join(repoRoot, 'public', '__static', 'docs');
const searchOutputRoot = path.join(
  repoRoot,
  'public',
  '__static',
  'docs-search',
);

export async function generateStaticDocsPayload() {
  await fs.rm(outputRoot, {
    force: true,
    recursive: true,
  });
  await fs.rm(searchOutputRoot, {
    force: true,
    recursive: true,
  });

  const allRoutes = Array.from(
    new Set([...getContentDocsPrerenderPaths(), ...getOpenApiPrerenderPaths()]),
  )
    .filter((route) => route !== '/')
    .sort();
  let generated = 0;

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
    generated += 1;
  }

  console.log(`[static-payload] generated ${generated} payload files`);
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
