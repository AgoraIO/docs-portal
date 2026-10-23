import { codePalettes } from '../src/lib/code/theme';

export function contrast(foreground: string, background: string) {
  const luminance = (hex: string) => {
    const rgb = hex
      .replace('#', '')
      .match(/../g)
      ?.map((v) => Number.parseInt(v, 16) / 255);
    if (rgb?.length !== 3) throw new Error(`Expected opaque RGB color: ${hex}`);
    const linear = rgb.map((v) =>
      v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4,
    );
    return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
  };
  const a = luminance(foreground);
  const b = luminance(background);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

if (import.meta.main) {
  const tokens = [
    'text',
    'comment',
    'keyword',
    'string',
    'function',
    'number',
    'punctuation',
  ] as const;
  const backgrounds = [
    'background',
    'header',
    'highlight',
    'added',
    'removed',
  ] as const;
  let valid = true;
  console.log(
    '# Code contrast audit\n\nWCAG 2.x relative luminance and contrast formula, opaque sRGB colors. Required minimum: 4.5:1.\n',
  );
  for (const [mode, palette] of Object.entries(codePalettes)) {
    console.log(
      `## ${mode}\n\n| Token | Foreground | ${backgrounds.join(' | ')} |\n|---|---|${backgrounds.map(() => '---').join('|')}|`,
    );
    console.log(
      `| Background colors | | ${backgrounds.map((b) => palette[b]).join(' | ')} |`,
    );
    for (const token of tokens) {
      const ratios = backgrounds.map((b) =>
        contrast(palette[token], palette[b]),
      );
      if (ratios.some((r) => r < 4.5)) valid = false;
      console.log(
        `| ${token} | ${palette[token]} | ${ratios.map((r) => `${r.toFixed(2)}:1${r < 4.5 ? ' FAIL' : ''}`).join(' | ')} |`,
      );
    }
  }
  console.log(
    `\nResult: ${valid ? 'PASS' : 'FAIL'} (70 combinations).\n\nComments and line numbers share the muted color. Browser verification must additionally confirm the applied CSS, opacity and actual composited backgrounds.`,
  );
  if (!valid) process.exitCode = 1;
}
