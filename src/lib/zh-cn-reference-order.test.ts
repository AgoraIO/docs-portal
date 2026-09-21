import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

type MetaPage = string | Record<string, unknown>;

const expectedReferencePages: Record<string, MetaPage[]> = {
  'realtime-media/cloud-recording/reference/meta.json': [
    '[服务端 API](/zh-CN/api-reference/api-ref/cloud-recording)',
    'api-reference',
    'response-code',
    'ncs-events',
    'quota',
    'concepts',
  ],
  'realtime-media/danmaku/reference/meta.json': [
    'downloads',
    '[服务端 API](/zh-CN/api-reference/api-ref/danmaku)',
    'api-limits',
    'response-code',
    'base-url',
  ],
  'realtime-media/fusion-cdn/reference/meta.json': [
    '[服务端 API](/zh-CN/api-reference/api-ref/fusion-cdn)',
    '[参考信息](/zh-CN/api-reference/fusion-cdn/restful/api/reference)',
    'response-code',
    'ncs-event',
    'quota',
  ],
  'realtime-media/marketplace/reference/meta.json': [
    'faceunity-ar-api',
    'iflytek-asr-api',
    'sensetime-ar-api',
    '!shengwang-ai-meeting-notes-api',
    'concepts',
    'supported-platforms',
    'provisioning',
  ],
  'realtime-media/media-pull/reference/meta.json': [
    '[服务端 API](/zh-CN/api-reference/api-ref/media-pull)',
    'response-code',
    'ncs-events',
    '[常用视频属性](/zh-CN/api-reference/media-pull/restful/api/video-profile)',
    'quota',
  ],
  'realtime-media/media-push/reference/meta.json': [
    '[服务端 API](/zh-CN/api-reference/api-ref/media-push)',
    'response-code',
    'ncs-events',
    '[常用视频属性](/zh-CN/api-reference/media-push/restful/api/video-profile)',
    'quota',
  ],
  'realtime-media/meeting/reference/meta.json': [
    'downloads',
    {
      type: 'group',
      title: '服务端 API',
      collapsible: true,
      pages: [
        'call-api',
        '[创建房间](/zh-CN/api-reference/meeting/restful/api/create-room?from=%2Fzh-CN%2Frealtime-media%2Fmeeting)',
        '[查询录制列表](/zh-CN/api-reference/meeting/restful/api/query-recording?from=%2Fzh-CN%2Frealtime-media%2Fmeeting)',
      ],
    },
    'response-code',
    'webhook-events',
    'quota',
    'platform-support',
  ],
  'realtime-media/rtc-server-sdk/reference/meta.json': [
    'downloads',
    'error-code',
    'supported-platforms',
  ],
  'realtime-media/rtc/reference/meta.json': [
    'downloads',
    '[服务端 API](/zh-CN/api-reference/api-ref/rtc)',
    {
      type: 'group',
      title: '错误码',
      collapsible: true,
      pages: ['error-code', 'response-code'],
    },
    {
      type: 'group',
      title: '迁移升级',
      collapsible: true,
      pages: ['migration-guide', 'after-migrate', 'sunset-plan'],
    },
    'key-concept',
    'events',
    {
      type: 'group',
      title: '平台支持',
      collapsible: true,
      pages: ['supported-platforms', 'browser-compatibility'],
    },
  ],
  'realtime-media/rtm/reference/meta.json': [
    'downloads',
    '[服务端 API](/zh-CN/api-reference/api-ref/signaling/publish)',
    'usage-limits-and-errors',
    'migration-guide',
    'capabilities-and-compatibility',
    'data-security',
    'sunset-policy',
  ],
  'realtime-media/rtmp-gateway/reference/meta.json': [
    '[服务端 API](/zh-CN/api-reference/api-ref/rtmp-gateway)',
    'response-code',
    'ncs-events',
    'quota',
    '[常用视频属性](/zh-CN/api-reference/rtmp-gateway/restful/api/video-profile)',
  ],
  'realtime-media/rtsa/reference/meta.json': [
    'downloads',
    'error-codes',
    'supported-platforms',
  ],
  'realtime-media/sdk-extensions/metakit/reference/meta.json': [
    'downloads',
    'api-ref',
  ],
  'realtime-media/speech-to-text/reference/meta.json': [
    '[服务端 API](/zh-CN/api-reference/api-ref/speech-to-text)',
    '[响应状态码](/zh-CN/api-reference/speech-to-text/restful/api/response-code)',
    'ncs-events',
    '[支持的语言](/zh-CN/api-reference/speech-to-text/restful/api/supported-languages)',
    'third-party-services',
  ],
  'realtime-media/transcoding/reference/meta.json': [
    '[服务端 API](/zh-CN/api-reference/api-ref/cloud-transcoding)',
    '[常用视频属性](/zh-CN/api-reference/cloud-transcoding/restful/api/video-profile)',
    'response-code',
    '[事件类型](/zh-CN/api-reference/api-ref/cloud-transcoding/ncs-events)',
    'quota',
  ],
  'realtime-media/usage-analytics/reference/meta.json': [
    '[服务端 API](/zh-CN/api-reference/api-ref/agora-analytics)',
    'api-limits',
    'response-code',
    'concept',
    '!concept-rtm',
  ],
  'realtime-media/whiteboard/fastboard-sdk/reference/meta.json': [
    'downloads',
    '[服务端 API](/zh-CN/api-reference/api-ref/whiteboard/restful)',
    'response-code',
    'migrate-from-netless',
    'supported-platforms',
    'convert-ppt',
  ],
  'realtime-media/whiteboard/whiteboard-sdk/reference/meta.json': [
    'downloads',
    '[服务端 API](/zh-CN/api-reference/api-ref/whiteboard/restful)',
    'response-code',
    'migrate-from-netless',
    'supported-platforms',
    'convert-ppt',
  ],
  'solutions/chatroom/sdk/reference/meta.json': [
    'downloads',
    '!api',
    'im-api',
    'rtc-api',
    'solution-compare',
  ],
  'solutions/flexible-classroom/reference/meta.json': [
    'downloads',
    '[服务端 API](/zh-CN/api-reference/flexible-classroom/restful-api/api-classroom)',
    'api-usage-and-limits',
    'migration',
    'capabilities-and-compatibility',
  ],
  'solutions/game-voice/reference/meta.json': [
    'downloads',
    'api',
    'supported-platforms',
  ],
  'solutions/iot-apaas/reference/meta.json': [
    'downloads',
    'restful',
    'supported-platforms',
    'tech-architecture',
  ],
  'solutions/multi-usecase/non-scenario-based/reference/meta.json': [
    'downloads',
    'billing',
    'karaoke',
  ],
  'solutions/multi-usecase/scenario-based/reference/meta.json': [
    'downloads',
    'billing',
  ],
  'solutions/multi-usecase/ui-solution/reference/meta.json': [
    'downloads',
    'billing',
  ],
  'solutions/one-to-one-live/custom-signaling/reference/meta.json': [
    'downloads',
    'supported-platforms',
    'solution-compare',
  ],
  'solutions/one-to-one-live/rtm/reference/meta.json': [
    'downloads',
    'supported-platforms',
    'solution-compare',
  ],
  'solutions/online-ktv/auikaraoke/reference/meta.json': [
    'downloads',
    '[在线 K 歌房 API 参考](/zh-CN/api-reference/online-ktv)',
    'solution-compare',
  ],
  'solutions/online-ktv/ktv-scenario/reference/meta.json': [
    'downloads',
    '[服务端 API](/zh-CN/api-reference/online-ktv/android/ktv-scenario/api/music-content-center)',
    '[在线 K 歌房 API 参考](/zh-CN/api-reference/online-ktv)',
    'solution-compare',
  ],
  'solutions/online-ktv/online-ktv-sdk/reference/meta.json': [
    'downloads',
    '[服务端 API](/zh-CN/api-reference/online-ktv/android/online-ktv-sdk/api/music-content-center)',
    '[在线 K 歌房 API 参考](/zh-CN/api-reference/online-ktv)',
    'solution-compare',
  ],
  'solutions/online-music-class/reference/meta.json': [
    'downloads',
    '[在线音乐教学 API 参考](/zh-CN/api-reference/online-music-teaching)',
  ],
  'solutions/ppt-transcoding/reference/meta.json': [
    '[服务端 API](/zh-CN/api-reference/api-ref/ppt-conversion-service)',
    '!slide-api',
    'response-code',
    'convert-ppt',
  ],
  'solutions/showroom/reference/meta.json': [
    'downloads',
    'api',
    'integrate-check-point',
  ],
  'solutions/smart-camera/reference/meta.json': [
    'downloads',
    'api-overview',
    'advanced-feature',
  ],
  'solutions/smart-doorbell/reference/meta.json': [
    'downloads',
    'api-overview',
    'advanced-feature',
  ],
  'solutions/smart-watch/reference/meta.json': [
    'downloads',
    'api-overview',
    'supported-platforms',
  ],
  'solutions/teleoperation/reference/meta.json': ['downloads'],
};

const intentionallyChangedReferencePages = new Set([
  'realtime-media/rtm/reference/meta.json',
  'solutions/flexible-classroom/reference/meta.json',
  'solutions/teleoperation/reference/meta.json',
]);

const expectedReferenceFolderMeta: Record<
  string,
  { title: string; pages: string[] }
> = {
  'realtime-media/rtm/reference/usage-limits-and-errors/meta.json': {
    title: '使用限制与错误处理',
    pages: ['api-limits', 'response-code'],
  },
  'realtime-media/rtm/reference/capabilities-and-compatibility/meta.json': {
    title: '能力与兼容性',
    pages: ['feature-list', 'platform-support'],
  },
  'solutions/flexible-classroom/reference/api-usage-and-limits/meta.json': {
    title: 'API 使用与限制',
    pages: ['call-api', 'response-code', 'quota'],
  },
  'solutions/flexible-classroom/reference/capabilities-and-compatibility/meta.json': {
    title: '能力与兼容性',
    pages: ['basic-concept', 'platform-support', 'tech-architect'],
  },
};

function readPages(relativePath: string) {
  const file = resolve(process.cwd(), 'content/docs/zh-CN', relativePath);
  const meta = JSON.parse(readFileSync(file, 'utf8')) as {
    pages?: MetaPage[];
  };

  return meta.pages ?? [];
}

function readPagesFromRevision(relativePath: string, revision: string) {
  const source = execFileSync(
    'git',
    ['show', `${revision}:content/docs/zh-CN/${relativePath}`],
    { encoding: 'utf8' },
  );
  const meta = JSON.parse(source) as { pages?: MetaPage[] };

  return meta.pages ?? [];
}

function serializePages(pages: MetaPage[]) {
  return pages.map((page) => JSON.stringify(page)).sort();
}

function groupContents(pages: MetaPage[]) {
  return pages
    .filter(
      (page): page is Record<string, unknown> =>
        typeof page === 'object' && page !== null && page.type === 'group',
    )
    .map((group) => ({
      title: group.title,
      pages: group.pages,
    }))
    .sort((left, right) =>
      String(left.title).localeCompare(String(right.title)),
    );
}

describe('zh-CN product reference ordering', () => {
  it.each(Object.entries(expectedReferencePages))(
    'keeps the approved order for %s',
    (relativePath, expectedPages) => {
      const baselinePages = readPagesFromRevision(relativePath, 'HEAD');
      const actualPages = readPages(relativePath);

      if (!intentionallyChangedReferencePages.has(relativePath)) {
        expect(serializePages(actualPages)).toEqual(
          serializePages(baselinePages),
        );
        expect(groupContents(actualPages)).toEqual(
          groupContents(baselinePages),
        );
      }
      expect(groupContents(actualPages)).toEqual(groupContents(expectedPages));
      expect(actualPages).toEqual(expectedPages);
    },
  );

  it.each(Object.entries(expectedReferenceFolderMeta))(
    'keeps the approved physical folder metadata for %s',
    (relativePath, expectedMeta) => {
      const meta = JSON.parse(
        readFileSync(
          resolve(process.cwd(), 'content/docs/zh-CN', relativePath),
          'utf8',
        ),
      );

      expect(meta).toEqual(expectedMeta);
    },
  );
});
