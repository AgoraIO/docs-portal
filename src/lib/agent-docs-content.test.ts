import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('agent-readable tab headings', () => {
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
