import { describe, expect, it } from 'vitest';
import { generatedStructureFindings } from './lib/api-reference-quality/policy.mjs';

const migrated = (body: string) =>
  `---\n_migration:\n  generator: doxygen\n---\n${body}`;

describe('generated reference structure', () => {
  it('rejects empty separator rows and leaked anchor text in the published source', () => {
    const findings = generatedStructureFindings(
      'content/docs/zh-CN/api-reference/sdk/player.mdx',
      migrated(
        '| Type | Member |\n| --- | --- |\n| void | post() |\n|  |  |\n\n<Slot for="type">\n\n/zh-CN/api-reference/sdk/player#post\nvoid\n\n</Slot>',
      ),
    );
    expect(findings.map((finding: { rule: string }) => finding.rule)).toEqual([
      'empty-generated-table-row',
      'leaked-generated-anchor',
    ]);
  });
  it('preserves real empty cells, destination anchors, code examples and prose links', () => {
    expect(
      generatedStructureFindings(
        'page.mdx',
        migrated(
          '| Type | Member |\n| --- | --- |\n| void | |\n\n<a id="post"></a>\n\n[post](/zh-CN/api-reference/sdk/player#post)\n\n```text\n/zh-CN/api-reference/sdk/player#post\n| | |\n```',
        ),
      ),
    ).toEqual([]);
  });
  it('checks native generated tables as well as GFM without rejecting anchored or partially empty rows', () => {
    const body = `<DocsTable>
<tbody>
<tr><td colSpan={2} /></tr>
<tr><td>/zh-CN/api-reference/sdk/player#post</td><td>post()</td></tr>
<tr><td>void</td><td /></tr>
<tr><td><a id="post"></a></td><td /></tr>
<tr id="legacy"><td colSpan={2} /></tr>
</tbody>
</DocsTable>`;
    expect(
      generatedStructureFindings('player.mdx', migrated(body)).map(
        (finding: { rule: string }) => finding.rule,
      ),
    ).toEqual(['empty-generated-table-row', 'leaked-generated-anchor']);
  });
  it('leaves authored content and other generators to their own source contracts', () => {
    expect(
      generatedStructureFindings(
        'authored.mdx',
        '| A | B |\n| --- | --- |\n| | |',
      ),
    ).toEqual([]);
  });
});

import { planTypeDocStructure } from './lib/api-center/typedoc-structure.mjs';

it('plans source-level TypeDoc signatures and notes without changing their values, links or quotations', () => {
  const source = `---\n_migration:\n  generator: typedoc\n---\n## Properties\n\n<a id="channelname"></a>\n\n### Optional Readonly channelName\n\nchannelName: [string](#string)\n\n#### Example\n\nExample: ordinary explanatory text.\n\n> 注意事项：\n>\n> - Keep \`uid\` unique.\n\n> Quoted words from another source.`;
  const edits = planTypeDocStructure(source);
  expect(
    generatedStructureFindings('typedoc.mdx', source).map(
      (finding: { rule: string }) => finding.rule,
    ),
  ).toEqual(['unstructured-typedoc-property', 'quoted-typedoc-notice']);
  expect(edits.map((edit: { rule: string }) => edit.rule)).toEqual([
    'unstructured-typedoc-property',
    'quoted-typedoc-notice',
  ]);
  let fixed = source;
  for (const edit of [...edits].reverse())
    fixed =
      fixed.slice(0, edit.start) + edit.replacement + fixed.slice(edit.end);
  expect(fixed).toContain('### channelName');
  expect(fixed).toContain('<a id="optional-readonly-channelname"></a>');
  expect(fixed).toContain(
    '<ApiSignature labels="Optional Readonly">\n\nchannelName: [string](#string)',
  );
  expect(fixed).toContain(':::note[注意事项]\n- Keep `uid` unique.\n:::');
  expect(fixed).toContain('> Quoted words from another source.');
  expect(planTypeDocStructure(fixed)).toEqual([]);
  expect(
    planTypeDocStructure(
      source.replace('generator: typedoc', 'generator: authored'),
    ),
  ).toEqual([]);
});

import remarkDirective from 'remark-directive';
import remarkMdx from 'remark-mdx';
import remarkParse from 'remark-parse';
import { unified } from 'unified';

it('preserves notice list ownership and reuses an enclosing callout', () => {
  const source = `---\n_migration:\n  generator: typedoc\n---\n- Audio options\n\n  > 注意事项：\n  >\n  > - Keep \`uid\` unique.\n\n:::info[Compatibility]\n\n> Note: Browser support remains documented.\n:::\n`;
  let fixed = source;
  for (const edit of [...planTypeDocStructure(source)].reverse())
    fixed =
      fixed.slice(0, edit.start) + edit.replacement + fixed.slice(edit.end);
  expect(fixed).toContain('  :::note[注意事项]\n  - Keep `uid` unique.\n  :::');
  const root = unified()
    .use(remarkParse)
    .use(remarkMdx)
    .use(remarkDirective)
    .parse(fixed.replace(/^---\n[\s\S]*?\n---\n/, ''));
  type Branch = { type: string; name?: string | null; children?: Branch[] };
  const directives: { name?: string | null; parents: string[] }[] = [];
  function visit(node: Branch, parents: string[] = []) {
    if (node.type === 'containerDirective')
      directives.push({ name: node.name, parents });
    for (const child of node.children ?? [])
      visit(child, [...parents, node.type]);
  }
  visit(root);
  expect(directives).toHaveLength(2);
  expect(directives.find((d) => d.name === 'note')?.parents).toContain(
    'listItem',
  );
  expect(directives.some((d) => d.parents.includes('containerDirective'))).toBe(
    false,
  );
  expect(fixed).toContain('**Note:**\n\nBrowser support remains documented.');
  expect(planTypeDocStructure(fixed)).toEqual([]);
});
