import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('agent-readable tab headings', () => {
  it('distinguishes repeated backend steps by language', () => {
    const markdown = readFileSync(
      join(
        process.cwd(),
        'content/docs/en/ai/build/custom-model-integration/build-server-client.mdx',
      ),
      'utf8',
    );

    for (const language of ['TypeScript', 'Python']) {
      expect(markdown).toContain(`### Generate tokens with ${language}`);
      expect(markdown).toContain(`### Start an agent session with ${language}`);
      expect(markdown).toContain(`### Stop an agent session with ${language}`);
    }
  });
});
