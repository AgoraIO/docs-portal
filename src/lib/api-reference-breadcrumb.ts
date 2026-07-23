import {
  type ApiReferenceCardEntry,
  zhCNApiReferenceCards,
} from './api-reference-cards-data.zh-cn';
import { isSamePathOrDescendant } from './docs-routing';
import type { DocsBreadcrumbItem } from './docs-tree';

const ZH_CN_API_REFERENCE_INDEX_URL = '/zh-CN/api-reference/api';
const ZH_CN_API_REFERENCE_ENTRIES = zhCNApiReferenceCards.all;
const SIBLING_FALLBACK_BY_SCOPE = getSiblingFallbackByScope(
  ZH_CN_API_REFERENCE_ENTRIES,
);

export function resolveZhCnApiReferenceBreadcrumb({
  activePath,
  title,
}: {
  activePath: string;
  title: string;
}): DocsBreadcrumbItem[] | null {
  const entry = findZhCnApiReferenceEntry(activePath);

  if (!entry) {
    return null;
  }

  const breadcrumb: DocsBreadcrumbItem[] = [
    {
      title: 'API 参考',
      url: ZH_CN_API_REFERENCE_INDEX_URL,
    },
    {
      title: entry.product,
    },
    {
      title: entry.platform,
      ...(activePath === entry.href ? {} : { url: entry.href }),
    },
  ];

  if (activePath !== entry.href || entry.breadcrumbRole === 'document') {
    breadcrumb.push({
      title,
      url: activePath,
    });
  }

  return breadcrumb;
}

function findZhCnApiReferenceEntry(
  activePath: string,
): ApiReferenceCardEntry | undefined {
  return ZH_CN_API_REFERENCE_ENTRIES.map((entry, index) => ({
    entry,
    index,
    score: scoreEntryMatch(activePath, entry),
  }))
    .filter((candidate) => candidate.score >= 0)
    .sort(
      (left, right) => right.score - left.score || left.index - right.index,
    )[0]?.entry;
}

function scoreEntryMatch(activePath: string, entry: ApiReferenceCardEntry) {
  if (isSamePathOrDescendant(activePath, entry.href)) {
    return 20_000 + entry.href.length;
  }

  const siblingScope = getParentPath(entry.href);

  if (
    SIBLING_FALLBACK_BY_SCOPE.get(siblingScope) === entry &&
    isSamePathOrDescendant(activePath, siblingScope)
  ) {
    return 10_000 + siblingScope.length;
  }

  return -1;
}

function getSiblingFallbackByScope(entries: readonly ApiReferenceCardEntry[]) {
  const entriesByScope = new Map<string, ApiReferenceCardEntry[]>();

  for (const entry of entries) {
    const scope = getParentPath(entry.href);
    const scopedEntries = entriesByScope.get(scope) ?? [];
    scopedEntries.push(entry);
    entriesByScope.set(scope, scopedEntries);
  }

  return new Map(
    Array.from(entriesByScope.entries()).flatMap(([scope, scopedEntries]) => {
      const ownershipKeys = new Set(
        scopedEntries.map((entry) => `${entry.productId}:${entry.platformId}`),
      );
      const productIds = new Set(scopedEntries.map((entry) => entry.productId));
      const solutionIds = new Set(
        scopedEntries.map((entry) => entry.solutionId ?? ''),
      );
      const clientEntries = scopedEntries.filter(
        (entry) => entry.apiType === 'client-api',
      );
      const fallbackEntry =
        ownershipKeys.size === 1
          ? scopedEntries[0]
          : productIds.size === 1 &&
              solutionIds.size === 1 &&
              clientEntries.length === 1
            ? clientEntries[0]
            : undefined;

      return fallbackEntry ? [[scope, fallbackEntry] as const] : [];
    }),
  );
}

function getParentPath(url: string) {
  return url.slice(0, url.lastIndexOf('/'));
}
