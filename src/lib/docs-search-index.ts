import type { SearchEntry } from './docs-search';
import { normalizeLocale } from './i18n/i18n-config';

const STATIC_DOCS_SEARCH_BASE = '/__static/docs-search';
const STATIC_DOCS_SEARCH_PUBLIC_DIR = '__static/docs-search';

export class DocsSearchIndexUnavailableError extends Error {
  constructor(locale: string, cause?: unknown) {
    super(`Docs search index is unavailable for locale: ${locale}`);
    this.name = 'DocsSearchIndexUnavailableError';
    this.cause = cause;
  }
}

export function getStaticDocsSearchIndexPath(locale: string) {
  const normalizedLocale = normalizeLocale(locale);

  return normalizedLocale
    ? `${STATIC_DOCS_SEARCH_BASE}/${normalizedLocale}.json`
    : '';
}

export async function readStaticDocsSearchIndex(locale: string) {
  const staticIndexPath = getStaticDocsSearchIndexPath(locale);
  const normalizedLocale = normalizeLocale(locale);

  if (!staticIndexPath || !normalizedLocale) {
    return [];
  }

  if (import.meta.env.SSR) {
    return readStaticDocsSearchIndexFromDisk(locale);
  }

  const response = await fetch(staticIndexPath);

  if (response.status === 404) {
    throw new DocsSearchIndexUnavailableError(normalizedLocale);
  }

  if (!response.ok) {
    throw new Error(
      `Failed to load static docs search index: ${response.status} ${response.statusText}`,
    );
  }

  return (await response.json()) as SearchEntry[];
}

async function readStaticDocsSearchIndexFromDisk(locale: string) {
  const { readFile } = await import('node:fs/promises');
  const { join } = await import('node:path');
  const normalizedLocale = normalizeLocale(locale);

  if (!normalizedLocale) {
    return [];
  }

  const staticRoot = process.env.TSS_CLIENT_OUTPUT_DIR ?? 'public';
  const filePath = join(
    staticRoot,
    STATIC_DOCS_SEARCH_PUBLIC_DIR,
    `${normalizedLocale}.json`,
  );

  try {
    return JSON.parse(await readFile(filePath, 'utf8')) as SearchEntry[];
  } catch (error) {
    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      error.code === 'ENOENT'
    ) {
      throw new DocsSearchIndexUnavailableError(normalizedLocale, error);
    }

    throw error;
  }
}
