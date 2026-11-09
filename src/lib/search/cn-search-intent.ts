import { platformRegistry } from '../platforms/registry';
import { type CnSearchFamily, cnSearchFamilies } from './cn-search-family';
import {
  getCnSearchNavigationLanguage,
  normalizeCnSearchLanguageTerms,
} from './cn-search-terms';

// Language names such as Swift/C++ do not identify one documentation runtime.
const runtimePlatforms = new Set([
  'web',
  'javascript',
  'android',
  'ios',
  'macos',
  'windows',
  'harmonyos',
  'electron',
  'unity',
  'flutter',
  'react-native',
]);
const platformPhrases = Object.entries(platformRegistry)
  .filter(([id]) => runtimePlatforms.has(id))
  .flatMap(([id, entry]) =>
    [...new Set([id, entry.label.en, entry.label['zh-CN']])].map((phrase) => ({
      platform:
        id === 'javascript' ? 'web' : id === 'restful-api' ? 'restful' : id,
      pattern: new RegExp(
        `(^|\\s)${phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?=$|\\s)`,
        'gi',
      ),
    })),
  )
  .sort((a, b) => b.pattern.source.length - a.pattern.source.length);

// Resolve bare domain terms only. Explicit qualifiers retain their meaning
// (e.g. "bps 混淆" or "云录制常见问题"). The UI keeps the original input.
const bareTopicQueries = new Map([
  ['混淆', '代码混淆'],
  ['云录制', '云端录制'],
]);
const normalizeTopicQuery = (query: string) =>
  bareTopicQueries.get(query.trim()) ?? query;

export function resolveCnSearchQuery(query: string, platform?: string) {
  query = normalizeTopicQuery(normalizeCnSearchLanguageTerms(query));
  let remaining = query;
  const platforms = new Set<string>();
  for (const phrase of platformPhrases) {
    const { pattern } = phrase;
    pattern.lastIndex = 0;
    if (!pattern.test(remaining)) continue;
    platforms.add(phrase.platform);
    remaining = remaining.replace(pattern, '$1');
  }
  if (platforms.size !== 1) return { query, platform };
  const inferred = [...platforms][0];
  if (platform && platform !== inferred) return { query, platform };
  remaining = remaining.replace(/\s+/g, ' ').trim();
  // A platform name on its own is still a search term, not a request for its entire catalog.
  return remaining
    ? { query: normalizeTopicQuery(remaining), platform: platform ?? inferred }
    : { query, platform };
}

export function getCnSearchFamilyOrder(
  query: string,
  matches: ReadonlyArray<{
    family: CnSearchFamily;
    title: string;
    languageEntryTerms?: string[];
    languageEntryRank?: number;
  }>,
  platform?: string,
): readonly CnSearchFamily[] {
  const language = getCnSearchNavigationLanguage(query);
  if (language) {
    const rank = (family: CnSearchFamily) =>
      Math.min(
        1000,
        ...matches
          .filter(
            (match) =>
              match.family === family &&
              match.languageEntryTerms?.includes(language),
          )
          .map((match) => match.languageEntryRank ?? 1000),
      );
    return [...cnSearchFamilies].sort((a, b) => rank(a) - rank(b));
  }
  // Preserve guide-first discovery for ordinary words; prioritize a matching code identifier.
  const identifier = resolveCnSearchQuery(query, platform)
    .query.trim()
    .replace(/\(\)$/, '');
  if (
    /^(?:(?=.*[a-z])(?=.*[A-Z])[A-Za-z\d]+|[A-Za-z\d]+(?:_[A-Za-z\d]+)+)$/.test(
      identifier,
    ) &&
    matches.some(
      ({ family, title }) =>
        family === 'api' &&
        title
          .replace(/<\/?(?:mark|em)>/gi, '')
          .replace(/\s*\[\d+\/\d+\]$/, '')
          .replace(/\(\)$/, '')
          .trim()
          .toLowerCase() === identifier.toLowerCase(),
    )
  )
    return ['api', 'docs', 'faq'];
  return cnSearchFamilies;
}

export function getCnGuideIdentifier(query: string) {
  const identifier = query.trim().replace(/\(\)$/, '');
  return /^(?:(?=.*[a-z][A-Z])[A-Za-z\d]+|[A-Za-z\d]+(?:_[A-Za-z\d]+)+)$/.test(
    identifier,
  )
    ? identifier
    : undefined;
}
