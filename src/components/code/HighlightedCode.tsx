import {
  type CSSProperties,
  Fragment,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { cn } from '@/lib/cn';
import { highlightCode } from '@/lib/code/highlight';
import { prepareCodeSource, splitCodeLines } from '@/lib/code/source';
import { codeTokenVariable } from '@/lib/code/theme';

type Tokens = Awaited<ReturnType<typeof highlightCode>>;

/** Plain text on the server; load only the requested grammar to enhance it. */
export function HighlightedCode({
  source,
  language,
  lineIdPrefix,
}: {
  source: string;
  language: string;
  lineIdPrefix?: string;
}) {
  const prepared = useMemo(() => prepareCodeSource(source), [source]);
  const key = `${language}\u0000${source}`;
  const [result, setResult] = useState<{ key: string; tokens: Tokens }>();
  useEffect(() => {
    let cancelled = false;
    void highlightCode(prepared.source, language)
      .then((tokens) => {
        if (!cancelled) setResult({ key, tokens });
      })
      .catch(() => {
        /* Keep selectable, copyable plain text if a grammar fails. */
      });
    return () => {
      cancelled = true;
    };
  }, [key, prepared.source, language]);
  const tokens = result?.key === key ? result.tokens.tokens : undefined;
  const lines = splitCodeLines(prepared.source);
  return (
    <code className={`language-${language}`} data-highlighted={Boolean(tokens)}>
      {lines.map(({ text: line, number, key: lineKey }) => (
        <Fragment key={lineKey}>
          <span
            id={lineIdPrefix ? `${lineIdPrefix}-${number}` : undefined}
            className={cn(
              'line',
              prepared.highlighted.has(number) && 'highlighted',
              prepared.added.has(number) && 'diff add',
              prepared.removed.has(number) && 'diff remove',
            )}
          >
            {tokens?.[number - 1]
              ? tokens[number - 1].map((token) => (
                  <span
                    key={token.offset}
                    style={
                      {
                        ...token.htmlStyle,
                        '--shiki-light': codeTokenVariable(
                          String(token.htmlStyle?.['--shiki-light'] ?? ''),
                          'light',
                        ),
                        '--shiki-dark': codeTokenVariable(
                          String(token.htmlStyle?.['--shiki-dark'] ?? ''),
                          'dark',
                        ),
                      } as CSSProperties
                    }
                  >
                    {token.content}
                  </span>
                ))
              : line}
          </span>
          {number < lines.length ? '\n' : null}
        </Fragment>
      ))}
    </code>
  );
}
