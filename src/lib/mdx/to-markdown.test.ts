import { readFileSync } from 'node:fs';
import { remarkGfm } from 'fumadocs-core/mdx-plugins/remark-gfm';
import remarkMdx from 'remark-mdx';
import remarkParse from 'remark-parse';
import { unified } from 'unified';
import { visit } from 'unist-util-visit';
import { describe, expect, it } from 'vitest';
import { toDocsMarkdown } from './to-markdown';

describe('documentation Markdown export', () => {
  it('keeps static expression strings as literal text instead of Markdown formatting', () => {
    const markdown = toDocsMarkdown(
      '{"*required*"}\n\n{"[x](https://example.com)"}\n\nUse {"*required*"}.',
    );
    const tree = unified().use(remarkParse).parse(markdown);
    const text: string[] = [];
    visit(tree, 'text', (node) => {
      text.push(node.value);
    });
    expect(text).toEqual([
      '*required*',
      '[x](https://example.com)',
      'Use *required*.',
    ]);
  });

  it.each([
    '<table><tr><th>Value</th><th>Other</th></tr><tr><td><code>a|b</code></td><td>ok</td></tr></table>',
    '| Value | Other |\n| --- | --- |\n| <code>a\\|b</code> | ok |',
    '| Value | Other |\n| --- | --- |\n| `a\\|b` | ok |',
  ])('preserves pipe characters in inline code inside tables: %s', (source) => {
    const tree = unified()
      .use(remarkParse)
      .use(remarkGfm)
      .parse(toDocsMarkdown(source));
    const values: string[] = [];
    visit(tree, 'tableRow', (node) => {
      expect(node.children).toHaveLength(2);
    });
    visit(tree, 'inlineCode', (node) => {
      values.push(node.value);
    });
    expect(values).toEqual(['a|b']);
  });

  it('preserves inline HTML code identifiers, backslashes and backticks literally', () => {
    const markdown = toDocsMarkdown(
      'Use <code>start_time</code>, <code>libagora_video_process_extension.so</code>, <kbd>C:\\Users</kbd>, and <code>a`b</code>.',
    );
    const values: string[] = [];
    visit(unified().use(remarkParse).parse(markdown), 'inlineCode', (node) => {
      values.push(node.value);
    });
    expect(values).toEqual([
      'start_time',
      'libagora_video_process_extension.so',
      'C:\\Users',
      'a`b',
    ]);
  });

  it('keeps parameter defaults, allowed values and required/optional/nullable state', () => {
    const markdown = toDocsMarkdown(
      '<ParameterList title="Metadata" nullable optional>\n<Parameter name="state" type="string" required={false} nullable possibleValues="START, ANSWERED" defaultValue="START">State.</Parameter>\n<Parameter name="limit" type="number" required defaultValue={0}>Maximum.</Parameter>\n</ParameterList>',
    );
    expect(markdown).toContain('**Metadata optional nullable**');
    expect(markdown).toContain('**`state` (string) optional nullable**');
    expect(markdown).toContain('Default value: `START`');
    expect(markdown).toContain('Possible values: `START, ANSWERED`');
    expect(markdown).toContain('**`limit` (number) required**');
    expect(markdown).toContain('Default value: `0`');
    expect(markdown).toContain('State.');
  });

  it('keeps pipe characters in parameter defaults inside HTML table cells', () => {
    const markdown = toDocsMarkdown(
      '<table><tr><th>Value</th></tr><tr><td><Parameter name="option" defaultValue="a|b" /></td></tr></table>',
    );
    const tree = unified().use(remarkParse).use(remarkGfm).parse(markdown);
    const values: string[] = [];
    visit(tree, 'tableRow', (node) => {
      expect(node.children).toHaveLength(1);
    });
    visit(tree, 'inlineCode', (node) => {
      values.push(node.value);
    });
    expect(values).toEqual(['option', 'a|b']);
  });

  it.each([
    [
      'ai/best-practices/regional-restrictions.mdx',
      'Possible values: `GLOBAL, NORTH_AMERICA, EUROPE, ASIA, INDIA, JAPAN`',
    ],
    [
      'ai/models/mllm/openai-gpt-live.mdx',
      'Default value: `wss://api.openai.com/v1/live/sessions`',
    ],
  ])('retains parameter contract details in %s', (path, value) => {
    const source = readFileSync(`content/docs/en/${path}`, 'utf8').replace(
      /^---\r?\n[\s\S]*?\r?\n---\r?\n/,
      '',
    );
    expect(toDocsMarkdown(source)).toContain(value);
  });

  it.each([
    'api-reference/api-ref/speech-to-text/rest-api-v5/query.mdx',
    'api-reference/faq/integration/rtm2_rtc_integration_issue.mdx',
    'realtime-media/speech-to-text/build/process-transcription-data/parse-data.mdx',
    'api-reference/faq/quality/adjust_music_volume.mdx',
  ])('preserves code values and languages in legacy content: %s', (path) => {
    const source = readFileSync(`content/docs/en/${path}`, 'utf8').replace(
      /^---\r?\n[\s\S]*?\r?\n---\r?\n/,
      '',
    );
    const original = unified()
      .use(remarkParse)
      .use(remarkMdx)
      .use(remarkGfm)
      .parse(source);
    const exported = unified()
      .use(remarkParse)
      .use(remarkGfm)
      .parse(toDocsMarkdown(source));
    function codes(tree: typeof original) {
      const values: { lang?: string | null; value: string }[] = [];
      visit(tree, 'code', (node) => {
        values.push({ lang: node.lang, value: node.value });
      });
      return values;
    }
    expect(codes(exported)).toEqual(codes(original));
  });
  it('keeps nested tab labels scoped to their own group and exports every alternative', () => {
    const markdown = toDocsMarkdown(`<Tabs>
<TabsList>
<TabsTrigger value="a">Outer A</TabsTrigger>
<TabsTrigger value="b">Outer B</TabsTrigger>
</TabsList>
<TabsContent value="a">
<Tabs items={['Inner A', 'Inner B']}>
<Tab>First nested choice.</Tab>
<Tab>Second nested choice.</Tab>
</Tabs>
</TabsContent>
<TabsContent value="b">Outer choice B.</TabsContent>
</Tabs>`);

    expect(markdown).toContain('**Outer A**');
    expect(markdown).toContain('**Outer B**\n\nOuter choice B.');
    expect(markdown).toContain('**Inner A**\n\nFirst nested choice.');
    expect(markdown).toContain('**Inner B**\n\nSecond nested choice.');
    expect(markdown).not.toMatch(/<\/?\w/);
  });

  it('preserves language, metadata, indentation, HTML, braces and blank lines inside code', () => {
    const code =
      '```tsx title="example.tsx"\nfunction Demo() {\n  return <Tabs>\n    <div>{"hello"}</div>\n\n  </Tabs>;\n}\n```';
    const markdown = toDocsMarkdown(`<CodeBlockTabs>
<CodeBlockTabsList>
<CodeBlockTabsTrigger value="tsx">React example</CodeBlockTabsTrigger>
</CodeBlockTabsList>
<CodeBlockTab value="tsx">

${code}

</CodeBlockTab>
</CodeBlockTabs>`);

    expect(markdown).toBe(`**React example**\n\n${code}\n`);
    expect(toDocsMarkdown(markdown)).toBe(markdown);
  });

  it('keeps code nested in list items and callouts valid', () => {
    const markdown = toDocsMarkdown(`1. Install the SDK.

   <Callout type="warning" title="Credentials">

   Keep your token private.

   \`\`\`python
   if ready:
       connect(token)
   \`\`\`

   </Callout>

2. Join the channel.`);

    expect(markdown).toContain('   > **Credentials**');
    expect(markdown).toContain(
      '   > ```python\n   > if ready:\n   >     connect(token)\n   > ```',
    );
    expect(markdown).toContain('2. Join the channel.');
    expect(markdown).not.toContain('<Callout');
  });

  it('renders authored directive titles and nested Markdown as blockquotes', () => {
    expect(
      toDocsMarkdown(':::caution[Token expiry]\nTokens **expire**.\n:::'),
    ).toBe('> **Caution: Token expiry**\n>\n> Tokens **expire**.\n');
    expect(
      toDocsMarkdown(
        '<CalloutContainer type="info">\n<CalloutTitle>{"Note"}</CalloutTitle>\n<CalloutDescription>Keep [this link](/help).</CalloutDescription>\n</CalloutContainer>',
      ),
    ).toBe('> **Note**\n>\n> Keep [this link](/help).\n');
  });

  it('preserves card titles, descriptions, destinations, images and inline formatting', () => {
    const markdown = toDocsMarkdown(`<Cards>
<Card title="Quickstart" href="/start" description="Build an app." />
</Cards>

An <a href="/reference">API reference</a> and <strong>important</strong> <code>App ID</code>.

<img src="/workflow.svg" alt="Call workflow" />`);

    expect(markdown).toContain('**[Quickstart](/start)**\n\nBuild an app.');
    expect(markdown).toContain(
      'An [API reference](/reference) and **important** `App ID`.',
    );
    expect(markdown).toContain('![Call workflow](/workflow.svg)');
    expect(markdown).not.toMatch(/<\/?\w/);
  });

  it('keeps accordion titles and unknown wrapper contents without UI attributes', () => {
    const markdown = toDocsMarkdown(
      '<Accordions>\n<Accordion title="SDK 4.7" headingLevel={2}>\n\n<CustomWrapper className="noise">Content with `x < y`.</CustomWrapper>\n\n</Accordion>\n</Accordions>',
    );
    expect(markdown).toContain('### SDK 4.7\n\nContent with `x < y`.');
    expect(markdown).not.toMatch(/CustomWrapper|className|Accordion/);
  });

  it('removes imports and comments and reads literal expressions without executing JavaScript', () => {
    const markdown = toDocsMarkdown(
      'import Example from "./example";\n\n{/* hidden */}\n\nHello {"world"}.\n\n{globalThis.secret()}',
    );
    expect(markdown).toContain('Hello world.');
    expect(markdown).toContain('`globalThis.secret()`');
    expect(markdown).not.toMatch(/import Example|hidden/);
  });

  it('does not change plain Markdown or inline and fenced HTML samples', () => {
    const markdown =
      '# Example\n\n- Use `<Card />` here.\n\n```html\n<div class="example">\n  {keep_this}\n</div>\n```\n';
    expect(toDocsMarkdown(markdown)).toBe(markdown);
  });

  it('labels Markdown-authored code tabs without changing their code or other metadata', () => {
    expect(
      toDocsMarkdown(
        '```bash tab="npm" tabGroup="packages" title="Install"\nnpm install agora\n```',
      ),
    ).toBe('**npm**\n\n```bash title="Install"\nnpm install agora\n```\n');
  });

  it('keeps table slot code and callouts in linked detail sections', () => {
    const markdown = toDocsMarkdown(`| Field | Description |
| --- | --- |
| token | <Slot name="token" /> |

<Slot for="token">

:::note[Expiry]
Refresh the token before it expires.
:::

\`\`\`json
{ "token": "<YOUR_TOKEN>" }
\`\`\`

</Slot>`);
    expect(markdown).toContain('| token | [token details](#token-details) |');
    expect(markdown).toContain('#### token details');
    expect(markdown).toContain('> **Note: Expiry**');
    expect(markdown).toContain('```json\n{ "token": "<YOUR_TOKEN>" }\n```');
    expect(markdown).not.toContain('<Slot');
  });

  it('keeps inline HTML lists inside a single GFM table cell', () => {
    const markdown = toDocsMarkdown(
      '| Options |\n| --- |\n| <ul><li>First</li><li>Second</li></ul> |',
    );
    const tree = unified().use(remarkParse).use(remarkGfm).parse(markdown);
    expect(tree.children).toHaveLength(1);
    expect(tree.children[0].type).toBe('table');
    expect(markdown).toContain('First; Second');
    expect(markdown).not.toMatch(/<\/?(?:ul|li)>/);
  });

  it('flattens merged HTML table headers without joining separate cell values', () => {
    const markdown = toDocsMarkdown(
      '<table>\n<tbody>\n<tr><th rowSpan={2}>Date</th><th colSpan={2}>Usage</th></tr>\n<tr><th>Audio</th><th>Video</th></tr>\n<tr><td>Feb 4</td><td>6,000</td><td>0</td></tr>\n</tbody>\n</table>',
    );
    const tree = unified().use(remarkParse).use(remarkGfm).parse(markdown);
    expect(tree.children[0].type).toBe('table');
    expect(markdown).toMatch(
      /\| Date\s*\| Usage \/ Audio\s*\| Usage \/ Video\s*\|/,
    );
    expect(markdown).toMatch(/\| Feb 4\s*\| 6,000\s*\| 0\s*\|/);
    expect(markdown).not.toMatch(/<\/?(?:table|tr|th|td)/);
  });

  it('keeps structured component props as readable content', () => {
    const markdown = toDocsMarkdown(
      "<CapabilityMatrix rows={[{title: 'Interact', description: 'Exchange media.', items: ['Video', 'Chat']}]} />",
    );
    expect(markdown).toContain('**Interact**');
    expect(markdown).toContain('Exchange media.');
    expect(markdown).toContain('Video');
    expect(markdown).toContain('Chat');
    expect(markdown).not.toContain('CapabilityMatrix');
  });

  it('removes HTML comments and converts void HTML tags without touching code samples', () => {
    const markdown = toDocsMarkdown(
      '<!-- Author note -->\n\n<img src="/flow.svg" alt="Flow">\n\nA<br>line break.\n\n```html\n<!-- Keep this comment -->\n<br>\n```',
    );
    expect(markdown).not.toContain('Author note');
    expect(markdown).toContain('![Flow](/flow.svg)');
    expect(markdown).toContain('A\nline break.');
    expect(markdown).toContain(
      '```html\n<!-- Keep this comment -->\n<br>\n```',
    );
    expect(toDocsMarkdown('<!-- Author note -->Keep this content.')).toBe(
      'Keep this content.\n',
    );
  });
});
