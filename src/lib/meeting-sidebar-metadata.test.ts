import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const meetingReferenceMetaPath =
  'content/docs/zh-CN/realtime-media/meeting/reference/meta.json';

describe('Chinese Meeting reference sidebar metadata', () => {
  it('keeps Meeting REST endpoints under the service API entry only', () => {
    const meta = JSON.parse(readFileSync(meetingReferenceMetaPath, 'utf8')) as {
      pages: string[];
    };

    expect(meta.pages).toContain(
      '[服务端 API](/zh-CN/api-reference/meeting/restful/api/create-room)',
    );
    expect(meta.pages).not.toContain(
      '[创建房间](/zh-CN/api-reference/meeting/restful/api/create-room)',
    );
    expect(meta.pages).not.toContain(
      '[查询录制列表](/zh-CN/api-reference/meeting/restful/api/query-recording)',
    );
  });
});
