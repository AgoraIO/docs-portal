import { isKnownPlatform, normalizePlatformKey } from '@/lib/platforms/registry';

// External api-ref hrefs use path tokens that don't all match registry keys.
// Map the known oddities; everything else falls through to normalizePlatformKey.
const EXTERNAL_PLATFORM_TOKEN_MAP: Record<string, string> = {
  'unreal-engine': 'unreal',
  reactjs: 'javascript',
  'windows-csharp': 'windows',
};

/**
 * Resolve the platform for an external SDK api-ref link from its href.
 * Href shape: https://api-ref.agora.io/{locale}/{product}/{platform}/{version}/...
 * Returns a registry key, or undefined when the token has no registry equivalent
 * (record is still indexed and findable by title/ancestry, just not platform-filterable).
 */
export function platformFromExternalHref(href: string): string | undefined {
  const pathname = href.replace(/^https?:\/\/[^/]+/, '');
  const segments = pathname.split('/').filter(Boolean); // [locale, product, platform, ...]
  const token = segments[2];

  if (!token) {
    return undefined;
  }

  const mapped = EXTERNAL_PLATFORM_TOKEN_MAP[token] ?? token;
  const key = normalizePlatformKey(mapped);

  return isKnownPlatform(key) ? key : undefined;
}

/** Last slug of an internal REST-API link target (e.g. "/en/.../api-ref/rtc" -> "rtc"). */
export function deriveRestAlias(target: string): string | undefined {
  return target.split(/[#?]/)[0].split('/').filter(Boolean).at(-1);
}

export type ExternalNavEntry = {
  title: string;
  href: string;
  ancestry: string[];
  restAlias?: string;
};

type SidebarNodeLike = {
  type?: string;
  title?: string;
  url?: string;
  href?: string;
  external?: boolean;
  children?: SidebarNodeLike[];
};

// Find a group's internal REST-API sibling link and derive its alias slug.
function restAliasFromChildren(children: SidebarNodeLike[]): string | undefined {
  const rest = children.find(
    (child) => !child.external && (child.url ?? '').includes('/api-ref/'),
  );

  return rest?.url ? deriveRestAlias(rest.url) : undefined;
}

/** Walk in-memory sidebar nodes -> external api-ref entries (ancestry = parent section titles). */
export function collectExternalNavEntries(
  nodes: SidebarNodeLike[],
  ancestry: string[] = [],
  inheritedAlias?: string,
): ExternalNavEntry[] {
  const groupAlias = inheritedAlias ?? restAliasFromChildren(nodes);

  return nodes.flatMap((node) => {
    if (node.external && node.href && node.title) {
      return [{ title: node.title, href: node.href, ancestry, restAlias: groupAlias }];
    }

    if (node.children?.length) {
      const nextAncestry = node.title ? [...ancestry, node.title] : ancestry;
      return collectExternalNavEntries(node.children, nextAncestry, undefined);
    }

    return [];
  });
}

/** Searchable text for an external record: title + ancestry + href path tokens + REST alias. */
export function buildExternalSearchText(entry: ExternalNavEntry): string {
  const hrefTokens = entry.href
    .replace(/^https?:\/\/[^/]+/, '')
    .split(/[/.]/)
    .filter(Boolean);

  return [entry.title, ...entry.ancestry, ...hrefTokens, entry.restAlias]
    .filter(Boolean)
    .join(' ');
}
