import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const releaseNotes = readFileSync(
  resolve(process.cwd(), 'content/docs/en/ai/release-notes.mdx'),
  'utf8',
);

describe('Voice Agent release notes', () => {
  it('uses the shared multi-open version history structure', () => {
    expect(releaseNotes).toContain('## Versions');
    expect(releaseNotes).toContain(
      '<Accordions type="multiple" defaultValue="v212">',
    );
    expect(releaseNotes).toContain(
      '<Accordion title="v2.12" id="v212" headingLevel={3} value="v212">',
    );
  });
});
