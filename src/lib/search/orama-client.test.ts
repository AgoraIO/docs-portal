import { describe, expect, it } from 'vitest';
import { createOramaDocsClient } from './orama-client';

describe('createOramaDocsClient', () => {
  it('finds Chinese documentation by body text', async () => {
    const client = createOramaDocsClient({
      pages: [
        {
          content: '了解如何启动和管理云端录制服务。',
          description: '云端录制概览',
          title: '云端录制',
          url: '/zh-CN/realtime-media/cloud-recording',
        },
        {
          content: '使用实时音视频 SDK 加入频道。',
          title: '实时音视频',
          url: '/zh-CN/realtime-media/video',
        },
      ],
    });

    await expect(client.search('管理录制')).resolves.toEqual([
      expect.objectContaining({
        title: '云端录制',
        url: '/zh-CN/realtime-media/cloud-recording',
      }),
    ]);
  });

  it('applies the same product and platform scope as the docs search UI', async () => {
    const client = createOramaDocsClient({
      pages: [
        {
          content: '快速开始',
          platform: ['android'],
          product: 'video',
          title: 'Android 视频通话',
          url: '/zh-CN/realtime-media/video/quickstart',
        },
        {
          content: '快速开始',
          platform: ['ios'],
          product: 'voice',
          title: 'iOS 语音通话',
          url: '/zh-CN/realtime-media/voice/quickstart',
        },
      ],
      platform: 'android',
      scope: { field: 'product', value: 'video' },
    });

    await expect(client.search('快速开始')).resolves.toEqual([
      expect.objectContaining({
        title: 'Android 视频通话',
      }),
    ]);
  });
});
