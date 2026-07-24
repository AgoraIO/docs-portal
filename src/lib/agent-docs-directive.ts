export const AGENT_DOCS_DIRECTIVE =
  '> For AI agents: see the complete documentation index at [llms.txt](/llms.txt).';

export function withAgentDocsDirective(markdown: string) {
  if (markdown.includes(AGENT_DOCS_DIRECTIVE)) {
    return markdown;
  }

  const titleMatch = markdown.match(/^# .+(?:\r?\n|$)/);

  if (!titleMatch) {
    return `${AGENT_DOCS_DIRECTIVE}\n\n${markdown}`;
  }

  const title = titleMatch[0].trimEnd();
  const body = markdown.slice(titleMatch[0].length).trimStart();

  return [title, AGENT_DOCS_DIRECTIVE, body].filter(Boolean).join('\n\n');
}
