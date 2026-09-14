import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('RTMP Gateway quickstart', () => {
  it('uses POST to create a streaming key', () => {
    const quickstart = readFileSync(
      resolve(
        process.cwd(),
        'content/docs/en/realtime-media/rtmp-gateway/quickstart.md',
      ),
      'utf8',
    );

    expect(quickstart).toContain(
      '`POST https://api.agora.io/:region/v1/projects/:appId/rtls/ingress/streamkeys`',
    );
    expect(quickstart).not.toContain(
      '`PUT https://api.agora.io/:region/v1/projects/:appId/rtls/ingress/streamkeys`',
    );
  });
});
