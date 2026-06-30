import type { DocsRedirectPayload } from './docs-page.server';
import { isKnownPlatform } from './platforms/registry';

const STATIC_DOCS_BASE = '/__static/docs';
const STATIC_DOCS_PUBLIC_DIR = '__static/docs';

export function getStaticDocsPayloadPath({
  locale,
  slugSegments,
  tab,
}: {
  locale: string;
  slugSegments: string[];
  tab: string;
}) {
  const normalizedSegments = slugSegments.filter(Boolean);
  const fileName =
    normalizedSegments.length > 0
      ? `${normalizedSegments.join('/')}.json`
      : 'index.json';

  return `${STATIC_DOCS_BASE}/${locale}/${tab}/${fileName}`;
}

export function shouldUseStaticDocsPayload() {
  return import.meta.env.VITE_TSS_SPA_STATIC_EXPERIMENT === 'true';
}

export async function readStaticDocsPayload<T>({
  locale,
  slugSegments,
  tab,
}: {
  locale: string;
  slugSegments: string[];
  tab: string;
}) {
  if (import.meta.env.SSR) {
    return readStaticDocsPayloadFromDisk<T>({
      locale,
      slugSegments,
      tab,
    });
  }

  const response = await fetch(
    getStaticDocsPayloadPath({
      locale,
      slugSegments,
      tab,
    }),
  );

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(
      `Failed to load static docs payload: ${response.status} ${response.statusText}`,
    );
  }

  if (isStaticFallbackHtml(response)) {
    return null;
  }

  return (await response.json()) as T;
}

function isStaticFallbackHtml(response: Response) {
  const contentType = response.headers?.get('content-type')?.toLowerCase();

  return contentType?.includes('text/html') ?? false;
}

type PlatformStaticPayload = {
  activePath?: string;
  body: {
    kind: string;
    platformTabs?: {
      canonicalPlatform: string;
      defaultPlatform?: string;
      initialPlatform?: string;
      platforms: string;
    };
  };
  markdownUrl: string;
  toc?: unknown[];
};

export async function resolvePlatformStaticDocsPayload<
  T extends PlatformStaticPayload | DocsRedirectPayload,
>({
  locale,
  slugSegments,
  tab,
}: {
  locale: string;
  slugSegments: string[];
  tab: string;
}) {
  const payload = await readStaticDocsPayload<T>({
    locale,
    slugSegments,
    tab,
  });

  if (payload) {
    return payload;
  }

  const platform = slugSegments.at(-1);

  if (!platform || !isKnownPlatform(platform)) {
    return null;
  }

  const canonicalPayload = await readStaticDocsPayload<T>({
    locale,
    slugSegments: slugSegments.slice(0, -1),
    tab,
  });

  if (
    !canonicalPayload ||
    'redirectUrl' in canonicalPayload ||
    !canonicalPayload.body.platformTabs ||
    !platformsInclude(canonicalPayload.body.platformTabs.platforms, platform)
  ) {
    return null;
  }

  if (canonicalPayload.body.kind === 'platform-group') {
    return canonicalPayload.activePath
      ? {
          redirectUrl: canonicalPayload.activePath,
        }
      : null;
  }

  if (canonicalPayload.body.kind !== 'mdx') {
    return null;
  }

  return clearStalePlatformFallbackToc(
    {
      ...canonicalPayload,
      body: {
        ...canonicalPayload.body,
        platformTabs: {
          ...canonicalPayload.body.platformTabs,
          initialPlatform: platform,
        },
      },
      markdownUrl: getPlatformMarkdownUrl(
        canonicalPayload.markdownUrl,
        platform,
      ),
    },
    platform,
  );
}

function clearStalePlatformFallbackToc<T extends PlatformStaticPayload>(
  payload: T,
  platform: string,
) {
  const tocPlatform =
    payload.body.platformTabs?.defaultPlatform ??
    payload.body.platformTabs?.canonicalPlatform;

  if (!('toc' in payload) || tocPlatform === platform) {
    return payload;
  }

  return {
    ...payload,
    toc: [],
  };
}

function platformsInclude(platformsJson: string, platform: string) {
  try {
    const platforms = JSON.parse(platformsJson) as unknown;
    return Array.isArray(platforms) && platforms.includes(platform);
  } catch {
    return false;
  }
}

function getPlatformMarkdownUrl(markdownUrl: string, platform: string) {
  return markdownUrl.replace(/\/([^/]+)\.md$/, (_match, leaf: string) => {
    if (leaf === 'index') {
      return `/${platform}.md`;
    }

    if (isKnownPlatform(leaf)) {
      return `/${platform}.md`;
    }

    return `/${leaf}/${platform}.md`;
  });
}

async function readStaticDocsPayloadFromDisk<T>({
  locale,
  slugSegments,
  tab,
}: {
  locale: string;
  slugSegments: string[];
  tab: string;
}) {
  const { readFile } = await import('node:fs/promises');
  const { join } = await import('node:path');

  const normalizedSegments = slugSegments.filter(Boolean);
  const fileName =
    normalizedSegments.length > 0
      ? `${normalizedSegments.join('/')}.json`
      : 'index.json';
  const staticRoot = process.env.TSS_CLIENT_OUTPUT_DIR ?? 'public';
  const filePath = join(
    staticRoot,
    STATIC_DOCS_PUBLIC_DIR,
    locale,
    tab,
    fileName,
  );

  try {
    return JSON.parse(await readFile(filePath, 'utf8')) as T;
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
