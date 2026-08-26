import type { SearchIntentResult } from './search-intent';

export type NormalizedApiResult = {
  canonicalKey: string;
  displayTitle: string;
  symbol: string;
  product?: string;
  platforms: string[];
  version?: string;
  isCurrentVersion: boolean;
  url: string;
  snippet?: string;
  path: string[];
  id: string;
  titleMatch: boolean;
  symbolMatch: boolean;
  contentMatch: boolean;
};

export type ApiSearchHit = Record<string, unknown> & { url: string };
type UnknownRecord = Record<string, unknown>;
export type CurrentVersionInput = {
  currentVersion?: string;
  currentPath?: string;
};

const PLATFORM_ALIASES: Record<string, string> = {
  'unreal-engine': 'unreal',
  reactjs: 'javascript',
};

function stripMark(value: string) {
  return value.replace(/<\/?mark(?:\s[^>]*)?>/giu, '');
}

function text(value: unknown) {
  return typeof value === 'string' ? stripMark(value).trim() : undefined;
}

function isNavigableUrl(value: string) {
  if (value.startsWith('/')) return true;
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

function record(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null;
}

function stringArray(value: unknown) {
  if (Array.isArray(value)) {
    return value.flatMap((item) => {
      const itemText = text(item);
      return itemText ? [itemText] : [];
    });
  }
  const itemText = text(value);
  return itemText ? [itemText] : [];
}

function hierarchyValue(hit: UnknownRecord, key: string) {
  const hierarchy = hit.hierarchy;
  if (!record(hierarchy)) return undefined;
  return text(hierarchy[key]);
}

function highlightedHierarchyValue(hit: UnknownRecord, key: string) {
  const highlight = hit._highlightResult;
  if (!record(highlight) || !record(highlight.hierarchy)) return undefined;
  const value = highlight.hierarchy[key];
  return record(value) ? text(value.value) : text(value);
}

function matchLevel(hit: UnknownRecord, key: string, nested?: string) {
  const highlight = hit._highlightResult;
  const value = record(highlight) ? highlight[key] : undefined;
  const target = nested && record(value) ? value[nested] : value;
  return (
    record(target) &&
    typeof target.matchLevel === 'string' &&
    target.matchLevel !== 'none'
  );
}

const KIND_ALIASES: Record<string, string> = {
  enum: 'enum',
  enumeration: 'enum',
  function: 'method',
  method: 'method',
};

const PAGE_KINDS = new Set(['class', 'enum', 'interface', 'namespace', 'type']);

function normalizeMemberKind(value: string) {
  const normalized = value.trim().toLowerCase();
  return KIND_ALIASES[normalized] ?? normalized;
}

function splitIdentifier(value: string) {
  return value
    .replace(/[^\p{L}\p{M}\p{N}]+/gu, ' ')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .replace(/([a-z\d])([A-Z])/g, '$1 $2')
    .toLowerCase()
    .split(/\s+/u)
    .filter(Boolean);
}

function compact(value: string) {
  return splitIdentifier(value).join('');
}

function normalizeProductKey(value: string | undefined) {
  return (
    value
      ?.toLowerCase()
      .trim()
      .replace(/[\s_]+/gu, '-')
      .replace(/[^\p{L}\p{N}-]+/gu, '-')
      .replace(/-+/gu, '-')
      .replace(/^-|-$/gu, '') || 'unknown'
  );
}

function normalizePlatform(value: string) {
  const normalized = value.trim().toLowerCase();
  if (PLATFORM_ALIASES[normalized]) return PLATFORM_ALIASES[normalized];
  return normalized.startsWith('windows-') ? 'windows' : normalized;
}

function pathSegments(hit: UnknownRecord) {
  const lvl0 = hierarchyValue(hit, 'lvl0') ?? '';
  return lvl0
    .split('❯')
    .map((segment) => segment.trim())
    .filter(Boolean)
    .map((segment) =>
      segment.replace(/\bApi\b/gu, 'API').replace(/\bSdk\b/gu, 'SDK'),
    );
}

function versionFromPath(path: string[]) {
  const value = path
    .at(-1)
    ?.replace(/\s*\((?:current)\)\s*/giu, '')
    .trim();
  if (!value) return undefined;
  if (/^current$/iu.test(value)) return value;
  return /^(?:v?\d+(?:\.\d+)*(?:\.x|x)?)$/iu.test(value) ? value : undefined;
}

function normalizePathForComparison(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\/[^/]+/iu, '')
    .replace(/^\/+|\/+$/gu, '')
    .split('/')
    .map((segment) => segment.trim().replace(/[\s_]+/gu, '-'))
    .join('/');
}

function urlPathForComparison(url: string) {
  try {
    return normalizePathForComparison(new URL(url).pathname);
  } catch {
    return normalizePathForComparison(url);
  }
}

function pathMatchesConfigured(
  url: string,
  path: string[],
  configuredPath: string,
) {
  const expected = normalizePathForComparison(configuredPath);
  if (!expected) return false;
  const urlPath = urlPathForComparison(url);
  const hierarchyPath = normalizePathForComparison(path.join('/'));
  const includesSegments = (candidate: string) => {
    const candidateSegments = candidate.split('/').filter(Boolean);
    const expectedSegments = expected.split('/').filter(Boolean);
    const offset = candidateSegments.indexOf(expectedSegments[0]);
    return (
      offset >= 0 &&
      candidateSegments
        .slice(offset, offset + expectedSegments.length)
        .join('/') === expectedSegments.join('/')
    );
  };
  return (
    urlPath === expected ||
    urlPath.startsWith(`${expected}/`) ||
    hierarchyPath === expected ||
    hierarchyPath.startsWith(`${expected}/`) ||
    includesSegments(urlPath) ||
    includesSegments(hierarchyPath)
  );
}

function isCurrentVersion(
  hit: UnknownRecord,
  path: string[],
  version: string | undefined,
  current?: CurrentVersionInput,
  url = '',
) {
  if (hit.isCurrentVersion === true || hit.current === true) return true;
  if (
    [...path, version ?? ''].some((value) =>
      /(?:^|\()current\)?$/iu.test(value),
    )
  ) {
    return true;
  }
  const configured = current;
  if (configured?.currentVersion && version) {
    if (version.toLowerCase() === configured.currentVersion.toLowerCase()) {
      return true;
    }
  }
  if (configured?.currentPath) {
    return pathMatchesConfigured(url, path, configured.currentPath);
  }
  return false;
}

function urlBasename(url: string) {
  try {
    const pathname = new URL(url, 'https://api-ref.invalid').pathname;
    return (
      pathname
        .split('/')
        .at(-1)
        ?.replace(/\.html$/iu, '') || undefined
    );
  } catch {
    return undefined;
  }
}

function supportsSynthesizedTypeDocAnchor(url: string, symbol: string) {
  try {
    const pathname = new URL(url, 'https://api-ref.invalid').pathname;
    const basename = urlBasename(url);
    if (!pathname.includes('/interfaces/') || !basename) return false;
    const normalizedSymbol = compact(symbol);
    const normalizedContainer = compact(basename);
    return (
      normalizedSymbol.length > normalizedContainer.length &&
      normalizedSymbol.endsWith(normalizedContainer)
    );
  } catch {
    return false;
  }
}

function apiFields(hit: UnknownRecord, displayTitle: string, symbol: string) {
  return [
    hierarchyValue(hit, 'lvl1'),
    hierarchyValue(hit, 'lvl2'),
    text(hit.title),
    text(hit.symbol),
    text(hit.operation),
    text(hit.name),
    text(hit.memberName),
    displayTitle,
    symbol,
  ].filter((value): value is string => Boolean(value));
}

function titleAndSymbol(hit: UnknownRecord, url: string) {
  const levelOne =
    highlightedHierarchyValue(hit, 'lvl1') ?? hierarchyValue(hit, 'lvl1');
  const levelTwo =
    highlightedHierarchyValue(hit, 'lvl2') ?? hierarchyValue(hit, 'lvl2');
  const rawTitle =
    levelTwo ?? levelOne ?? text(hit.title) ?? urlBasename(url) ?? url;
  const kindMatch = (levelTwo ?? levelOne ?? rawTitle).match(
    /^(Class|Enum|Enumeration|Interface|Namespace|Type|Function|Method|Property|Event|Constructor)\s+(.+)$/iu,
  );
  const levelOneKindMatch = levelOne?.match(
    /^(Class|Enum|Enumeration|Interface|Namespace|Type|Function|Method|Property|Event|Constructor)\s+(.+)$/iu,
  );
  const symbol = kindMatch?.[2]?.trim() || rawTitle;
  const memberKind = normalizeMemberKind(
    text(hit.memberKind) ??
      text(hit.kind) ??
      (kindMatch ? kindMatch[1] : 'member'),
  );
  const basename = urlBasename(url);
  const titleLower = rawTitle.toLowerCase();
  const basenameLower = basename?.toLowerCase();
  const container =
    !kindMatch && !levelOneKindMatch && levelTwo
      ? levelOne
      : !kindMatch &&
          basenameLower &&
          basename &&
          titleLower.length > basename.length &&
          titleLower.endsWith(basenameLower)
        ? rawTitle.slice(-basename.length)
        : undefined;
  const displayTitle = container ? `${container} › ${rawTitle}` : rawTitle;
  const namespace =
    text(hit.namespace) ??
    text(hit.className) ??
    (levelTwo
      ? levelOneKindMatch?.[2]?.trim() || levelOne
      : levelOneKindMatch?.[2]?.trim()) ??
    basename ??
    '';
  if (
    !levelTwo &&
    !levelOneKindMatch &&
    !text(hit.memberKind) &&
    !text(hit.kind) &&
    basename &&
    compact(rawTitle) === compact(basename)
  ) {
    return {
      displayTitle: rawTitle,
      memberKind: 'class',
      namespace: basename,
      symbol: rawTitle,
    };
  }
  return { displayTitle, memberKind, namespace, symbol };
}

function normalizedCandidateFields(hit: unknown) {
  if (!record(hit)) return [];
  if ('canonicalKey' in hit && typeof hit.displayTitle === 'string') {
    return [
      text(hit.displayTitle),
      text(hit.symbol),
      'title' in hit ? text(hit.title) : undefined,
    ].filter((value): value is string => Boolean(value));
  }
  const rawHit = hit as UnknownRecord;
  return [
    hierarchyValue(rawHit, 'lvl1'),
    hierarchyValue(rawHit, 'lvl2'),
    text(rawHit.title),
    text(rawHit.symbol),
    text(rawHit.operation),
    text(rawHit.name),
    text(rawHit.memberName),
  ].filter((value): value is string => Boolean(value));
}

function matchesTerms(fields: string[], intent: SearchIntentResult) {
  const candidateTokens = new Set(fields.flatMap(splitIdentifier));
  const candidateCompact = fields.map(compact).join('');
  return (
    intent.majorTerms.length > 0 &&
    intent.majorTerms.every((term) => {
      const normalizedTerm = compact(term);
      return (
        candidateTokens.has(normalizedTerm) ||
        candidateCompact.includes(normalizedTerm)
      );
    })
  );
}

function symbolMatches(fields: string[], intent: SearchIntentResult) {
  const queryCompact = compact(intent.normalizedQuery);
  return fields.some((field) => {
    const fieldCompact = compact(field);
    return fieldCompact === queryCompact;
  });
}

export function normalizeApiHit(
  hit: ApiSearchHit,
  intent: SearchIntentResult,
  current?: CurrentVersionInput,
): NormalizedApiResult | undefined;
export function normalizeApiHit(
  hit: null | undefined,
  intent: SearchIntentResult,
  current?: CurrentVersionInput,
): undefined;
export function normalizeApiHit(
  hit: unknown,
  intent: SearchIntentResult,
  current?: CurrentVersionInput,
): NormalizedApiResult | undefined;
export function normalizeApiHit(
  hit: unknown,
  intent: SearchIntentResult,
  current?: CurrentVersionInput,
): NormalizedApiResult | undefined {
  if (!record(hit)) return undefined;
  let url = text(hit.url) ?? '';
  if (!isNavigableUrl(url)) return undefined;
  const path = pathSegments(hit);
  const { displayTitle, memberKind, namespace, symbol } = titleAndSymbol(
    hit,
    url,
  );
  if (!compact(displayTitle) || !compact(symbol)) return undefined;
  if (
    !PAGE_KINDS.has(memberKind) &&
    !url.includes('#') &&
    supportsSynthesizedTypeDocAnchor(url, symbol)
  ) {
    url = `${url}#${symbol.toLowerCase()}`;
  }
  const product = text(hit.product);
  const platforms = stringArray(hit.platform).map(normalizePlatform);
  const inferredPlatform = path
    .map(normalizePlatform)
    .find((segment) =>
      [
        'android',
        'ios',
        'web',
        'javascript',
        'unreal',
        'windows',
        'macos',
        'linux',
      ].includes(segment),
    );
  if (platforms.length === 0 && inferredPlatform)
    platforms.push(inferredPlatform);
  const version = text(hit.version) ?? versionFromPath(path);
  const fields = apiFields(hit, displayTitle, symbol);
  const titleMatch =
    matchLevel(hit, 'hierarchy', 'lvl1') ||
    matchLevel(hit, 'hierarchy', 'lvl2') ||
    matchLevel(hit, 'title') ||
    matchesTerms(
      [hierarchyValue(hit, 'lvl1') ?? '', text(hit.title) ?? ''],
      intent,
    );
  const symbolMatch = symbolMatches(fields, intent);
  const contentMatch = matchLevel(hit, 'content');
  const id = text(hit.objectID) ?? text(hit.id) ?? `${url}#${symbol}`;
  const snippet =
    (record(hit._snippetResult) && record(hit._snippetResult.content)
      ? text(hit._snippetResult.content.value)
      : undefined) ?? text(hit.content);
  const key = [
    normalizeProductKey(product),
    compact(namespace) || 'unknown',
    ...(PAGE_KINDS.has(memberKind.toLowerCase()) &&
    compact(namespace) === compact(symbol)
      ? [memberKind.toLowerCase()]
      : [compact(symbol) || 'unknown', memberKind.toLowerCase()]),
  ].join('|');
  const fallbackIdentity = !product
    ? `|url:${encodeURIComponent(url.toLowerCase())}`
    : '';

  return {
    canonicalKey: `${key}${fallbackIdentity}`,
    displayTitle,
    symbol,
    ...(product ? { product } : {}),
    platforms: [...new Set(platforms)],
    ...(version ? { version } : {}),
    isCurrentVersion: isCurrentVersion(hit, path, version, current, url),
    url,
    ...(snippet ? { snippet } : {}),
    path,
    id,
    titleMatch,
    symbolMatch,
    contentMatch,
  };
}

export function admitApiHit(
  hit: unknown,
  intent: SearchIntentResult,
  apiScopeSelected: boolean,
) {
  if (!record(hit)) return false;
  const hasNavigableUrl = isNavigableUrl(text(hit.url) ?? '');
  const fields = normalizedCandidateFields(hit);
  if (!hasNavigableUrl || fields.length === 0) return false;
  if (apiScopeSelected) return true;
  if (intent.intent === 'api-symbol') {
    return symbolMatches(fields, intent);
  }
  if (intent.intent === 'api-task') {
    return matchesTerms(fields, intent);
  }
  return false;
}

function compareVersions(a?: string, b?: string) {
  const aParts = a?.match(/\d+/gu)?.map(Number) ?? [];
  const bParts = b?.match(/\d+/gu)?.map(Number) ?? [];
  const length = Math.max(aParts.length, bParts.length);
  for (let index = 0; index < length; index += 1) {
    const difference = (aParts[index] ?? 0) - (bParts[index] ?? 0);
    if (difference !== 0) return difference;
  }
  return 0;
}

const PLATFORM_PRIORITY = [
  'android',
  'ios',
  'web',
  'javascript',
  'unreal',
  'windows',
  'macos',
  'linux',
];

function platformRank(platforms: string[]) {
  return Math.min(
    ...platforms.map((platform) => {
      const rank = PLATFORM_PRIORITY.indexOf(platform);
      return rank === -1 ? PLATFORM_PRIORITY.length : rank;
    }),
  );
}

function withConfiguredCurrent(
  result: NormalizedApiResult,
  current?: CurrentVersionInput,
) {
  if (result.isCurrentVersion || !current) return result;
  const configured = current;
  const matchesVersion =
    configured.currentVersion &&
    result.version?.toLowerCase() === configured.currentVersion.toLowerCase();
  const matchesPath =
    configured.currentPath &&
    pathMatchesConfigured(result.url, result.path, configured.currentPath);
  return matchesVersion || matchesPath
    ? { ...result, isCurrentVersion: true }
    : result;
}

export function aggregateApiResults(
  results: NormalizedApiResult[],
  platform?: string,
  current?: CurrentVersionInput,
) {
  const groups = new Map<string, NormalizedApiResult[]>();
  for (const result of results) {
    const group = groups.get(result.canonicalKey) ?? [];
    group.push(withConfiguredCurrent(result, current));
    groups.set(result.canonicalKey, group);
  }

  return [...groups.values()].map((group) => {
    const wantedPlatform = platform ? normalizePlatform(platform) : undefined;
    const sorted = [...group].sort((a, b) => {
      const aPlatform =
        wantedPlatform && a.platforms.includes(wantedPlatform) ? 1 : 0;
      const bPlatform =
        wantedPlatform && b.platforms.includes(wantedPlatform) ? 1 : 0;
      return (
        bPlatform - aPlatform ||
        Number(b.isCurrentVersion) - Number(a.isCurrentVersion) ||
        compareVersions(b.version, a.version) ||
        Number(b.symbolMatch) - Number(a.symbolMatch) ||
        Number(b.titleMatch) - Number(a.titleMatch) ||
        platformRank(a.platforms) - platformRank(b.platforms) ||
        a.url.localeCompare(b.url) ||
        a.id.localeCompare(b.id)
      );
    });
    const representative = sorted[0];
    const platforms = [
      ...new Set(group.flatMap((result) => result.platforms)),
    ].sort(
      (a, b) => platformRank([a]) - platformRank([b]) || a.localeCompare(b),
    );
    return { ...representative, platforms };
  });
}
