import { expect, it } from 'vitest';
import { convertHtmlToMdx } from './lib/api-center/html-to-mdx.mjs';

it('omits Doxygen decoration rows and preserves real cells and destination anchors', async () => {
  const result = await convertHtmlToMdx({
    html: `<div class="contents"><div class="textblock"><table class="memberdecls">
      <tr class="heading"><td colspan="2"><h2><a href="#methods" id="methods"></a>Methods</h2></td></tr>
      <tr><td><a href="#post" id="post"></a>void</td><td>post()</td></tr>
      <tr class="separator"><td class="memSeparator" colspan="2">&#160;</td></tr>
      <tr><td>int</td><td></td></tr>
      </table></div></div>`,
    sourcePath: 'html-docs/sdk/Android/player.html',
    sourceUrl: 'https://example.com/api/player',
    rootSelector: '.contents',
  });
  expect(result.body).not.toContain('<td colSpan={2} />');
  expect(result.body).toContain('<a id="post"></a>');
  expect(result.body).toContain('void');
  expect(result.body).toContain('<td>int</td>');
  expect(result.body).toContain('<td />');
  expect(result.body).not.toContain('https://example.com/api/player#post');
});
