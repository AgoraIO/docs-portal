import { describe, expect, it } from 'vitest';
import { convertHtmlToMdx } from './lib/api-center/html-to-mdx.mjs';
describe('generated API prototype languages', () => {
  it.each([
    ['Cpp', 'cpp'],
    ['Android', 'java'],
    ['iOS', 'objc'],
    ['macOS', 'objc'],
    ['Unity', 'csharp'],
    ['Csharp', 'csharp'],
    ['Flutter', 'dart'],
    ['RN', 'ts'],
    ['Electron', 'ts'],
    ['HarmonyOS', 'ts'],
    ['Unreal-cpp', 'cpp'],
    ['Unreal-blueprint', 'cpp'],
  ])(
    'preserves the known %s prototype language without guessing from its text',
    async (platform, language) => {
      const { body } = await convertHtmlToMdx({
        html: '<article><h1>Callback</h1><section id="callback__prototype"><pre>identifier</pre></section><pre>plain output</pre></article>',
        sourcePath: `html-docs/rtc/${platform}/API/callback.html`,
        sourceUrl: 'https://example.com/api/callback',
      });
      expect(body).toContain('```' + language + '\nidentifier\n```');
      expect(body).toContain('```text\nplain output\n```');
    },
  );
});

describe('explicit source language precedence', () => {
  it('honors an explicit pre language even when the code element has no class', async () => {
    const { body } = await convertHtmlToMdx({
      html: '<article><section id="callback__prototype"><pre class="language-json"><code>{}</code></pre></section></article>',
      sourcePath: 'html-docs/rtc/Cpp/API/callback.html',
      sourceUrl: 'https://example.com/api',
    });
    expect(body).toContain('```json\n{}\n```');
  });
});
