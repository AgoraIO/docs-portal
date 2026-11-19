import type { SearchIntentResult } from './search-intent';
import {
  normalizeSearchText,
  tokenizeSearchText,
} from './search-normalization';

// These names describe use cases. Search the product overview alongside the
// original phrase so that users can still find task guides and troubleshooting.
const overviewAliases = new Map([
  ['interactive live streaming', 'RTC overview'],
  ['broadcast streaming', 'RTC overview'],
  ['start cloud recording', 'Cloud Recording overview'],
  ['cloud recording start', 'Cloud Recording overview'],
  ['transcribe audio', 'Speech-to-Text overview'],
]);

export function getRelatedOverview(intent: SearchIntentResult) {
  return overviewAliases.get(intent.normalizedQuery);
}

const stopWords = new Set(['a', 'an', 'and', 'the', 'with', 'to', 'of']);
function terms(text: string) {
  return tokenizeSearchText(text)
    .filter((word) => !stopWords.has(word))
    .map((word) => word.replace(/([^s])s$/u, '$1'));
}

type Doc = {
  title: string;
  url: string;
  section?: string;
  snippet?: string;
  recordKind: string;
};

export function rankEnglishDocs<T extends Doc>(
  docs: T[],
  intent: SearchIntentResult,
) {
  if (!['product', 'task', 'support'].includes(intent.intent)) return docs;
  const query = terms(intent.normalizedQuery);
  const code = /\berror codes?\s+(\d+)\b/u.exec(intent.normalizedQuery)?.[1];
  function score(doc: Doc) {
    const title = terms(doc.title);
    if (intent.intent === 'product') {
      return Number(
        title.filter((word) => word !== 'overview').join(' ') ===
          query.join(' '),
      );
    }
    if (code) {
      const codeTable = title.includes('error') && title.includes('code');
      return (
        Number(codeTable) +
        Number(terms(doc.section ?? '').includes(code)) +
        Number(codeTable && terms(doc.snippet ?? '').includes(code))
      );
    }
    if (query.length < 2) return 0;
    if (query.every((word) => title.includes(word))) {
      return doc.recordKind === 'faq' ? 2 : 3;
    }
    // An authentication reference with a matching section is more useful
    // than a feature guide which only mentions authentication in its body.
    const section = terms(doc.section ?? '');
    if (
      intent.intent === 'support' &&
      title.some((word) => query.includes(word)) &&
      query.filter((word) => section.includes(word)).length >= 2
    )
      return 1;
    return 0;
  }
  // Algolia can return identical reference titles and section names for several
  // products. Keep the group's first relevance position and give its members a
  // reproducible order across full index replacements.
  const firstByLabel = new Map<string, number>();
  const ranked = docs.map((doc, index) => {
    const relevance = score(doc);
    const label = [
      relevance,
      normalizeSearchText(doc.title),
      normalizeSearchText(doc.section ?? ''),
    ].join('\n');
    const group = relevance > 0 ? (firstByLabel.get(label) ?? index) : index;
    firstByLabel.set(label, group);
    return { doc, relevance, group };
  });
  ranked.sort(
    (a, b) =>
      b.relevance - a.relevance ||
      a.group - b.group ||
      a.doc.url.localeCompare(b.doc.url),
  );
  return ranked.map(({ doc }) => doc);
}
