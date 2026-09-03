import { compactSearchText } from './search-normalization';

export type ApiQueryIdentity = {
  canonicalTarget: string;
  retrievalQuery: string;
  target: string;
};

export type ApiIdentityMatch = {
  aliasesExactMatch: boolean;
  titleExactMatch: boolean;
};

const API_QUERY_MODIFIER_TERMS = new Set([
  'api',
  'class',
  'enum',
  'function',
  'interface',
  'method',
  'parameter',
  'property',
]);

const ROOT_CLIENT_ALIASES = new Set([
  'irtcengine',
  'agorartcenginekit',
  'rtcengine',
  'iagorartcclient',
]);

const API_RETRIEVAL_QUERY_ALIASES = new Map([
  ['rtcengine', 'AgoraRtcEngineKit'],
]);

const API_IDENTIFIER_SEGMENT = '[A-Za-z][A-Za-z\\d]*';
const API_IDENTIFIER_DELIMITER = '(?:\\.|::|->)';
const API_QUALIFIED_IDENTIFIER = `${API_IDENTIFIER_SEGMENT}(?:${API_IDENTIFIER_DELIMITER}${API_IDENTIFIER_SEGMENT})*`;
const API_IDENTIFIER_PATTERN = new RegExp(`^${API_IDENTIFIER_SEGMENT}$`, 'u');
const API_QUALIFIED_IDENTIFIER_PATTERN = new RegExp(
  `^${API_QUALIFIED_IDENTIFIER}$`,
  'u',
);
const API_IDENTIFIER_DELIMITER_PATTERN = new RegExp(
  API_IDENTIFIER_DELIMITER,
  'u',
);
const API_IDENTIFIER_DELIMITER_SPLIT_PATTERN = new RegExp(
  API_IDENTIFIER_DELIMITER,
  'u',
);
const API_IDENTIFIER_TOKEN_PATTERN = new RegExp(API_QUALIFIED_IDENTIFIER, 'gu');

export function canonicalizeApiSymbol(value: string) {
  const segments = value
    .normalize('NFKC')
    .trim()
    .split(API_IDENTIFIER_DELIMITER_SPLIT_PATTERN)
    .map(compactSearchText)
    .filter(Boolean);
  if (segments.length === 0) return '';
  if (ROOT_CLIENT_ALIASES.has(segments[0])) segments[0] = 'rtcengine';
  return segments.join('');
}

export function isApiSymbol(query: string) {
  // A symbol is a single identifier. Spaces make the query natural language,
  // even when one of its words happens to contain an uppercase letter.
  if (/\s/u.test(query)) return false;

  const compact = query.replace(/\s+/gu, '');
  if (!compact || compact.length < 2) return false;

  const identifier = compact.replace(/\(\)$/u, '');
  const hasCamelBoundary = /[a-z][A-Z]/u.test(identifier);
  const hasPascalBoundary =
    /[a-z]/u.test(identifier) && /[A-Z].*[A-Z]/u.test(identifier);
  const isIdentifier = API_IDENTIFIER_PATTERN.test(identifier);
  const isDelimitedIdentifier =
    API_QUALIFIED_IDENTIFIER_PATTERN.test(identifier) &&
    API_IDENTIFIER_DELIMITER_PATTERN.test(identifier);
  const hasCallSyntax = compact.endsWith('()');
  const hasApiPunctuation =
    (hasCallSyntax ? isIdentifier : isDelimitedIdentifier) &&
    (hasCamelBoundary || hasPascalBoundary);

  return hasApiPunctuation || hasCamelBoundary || hasPascalBoundary;
}

export function parseApiQueryIdentity(
  query: string,
): ApiQueryIdentity | undefined {
  const normalizedQuery = query.normalize('NFKC').trim();
  const target = isApiSymbol(normalizedQuery)
    ? normalizedQuery
    : (() => {
        const identifiers = (
          normalizedQuery.match(API_IDENTIFIER_TOKEN_PATTERN) ?? []
        ).filter(
          (token) =>
            !API_QUERY_MODIFIER_TERMS.has(token.toLowerCase()) &&
            isApiSymbol(token),
        );
        return identifiers.length === 1 && isApiSymbol(identifiers[0])
          ? identifiers[0]
          : undefined;
      })();
  if (!target) return undefined;

  const canonicalTarget = canonicalizeApiSymbol(target);
  return {
    canonicalTarget,
    retrievalQuery:
      API_RETRIEVAL_QUERY_ALIASES.get(canonicalTarget) ??
      target.replace(/\(\)$/u, ''),
    target,
  };
}

export function getApiRetrievalQuery(query: string) {
  return parseApiQueryIdentity(query)?.retrievalQuery ?? query;
}

export function getApiIdentityMatch(
  fields: Array<string | undefined>,
  identity: ApiQueryIdentity | undefined,
): ApiIdentityMatch {
  if (!identity) {
    return { aliasesExactMatch: false, titleExactMatch: false };
  }

  const titleExactMatch = fields.some(
    (field) =>
      field !== undefined &&
      compactSearchText(field) === compactSearchText(identity.target),
  );
  const canonicalMatch = fields.some(
    (field) =>
      field !== undefined &&
      canonicalizeApiSymbol(field) === identity.canonicalTarget,
  );
  return {
    aliasesExactMatch: !titleExactMatch && canonicalMatch,
    titleExactMatch,
  };
}
