/** A documentation release is independent of SDK platforms and API info.version. */
export type DocVersion = {
  id: string;
  label: string;
  rootUrl: string;
  /** Stable topic keys map to relative URLs, including anchors when needed. */
  pages: Readonly<Record<string, string>>;
};

export type DocVersionScope = {
  id: string;
  label: string;
  entryUrl: string;
  defaultVersion: string;
  versions: readonly DocVersion[];
};

const DEMO_ROOT = '/en/api-reference/versioning-demo';

/** Register real API families here when their versioned content is available. */
export const DOC_VERSION_SCOPES: readonly DocVersionScope[] = [
  {
    id: 'test-api',
    label: 'Test API (mock documentation)',
    entryUrl: DEMO_ROOT,
    defaultVersion: 'v1',
    versions: [
      {
        id: 'v1',
        label: 'v1 — Test current version',
        rootUrl: `${DEMO_ROOT}/v1`,
        pages: {
          overview: '',
          authentication: 'authentication',
          widgets: 'widgets',
          legacy: 'legacy-notes',
        },
      },
      {
        id: 'v2',
        label: 'v2 — Test new version',
        rootUrl: `${DEMO_ROOT}/v2`,
        pages: {
          overview: '',
          authentication: 'authentication',
          widgets: 'list-widgets',
          migration: 'migration',
        },
      },
    ],
  },
];

export type DocVersionSelections = Readonly<Record<string, string>>;

export function validateDocVersionScopes(scopes: readonly DocVersionScope[]) {
  const scopeIds = new Set<string>();
  const roots = new Set<string>();
  for (const scope of scopes) {
    if (!/^[a-z0-9-]+$/.test(scope.id) || scopeIds.has(scope.id)) {
      throw new Error(
        `Invalid or duplicate documentation version scope: ${scope.id}`,
      );
    }
    scopeIds.add(scope.id);
    const versionIds = new Set<string>();
    for (const version of scope.versions) {
      if (
        !/^[a-z0-9-]+$/.test(version.id) ||
        versionIds.has(version.id) ||
        roots.has(version.rootUrl)
      ) {
        throw new Error(
          `Duplicate or invalid documentation release: ${scope.id}/${version.id}`,
        );
      }
      if (
        !version.rootUrl.startsWith('/') ||
        /[?#]|\/$/.test(version.rootUrl) ||
        version.rootUrl === scope.entryUrl
      ) {
        throw new Error(
          `Documentation release needs a distinct canonical root: ${version.rootUrl}`,
        );
      }
      for (const relative of Object.values(version.pages)) {
        if (
          relative.startsWith('/') ||
          relative.includes('..') ||
          relative.includes('?')
        ) {
          throw new Error(
            `Documentation topic must use a relative path or anchor: ${relative}`,
          );
        }
      }
      versionIds.add(version.id);
      roots.add(version.rootUrl);
    }
    if (!versionIds.has(scope.defaultVersion)) {
      throw new Error(
        `Missing default documentation release: ${scope.id}/${scope.defaultVersion}`,
      );
    }
  }
}

validateDocVersionScopes(DOC_VERSION_SCOPES);

function localUrl(href: string) {
  return new URL(href, 'https://docs.invalid');
}

export function resolveDocVersion(
  href: string,
  scopes: readonly DocVersionScope[] = DOC_VERSION_SCOPES,
) {
  const url = localUrl(href);
  const pathname = url.pathname.replace(/\/$/, '').replace(/\.md$/, '');
  // Prefer the most specific owner when version roots are nested.
  const matches = scopes.flatMap((scope) =>
    scope.versions.flatMap((version) =>
      pathname === version.rootUrl || pathname.startsWith(`${version.rootUrl}/`)
        ? [{ scope, version }]
        : [],
    ),
  );
  const match = matches.sort(
    (a, b) => b.version.rootUrl.length - a.version.rootUrl.length,
  )[0];
  if (!match) return undefined;
  const relative = pathname
    .slice(match.version.rootUrl.length)
    .replace(/^\//, '');
  const pages = Object.entries(match.version.pages);
  const pageKey =
    pages.find(([, path]) => path === `${relative}${url.hash}`)?.[0] ??
    pages.find(([, path]) => path === relative)?.[0];
  return { ...match, pageKey };
}

export function getDocVersionTarget(
  href: string,
  targetId: string,
  scopes: readonly DocVersionScope[] = DOC_VERSION_SCOPES,
) {
  const current = resolveDocVersion(href, scopes);
  const scope =
    current?.scope ??
    scopes.find((item) => item.entryUrl === localUrl(href).pathname);
  const target = scope?.versions.find((item) => item.id === targetId);
  if (!scope || !target) return undefined;
  const relative = current?.pageKey ? target.pages[current.pageKey] : '';
  const fallback = Boolean(
    current && (!current.pageKey || relative === undefined),
  );
  return {
    href: `${target.rootUrl}${relative ? `${relative.startsWith('#') ? '' : '/'}${relative}` : ''}${fallback ? '?versionFallback=1' : ''}`,
    fallback,
  };
}

export function getDocVersionSelections(
  href: string,
  preferences: DocVersionSelections = {},
  scopes: readonly DocVersionScope[] = DOC_VERSION_SCOPES,
): DocVersionSelections {
  const active = resolveDocVersion(href, scopes);
  return Object.fromEntries(
    scopes.map((scope) => {
      const preferred = scope.versions.some(
        (version) => version.id === preferences[scope.id],
      )
        ? preferences[scope.id]
        : scope.defaultVersion;
      return [
        scope.id,
        active?.scope.id === scope.id ? active.version.id : preferred,
      ];
    }),
  );
}

export function getDocVersionIndexPath(
  scope: DocVersionScope,
  version: DocVersion,
) {
  return `/llms/doc-versions-${scope.id}-${version.id}.txt`;
}

export function withDocVersionMetadata(markdown: string, href: string) {
  const context = resolveDocVersion(href);
  if (!context) return markdown;
  const { scope, version } = context;
  const metadata = [
    `> Documentation family: ${scope.label} (${scope.id}).`,
    `> Documentation version: ${version.label} (${version.id}).`,
    `> This document describes only this version. [Version index](${getDocVersionIndexPath(scope, version)}).`,
  ].join('\n');
  const titleEnd = markdown.indexOf('\n');
  return titleEnd < 0
    ? `${markdown}\n\n${metadata}\n`
    : `${markdown.slice(0, titleEnd)}\n\n${metadata}\n${markdown.slice(titleEnd)}`;
}
