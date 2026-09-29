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
    expect(releaseNotes).toContain('<Accordions type="multiple" openFirst>');
    const versions = Array.from(
      releaseNotes.matchAll(
        /<Accordion title="(v[^"]+)" id="([^"]+)" headingLevel=\{3\} value="([^"]+)">/g,
      ),
    );

    expect(versions.length).toBeGreaterThan(1);
    expect(versions[0][2]).toBe(versions[0][3]);
    expect(versions[1][2]).toBe(versions[1][3]);
  });
});
