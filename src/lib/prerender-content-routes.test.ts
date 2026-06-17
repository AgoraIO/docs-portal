import { randomUUID } from 'node:crypto';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import * as prerenderContentRoutes from './prerender-content-routes';

const tempRoots: string[] = [];

afterEach(() => {
  for (const root of tempRoots.splice(0)) {
    rmSync(root, { force: true, recursive: true });
  }
});

describe('getContentDocsPrerenderPaths', () => {
  it('maps content docs files to canonical route paths', () => {
    const root = join(
      import.meta.dirname,
      `../../tmp/prerender-content-routes-${randomUUID()}`,
    );
    tempRoots.push(root);

    writeDoc(root, 'en/introduction/index.mdx');
    writeDoc(root, 'en/introduction/about-agora.mdx');
    writeDoc(root, 'en/api-reference/rtc/android/index.mdx');
    writeDoc(root, 'zh-CN/ai/domain-overview.md');

    expect(prerenderContentRoutes.getContentDocsPrerenderPaths(root)).toEqual([
      '/en/api-reference/rtc/android',
      '/en/introduction',
      '/en/introduction/about-agora',
      '/zh-CN/ai/domain-overview',
    ]);
  });

  it('keeps only the RTC Android landing pages in static prerender seeds', () => {
    const root = join(
      import.meta.dirname,
      `../../tmp/prerender-content-routes-${randomUUID()}`,
    );
    tempRoots.push(root);

    writeDoc(root, 'en/api-reference/rtc/android/index.mdx');
    writeDoc(root, 'en/api-reference/rtc/android/(current)/overview.mdx');
    writeDoc(root, 'en/api-reference/rtc/android/4.6.0/overview.mdx');
    writeDoc(root, 'zh-CN/api-reference/rtc/android/index.mdx');
    writeDoc(root, 'zh-CN/api-reference/rtc/android/(current)/channel.mdx');
    writeDoc(root, 'zh-CN/api-reference/rtc/android/4.6.0/channel.mdx');

    expect(prerenderContentRoutes.getContentDocsPrerenderPaths(root)).toEqual([
      '/en/api-reference/rtc/android',
      '/zh-CN/api-reference/rtc/android',
    ]);
  });

  it('excludes RTC Android class-and-enum docs from static prerender seeds', () => {
    const root = join(
      import.meta.dirname,
      `../../tmp/prerender-content-routes-${randomUUID()}`,
    );
    tempRoots.push(root);

    writeDoc(root, 'en/api-reference/rtc/android/index.mdx');
    writeDoc(
      root,
      'en/api-reference/rtc/android/(current)/class-and-enum/classes/class-rtcstats.mdx',
    );
    writeDoc(
      root,
      'zh-CN/api-reference/rtc/android/(current)/class-and-enum/enums/enum-rteerrorcode.mdx',
    );

    expect(prerenderContentRoutes.getContentDocsPrerenderPaths(root)).toEqual([
      '/en/api-reference/rtc/android',
    ]);
  });

  it('excludes heavy RTC Android API sections from static prerender seeds', () => {
    const root = join(
      import.meta.dirname,
      `../../tmp/prerender-content-routes-${randomUUID()}`,
    );
    tempRoots.push(root);

    writeDoc(root, 'en/api-reference/rtc/android/index.mdx');
    writeDoc(root, 'en/api-reference/rtc/android/(current)/playback/rte-player.mdx');
    writeDoc(
      root,
      'en/api-reference/rtc/android/(current)/video/video-basic.mdx',
    );
    writeDoc(
      root,
      'zh-CN/api-reference/rtc/android/(current)/audio/audio-basic.mdx',
    );

    expect(prerenderContentRoutes.getContentDocsPrerenderPaths(root)).toEqual([
      '/en/api-reference/rtc/android',
    ]);
  });

  it('keeps the RTC Android landing page but excludes all current-version child pages', () => {
    const root = join(
      import.meta.dirname,
      `../../tmp/prerender-content-routes-${randomUUID()}`,
    );
    tempRoots.push(root);

    writeDoc(root, 'en/api-reference/rtc/android/index.mdx');
    writeDoc(root, 'en/api-reference/rtc/android/(current)/overview.mdx');
    writeDoc(root, 'zh-CN/api-reference/rtc/android/index.mdx');
    writeDoc(root, 'zh-CN/api-reference/rtc/android/(current)/channel.mdx');

    expect(prerenderContentRoutes.getContentDocsPrerenderPaths(root)).toEqual([
      '/en/api-reference/rtc/android',
      '/zh-CN/api-reference/rtc/android',
    ]);
  });

  it('keeps only conversational-ai api-reference landing pages in static prerender seeds', () => {
    const root = join(
      import.meta.dirname,
      `../../tmp/prerender-content-routes-${randomUUID()}`,
    );
    tempRoots.push(root);

    writeDoc(root, 'en/api-reference/conversational-ai/index.md');
    writeDoc(root, 'en/api-reference/conversational-ai/client-toolkit/index.md');
    writeDoc(root, 'en/api-reference/conversational-ai/client-toolkit/android.mdx');
    writeDoc(root, 'en/api-reference/conversational-ai/server-sdk/index.md');
    writeDoc(root, 'en/api-reference/conversational-ai/server-sdk/python.mdx');
    writeDoc(root, 'en/api-reference/conversational-ai/rest-api/index.md');
    writeDoc(root, 'en/api-reference/conversational-ai/rest-api/authentication.md');
    writeDoc(root, 'zh-CN/api-reference/conversational-ai/index.md');
    writeDoc(root, 'zh-CN/api-reference/conversational-ai/rest-api/index.md');
    writeDoc(root, 'zh-CN/api-reference/conversational-ai/rest-api/agent/index.md');
    writeDoc(root, 'zh-CN/api-reference/conversational-ai/rest-api/authentication.mdx');

    expect(prerenderContentRoutes.getContentDocsPrerenderPaths(root)).toEqual([
      '/en/api-reference/conversational-ai',
      '/en/api-reference/conversational-ai/client-toolkit',
      '/en/api-reference/conversational-ai/rest-api',
      '/en/api-reference/conversational-ai/server-sdk',
      '/zh-CN/api-reference/conversational-ai',
      '/zh-CN/api-reference/conversational-ai/rest-api',
      '/zh-CN/api-reference/conversational-ai/rest-api/agent',
    ]);
  });

  it('keeps only ai models landing pages in static prerender seeds', () => {
    const root = join(
      import.meta.dirname,
      `../../tmp/prerender-content-routes-${randomUUID()}`,
    );
    tempRoots.push(root);

    writeDoc(root, 'en/ai/models/index.md');
    writeDoc(root, 'en/ai/models/asr/index.md');
    writeDoc(root, 'en/ai/models/asr/openai.mdx');
    writeDoc(root, 'en/ai/models/llm/index.md');
    writeDoc(root, 'en/ai/models/llm/gemini.mdx');
    writeDoc(root, 'zh-CN/ai/models/index.md');
    writeDoc(root, 'zh-CN/ai/models/tts/index.md');
    writeDoc(root, 'zh-CN/ai/models/tts/cartesia.mdx');
    writeDoc(root, 'zh-CN/ai/models/mllm/index.md');
    writeDoc(root, 'zh-CN/ai/models/mllm/openai.mdx');

    expect(prerenderContentRoutes.getContentDocsPrerenderPaths(root)).toEqual([
      '/en/ai/models',
      '/en/ai/models/asr',
      '/en/ai/models/llm',
      '/zh-CN/ai/models',
      '/zh-CN/ai/models/mllm',
      '/zh-CN/ai/models/tts',
    ]);
  });

  it('keeps only realtime-media rtc platform landing pages in static prerender seeds', () => {
    const root = join(
      import.meta.dirname,
      `../../tmp/prerender-content-routes-${randomUUID()}`,
    );
    tempRoots.push(root);

    writeDoc(root, 'en/realtime-media/rtc/index.md');
    writeDoc(root, 'en/realtime-media/rtc/android/index.md');
    writeDoc(root, 'en/realtime-media/rtc/android/audio/audio-routing.md');
    writeDoc(root, 'en/realtime-media/rtc/android/reference/billing.md');
    writeDoc(root, 'en/realtime-media/rtc/macOS/index.md');
    writeDoc(root, 'en/realtime-media/rtc/macOS/audio/audio-routing.md');
    writeDoc(root, 'zh-CN/realtime-media/rtc/index.md');

    expect(prerenderContentRoutes.getContentDocsPrerenderPaths(root)).toEqual([
      '/en/realtime-media/rtc',
      '/en/realtime-media/rtc/android',
      '/en/realtime-media/rtc/macOS',
      '/zh-CN/realtime-media/rtc',
    ]);
  });

  it('keeps only ai build landing pages in static prerender seeds', () => {
    const root = join(
      import.meta.dirname,
      `../../tmp/prerender-content-routes-${randomUUID()}`,
    );
    tempRoots.push(root);

    writeDoc(root, 'en/ai/build/index.md');
    writeDoc(root, 'en/ai/build/custom-llm.mdx');
    writeDoc(root, 'en/ai/build/build-server-client.mdx');
    writeDoc(root, 'zh-CN/ai/build/index.md');
    writeDoc(root, 'zh-CN/ai/build/custom-llm.mdx');
    writeDoc(root, 'zh-CN/ai/build/start-stop-agent.mdx');

    expect(prerenderContentRoutes.getContentDocsPrerenderPaths(root)).toEqual([
      '/en/ai/build',
      '/zh-CN/ai/build',
    ]);
  });

  it('can temporarily include deep routes under configured extra prerender prefixes', async () => {
    const root = join(
      import.meta.dirname,
      `../../tmp/prerender-content-routes-${randomUUID()}`,
    );
    tempRoots.push(root);

    writeDoc(root, 'en/ai/studio/index.md');
    writeDoc(root, 'en/ai/studio/deploy/sip-trunk.md');
    writeDoc(root, 'en/ai/device-kit/index.md');
    writeDoc(root, 'en/ai/device-kit/start-here/quickstart.md');

    expect(
      prerenderContentRoutes.getContentDocsPrerenderPaths(root, {
        extraPrerenderPrefixes: ['/en/ai/studio', '/en/ai/device-kit'],
      }),
    ).toEqual([
      '/en/ai/device-kit',
      '/en/ai/device-kit/start-here/quickstart',
      '/en/ai/studio',
      '/en/ai/studio/deploy/sip-trunk',
    ]);
  });

  it('excludes known redirect-only alias routes from static prerender seeds', () => {
    const root = join(
      import.meta.dirname,
      `../../tmp/prerender-content-routes-${randomUUID()}`,
    );
    tempRoots.push(root);

    writeDoc(root, 'en/ai/conversational-ai/index.md');
    writeDoc(root, 'en/ai/choose-your-path/quickstart-coding.mdx');
    writeDoc(root, 'en/ai/device-kit/index.md');
    writeDoc(root, 'en/ai/choose-your-path/quickstart-device-kit.mdx');
    writeDoc(root, 'en/api-reference/voice-ai-recipes/index.md');
    writeDoc(root, 'zh-CN/api-reference/voice-ai-recipes/index.md');
    writeDoc(root, 'en/best-practices/audio-settings.mdx');
    writeDoc(root, 'zh-CN/best-practices/audio-settings.mdx');
    writeDoc(root, 'en/best-practices/opt-latency.mdx');
    writeDoc(root, 'zh-CN/best-practices/opt-latency.mdx');
    writeDoc(root, 'en/best-practices/http-basic-auth.mdx');
    writeDoc(root, 'zh-CN/best-practices/http-basic-auth.mdx');
    writeDoc(root, 'en/ai/get-started/quickstart.mdx');
    writeDoc(root, 'en/ai/device-kit/start-here/quickstart.mdx');
    writeDoc(root, 'en/api-reference/recipes/index.md');
    writeDoc(root, 'zh-CN/ai/best-practices/audio-settings.mdx');
    writeDoc(root, 'en/ai/best-practices/regional-restrictions.mdx');
    writeDoc(
      root,
      'zh-CN/api-reference/conversational-ai/rest-api/authentication.mdx',
    );

    expect(prerenderContentRoutes.getContentDocsPrerenderPaths(root)).toEqual([
      '/en/ai/best-practices/regional-restrictions',
      '/en/ai/get-started/quickstart',
      '/en/api-reference/recipes',
      '/zh-CN/ai/best-practices/audio-settings',
    ]);
  });

  it('keeps only ai studio landing pages in static prerender seeds', () => {
    const root = join(
      import.meta.dirname,
      `../../tmp/prerender-content-routes-${randomUUID()}`,
    );
    tempRoots.push(root);

    writeDoc(root, 'en/ai/studio/index.md');
    writeDoc(root, 'en/ai/studio/build/customize-agent.mdx');
    writeDoc(root, 'en/ai/studio/deploy/import.mdx');
    writeDoc(root, 'en/ai/studio/quickstart.mdx');

    expect(prerenderContentRoutes.getContentDocsPrerenderPaths(root)).toEqual([
      '/en/ai/studio',
    ]);
  });

  it('excludes ai device-kit alias routes from static prerender seeds', () => {
    const root = join(
      import.meta.dirname,
      `../../tmp/prerender-content-routes-${randomUUID()}`,
    );
    tempRoots.push(root);

    writeDoc(root, 'en/ai/device-kit/index.md');
    writeDoc(root, 'en/ai/device-kit/start-here/quickstart.md');
    writeDoc(root, 'en/ai/device-kit/build/architecture-overview.md');
    writeDoc(root, 'en/ai/device-kit/reference/release-notes.md');
    writeDoc(root, 'zh-CN/ai/device-kit/index.md');
    writeDoc(root, 'zh-CN/ai/device-kit/build/run-the-r1-demo.md');
    writeDoc(root, 'zh-CN/ai/device-kit/reference/pricing.md');

    expect(prerenderContentRoutes.getContentDocsPrerenderPaths(root)).toEqual([]);
  });

  it('keeps only api-reference rtm landing pages in static prerender seeds', () => {
    const root = join(
      import.meta.dirname,
      `../../tmp/prerender-content-routes-${randomUUID()}`,
    );
    tempRoots.push(root);

    writeDoc(root, 'en/api-reference/rtm/index.md');
    writeDoc(root, 'en/api-reference/rtm/android.md');
    writeDoc(root, 'en/api-reference/rtm/javascript.md');
    writeDoc(root, 'zh-CN/api-reference/rtm/index.md');
    writeDoc(root, 'zh-CN/api-reference/rtm/android.md');

    expect(prerenderContentRoutes.getContentDocsPrerenderPaths(root)).toEqual([
      '/en/api-reference/rtm',
      '/zh-CN/api-reference/rtm',
    ]);
  });

  it('keeps only api-reference meeting landing pages in static prerender seeds', () => {
    const root = join(
      import.meta.dirname,
      `../../tmp/prerender-content-routes-${randomUUID()}`,
    );
    tempRoots.push(root);

    writeDoc(root, 'en/api-reference/meeting/index.md');
    writeDoc(root, 'en/api-reference/meeting/android.md');
    writeDoc(root, 'en/api-reference/meeting/web.md');
    writeDoc(root, 'en/api-reference/meeting/restful.md');

    expect(prerenderContentRoutes.getContentDocsPrerenderPaths(root)).toEqual([
      '/en/api-reference/meeting',
    ]);
  });

  it('keeps only api-reference whiteboard landing pages in static prerender seeds', () => {
    const root = join(
      import.meta.dirname,
      `../../tmp/prerender-content-routes-${randomUUID()}`,
    );
    tempRoots.push(root);

    writeDoc(root, 'en/api-reference/whiteboard/index.md');
    writeDoc(root, 'en/api-reference/whiteboard/android.md');
    writeDoc(root, 'en/api-reference/whiteboard/web.md');
    writeDoc(root, 'zh-CN/api-reference/whiteboard/index.md');

    expect(prerenderContentRoutes.getContentDocsPrerenderPaths(root)).toEqual([
      '/en/api-reference/whiteboard',
      '/zh-CN/api-reference/whiteboard',
    ]);
  });

  it('keeps only api-reference recipes landing pages in static prerender seeds', () => {
    const root = join(
      import.meta.dirname,
      `../../tmp/prerender-content-routes-${randomUUID()}`,
    );
    tempRoots.push(root);

    writeDoc(root, 'en/api-reference/recipes/index.mdx');
    writeDoc(root, 'en/api-reference/recipes/custom-llm.md');
    writeDoc(root, 'en/api-reference/recipes/python-quickstart.md');
    writeDoc(root, 'zh-CN/api-reference/recipes/index.mdx');
    writeDoc(root, 'zh-CN/api-reference/recipes/custom-modalities.md');
    writeDoc(root, 'zh-CN/api-reference/recipes/wellness-coach.md');

    expect(prerenderContentRoutes.getContentDocsPrerenderPaths(root)).toEqual([
      '/en/api-reference/recipes',
      '/zh-CN/api-reference/recipes',
    ]);
  });

  it('keeps only landing pages for multi-platform api-reference product groups', () => {
    const root = join(
      import.meta.dirname,
      `../../tmp/prerender-content-routes-${randomUUID()}`,
    );
    tempRoots.push(root);

    writeDoc(root, 'en/api-reference/im/index.md');
    writeDoc(root, 'en/api-reference/im/android.md');
    writeDoc(root, 'en/api-reference/im/ios.md');
    writeDoc(root, 'en/api-reference/im/web.md');
    writeDoc(root, 'en/api-reference/micro-calling/index.md');
    writeDoc(root, 'en/api-reference/micro-calling/android.md');
    writeDoc(root, 'en/api-reference/micro-calling/ios.md');
    writeDoc(root, 'en/api-reference/micro-calling/mini-program.md');
    writeDoc(root, 'en/api-reference/private-room/index.md');
    writeDoc(root, 'en/api-reference/private-room/android.md');
    writeDoc(root, 'en/api-reference/private-room/ios.md');
    writeDoc(root, 'en/api-reference/private-room/web.md');
    writeDoc(root, 'en/api-reference/rtc-server-sdk/index.md');
    writeDoc(root, 'en/api-reference/rtc-server-sdk/cpp.md');
    writeDoc(root, 'en/api-reference/rtc-server-sdk/java.md');
    writeDoc(root, 'en/api-reference/rtc-server-sdk/python.md');
    writeDoc(root, 'en/api-reference/rtsa/index.md');
    writeDoc(root, 'en/api-reference/rtsa/android.md');
    writeDoc(root, 'en/api-reference/rtsa/embedded.md');
    writeDoc(root, 'en/api-reference/rtsa/linux.md');
    writeDoc(root, 'en/api-reference/online-art-teaching/index.md');
    writeDoc(root, 'en/api-reference/online-art-teaching/android.md');
    writeDoc(root, 'en/api-reference/online-art-teaching/ios.md');
    writeDoc(root, 'en/api-reference/online-art-teaching/web.md');
    writeDoc(root, 'en/api-reference/online-music-teaching/index.md');
    writeDoc(root, 'en/api-reference/online-music-teaching/android.md');
    writeDoc(root, 'en/api-reference/online-music-teaching/ios.md');
    writeDoc(root, 'en/api-reference/online-music-teaching/web.md');
    writeDoc(root, 'en/api-reference/online-ktv/index.md');
    writeDoc(root, 'en/api-reference/online-ktv/paas-sdk.md');
    writeDoc(root, 'en/api-reference/online-ktv/scenario-api.md');
    writeDoc(root, 'en/api-reference/online-ktv/uikit.md');

    expect(prerenderContentRoutes.getContentDocsPrerenderPaths(root)).toEqual([
      '/en/api-reference/im',
      '/en/api-reference/micro-calling',
      '/en/api-reference/online-art-teaching',
      '/en/api-reference/online-ktv',
      '/en/api-reference/online-music-teaching',
      '/en/api-reference/private-room',
      '/en/api-reference/rtc-server-sdk',
      '/en/api-reference/rtsa',
    ]);
  });

  it('excludes legacy best-practices routes that always redirect at runtime', () => {
    const root = join(
      import.meta.dirname,
      `../../tmp/prerender-content-routes-${randomUUID()}`,
    );
    tempRoots.push(root);

    writeDoc(root, 'en/best-practices/geofencing.mdx');
    writeDoc(root, 'zh-CN/best-practices/geofencing.mdx');
    writeDoc(root, 'zh-CN/best-practices/release-notes.md');
    writeDoc(root, 'en/ai/best-practices/regional-restrictions.mdx');
    writeDoc(root, 'zh-CN/ai/best-practices/regional-restrictions.mdx');
    writeDoc(root, 'zh-CN/ai/release-notes.mdx');

    expect(prerenderContentRoutes.getContentDocsPrerenderPaths(root)).toEqual([
      '/en/ai/best-practices/regional-restrictions',
      '/zh-CN/ai/best-practices/regional-restrictions',
      '/zh-CN/ai/release-notes',
    ]);
  });
});

function writeDoc(root: string, relativePath: string) {
  const filePath = join(root, relativePath);
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, '# Test\n');
}
