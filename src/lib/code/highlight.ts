import { createHighlighterCore } from 'shiki/core';
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript';
import { normalizeShellOptions } from './presentation';
import { codeThemes } from './theme';

const languages = {
  javascript: () => import('shiki/langs/javascript.mjs'),
  typescript: () => import('shiki/langs/typescript.mjs'),
  bash: () => import('shiki/langs/bash.mjs'),
  json: () => import('shiki/langs/json.mjs'),
  python: () => import('shiki/langs/python.mjs'),
  java: () => import('shiki/langs/java.mjs'),
  go: () => import('shiki/langs/go.mjs'),
  csharp: () => import('shiki/langs/csharp.mjs'),
  rust: () => import('shiki/langs/rust.mjs'),
  cpp: () => import('shiki/langs/cpp.mjs'),
  swift: () => import('shiki/langs/swift.mjs'),
  dart: () => import('shiki/langs/dart.mjs'),
} as const;
const aliases: Record<string, string> = {
  js: 'javascript',
  node: 'javascript',
  ts: 'typescript',
  shell: 'bash',
  sh: 'bash',
  curl: 'bash',
  py: 'python',
  'c#': 'csharp',
  'c++': 'cpp',
};
let highlighter: ReturnType<typeof createHighlighterCore> | undefined;
const loading = new Map<string, Promise<unknown>>();

export async function highlightCode(source: string, language: string) {
  highlighter ??= createHighlighterCore({
    themes: [codeThemes.light, codeThemes.dark],
    langs: [],
    engine: createJavaScriptRegexEngine(),
  });
  const highlighterInstance = await highlighter;
  const normalized = aliases[language.toLowerCase()] ?? language.toLowerCase();
  const lang =
    normalized in languages ? (normalized as keyof typeof languages) : 'text';
  if (
    lang !== 'text' &&
    !highlighterInstance.getLoadedLanguages().includes(lang)
  ) {
    if (!loading.has(lang))
      loading.set(
        lang,
        languages[lang]().then((module) =>
          highlighterInstance.loadLanguage(module.default),
        ),
      );
    await loading.get(lang);
  }
  const result = highlighterInstance.codeToTokens(source, {
    lang,
    defaultColor: false,
    themes: { light: codeThemes.light.name, dark: codeThemes.dark.name },
    includeExplanation: lang === 'bash' ? 'scopeName' : false,
  });
  if (lang === 'bash') result.tokens = normalizeShellOptions(result.tokens);
  return result;
}
