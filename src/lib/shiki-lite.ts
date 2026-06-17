import { createBundledHighlighter } from '@shikijs/core';
import { createJavaScriptRegexEngine } from '@shikijs/engine-javascript';
import { createOnigurumaEngine } from '@shikijs/engine-oniguruma';

export * from '@shikijs/core';

const languageAliases = {
  csharp: ['cs'],
  javascript: ['js'],
  markdown: ['md'],
  powershell: ['ps1'],
  shellscript: ['shell', 'sh', 'zsh'],
  toml: ['ini'],
  typescript: ['ts'],
} as const;

const createHighlighter = createBundledHighlighter({
  engine: createJavaScriptRegexEngine,
  langs: {
    bash: () => import('@shikijs/langs/bash'),
    c: () => import('@shikijs/langs/c'),
    csharp: () => import('@shikijs/langs/csharp'),
    go: () => import('@shikijs/langs/go'),
    java: () => import('@shikijs/langs/java'),
    javascript: () => import('@shikijs/langs/javascript'),
    json: () => import('@shikijs/langs/json'),
    kotlin: () => import('@shikijs/langs/kotlin'),
    objc: () => import('@shikijs/langs/objc'),
    php: () => import('@shikijs/langs/php'),
    powershell: () => import('@shikijs/langs/powershell'),
    python: () => import('@shikijs/langs/python'),
    shellscript: () => import('@shikijs/langs/shellscript'),
    swift: () => import('@shikijs/langs/swift'),
    toml: () => import('@shikijs/langs/toml'),
    tsx: () => import('@shikijs/langs/tsx'),
    typescript: () => import('@shikijs/langs/typescript'),
  },
  langAlias: languageAliases,
  themes: {
    'github-dark': () => import('@shikijs/themes/github-dark'),
    'github-light': () => import('@shikijs/themes/github-light'),
  },
});

export {
  createHighlighter,
  createJavaScriptRegexEngine,
  createOnigurumaEngine,
};
