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

  it('marks recording status identifiers as inline code', () => {
    const markdown = readFileSync(
      join(
        process.cwd(),
        'content/docs/en/api-reference/faq/quality/record_status_error.mdx',
      ),
      'utf8',
    );

    expect(markdown).toContain('`stat_code: 16`');
    expect(markdown).toContain('`LEAVE_CODE_INIT(0)`');
    expect(markdown).toContain('`LEAVE_CODE_CLIENT_LEAVE(0b10000)`');
    expect(markdown).not.toContain('stat_code:16');
  });
});
