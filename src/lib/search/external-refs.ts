import {
  isKnownPlatform,
  normalizePlatformKey,
} from '@/lib/platforms/registry';

/**
 * Resolve the platform for an external SDK api-ref link from its href.
 * Href shape: https://api-ref.agora.io/{locale}/{product}/{platform}/{version}/...
 * The path token is normalized through the registry's own alias map (which covers
 * oddities like `unreal-engine`/`reactjs`/`windows-csharp`), keeping the registry
 * the single source of truth. Returns a registry key, or undefined when the token
 * has no registry equivalent (the record is still indexed and findable by
 * title/ancestry, just not platform-filterable).
 */
export function platformFromExternalHref(href: string): string | undefined {
  const pathname = href.replace(/^https?:\/\/[^/]+/, '');
  const segments = pathname.split('/').filter(Boolean); // [locale, product, platform, ...]
  const token = segments[2];

  if (!token) {
    return undefined;
  }

  const key = normalizePlatformKey(token);

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
