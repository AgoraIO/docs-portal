import { HighlightedCode } from '@/components/code/HighlightedCode';

/** API examples use the same Shiki themes as compiled documentation. */
export function highlightOpenApiCode({
  language,
  source,
}: {
  language: string;
  source: string;
}) {
  return <HighlightedCode language={language} source={source} />;
}
