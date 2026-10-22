import { describe, expect, it } from 'vitest';
import {
  appendApiReferenceTrail,
  readApiReferenceTrail,
} from './api-reference-context';

const origin = 'https://docs.example.com';
const root = '/zh-CN/api-reference/rtc/android';

describe('shareable API reference navigation', () => {
  it('preserves multiple source pages and anchors without session storage', () => {
    const first = appendApiReferenceTrail(
      `${root}/class-channelmediaoptions`,
      new URL(`${root}/channel#参数-5`, origin),
      '频道',
    );
    const second = appendApiReferenceTrail(
      `${root}/enum-multipathtype`,
      new URL(`${first}#prefermultipathtype`, origin),
      'ChannelMediaOptions',
    );
    expect(readApiReferenceTrail(new URL(second, origin))).toEqual([
      { href: `${root}/channel#%E5%8F%82%E6%95%B0-5`, title: '频道' },
      {
        href: `${root}/class-channelmediaoptions#prefermultipathtype`,
        title: 'ChannelMediaOptions',
      },
    ]);
  });

  it('preserves the destination query and hash and truncates cycles', () => {
    const first = appendApiReferenceTrail(
      `${root}/class-options`,
      new URL(`${root}/channel`, origin),
      '频道',
    );
    const back = appendApiReferenceTrail(
      `${root}/channel?platform=android#join`,
      new URL(first, origin),
      'Options',
    );
    expect(back).toBe(`${root}/channel?platform=android#join`);
  });

  it('rejects malformed, external, and non-API shared sources', () => {
    for (const value of [
      'broken',
      JSON.stringify([{ href: '//evil.test/x', title: 'bad' }]),
      JSON.stringify([{ href: '/en/introduction', title: 'bad' }]),
    ]) {
      expect(
        readApiReferenceTrail(
          new URL(`${root}/enum?apiTrail=${encodeURIComponent(value)}`, origin),
        ),
      ).toEqual([]);
    }
  });

  it('leaves external links and non-API navigation unchanged', () => {
    expect(
      appendApiReferenceTrail(
        'https://other.test/page',
        new URL(`${root}/channel`, origin),
        '频道',
      ),
    ).toBe('https://other.test/page');
    expect(
      appendApiReferenceTrail(
        `${root}/channel`,
        new URL('/zh-CN/introduction', origin),
        '首页',
      ),
    ).toBe(`${root}/channel`);
  });
});
