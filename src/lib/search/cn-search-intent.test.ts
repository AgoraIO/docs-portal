import { describe, expect, it } from 'vitest';
import {
  getCnSearchFamilyOrder,
  resolveCnSearchQuery,
  resolveCnSearchTask,
} from './cn-search-intent';

describe('Chinese search query intent', () => {
  it.each([
    ['令牌', 'Token'],
    ['加入频道后听不到对方声音怎么办', '无声'],
    ['听不到声音', '无声'],
  ])('understands a bounded Chinese expression: %s', (q, query) => {
    expect(resolveCnSearchQuery(q).query).toBe(query);
  });
  it('keeps unknown question qualifiers instead of silently dropping them', () => {
    expect(resolveCnSearchQuery('外星通话无声未知故障怎么办').query).toBe(
      '外星通话无声未知故障怎么办',
    );
  });
  it.each([
    ['怎么开启云录制', '开启云端录制'],
    ['请问，怎样设置日志文件？', '设置日志文件'],
    ['如何共享屏幕？', '屏幕共享'],
    ['如何开启虚拟背景', '虚拟背景'],
    ['视频黑屏怎么办？', '黑屏'],
    ['为什么视频会卡顿', '视频卡顿'],
    ['如何才能开启云录制', '开启云端录制'],
    ['为什么视频会出现卡顿', '视频卡顿'],
    ['为什么会黑屏', '黑屏'],
    ['通话时听不见对方声音怎么办', '无声'],
    ['为什么音频卡顿？', '音频卡顿'],
    ['如何处理回声问题', '回声 排查'],
    ['加入频道后没有声音该怎么办', '无声'],
    ['如何关闭云录制', '关闭云端录制'],
    ['怎么设置屏幕共享视频分辨率', '设置屏幕共享视频分辨率'],
    ['如何禁用虚拟背景', '禁用虚拟背景'],
    ['为什么视频不卡顿', '视频不卡顿'],
    ['为什么处理器占用率高', '处理器占用率高'],
    ['为什么解决方案不支持屏幕共享', '解决方案不支持屏幕共享'],
    ['如何处理处理器占用率高的问题', '处理器占用率高'],
    ['怎样处理器负载测试', '处理器负载测试'],
    ['如何解决 iOS 17 蓝牙耳机没有声音的问题', '17 蓝牙耳机没有声音'],
    ['怎么设置不存在的参数987', '设置不存在的参数987'],
    ['"如何处理回声问题"', '"如何处理回声问题"'],
  ])(
    'extracts the task from %s without dropping meaningful constraints',
    (q, query) => {
      expect(resolveCnSearchQuery(q).query).toBe(query);
    },
  );
  it('preserves an explicit platform while interpreting a question', () => {
    expect(
      resolveCnSearchQuery('如何解决 iOS 17 蓝牙耳机没有声音的问题'),
    ).toEqual({
      query: '17 蓝牙耳机没有声音',
      platform: 'ios',
    });
    expect(resolveCnSearchQuery('Android 怎么切换摄像头')).toEqual({
      query: '"切换摄像头"',
      platform: 'android',
    });
    expect(resolveCnSearchQuery('怎么在 Android 上共享屏幕')).toEqual({
      query: '屏幕共享',
      platform: 'android',
    });
    expect(resolveCnSearchQuery('如何在Web上开启虚拟背景')).toEqual({
      query: '虚拟背景',
      platform: 'web',
    });
    expect(resolveCnSearchQuery('RTM 怎么在Web上登录')).toEqual({
      query: 'RTM 怎么登录',
      platform: 'web',
    });
    expect(resolveCnSearchQuery('Web 怎么共享屏幕', 'android')).toEqual({
      query: 'Web 怎么共享屏幕',
      platform: 'android',
    });
  });
  it.each(['"怎么在Web上共享屏幕"', '`RTM 怎么在Web上登录`'])(
    'does not consume a platform phrase inside a literal search: %s',
    (query) => {
      expect(resolveCnSearchQuery(query)).toEqual({
        query,
        platform: undefined,
      });
    },
  );
  it.each(['听不到声音', '黑屏', '视频卡顿', 'ERR_INVALID_TOKEN'])(
    'surfaces an available troubleshooting FAQ for %s',
    (q) => {
      expect(
        getCnSearchFamilyOrder(q, [
          { family: 'faq', title: '如何排查问题？' },
        ])[0],
      ).toBe('faq');
    },
  );
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
  it.each([
    ['joinChannel', 'joinchannel'],
    ['renewToken', 'RENEWTOKEN'],
    ['setClientRole', 'setclientrole()'],
    ['setClientRole:', 'setclientrole'],
    ['muteLocalAudioStream', 'MUTELOCALAUDIOSTREAM'],
    ['audioScenario', 'audioscenario'],
    ['sendMessage', 'sendmessage'],
    ['join', 'JOIN'],
    ['leave', 'leave'],
    ['create_client', 'CREATE_CLIENT'],
  ])(
    'recognizes the actual API symbol %s independently of query casing (%s)',
    (title, query) => {
      expect(
        getCnSearchFamilyOrder(query, [
          { family: 'docs', title: '使用指南' },
          { family: 'api', title: `<mark>${title}</mark>[1/2]` },
        ]),
      ).toEqual(['api', 'docs', 'faq']);
    },
  );
  it('does not infer an API from English, a prefix or a product name', () => {
    for (const q of [
      'channel',
      'joinchan',
      'how to joinChannel',
      'joinChannel token',
      'RTM',
    ]) {
      expect(
        getCnSearchFamilyOrder(q, [
          { family: 'api', title: 'joinChannel' },
          { family: 'api', title: 'RTM' },
        ]),
      ).toEqual(['docs', 'api', 'faq']);
    }
  });

  it.each(['Token', 'token', '令牌'])(
    'preserves topic discovery for %s despite an identically named API property',
    (q) => {
      expect(
        getCnSearchFamilyOrder(q, [{ family: 'api', title: 'token' }]),
      ).toEqual(['docs', 'api', 'faq']);
    },
  );

  it.each(['example', 'Parameters', 'Returns', 'Methods'])(
    'does not mistake a generated reference heading for an API: %s',
    (title) => {
      expect(getCnSearchFamilyOrder(title, [{ family: 'api', title }])).toEqual(
        ['docs', 'api', 'faq'],
      );
    },
  );

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

describe('product-qualified tasks', () => {
  it.each([
    ['RTM 怎么登录', undefined, 'rtm', '登录'],
    ['实时消息如何发送消息？', undefined, 'rtm', '发送消息'],
    ['怎么登录 RTM', undefined, 'rtm', '登录'],
    ['RTC 为什么视频卡顿', undefined, 'rtc', '视频卡顿'],
    ['怎么设置视频分辨率', undefined, undefined, '设置视频编码属性'],
    ['如何调整视频帧率', 'rtc', 'rtc', '设置视频编码属性'],
    [
      '怎么设置视频分辨率',
      'cloud-recording',
      'cloud-recording',
      '设置视频分辨率',
    ],
    ['RTM 怎么登录', 'rtc', 'rtc', 'RTM 怎么登录'],
    ['RTM 如何与 RTC 对比', undefined, undefined, 'RTM 如何与 RTC 对比'],
    ['RTMP 怎么登录', undefined, undefined, 'RTMP 怎么登录'],
  ])('uses product and task context for %s', (q, selected, product, query) => {
    const intent = resolveCnSearchQuery(q);
    expect(resolveCnSearchTask(intent.query, selected)).toEqual({
      query,
      product,
      quickStart: false,
    });
  });
  it.each([
    ['快速开始', undefined, '快速开始', true],
    ['对话式 AI 快速开始', 'conversational-ai', '快速开始', true],
    ['实时消息 登录', 'rtm', '登录', false],
    ['RTM 发送消息', 'rtm', '发送消息', false],
    ['RTMP 发送消息', undefined, 'RTMP 发送消息', false],
    ['实时消息 对比 RTMP', undefined, '实时消息 对比 RTMP', false],
  ])(
    'recognizes the complete task, preserving other qualifiers: %s',
    (q, product, query, quickStart) => {
      expect(resolveCnSearchTask(q)).toEqual({ query, product, quickStart });
    },
  );
  it('preserves a conflicting explicit product filter', () => {
    expect(resolveCnSearchTask('实时消息 登录', 'rtc')).toEqual({
      query: '实时消息 登录',
      product: 'rtc',
      quickStart: false,
    });
  });
});
