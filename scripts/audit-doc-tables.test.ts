import { describe, expect, it } from 'vitest';
import { auditTableStructure } from './audit-doc-tables.mjs';

describe('documentation table structure audit', () => {
  it('rejects prose separating a table from its rich cell definition', () => {
    for (const isMdx of [true, false]) {
      const issues = auditTableStructure(
        `| Value | Details |
| --- | --- |
| row | <Slot name="details" /> |

Total: 100.

<Slot for="details">

- Detail

</Slot>`,
        isMdx,
      );
      expect(issues).toHaveLength(1);
      expect(issues[0].message).toMatch(/Missing.*[Ss]lot definition/);
    }
  });
  it('allows escaped pipes, empty cells, rich slots, and examples inside code', () => {
    expect(
      auditTableStructure(`| Name | Description |
| --- | --- |
| \`x\\|y\` | <Slot name="details" /> |
| empty | |

<Slot for="details">

- Detail

</Slot>

\`\`\`md
| broken | example |
| --- | --- |
| one |
\`\`\``),
    ).toEqual([]);
  });

  it('reports missing and overflowing cells instead of padding away data loss', () => {
    expect(
      auditTableStructure('| A | B |\n| --- | --- |\n| one |\n| a | b | c |'),
    ).toEqual([
      { line: 3, message: 'Expected 2 cells, found 1' },
      { line: 4, message: 'Expected 2 cells, found 3' },
    ]);
  });

  it('rejects legacy HTML tables in both Markdown and MDX', () => {
    const source = '<table>\n<tr><td rowspan="2">group</td></tr>\n</table>';
    expect(auditTableStructure(source)).toHaveLength(1);
    expect(auditTableStructure(source, false)).toHaveLength(1);
  });
});
