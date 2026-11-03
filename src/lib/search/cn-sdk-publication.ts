import type { DocsNavScope, DocsNavScopeVersion } from '../docs-meta-schema';
import { isSamePathOrDescendant } from '../docs-routing';

export type CnSdkPublicationScope = {
  scopeUrl: string;
  navScope?: DocsNavScope;
};

export type CnSdkPublication = { searchable: boolean; version?: string };

// Version menus are the publication source of truth, not semver ordering across
// unrelated SDKs. Keep retained local history available for reading, not search.
export function createCnSdkPublicationPolicy(scopes: CnSdkPublicationScope[]) {
  const publications = scopes
    .flatMap(({ scopeUrl, navScope }) => [
      ...(navScope?.versions
        ? [
            {
              scopeUrl,
              versions: navScope.versions,
              currentId: navScope.defaultVersion ?? 'current',
            },
          ]
        : []),
      ...(navScope?.versionOverrides ?? []).map((override) => ({
        scopeUrl: `${scopeUrl}/${override.path}`,
        versions: override.versions,
        currentId: navScope?.defaultVersion ?? 'current',
      })),
    ])
    .sort((a, b) => b.scopeUrl.length - a.scopeUrl.length);

  return (url: string): CnSdkPublication => {
    if (!url.startsWith('/') || url.startsWith('//'))
      return { searchable: false };
    const pathname = url.split(/[?#]/, 1)[0].replace(/\/$/, '');
    const publication = publications.find(({ scopeUrl }) =>
      isSamePathOrDescendant(pathname, scopeUrl),
    );
    if (!publication) return { searchable: true };
    const { scopeUrl, versions, currentId } = publication;
    const current = versions.find((entry) => entry.id === currentId);
    // Invalid or external-only publication configuration must not relabel old
    // bodies as current content.
    if (!current || (current.href && !current.href.startsWith('/'))) {
      return { searchable: false };
    }
    const relative = pathname.slice(scopeUrl.length).replace(/^\//, '');
    const currentPath = publicVersionPath(current);
    if (currentPath && !isSamePathOrDescendant(relative, currentPath)) {
      return { searchable: false };
    }
    if (
      versions.some((entry) => {
        const historicalPath = publicVersionPath(entry);
        return (
          entry !== current &&
          historicalPath &&
          isSamePathOrDescendant(relative, historicalPath)
        );
      })
    )
      return { searchable: false };
    // Retired numeric directories may outlive their menu option. Do not admit
    // them through a root-level current route group.
    if (
      !currentPath &&
      /^v?\d+\.\d+(?:\.\d+)?(?:[-+][^/]*)?(?:\/|$)/.test(relative)
    ) {
      return { searchable: false };
    }
    const version = current.label.replace(/^v/i, '');
    return /^\d+\.\d+(?:\.\d+)?(?:[-+][\w.-]+)?$/.test(version)
      ? { searchable: true, version }
      : { searchable: true };
  };
}

function publicVersionPath(version: DocsNavScopeVersion) {
  return version.path
    .split('/')
    .filter((segment) => segment !== '.' && !/^\(.+\)$/.test(segment))
    .join('/');
}
