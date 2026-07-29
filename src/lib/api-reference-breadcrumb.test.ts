import { describe, expect, it } from 'vitest';
import { resolveZhCnApiReferenceBreadcrumb } from './api-reference-breadcrumb';

describe('resolveZhCnApiReferenceBreadcrumb', () => {
  it('adds the product and platform to a client API detail breadcrumb', () => {
    expect(
      resolveZhCnApiReferenceBreadcrumb({
        activePath: '/zh-CN/api-reference/rtc/android/rtc-interface-class',
        title: 'IAudioFrameObserver 类',
      }),
    ).toEqual([
      {
        title: 'API 参考',
        url: '/zh-CN/api-reference/api',
      },
      {
        title: '实时互动 RTC',
      },
      {
        title: 'Android',
        url: '/zh-CN/api-reference/rtc/android/rtc-api-overview',
      },
      {
        title: 'IAudioFrameObserver 类',
        url: '/zh-CN/api-reference/rtc/android/rtc-interface-class',
      },
    ]);
  });

  it('stops at the platform for its catalog landing page', () => {
    expect(
      resolveZhCnApiReferenceBreadcrumb({
        activePath: '/zh-CN/api-reference/api-ref/cloud-recording',
        title: '云端录制概览',
      }),
    ).toEqual([
      {
        title: 'API 参考',
        url: '/zh-CN/api-reference/api',
      },
      {
        title: '云端录制',
      },
      {
        title: 'RESTful API',
      },
    ]);
  });

  it('links the platform landing page from OpenAPI details', () => {
    expect(
      resolveZhCnApiReferenceBreadcrumb({
        activePath: '/zh-CN/api-reference/api-ref/cloud-recording/start',
        title: '开始云端录制',
      }),
    ).toEqual([
      {
        title: 'API 参考',
        url: '/zh-CN/api-reference/api',
      },
      {
        title: '云端录制',
      },
      {
        title: 'RESTful API',
        url: '/zh-CN/api-reference/api-ref/cloud-recording',
      },
      {
        title: '开始云端录制',
        url: '/zh-CN/api-reference/api-ref/cloud-recording/start',
      },
    ]);
  });

  it('keeps the current title when the catalog links directly to an API document', () => {
    expect(
      resolveZhCnApiReferenceBreadcrumb({
        activePath: '/zh-CN/api-reference/api-ref/signaling/publish',
        title: '发送消息',
      }),
    ).toEqual([
      {
        title: 'API 参考',
        url: '/zh-CN/api-reference/api',
      },
      {
        title: '实时消息 RTM',
      },
      {
        title: 'RESTful API',
      },
      {
        title: '发送消息',
        url: '/zh-CN/api-reference/api-ref/signaling/publish',
      },
    ]);
  });

  it('keeps the API document title for a catalog entry that is not an overview', () => {
    expect(
      resolveZhCnApiReferenceBreadcrumb({
        activePath:
          '/zh-CN/api-reference/online-ktv/android/ktv-scenario/api/ktv-api',
        title: 'K 歌房场景化 Kotlin API',
      }),
    ).toEqual([
      {
        title: 'API 参考',
        url: '/zh-CN/api-reference/api',
      },
      {
        title: '在线 K 歌房',
      },
      {
        title: 'Android',
      },
      {
        title: 'K 歌房场景化 Kotlin API',
        url: '/zh-CN/api-reference/online-ktv/android/ktv-scenario/api/ktv-api',
      },
    ]);
  });

  it('uses the client platform for sibling API documents beside a RESTful entry', () => {
    expect(
      resolveZhCnApiReferenceBreadcrumb({
        activePath:
          '/zh-CN/api-reference/online-ktv/android/ktv-scenario/api/lyrics-api',
        title: '歌词打分组件 Kotlin API',
      }),
    ).toMatchObject([
      {
        title: 'API 参考',
      },
      {
        title: '在线 K 歌房',
      },
      {
        title: 'Android',
      },
      {
        title: '歌词打分组件 Kotlin API',
      },
    ]);
  });

  it('does not claim non-catalog reference pages', () => {
    expect(
      resolveZhCnApiReferenceBreadcrumb({
        activePath: '/zh-CN/reference/faq',
        title: '常见问题',
      }),
    ).toBeNull();
  });
});
