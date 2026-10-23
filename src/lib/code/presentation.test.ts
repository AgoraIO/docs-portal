import { expect, it } from 'vitest';
import { highlightCode } from './highlight';
import { codePalettes } from './theme';

it('gives runtime curl options the same color without changing command text', async () => {
  const source = String.raw`curl --location -X POST \
--header 'Content-Type: application/json' \
--data '{"value":"literal --header"}'`;
  const { tokens } = await highlightCode(source, 'bash');
  expect(
    tokens
      .map((line) => line.map((token) => token.content).join(''))
      .join('\n'),
  ).toBe(source);
  const flags = tokens
    .flat()
    .filter((token) => /^--?[a-zA-Z][\w-]*$/.test(token.content));
  expect(flags.map((token) => token.content)).toEqual([
    '--location',
    '-X',
    '--header',
    '--data',
  ]);
  for (const flag of flags) {
    expect(flag.htmlStyle?.['--shiki-light']).toBe(codePalettes.light.number);
    expect(flag.htmlStyle?.['--shiki-dark']).toBe(codePalettes.dark.number);
  }
  expect(
    tokens
      .flat()
      .find((token) => token.content.includes('literal --header'))
      ?.htmlStyle?.['--shiki-light']?.toLowerCase(),
  ).toBe(codePalettes.light.string);
});

it('leaves option-like strings, comments and heredoc payloads under their original grammar', async () => {
  const source = `printf '%s' "literal --quoted"\n# --comment\ncat <<'EOF'\n--payload\nEOF`;
  const { tokens } = await highlightCode(source, 'bash');
  for (const text of ['--quoted', '--comment', '--payload']) {
    const matches = tokens
      .flat()
      .filter((token) => token.content.includes(text));
    expect(matches.length).toBeGreaterThan(0);
    for (const token of matches)
      expect(token.htmlStyle?.['--shiki-light']).not.toBe(
        codePalettes.light.number,
      );
  }
});
