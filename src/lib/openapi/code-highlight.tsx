import type { ReactNode } from 'react';

type OpenApiCodeHighlightOptions = {
  language: string;
  source: string;
};

type Token = {
  className: string;
  key: string;
  value: string;
};

const LANGUAGE_ALIASES: Record<string, string> = {
  bash: 'bash',
  curl: 'bash',
  js: 'javascript',
  javascript: 'javascript',
  node: 'javascript',
  python: 'python',
  py: 'python',
  json: 'json',
};

const TOKEN_PATTERN =
  /(--[a-z][\w-]*|https?:\/\/[^\s'"\\]+|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\b\d+(?:\.\d+)?\b|[{}[\](),:;]|\b(?:curl|import|from|const|let|var|await|async|return|def|fetch|stringify|True|False|None|null|true|false)\b)/g;

export function highlightOpenApiCode({
  language,
  source,
}: OpenApiCodeHighlightOptions): ReactNode {
  const normalizedLanguage =
    LANGUAGE_ALIASES[language.toLowerCase()] ?? language;
  const lines = source.replace(/\n$/, '').split('\n');
  const lineKeys = new Map<string, number>();

  return (
    <code className={`language-${normalizedLanguage}`}>
      {lines.map((line) => {
        const occurrence = (lineKeys.get(line) ?? 0) + 1;
        lineKeys.set(line, occurrence);

        return (
          <span className="line" key={`${line}:${occurrence}`}>
            {tokenizeLine(line, normalizedLanguage).map((token) => (
              <span className={token.className} key={token.key}>
                {token.value}
              </span>
            ))}
          </span>
        );
      })}
    </code>
  );
}

function tokenizeLine(line: string, language: string): Token[] {
  const tokens: Token[] = [];
  let cursor = 0;

  for (const match of line.matchAll(TOKEN_PATTERN)) {
    const value = match[0];
    const start = match.index ?? cursor;

    if (start > cursor) {
      tokens.push({
        className: 'token-plain',
        key: `${cursor}:${start}`,
        value: line.slice(cursor, start),
      });
    }

    tokens.push(...getTokenParts(value, line, start, language));
    cursor = start + value.length;
  }

  if (cursor < line.length) {
    tokens.push({
      className: 'token-plain',
      key: `${cursor}:${line.length}`,
      value: line.slice(cursor),
    });
  }

  return tokens.length > 0
    ? tokens
    : [{ className: 'token-plain', key: 'empty', value: line }];
}

function getTokenParts(
  value: string,
  line: string,
  start: number,
  language: string,
): Token[] {
  if (/^['"]/.test(value) && /[[{]/.test(value)) {
    const quote = value[0];
    const inner = value.slice(1, -1);

    return [
      { className: 'token-string', key: 'open-quote', value: quote },
      ...tokenizeLine(inner, 'json'),
      { className: 'token-string', key: 'close-quote', value: quote },
    ];
  }

  return [
    {
      className: getTokenClass(value, line, start, language),
      key: `${start}:${value}`,
      value,
    },
  ];
}

function getTokenClass(
  value: string,
  line: string,
  start: number,
  language: string,
) {
  if (value.startsWith('--')) return 'token-flag';
  if (/^https?:\/\//.test(value)) return 'token-url';
  if (/^\d/.test(value)) return 'token-number';
  if (/^[{}[\](),:;]$/.test(value)) return 'token-punctuation';
  if (
    /^(curl|import|from|const|let|var|await|async|return|def|True|False|None|null|true|false)$/.test(
      value,
    )
  ) {
    return language === 'bash' && value === 'curl'
      ? 'token-command'
      : 'token-keyword';
  }
  if (/^(fetch|stringify)$/.test(value)) return 'token-function';
  if (/^['"]/.test(value)) {
    const after = line.slice(start + value.length);
    return /^\s*:/.test(after) ? 'token-key' : 'token-string';
  }
  return 'token-plain';
}
