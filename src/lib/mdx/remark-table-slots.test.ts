import { compile } from '@mdx-js/mdx';
import {
  remarkDirectiveAdmonition,
  remarkGfm,
} from 'fumadocs-core/mdx-plugins';
import remarkDirective from 'remark-directive';
import { describe, expect, it } from 'vitest';
import { remarkTableSlots } from './remark-table-slots';

async function compileWithTableSlots(source: string) {
  return String(
    await compile(source, {
      jsx: true,
      remarkPlugins: [
        remarkGfm,
        remarkDirective,
        [
          remarkDirectiveAdmonition,
          {
            types: {
              note: 'info',
            },
          },
        ],
        remarkTableSlots,
      ],
    }),
  );
}

describe('remarkTableSlots', () => {
  it('replaces a table cell placeholder with block slot content', async () => {
    const result = await compileWithTableSlots(`
| Field | Description |
| - | - |
| Options | <Slot name="options" /> |

<Slot for="options">

- aaa
- bbb

</Slot>
`);

    expect(result).toContain('<_components.table>');
    expect(result).toContain('<_components.td>{"Options"}</_components.td>');
    expect(result).toContain('<_components.ul>');
    expect(result).toContain('<_components.li>{"aaa"}</_components.li>');
    expect(result).toContain('<_components.li>{"bbb"}</_components.li>');
    expect(result).not.toContain('Slot');
  });

  it('supports admonitions inside slot definitions', async () => {
    const result = await compileWithTableSlots(`
| Field | Description |
| - | - |
| Options | <Slot name="options" /> |

<Slot for="options">

:::note
Hahaha
:::

</Slot>
`);

    expect(result).toContain('<CalloutContainer type="info">');
    expect(result).toContain('<CalloutDescription>');
    expect(result).toContain('{"Hahaha"}');
    expect(result).toContain('</_components.td></_components.tr>');
  });

  it('supports paragraphs and code blocks inside slot definitions', async () => {
    const result = await compileWithTableSlots(`
| Field | Description |
| - | - |
| Options | <Slot name="options" /> |

<Slot for="options">

First paragraph.

\`\`\`ts
const value = true;
\`\`\`

</Slot>
`);

    expect(result).toContain(
      '<_components.p>{"First paragraph."}</_components.p>',
    );
    expect(result).toContain('<_components.pre>');
    expect(result).toContain('const value = true;');
    expect(result).toContain('</_components.td></_components.tr>');
  });

  it('supports MDX components inside slot definitions', async () => {
    const result = await compileWithTableSlots(`
| Field | Description |
| - | - |
| Options | <Slot name="options" /> |

<Slot for="options">
<Tabs items={["Web"]}>
<Tab value="web">Web body</Tab>
</Tabs>
</Slot>
`);

    expect(result).toContain('<Tabs items={["Web"]}>');
    expect(result).toContain('<Tab value="web">{"Web body"}</Tab>');
  });

  it('replaces table cell placeholders inside MDX flow containers', async () => {
    const result = await compileWithTableSlots(`
<Wrapper>

| Field | Description |
| - | - |
| Options | <Slot name="options" /> |

<Slot for="options">

- Android
- iOS

</Slot>

</Wrapper>
`);

    expect(result).toContain('<Wrapper>');
    expect(result).toContain('<_components.ul>');
    expect(result).toContain('<_components.li>{"Android"}</_components.li>');
    expect(result).toContain('<_components.li>{"iOS"}</_components.li>');
    expect(result).not.toContain('Slot');
  });

  it('replaces table cell placeholders inside list items', async () => {
    const result = await compileWithTableSlots(`
1. Response

   | Field | Description |
   | - | - |
   | Status | <Slot name="status" /> |

   <Slot for="status">

   - Running
   - Stopped

   </Slot>
`);

    expect(result).toContain('<_components.ol>');
    expect(result).toContain('<_components.table>');
    expect(result).toContain('<_components.li>{"Running"}</_components.li>');
    expect(result).toContain('<_components.li>{"Stopped"}</_components.li>');
    expect(result).not.toContain('Slot');
  });

  it('fails clearly for duplicate slot definitions after one table', async () => {
    await expect(
      compileWithTableSlots(`
| Field | Description |
| - | - |
| Options | <Slot name="options" /> |

<Slot for="options">First</Slot>
<Slot for="options">Second</Slot>
`),
    ).rejects.toThrow(
      'Duplicate slot definition "options" after the same table.',
    );
  });

  it('fails clearly for missing slot definitions', async () => {
    await expect(
      compileWithTableSlots(`
| Field | Description |
| - | - |
| Options | <Slot name="options" /> |
`),
    ).rejects.toThrow(
      'Missing slot definition "options" for table placeholder.',
    );
  });

  it('fails clearly when a slot definition is not adjacent to its table', async () => {
    await expect(
      compileWithTableSlots(`
| Field | Description |
| - | - |
| Options | <Slot name="options" /> |

Text between the table and definition.

<Slot for="options">Late</Slot>
`),
    ).rejects.toThrow(
      'Missing slot definition "options" for table placeholder.',
    );
  });

  it('fails clearly when a placeholder cell contains extra content', async () => {
    await expect(
      compileWithTableSlots(`
| Field | Description |
| - | - |
| Options | Prefix <Slot name="options" /> |

<Slot for="options">Used</Slot>
`),
    ).rejects.toThrow(
      'A table slot placeholder cell must contain only one <Slot name="..." /> element.',
    );
  });

  it('fails clearly for unused slot definitions', async () => {
    await expect(
      compileWithTableSlots(`
| Field | Description |
| - | - |
| Options | <Slot name="options" /> |

<Slot for="options">Used</Slot>
<Slot for="unused">Unused</Slot>
`),
    ).rejects.toThrow('Unused slot definition "unused" after table.');
  });

  it('validates ambiguous slot usage', async () => {
    await expect(
      compileWithTableSlots(`
| Field | Description |
| - | - |
| Options | <Slot name="options" for="options" /> |
`),
    ).rejects.toThrow('Slot usage is ambiguous');
  });

  it('fails clearly when a slot definition is not a flow sibling', async () => {
    await expect(
      compileWithTableSlots(`
| Field | Description |
| - | - |
| Options | <Slot name="options" /> |

> <Slot for="options">Nested</Slot>
`),
    ).rejects.toThrow(
      '<Slot for="..."> must be placed as a flow sibling immediately after its table.',
    );
  });

  it('keeps normal GFM tables unchanged', async () => {
    const result = await compileWithTableSlots(`
| Field | Description |
| - | - |
| Options | Normal content |
`);

    expect(result).toContain('<_components.table>');
    expect(result).toContain('{"Normal content"}');
    expect(result).not.toContain('Missing slot definition');
  });
});
