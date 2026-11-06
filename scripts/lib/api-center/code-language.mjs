import { load } from 'js-yaml';
import remarkParse from 'remark-parse';
import { unified } from 'unified';

// The migration provenance names the SDK language; snippet text is not evidence.
const platformLanguages = {
  cpp: 'cpp',
  android: 'java',
  ios: 'objc',
  macos: 'objc',
  unity: 'csharp',
  csharp: 'csharp',
  flutter: 'dart',
  rn: 'ts',
  electron: 'ts',
  harmonyos: 'ts',
  'unreal-cpp': 'cpp',
  'unreal-blueprint': 'cpp',
};
export function apiPrototypeLanguage(sourcePath = '') {
  const segments = sourcePath.replaceAll('\\', '/').split('/');
  return segments[0] === 'html-docs'
    ? platformLanguages[segments[2]?.toLowerCase()]
    : undefined;
}

const parser = unified().use(remarkParse);

// Repair only generated prototype fence metadata. All code bytes, anchors,
// examples, explicit grammars and unknown-language/plain-output blocks stay exact.
export function normalizeApiPrototypeLanguages(source) {
  const frontmatter = source.match(
    /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/,
  )?.[1];
  if (!frontmatter) return { source, changes: [] };
  const migration = load(frontmatter)?._migration;
  const language = apiPrototypeLanguage(migration?.sourcePath);
  if (migration?.generator !== 'oxygen' || !language)
    return { source, changes: [] };
  const changes = [];
  function visit(node) {
    if (
      node.type === 'code' &&
      (!node.lang || ['text', 'plaintext', 'txt'].includes(node.lang))
    ) {
      const offset = node.position.start.offset;
      const anchor = source
        .slice(0, offset)
        .match(/<a\s+id=["']([^"']+__prototype)["']\s*><\/a>\s*$/)?.[1];
      const opening = source
        .slice(offset)
        .match(
          /^([ \t]*)(`{3,}|~{3,})([ \t]*)(text|plaintext|txt)?(?=[ \t\r\n])/,
        );
      if (anchor && opening) {
        const start =
          offset + opening[1].length + opening[2].length + opening[3].length;
        changes.push({
          start,
          end: start + (opening[4]?.length ?? 0),
          line: node.position.start.line,
          anchor,
          from: node.lang ?? '',
          to: language,
        });
      }
    }
    for (const child of node.children ?? []) visit(child);
  }
  visit(parser.parse(source));
  let normalized = source;
  for (const { start, end, to } of [...changes].reverse())
    normalized = normalized.slice(0, start) + to + normalized.slice(end);
  return { source: normalized, changes };
}
