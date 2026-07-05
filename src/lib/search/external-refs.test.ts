import { describe, expect, it } from 'vitest';
import { buildExternalSearchText, deriveRestAlias, platformFromExternalHref } from './external-refs';

describe('platformFromExternalHref', () => {
  it('extracts the platform token as a registry key', () => {
    expect(
      platformFromExternalHref('https://api-ref.agora.io/en/video-sdk/android/4.x/index.html'),
    ).toBe('android');
    expect(
      platformFromExternalHref('https://api-ref.agora.io/en/server-gateway-sdk/linux-cpp/4.x/index.html'),
    ).toBe('linux-cpp');
  });

  it('maps token oddities onto registry keys', () => {
    expect(
      platformFromExternalHref('https://api-ref.agora.io/en/video-sdk/unreal-engine/4.x/index.html'),
    ).toBe('unreal');
    expect(
      platformFromExternalHref('https://api-ref.agora.io/en/video-sdk/reactjs/2.x/index.html'),
    ).toBe('javascript');
  });

  it('returns undefined for tokens with no registry key', () => {
    expect(
      platformFromExternalHref('https://api-ref.agora.io/en/iot-sdk/linux/1.x/index.html'),
    ).toBeUndefined();
  });
});

describe('deriveRestAlias', () => {
  it('takes the last slug of an internal REST-API link target', () => {
    expect(deriveRestAlias('/en/api-reference/api-ref/rtc')).toBe('rtc');
    expect(deriveRestAlias('/en/api-reference/api-ref/im')).toBe('im');
  });
});

describe('buildExternalSearchText', () => {
  it('includes title, ancestry, href tokens and the alias so "rtc android" matches', () => {
    const text = buildExternalSearchText({
      title: 'Android',
      href: 'https://api-ref.agora.io/en/video-sdk/android/4.x/index.html',
      ancestry: ['Voice & Video'],
      restAlias: 'rtc',
    }).toLowerCase();
    expect(text).toContain('android');
    expect(text).toContain('voice & video');
    expect(text).toContain('video-sdk');
    expect(text).toContain('rtc');
  });
});
