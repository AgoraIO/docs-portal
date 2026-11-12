import { expect, it } from 'vitest';
import {
  API_CENTER_GENERATOR_CONVERSION_OPTIONS,
  convertHtmlToMdx,
} from './lib/api-center/html-to-mdx.mjs';

const convert = (body: string) =>
  convertHtmlToMdx({
    html: `<div class="col-content">${body}</div>`,
    sourcePath: 'html-docs/rtc/Web/interfaces/client.html',
    sourceUrl: 'https://example.com/api/client',
    rootSelector: '.col-content',
  });

it('preserves Docusaurus admonition semantics, title and body despite CSS-module wrappers', async () => {
  const result = await convert(
    '<div class="theme-admonition theme-admonition-caution alert alert--warning admonition_WoCw"><div class="w-flex"><span>注意</span></div><div class="w-flex"><div class="admonitionContent_vXIg"><p>Keep <code>uid</code> unique.</p><ul><li>Preserve this condition.</li></ul></div></div></div>',
  );
  expect(result.body).toContain(':::caution[注意]');
  expect(result.body).toContain('Keep `uid` unique.');
  expect(result.body).toContain('- Preserve this condition.');
  expect(result.body.match(/注意/g)).toHaveLength(1);
});

it('applies the legacy TypeDoc parser contract only when that generator is selected', async () => {
  const input = {
    html: '<div class="col-content"><div class="tsd-comment"><blockquote><p>Preserve this condition.</p></blockquote></div></div>',
    sourcePath: 'html-docs/rtc/Web/interfaces/client.html',
    sourceUrl: 'https://example.com/api/client',
  };
  const legacy = await convertHtmlToMdx({
    ...input,
    ...API_CENTER_GENERATOR_CONVERSION_OPTIONS.typedoc,
  });
  expect(legacy.body).toContain(
    ':::caution[注意]\nPreserve this condition.\n:::',
  );
  const ordinary = await convertHtmlToMdx({
    ...input,
    rootSelector: '.col-content',
  });
  expect(ordinary.body).toContain('> Preserve this condition.');
});

it('keeps TypeDoc property modifiers as signature metadata, with a real property declaration', async () => {
  const result = await convert(
    '<section class="tsd-member tsd-kind-property"><a id="channelname"></a><h3><span class="tsd-flag">Optional</span> <span class="tsd-flag">Readonly</span> channelName</h3><div class="tsd-signature tsd-kind-icon">channelName<span class="tsd-signature-symbol">:</span> <span class="tsd-signature-type">string</span></div><p>The channel.</p></section>',
  );
  expect(result.body).toContain('### channelName');
  expect(result.body).toContain('<ApiSignature labels="Optional Readonly">');
  expect(result.body).toContain('channelName: string');
  expect(result.body).toContain('<a id="channelname"></a>');
  expect(result.body).toContain('The channel.');
});

it('maps explicitly labeled notes to standard callouts and preserves actual quotations', async () => {
  const result = await convert(
    '<blockquote><p>注意事项：</p><ul><li>Keep <code>uid</code> unique.</li></ul></blockquote><blockquote><p>Quoted words from another source.</p></blockquote>',
  );
  expect(result.body).toContain(':::note[注意事项]');
  expect(result.body).toContain('- Keep `uid` unique.');
  expect(result.body).not.toContain('> 注意事项');
  expect(result.body).toContain('> Quoted words from another source.');
});

it('reuses HTML callout and comment-tag containers instead of nesting callout fences', async () => {
  for (const html of [
    '<div class="admonition note"><blockquote><p>Note: Keep this text.</p></blockquote></div>',
    '<dl class="tsd-comment-tags"><dt>since</dt><dd><p>4.17.1</p><blockquote><p>Note: Keep this text.</p></blockquote></dd></dl>',
  ]) {
    const result = await convert(html);
    expect(result.body.match(/^:::\w/gm)).toHaveLength(1);
    expect(result.body).toContain('**Note:**\n\nKeep this text.');
  }
});

it('reuses a deprecated comment-tag notice for nested notes', async () => {
  const result = await convert(
    '<dl class="tsd-comment-tags"><dt>deprecated</dt><dd><p>Use the current callback.</p><blockquote><p>Note: Keep this condition.</p></blockquote></dd></dl>',
  );
  expect(result.body).toContain(':::warning[deprecated]');
  expect(result.body).toContain('**Note:**\n\nKeep this condition.');
  expect(result.body.match(/^:::\w/gm)).toHaveLength(1);
});
