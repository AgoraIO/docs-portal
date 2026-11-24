import { languageAliasNames, languageNames } from '@shikijs/langs';

export const codeLanguageAliases: Record<string, string> = {
  // ArkTS API declarations retain TypeScript syntax; use the bundled grammar.
  arkts: 'typescript',
  'C++': 'cpp',
  'c++': 'cpp',
  curl: 'bash',
  env: 'dotenv',
  gradle: 'groovy',
  shell: 'bash',
  js: 'javascript',
  node: 'javascript',
  md: 'markdown',
  objectivec: 'objc',
  // ProGuard class/member specifications use Java syntax; retain the label.
  proguard: 'java',
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
