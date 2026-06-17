import { describe, expect, it } from 'vitest';
import { resolveDocsBrowserContentPath } from './docs-browser-content-path';

describe('resolveDocsBrowserContentPath', () => {
  it('keeps ordinary docs content paths unchanged', () => {
    expect(
      resolveDocsBrowserContentPath('en/introduction/about-agora.mdx'),
    ).toBe('en/introduction/about-agora.mdx');
    expect(
      resolveDocsBrowserContentPath('zh-CN/ai/quick-start/index.mdx'),
    ).toBe('zh-CN/ai/quick-start/index.mdx');
  });

  it('maps rtc android current-version docs paths onto the concrete versioned content files', () => {
    expect(
      resolveDocsBrowserContentPath(
        'en/api-reference/rtc/android/(current)/overview.mdx',
      ),
    ).toBe('en/api-reference/rtc/android/4.6.0/overview.mdx');
    expect(
      resolveDocsBrowserContentPath(
        'zh-CN/api-reference/rtc/android/(current)/class-and-enum/classes/class-rtcstats.mdx',
      ),
    ).toBe(
      'zh-CN/api-reference/rtc/android/4.6.0/class-and-enum/classes/class-rtcstats.mdx',
    );
  });

  it('does not rewrite already-versioned rtc android docs paths', () => {
    expect(
      resolveDocsBrowserContentPath(
        'en/api-reference/rtc/android/4.6.0/overview.mdx',
      ),
    ).toBe('en/api-reference/rtc/android/4.6.0/overview.mdx');
  });
});
