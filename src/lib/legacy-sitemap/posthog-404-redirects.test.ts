import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

type VercelRedirect = {
  source: string;
  destination: string;
  statusCode: number;
};

const reviewedRedirects = [
  [
    '/en/solutions/agora-analytics/reference/pricing',
    '/en/realtime-media/agora-analytics/reference/pricing',
  ],
  [
    '/en/video-calling/get-started/get-started-sdk',
    '/en/realtime-media/video/quickstart',
  ],
  [
    '/en/video-calling/get-started/get-started-sdk/',
    '/en/realtime-media/video/quickstart',
  ],
  [
    '/en/solutions/flexible-classroom/product-overview',
    '/en/realtime-media/flexible-classroom/product-overview',
  ],
  [
    '/en/signaling/develop/get-started-sdk',
    '/en/realtime-media/rtm/quickstart',
  ],
  [
    '/en/solutions/agora-analytics/build/explore-and-analyze-data/call-search',
    '/en/realtime-media/agora-analytics/build/explore-and-analyze-data/call-search',
  ],
  ['/en/help', '/en/introduction/support'],
  ['/en/ai/models', '/en/ai'],
  [
    '/en/api-reference/api-ref/signaling/configuration',
    '/en/realtime-media/rtm/build/connect-and-authenticate/client-configuration',
  ],
  ['/en/build-with-ai', '/en/ai'],
  [
    '/en/api-reference/api-ref/media-push/integration-best-practices',
    '/en/realtime-media/media-push/build/integration-best-practices',
  ],
  [
    '/en/api-reference/api-ref/storage',
    '/en/realtime-media/rtm/build/manage-presence-and-metadata/storage/store-channel-metadata',
  ],
  [
    '/en/api-reference/api-reference/enable-ncs',
    '/en/realtime-media/transcoding/build/receive-ncs-events',
  ],
  [
    '/en/api-reference/api-ref/signaling/enumv',
    '/en/api-reference/api-ref/signaling',
  ],
  [
    '/en/api-reference/api-ref/signaling/enum',
    '/en/api-reference/api-ref/signaling',
  ],
  [
    '/en/api-reference/api-reference/ncs-events',
    '/en/realtime-media/transcoding/reference/ncs-events',
  ],
  [
    '/en/api-reference/api-ref/signaling/reference/limitations',
    '/en/realtime-media/rtm/reference/limitations',
  ],
  [
    '/en/api-reference/api-ref/signaling/toc-configuration/configuration',
    '/en/realtime-media/rtm/build/connect-and-authenticate/client-configuration',
  ],
  ['/en/status-page', 'https://status.agora.io/'],
  [
    '/en/video-calling/reference/agora-console-rest-api',
    '/en/api-reference/api-ref/console/solutions-agora-console-rest-api',
  ],
  [
    '/en/solutions/agora-analytics/build/integrate-and-embed/datadog-integration',
    '/en/realtime-media/agora-analytics/build/integrate-and-embed/datadog-integration',
  ],
  [
    '/en/solutions/agora-analytics/product-overview',
    '/en/realtime-media/agora-analytics/product-overview',
  ],
  [
    '/en/solutions/iot/product-overview',
    '/en/realtime-media/iot/product-overview',
  ],
  [
    '/en/realtime-media/iot/reference/licensing',
    '/en/realtime-media/iot/build/authenticate-and-secure-channels/license',
  ],
  [
    '/en/realtime-media/fusion-cdn',
    '/en/realtime-media/media-push/get-started/enable-media-push',
  ],
  ['/en/solutions/iot/quickstart', '/en/realtime-media/iot/quickstart'],
  [
    '/en/realtime-media/iot/build/stream-and-optimize-media/multi-channel-streaming',
    '/en/realtime-media/iot/build/manage-connections-and-quality/multi-channel-streaming',
  ],
  [
    '/en/api-reference/faq/integration/log',
    '/en/api-reference/faq/integration/set_log_file',
  ],
  [
    '/en/cloud-recording/reference/pricing',
    '/en/realtime-media/cloud-recording/reference/pricing',
  ],
  ['/en/rtc-1.0/rtc-1.0-landing-page', '/en/realtime-media/overview'],
  [
    '/en/assets/files/Agora_ISO_27018-0f20342310eefc1424b81ff98caf707d.pdf',
    'https://docs.agora.io/files/Agora_ISO_27018.pdf',
  ],
  [
    '/en/cloud-recording/reference/restful-api',
    '/en/api-reference/api-ref/cloud-recording',
  ],
  [
    '/en/Interactive%20Broadcast/product_live',
    '/en/realtime-media/interactive-live-streaming/product-overview',
  ],
  ['/en/Agora%20Platform/ticket', 'https://agora-ticket.agora.io/'],
  [
    '/en/video-calling/get-started/authentication-workflow',
    '/en/realtime-media/video/build/authenticate-users/authentication-workflow',
  ],
  ['/en/Agora%20Platform/community', '/en/introduction/community-resources'],
  ['/en/Agora%20Platform/token', '/en/introduction/account'],
  ['/en/Agora%20Platform/terms', 'https://www.agora.io/en/terms-of-service/'],
  ['/en/Agora%20Platform/firewall', '/en/introduction/firewall'],
  ['/en/Video/downloads', '/en/api-reference/sdks'],
  ['/en/ai/models/asr/overview', '/en/ai/models/asr/deepgram'],
  [
    '/en/video-calling/reference/restful-authentication',
    '/en/api-reference/api-ref/rtc/authentication',
  ],
  ['/en/Video/start_call_ios', '/en/realtime-media/video/quickstart'],
  [
    '/en/video-calling/reference/release-notes',
    '/en/realtime-media/video/reference/release-notes',
  ],
  [
    '/en/solutions/flexible-classroom/quickstart/ios',
    '/en/realtime-media/flexible-classroom/quickstart',
  ],
  ['/en/video-calling/reference/downloads', '/en/api-reference/sdks'],
  [
    '/en/Interactive%20Broadcast/game_streaming_video_profile',
    '/en/realtime-media/interactive-live-streaming/product-overview',
  ],
  [
    '/en/solutions/flexible-classroom/quickstart/web',
    '/en/realtime-media/flexible-classroom/quickstart',
  ],
  ['/en/Voice/downloads', '/en/api-reference/sdks'],
  ['/en/Video/start_call_android', '/en/realtime-media/video/quickstart'],
  [
    '/en/realtime-media/reference/restful-authentication',
    '/en/api-reference/api-ref/rtc/authentication',
  ],
] as const;

describe('PostHog-discovered English 404 redirects', () => {
  const baseConfig = JSON.parse(readFileSync('vercel.base.json', 'utf8')) as {
    redirects: VercelRedirect[];
  };
  const generatedConfig = JSON.parse(readFileSync('vercel.json', 'utf8')) as {
    redirects: VercelRedirect[];
  };
  const docsInventory = JSON.parse(
    readFileSync('src/lib/legacy-sitemap/new-docs-inventory.json', 'utf8'),
  ) as { routes: Array<{ routePath: string }> };

  it('keeps one exact 301 rule per reviewed source in both Vercel configs', () => {
    expect(reviewedRedirects).toHaveLength(51);
    expect(new Set(reviewedRedirects.map(([source]) => source)).size).toBe(
      reviewedRedirects.length,
    );

    for (const [source, destination] of reviewedRedirects) {
      const expected = { source, destination, statusCode: 301 };
      expect(
        baseConfig.redirects.filter(
          (redirect) => redirect.source === source && !('has' in redirect),
        ),
      ).toEqual([expected]);
      expect(
        generatedConfig.redirects.filter(
          (redirect) => redirect.source === source && !('has' in redirect),
        ),
      ).toEqual([expected]);
    }
  });

  it('points internal redirects to routes present in the docs inventory', () => {
    const inventoryPaths = new Set(
      docsInventory.routes.map((route) => route.routePath),
    );
    const migratedArticleFiles = new Map([
      [
        '/en/realtime-media/iot/build/authenticate-and-secure-channels/license',
        'content/docs/en/realtime-media/iot/build/authenticate-and-secure-channels/license.mdx',
      ],
      [
        '/en/realtime-media/iot/build/manage-connections-and-quality/multi-channel-streaming',
        'content/docs/en/realtime-media/iot/build/manage-connections-and-quality/multi-channel-streaming.mdx',
      ],
    ]);
    for (const [, destination] of reviewedRedirects) {
      if (destination.startsWith('/en/')) {
        const migratedArticleFile = migratedArticleFiles.get(destination);
        expect(
          inventoryPaths.has(destination) ||
            (migratedArticleFile !== undefined &&
              existsSync(migratedArticleFile)),
        ).toBe(true);
      }
    }
  });
});
