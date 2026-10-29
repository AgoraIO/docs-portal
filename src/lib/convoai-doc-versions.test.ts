import type { Root } from 'fumadocs-core/page-tree';
import { describe, expect, it } from 'vitest';
import {
  getDocVersionSelections,
  getDocVersionTarget,
  resolveDocVersion,
  withDocVersionMetadata,
} from './doc-versions';
import { resolveDocsNavScope } from './docs-nav-scope';

describe('ConvoAI documentation integration', () => {
  it('defaults to Main, restores a saved Preview choice and keeps explicit links pinned', () => {
    expect(
      getDocVersionSelections('/en/ai/documentation-versions')[
        'convoai-guides'
      ],
    ).toBe('v1');
    expect(resolveDocVersion('/en/ai/build/managed-mode')?.version.label).toBe(
      'Main',
    );
    expect(
      resolveDocVersion('/en/ai/platform/build/managed-mode')?.version.status,
    ).toBe('preview');
    expect(
      getDocVersionSelections('/en/ai/documentation-versions', {
        convoai: 'v2',
      })['convoai-guides'],
    ).toBe('v2');
    expect(
      getDocVersionSelections(
        '/en/api-reference/api-ref/conversational-ai/documentation-versions',
      )['convoai-api'],
    ).toBe('v1');
    expect(
      getDocVersionSelections('/en/ai/platform/build/managed-mode', {
        convoai: 'v1',
      })['convoai-guides'],
    ).toBe('v2');
  });

  it.each([
    ['build/managed-mode', 'build/managed-mode'],
    ['best-practices/audio-setup', 'best-practices/audio-setup'],
    ['models/asr/openai', 'models/asr/openai'],
    ['models/tts/elevenlabs', 'models/tts/elevenlabs'],
    ['models/avatar/tavus', 'models/avatar/tavus'],
    ['build/start-stop-agent', 'get-started/start-stop-agent'],
    [
      'build/shape-the-conversation/custom-information',
      'build/shape-the-conversation/personalize-conversations',
    ],
    ['reference/event-types', 'reference/event-types'],
    ['release-notes', 'release-notes'],
  ])('switches the real topic %s in both directions', (voice, platform) => {
    expect(getDocVersionTarget(`/en/ai/${voice}`, 'v2')).toEqual({
      href: `/en/ai/platform/${platform}`,
      fallback: false,
    });
    expect(getDocVersionTarget(`/en/ai/platform/${platform}`, 'v1')).toEqual({
      href: `/en/ai/${voice}`,
      fallback: false,
    });
  });

  it.each([
    'get-started/quickstart',
    'best-practices/get-agent-state',
    'best-practices/manual-turn-control',
    'best-practices/optimize-latency',
    'best-practices/regional-restrictions',
    'build/build-server-client',
    'build/send-multimodal-messages',
    'build/transcripts',
    'build/custom-model-integration/audio-output',
    'build/custom-model-integration/custom-llm',
    'build/custom-model-integration/custom-tts',
    'build/handle-runtime-events/debug-agent-failures',
    'build/handle-runtime-events/event-notifications',
    'build/handle-runtime-events/get-runtime-events',
    'build/handle-runtime-events/monitor-agent-runtime',
    'build/handle-runtime-events/retrieve-session-history',
    'build/handle-runtime-events/webhooks',
    'build/tools/custom-tools',
    'build/tools/mcp-tools',
    'models/tts/gemini',
    'models/mllm/openai',
    'reference/ten-agent/create-asr-extension',
  ])('never switches %s into an unpublished Platform copy', (path) => {
    expect(getDocVersionTarget(`/en/ai/${path}`, 'v2')).toEqual({
      href: '/en/ai/platform?versionFallback=1',
      fallback: true,
    });
    expect(resolveDocVersion(`/en/ai/platform/${path}`)).toBeUndefined();
  });

  it('uses overview fallback for a Platform-only topic and drops incompatible anchors', () => {
    expect(
      getDocVersionTarget('/en/ai/platform/build/use-your-own-keys', 'v1'),
    ).toEqual({ href: '/en/ai?versionFallback=1', fallback: true });
    expect(
      getDocVersionTarget('/en/ai/reference/event-types#legacy-event', 'v2')
        ?.href,
    ).toBe('/en/ai/platform/reference/event-types');
  });

  it.each([
    '/en/ai/studio',
    '/en/ai/device-kit',
    '/en/ai/reference/pricing',
    '/en/ai/ten-agent',
    '/zh-CN/ai',
  ])('does not claim the shared or independent product %s', (path) => {
    expect(resolveDocVersion(path)).toBeUndefined();
  });

  it('shares real guide/API selection without inventing operation equivalence', () => {
    expect(
      getDocVersionSelections(
        '/en/api-reference/api-ref/conversational-ai/documentation-versions',
        { convoai: 'v1' },
      )['convoai-api'],
    ).toBe('v1');
    expect(
      getDocVersionTarget(
        '/en/api-reference/api-ref/conversational-ai/join',
        'v2',
      ),
    ).toEqual({
      href: '/en/api-reference/api-ref/conversational-ai/platform?versionFallback=1',
      fallback: true,
    });
    expect(
      getDocVersionTarget(
        '/en/api-reference/api-ref/conversational-ai/platform/start-session',
        'v1',
      ),
    ).toEqual({
      href: '/en/api-reference/api-ref/conversational-ai?versionFallback=1',
      fallback: true,
    });
    expect(
      resolveDocVersion(
        '/en/api-reference/api-ref/conversational-ai/client-toolkit/android',
      ),
    ).toBeUndefined();
  });

  it('excludes the other edition even when it contains a shared Pricing link', () => {
    const root: Root = {
      name: 'Docs',
      children: [
        {
          type: 'folder',
          name: 'AI',
          index: { type: 'page', name: 'Voice', url: '/en/ai' },
          children: [
            {
              type: 'page',
              name: 'Managed mode',
              url: '/en/ai/build/managed-mode',
            },
            { type: 'page', name: 'Pricing', url: '/en/ai/reference/pricing' },
            {
              type: 'page',
              name: 'REST API',
              url: '/en/api-reference/api-ref/conversational-ai',
            },
            {
              type: 'page',
              name: 'Other edition API',
              url: '/en/api-reference/api-ref/conversational-ai/platform',
            },
            {
              type: 'folder',
              name: 'Platform',
              index: { type: 'page', name: 'Platform', url: '/en/ai/platform' },
              children: [
                { type: 'separator', name: 'API operations' },
                {
                  type: 'page',
                  name: 'Pricing',
                  url: '/en/ai/reference/pricing',
                },
                {
                  type: 'page',
                  name: 'Managed mode',
                  url: '/en/ai/platform/build/managed-mode',
                },
              ],
            },
            { type: 'page', name: 'Studio', url: '/en/ai/studio' },
            { type: 'page', name: 'Device Kit', url: '/en/ai/device-kit' },
          ],
        },
      ],
    };
    const scope = resolveDocsNavScope({
      root,
      tab: 'ai',
      activePath: '/en/ai/build/managed-mode',
      getNodeMeta: () => undefined,
    });
    expect(
      scope?.sidebarRoot.children.map((node) =>
        node.type === 'page' ? node.url : node.name,
      ),
    ).toEqual([
      '/en/ai/build/managed-mode',
      '/en/ai/reference/pricing',
      '/en/api-reference/api-ref/conversational-ai',
    ]);
    expect(scope?.header).not.toHaveProperty('backHref');
  });

  it('gives fixed Markdown URLs the correct edition identity', () => {
    expect(
      withDocVersionMetadata(
        '# Managed mode\n\nBody',
        '/en/ai/build/managed-mode',
      ),
    ).toContain('Documentation version: Main');
    expect(
      withDocVersionMetadata(
        '# Managed mode\n\nBody',
        '/en/ai/platform/build/managed-mode',
      ),
    ).toContain('/llms/doc-versions-convoai-guides-v2.txt');
    expect(withDocVersionMetadata('# Studio\n\nBody', '/en/ai/studio')).toBe(
      '# Studio\n\nBody',
    );
  });
});
