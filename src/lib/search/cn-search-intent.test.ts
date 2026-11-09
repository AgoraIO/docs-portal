import { describe, expect, it } from 'vitest';
import {
  getCnSearchFamilyOrder,
  resolveCnSearchQuery,
} from './cn-search-intent';

describe('Chinese search query intent', () => {
  it.each([
    ['混淆', '代码混淆', undefined],
    [' 混淆 ', '代码混淆', undefined],
    ['混淆 Android', '代码混淆', 'android'],
    ['bps 混淆', 'bps 混淆', undefined],
    ['RTC Token 混淆', 'RTC Token 混淆', undefined],
    ['云录制', '云端录制', undefined],
    ['云录制 Web', '云端录制', 'web'],
    ['云录制常见问题', '云录制常见问题', undefined],
    ['云容器部署录制 SDK', '云容器部署录制 SDK', undefined],
  ])(
    'resolves bare topic %s without overriding explicit intent',
    (q, query, platform) => {
      expect(resolveCnSearchQuery(q)).toEqual({ query, platform });
    },
  );

  it('chooses the family with the more direct language SDK entry', () => {
    const entries = [
      { family: 'docs' as const, title: '实现 HTTP 基本认证' },
      {
        family: 'api' as const,
        title: 'API 概览',
        languageEntryTerms: ['csharp'],
        languageEntryRank: 2,
      },
    ];
    expect(getCnSearchFamilyOrder('C#', entries)).toEqual([
      'api',
      'docs',
      'faq',
    ]);
    expect(
      getCnSearchFamilyOrder('C#', [
        ...entries,
        {
          family: 'docs',
          title: '下载 SDK',
          languageEntryTerms: ['csharp'],
          languageEntryRank: 0,
        },
      ]),
    ).toEqual(['docs', 'api', 'faq']);
    expect(getCnSearchFamilyOrder('C# Token', entries)).toEqual([
      'docs',
      'api',
      'faq',
    ]);
  });
  it.each([
    ['C#', 'csharp'],
    ['C++', 'cplusplus'],
    ['C# SDK 下载', 'csharp SDK 下载'],
    ['C++ 日志', 'cplusplus 日志'],
  ])(
    'keeps the language meaning of %s instead of searching the letter C',
    (q, query) => {
      expect(resolveCnSearchQuery(q)).toEqual({ query, platform: undefined });
    },
  );
  it.each([
    ['屏幕共享 JavaScript', '屏幕共享', 'web'],
    ['屏幕共享 Web', '屏幕共享', 'web'],
    ['Android 屏幕共享', '屏幕共享', 'android'],
    ['屏幕共享 iOS', '屏幕共享', 'ios'],
    ['React Native 加入频道', '加入频道', 'react-native'],
  ])('uses an explicit platform phrase in %s', (q, query, platform) => {
    expect(resolveCnSearchQuery(q)).toEqual({ query, platform });
  });

  it.each(['Web', 'webrtc', '屏幕共享 Android iOS', 'onWebEvent'])(
    'does not turn an ambiguous or standalone term into a filter: %s',
    (query) =>
      expect(resolveCnSearchQuery(query)).toEqual({
        query,
        platform: undefined,
      }),
  );

  it.each(['屏幕共享 TypeScript', '屏幕共享 Swift', '日志 Java'])(
    'preserves language terms that do not identify one runtime platform: %s',
    (query) =>
      expect(resolveCnSearchQuery(query)).toEqual({
        query,
        platform: undefined,
      }),
  );

  it('honors a manual platform and does not discard a conflicting query qualifier', () => {
    expect(resolveCnSearchQuery('屏幕共享 JavaScript', 'android')).toEqual({
      query: '屏幕共享 JavaScript',
      platform: 'android',
    });
    expect(resolveCnSearchQuery('屏幕共享 JavaScript', 'web')).toEqual({
      query: '屏幕共享',
      platform: 'web',
    });
  });

  const matches = [
    { family: 'docs' as const, title: '加入频道' },
    { family: 'api' as const, title: 'joinChannel [1/2]' },
    { family: 'api' as const, title: 'AudioScenario' },
  ];
  it.each([
    'joinChannel',
    'joinChannel()',
    'audioScenario',
    'AudioScenario',
    'joinChannel Android',
  ])('shows an exact API definition before guide mentions for %s', (q) => {
    expect(getCnSearchFamilyOrder(q, matches)).toEqual(['api', 'docs', 'faq']);
  });

  it('recognizes rendered highlight markup without depending on the transport layer', () => {
    expect(
      getCnSearchFamilyOrder('joinChannel', [
        { family: 'api', title: '<mark>joinChannel</mark>' },
      ]),
    ).toEqual(['api', 'docs', 'faq']);
  });

  it.each(['join_channel', 'AUDIO_SCENARIO'])(
    'recognizes exact identifiers with underscores: %s',
    (query) => {
      expect(
        getCnSearchFamilyOrder(query, [{ family: 'api', title: query }]),
      ).toEqual(['api', 'docs', 'faq']);
    },
  );
  it.each(['高级美颜', 'rtm', 'token', 'joinChannelEx', 'joinChannel token'])(
    'keeps ordinary and non-exact queries in document order: %s',
    (q) => {
      expect(getCnSearchFamilyOrder(q, matches)).toEqual([
        'docs',
        'api',
        'faq',
      ]);
    },
  );
});
