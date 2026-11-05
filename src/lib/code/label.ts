import { codeLanguageAliases } from './languages';

const labels: Record<string, string> = {
  bash: 'Bash',
  c: 'C',
  cpp: 'C++',
  'c++': 'C++',
  csharp: 'C#',
  cs: 'C#',
  'c#': 'C#',
  css: 'CSS',
  curl: 'cURL',
  dart: 'Dart',
  go: 'Go',
  html: 'HTML',
  http: 'HTTP',
  java: 'Java',
  javascript: 'JavaScript',
  json: 'JSON',
  jsx: 'JSX',
  kotlin: 'Kotlin',
  markdown: 'Markdown',
  objc: 'Objective-C',
  php: 'PHP',
  powershell: 'PowerShell',
  python: 'Python',
  py: 'Python',
  ruby: 'Ruby',
  rb: 'Ruby',
  rust: 'Rust',
  sh: 'Shell',
  shell: 'Shell',
  shellscript: 'Shell',
  sql: 'SQL',
  swift: 'Swift',
  text: 'Text',
  plaintext: 'Text',
  ts: 'TypeScript',
  tsx: 'TSX',
  typescript: 'TypeScript',
  xml: 'XML',
  yaml: 'YAML',
  yml: 'YAML',
};

export function getCodeLanguageLabel(language: string | undefined) {
  if (!language) return undefined;
  return labels[language] ?? labels[codeLanguageAliases[language]] ?? language;
}
