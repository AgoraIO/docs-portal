import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const apiMetaPaths = ['android', 'ios', 'macos', 'cpp-all-platforms'] as const;

function readApiMeta(platform: (typeof apiMetaPaths)[number]) {
  const path = resolve(
    process.cwd(),
    `content/docs/zh-CN/api-reference/rtc/${platform}/meta.json`,
  );
  return JSON.parse(readFileSync(path, 'utf8')) as {
    navScope: {
      versions: Array<{ id: string; label: string; path: string }>;
    };
  };
}

describe('RTC Native API version metadata', () => {
  it.each(apiMetaPaths)('labels %s current as v4.7.0', (platform) => {
    const meta = readApiMeta(platform);
    expect(meta.navScope.versions[0]).toEqual({
      id: 'current',
      label: 'v4.7.0',
      path: '(current)',
    });
  });

  it('keeps the existing Android v4.6.0 local archive', () => {
    const meta = readApiMeta('android');
    expect(meta.navScope.versions).toContainEqual({
      id: '4.6.0',
      label: 'v4.6.0',
      path: '4.6.0',
    });
  });
});
