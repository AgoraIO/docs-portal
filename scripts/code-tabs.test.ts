import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { codeTabFiles, normalizeCodeTabs } from './normalize-code-tabs.mjs';

const example = (
  extra = '',
) => `<Tabs defaultValue="python3" groupId="example" persist>
<TabsList>
  <TabsTrigger value="python3">Python3</TabsTrigger>
  <TabsTrigger value="php">PHP</TabsTrigger>
</TabsList>
<TabsContent value="python3">

${extra}
\`\`\`py
  print("<Tabs> is code")
\`\`\`

</TabsContent>
<TabsContent value="php">

\`\`\`php
echo 'hello';
\`\`\`

</TabsContent>
</Tabs>`;

describe('code tab source normalization', () => {
  it('preserves code bytes, historical anchors, values and persistence', () => {
    const source = example('<a id="sample-code"></a>');
    const result = normalizeCodeTabs(source);
    expect(result.count).toBe(1);
    expect(result.source).toContain(
      '<CodeBlockTabs defaultValue="python3" groupId="example" persist>',
    );
    expect(result.source).toContain('<a id="sample-code"></a>');
    expect(result.source.match(/<CodeBlockTabsTrigger /g)).toHaveLength(2);
    expect(
      result.source
        .replaceAll('CodeBlockTabsTrigger', 'TabsTrigger')
        .replaceAll('CodeBlockTabsList', 'TabsList')
        .replaceAll('CodeBlockTabs', 'Tabs')
        .replaceAll('CodeBlockTab', 'TabsContent'),
    ).toBe(source);
    expect(normalizeCodeTabs(result.source).count).toBe(0);
  });

  it.each([
    'Instructions before the code.',
    '<a id="sample-code">Read more</a>',
  ])('retains mixed content: %s', (extra) =>
    expect(normalizeCodeTabs(example(extra)).source).toBe(example(extra)),
  );

  it('retains every step when a synchronized scenario includes mixed content', () => {
    const source = `${example()}\n\n${example('Install and configure first.')}`;
    expect(normalizeCodeTabs(source)).toEqual({ source, count: 0 });
  });

  it('has no remaining independent code-only ordinary Tabs in Chinese content', () => {
    const findings = codeTabFiles(resolve('content/docs/zh-CN')).flatMap(
      (file) => {
        const result = normalizeCodeTabs(readFileSync(file, 'utf8'));
        return result.count ? [{ file, groups: result.count }] : [];
      },
    );
    expect(findings).toEqual([]);
  }, 30_000);
});
