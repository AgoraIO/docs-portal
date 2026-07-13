export const DOCS_LOCALES = ['en', 'zh-CN'] as const;
export const DOCS_REGIONS = ['global', 'cn'] as const;

export type DocsLocale = (typeof DOCS_LOCALES)[number];
export type DocsRegion = (typeof DOCS_REGIONS)[number];

const GLOBAL_LOCALES = DOCS_LOCALES.filter(
  (locale): locale is Exclude<DocsLocale, 'zh-CN'> => locale !== 'zh-CN',
);
const CN_LOCALES = ['zh-CN'] as const satisfies readonly DocsLocale[];

export function resolveDocsRegion(
  value: string | null | undefined,
): DocsRegion {
  if (!value) {
    return 'global';
  }

  if (value === 'global' || value === 'cn') {
    return value;
  }

  throw new Error(
    `Unsupported VITE_DOCS_REGION "${value}". Expected "global" or "cn".`,
  );
}

export function getPublishedDocsLocales(
  region: DocsRegion = DOCS_REGION,
): readonly DocsLocale[] {
  return region === 'cn' ? CN_LOCALES : GLOBAL_LOCALES;
}

export function getDefaultDocsLocale(
  region: DocsRegion = DOCS_REGION,
): DocsLocale {
  return region === 'cn' ? 'zh-CN' : 'en';
}

export function isPublishedDocsLocale(
  locale: string | null | undefined,
  region: DocsRegion = DOCS_REGION,
): locale is DocsLocale {
  return getPublishedDocsLocales(region).some(
    (publishedLocale) => publishedLocale === locale,
  );
}

export function isPublishedDocsPath(
  path: string,
  region: DocsRegion = DOCS_REGION,
) {
  const [locale] = path.split('/').filter(Boolean);

  return isPublishedDocsLocale(locale, region);
}

export function getDocsHomePath(region: DocsRegion = DOCS_REGION) {
  return `/${getDefaultDocsLocale(region)}/introduction`;
}

function readDocsRegionEnv() {
  const viteEnv = (
    import.meta as ImportMeta & {
      env?: Record<string, string | undefined>;
    }
  ).env;
  const processEnv =
    typeof process === 'undefined' ? undefined : process.env.VITE_DOCS_REGION;

  return viteEnv?.VITE_DOCS_REGION ?? processEnv;
}

export const DOCS_REGION = resolveDocsRegion(readDocsRegionEnv());
export const PUBLISHED_DOCS_LOCALES = getPublishedDocsLocales(DOCS_REGION);
