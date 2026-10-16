import {
  isKnownPlatform,
  normalizePlatformKey,
  type PlatformKey,
} from './registry';

export type PlatformContext = {
  availablePlatforms: PlatformKey[];
  canonicalPlatform?: PlatformKey;
  defaultPlatform?: PlatformKey;
  selectedPlatform?: PlatformKey;
  titlePlatforms: PlatformKey[];
};

export type ResolvePlatformContextInput = {
  availablePlatforms?: readonly string[];
  canonicalPlatform?: string;
  defaultPlatform?: string;
  explicitTitlePlatforms?: readonly string[];
  pathPlatforms?: readonly string[];
  requestedPlatform?: string;
};

const TITLE_PLATFORM_EXCLUDED_KEYS = new Set<PlatformKey>([
  'restful',
  'restful-api',
]);

export function resolvePlatformContext({
  availablePlatforms = [],
  canonicalPlatform,
  defaultPlatform,
  explicitTitlePlatforms = [],
  pathPlatforms = [],
  requestedPlatform,
}: ResolvePlatformContextInput): PlatformContext {
  const normalizedAvailablePlatforms =
    normalizePlatformList(availablePlatforms);
  const normalizedCanonicalPlatform = normalizeKnownPlatform(canonicalPlatform);
  const normalizedDefaultPlatform = normalizeKnownPlatform(defaultPlatform);
  const normalizedRequestedPlatform = normalizeKnownPlatform(requestedPlatform);
  const normalizedExplicitTitlePlatforms = normalizeTitlePlatformList(
    explicitTitlePlatforms,
  );
  const normalizedPathPlatforms = normalizeTitlePlatformList(pathPlatforms);
  const selectedPlatform =
    normalizedRequestedPlatform ??
    (normalizedDefaultPlatform &&
    (normalizedAvailablePlatforms.length === 0 ||
      normalizedAvailablePlatforms.includes(normalizedDefaultPlatform))
      ? normalizedDefaultPlatform
      : undefined) ??
    (normalizedAvailablePlatforms.length === 1
      ? normalizedAvailablePlatforms[0]
      : undefined) ??
    (normalizedPathPlatforms.length === 1
      ? normalizedPathPlatforms[0]
      : undefined) ??
    (normalizedCanonicalPlatform &&
    (normalizedAvailablePlatforms.length === 0 ||
      normalizedAvailablePlatforms.includes(normalizedCanonicalPlatform))
      ? normalizedCanonicalPlatform
      : undefined);

  const titlePlatforms =
    normalizedRequestedPlatform &&
    !TITLE_PLATFORM_EXCLUDED_KEYS.has(normalizedRequestedPlatform)
      ? [normalizedRequestedPlatform]
      : normalizedExplicitTitlePlatforms.length > 0
        ? normalizedExplicitTitlePlatforms
        : selectedPlatform &&
            !TITLE_PLATFORM_EXCLUDED_KEYS.has(selectedPlatform)
          ? [selectedPlatform]
          : normalizedPathPlatforms.length === 1
            ? normalizedPathPlatforms
            : [];

  return {
    availablePlatforms: normalizedAvailablePlatforms,
    ...(normalizedCanonicalPlatform
      ? { canonicalPlatform: normalizedCanonicalPlatform }
      : {}),
    ...(normalizedDefaultPlatform
      ? { defaultPlatform: normalizedDefaultPlatform }
      : {}),
    ...(selectedPlatform ? { selectedPlatform } : {}),
    titlePlatforms,
  };
}

function normalizePlatformList(values: readonly string[]) {
  const normalized: PlatformKey[] = [];

  for (const value of values) {
    const platform = normalizeKnownPlatform(value);
    if (platform && !normalized.includes(platform)) {
      normalized.push(platform);
    }
  }

  return normalized;
}

function normalizeTitlePlatformList(values: readonly string[]) {
  return normalizePlatformList(values).filter(
    (platform) => !TITLE_PLATFORM_EXCLUDED_KEYS.has(platform),
  );
}

function normalizeKnownPlatform(value: string | undefined) {
  if (!value) {
    return undefined;
  }

  const normalized = normalizePlatformKey(value);
  return isKnownPlatform(normalized) ? normalized : undefined;
}
