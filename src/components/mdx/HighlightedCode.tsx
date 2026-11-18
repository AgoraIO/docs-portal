import { defaultShikiFactory } from 'fumadocs-core/highlight/shiki/full';
import { useShikiDynamic } from 'fumadocs-core/highlight/shiki/react';
import { codeHighlightOptions, codeLanguageAliases } from '@/lib/code/options';

/** Runtime examples use the same grammar, themes and transformers as MDX. */
export function HighlightedCode({
  source,
  language,
}: {
  source: string;
  language: string;
}) {
  return useShikiDynamic(
    () => defaultShikiFactory.getOrInit(),
    source,
    {
      ...codeHighlightOptions,
      lang: codeLanguageAliases[language] ?? language,
      defaultColor: false,
      components: { pre: ({ children }) => <>{children}</> },
      // Keep source and newlines intact in server HTML and during hydration.
      defaultValue: <code data-syntax-pending="">{source}</code>,
    },
    [source, language],
  );
}
