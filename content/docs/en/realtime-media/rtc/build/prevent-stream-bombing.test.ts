import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const file = resolve(
  process.cwd(),
  'content/docs/en/realtime-media/rtc/build/secure-and-protect-channels/prevent-stream-bombing.mdx',
);

describe('prevent-stream-bombing doc links', () => {
  it('links the RESTful API reference to the shared rtc query-user-list page', () => {
    const content = readFileSync(file, 'utf8');

    expect(content).toContain(
      '[RESTful API](/en/api-reference/api-ref/rtc/query-user-list)',
    );
    expect(content).not.toContain(
      '[RESTful API](../channel-management-api/endpoint/query-channel-information/query-user-list)',
    );
  });
});
