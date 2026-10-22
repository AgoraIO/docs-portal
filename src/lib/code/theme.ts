import type { ThemeRegistration } from 'shiki';

export const codePalettes = {
  light: {
    background: '#f4f6f8',
    header: '#e9edf2',
    text: '#253444',
    comment: '#536273',
    keyword: '#6b3a9b',
    string: '#14603d',
    function: '#1a559c',
    number: '#8a3b20',
    punctuation: '#536273',
    highlight: '#e5ebf4',
    added: '#e3efe7',
    removed: '#f6e6e7',
  },
  dark: {
    background: '#131b28',
    header: '#1b2636',
    text: '#dce6f3',
    comment: '#a4b3c6',
    keyword: '#d4b0f5',
    string: '#a5d4b3',
    function: '#a9caff',
    number: '#efc39b',
    punctuation: '#b8c5d6',
    highlight: '#243146',
    added: '#19392d',
    removed: '#422833',
  },
} as const;

function theme(mode: 'light' | 'dark'): ThemeRegistration & { name: string } {
  const p = codePalettes[mode];
  return {
    name: `agora-code-${mode}`,
    type: mode,
    fg: p.text,
    bg: p.background,
    colors: { 'editor.foreground': p.text, 'editor.background': p.background },
    tokenColors: [
      {
        scope: ['comment', 'punctuation.definition.comment'],
        settings: { foreground: p.comment },
      },
      {
        scope: [
          'keyword',
          'storage',
          'storage.type',
          'storage.modifier',
          'constant.language',
        ],
        settings: { foreground: p.keyword },
      },
      {
        scope: ['string', 'string.quoted', 'markup.inline.raw'],
        settings: { foreground: p.string },
      },
      {
        scope: [
          'entity.name.function',
          'support.function',
          'entity.name.type',
          'support.type',
          'entity.name.tag',
          'meta.object-literal.key',
          'support.type.property-name.json',
        ],
        settings: { foreground: p.function },
      },
      {
        scope: ['constant.numeric', 'constant.character', 'constant.other'],
        settings: { foreground: p.number },
      },
      {
        scope: ['punctuation', 'keyword.operator', 'meta.brace'],
        settings: { foreground: p.punctuation },
      },
    ],
  };
}
export const codeThemes = { light: theme('light'), dark: theme('dark') };

export function codeTokenVariable(color: string, mode: 'light' | 'dark') {
  const palette = codePalettes[mode];
  const role = (
    [
      'text',
      'comment',
      'keyword',
      'string',
      'function',
      'number',
      'punctuation',
    ] as const
  ).find((key) => palette[key].toLowerCase() === color.toLowerCase());
  return role ? `var(--code-token-${role})` : color;
}
