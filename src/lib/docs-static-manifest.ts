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

  return (await response.json()) as T;
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
