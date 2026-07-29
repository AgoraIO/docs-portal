import { type AppLocale, DEFAULT_LOCALE } from './i18n/i18n-config';
import {
  DOCS_REGION,
  type DocsRegion,
  getDefaultDocsLocale,
  getDocsHomePath,
} from './site-region';

export const MACHINE_READABLE_LOCALE = DEFAULT_LOCALE;

export function getMachineReadableLocale(region?: DocsRegion) {
  return getDefaultDocsLocale(region);
}

export function getMachineReadableEntryRoute(region: DocsRegion = DOCS_REGION) {
  if (region !== 'global') {
    return null;
  }

  const locale = getDefaultDocsLocale(region);

  return {
    markdownPath: `/${locale}.md`,
    sourcePath: getDocsHomePath(region),
  };
}

export async function createMachineReadableEntryArtifact<
  T extends { url: string },
>({
  pages,
  region = DOCS_REGION,
  renderMarkdown,
}: {
  pages: readonly T[];
  region?: DocsRegion;
  renderMarkdown: (page: T) => Promise<string>;
}) {
  const entryRoute = getMachineReadableEntryRoute(region);
  if (!entryRoute) {
    return null;
  }

  const entryPage = pages.find((page) => page.url === entryRoute.sourcePath);
  if (!entryPage) {
    throw new Error(
      `Missing machine-readable docs entry source at ${entryRoute.sourcePath}.`,
    );
  }

  return {
    content: await renderMarkdown(entryPage),
    path: entryRoute.markdownPath,
  };
}

export function isMachineReadableLocale(
  locale: string | null | undefined,
): locale is AppLocale {
  return locale === MACHINE_READABLE_LOCALE;
}

export function isMachineReadableDocsPath(path: string) {
  const [locale] = path.split('/').filter(Boolean);

  return isMachineReadableLocale(locale);
}

export function filterMachineReadableDocsPages<
  T extends { path?: string; url?: string },
>(pages: T[]) {
  return pages.filter((page) =>
    isMachineReadableDocsPath(page.path ?? page.url ?? ''),
  );
}
