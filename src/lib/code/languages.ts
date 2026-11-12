import { languageAliasNames, languageNames } from '@shikijs/langs';

export const codeLanguageAliases: Record<string, string> = {
  // ArkTS API declarations retain TypeScript syntax; use the bundled grammar.
  arkts: 'typescript',
  curl: 'bash',
  shell: 'bash',
  js: 'javascript',
  node: 'javascript',
  md: 'markdown',
  objectivec: 'objc',
  txt: 'text',
};

export const codeLanguageNames: ReadonlySet<string> = new Set([
  ...languageNames,
  ...languageAliasNames,
  ...Object.keys(codeLanguageAliases),
  ...Object.values(codeLanguageAliases),
  'text',
  'plaintext',
]);
