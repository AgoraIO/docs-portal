import { describe, expect, it } from 'vitest';

import { normalizeApiPrototypeLanguages } from './lib/api-center/code-language.mjs';

const generated = (body: string, platform = 'Cpp') =>
  `---\n_migration:\n  generator: oxygen\n  sourcePath: html-docs/rtc/${platform}/API/callback.html\n---\n\n${body}`;

describe('existing generated prototype language repair', () => {
  it('changes only fence language metadata, preserving literal code and anchors', () => {
    const body =
      '<a id="callback__prototype"></a>\n\n```text title="signature"\nvirtual int callback(const Config& config);\n```\n\n```text\nplain output\n```';
    const original = generated(body);
    const result = normalizeApiPrototypeLanguages(original);
    expect(result.source).toBe(
      original.replace('```text title=', '```cpp title='),
    );
    expect(result.changes).toHaveLength(1);
    expect(normalizeApiPrototypeLanguages(result.source).changes).toEqual([]);
  });
  it('does not change arbitrary examples, explicit grammars, unknown provenance or literal anchors inside code', () => {
    const body =
      '````text\n<a id="literal__prototype"></a>\n```text\nexample\n```\n````\n\n<a id="actual__prototype"></a>\n\n```json\n{}\n```';
    expect(normalizeApiPrototypeLanguages(generated(body)).changes).toEqual([]);
    expect(
      normalizeApiPrototypeLanguages(
        generated(
          '<a id="x__prototype"></a>\n\n```text\nidentifier\n```',
          'Unknown',
        ),
      ).changes,
    ).toEqual([]);
  });
});

import { prototypeLanguageFindings } from './lib/api-reference-quality/policy.mjs';
it('fails source QA for a known prototype mislabeled as plaintext without flagging ordinary output', () => {
  const source = generated(
    '<a id="callback__prototype"></a>\n\n```text\nidentifier\n```\n\n```text\nplain output\n```',
  );
  expect(prototypeLanguageFindings('api.mdx', source)).toEqual([
    expect.objectContaining({
      rule: 'api-prototype-language',
      actual: 'text',
      expected: 'cpp',
    }),
  ]);
  expect(
    prototypeLanguageFindings(
      'api.mdx',
      normalizeApiPrototypeLanguages(source).source,
    ),
  ).toEqual([]);
});

it('repairs a missing language on a known fenced prototype', () => {
  const source = generated(
    '<a id="callback__prototype"></a>\n\n```\nidentifier\n```',
  );
  expect(normalizeApiPrototypeLanguages(source).source).toBe(
    source.replace('```\nidentifier', '```cpp\nidentifier'),
  );
});
