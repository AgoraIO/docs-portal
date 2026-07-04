import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
  auditMigrationParity,
  compareRecords,
  createIntermediateRecords,
  expandLegacyFiles,
  projectTargetContent,
} from './audit-migration-parity.mjs';

const tempDirs: string[] = [];

describe('auditMigrationParity', () => {
  afterEach(async () => {
    await Promise.all(
      tempDirs
        .splice(0)
        .map((dir) => fs.rm(dir, { force: true, recursive: true })),
    );
  });

  it('expands private shared imports and filters platform/product wrappers', async () => {
    const sourceRoot = await mkTempDir('migration-parity-source-');
    await writeFile(
      path.join(sourceRoot, 'video-calling', 'advanced-features', 'custom.mdx'),
      [
        '---',
        'title: Custom',
        '---',
        '',
        "import Shared from '@docs/shared/video-sdk/custom/index.mdx';",
        '',
        '<Shared />',
      ].join('\n'),
    );
    await writeFile(
      path.join(sourceRoot, 'shared', 'video-sdk', 'custom', 'index.mdx'),
      [
        'import Android from "./android.mdx";',
        'import Ios from "./ios.mdx";',
        '',
        'Intro from <Vg k="COMPANY" />.',
        '',
        '<Android />',
        '<Ios />',
        '',
        '<ProductWrapper product="voice-calling">',
        'Voice-only content.',
        '</ProductWrapper>',
      ].join('\n'),
    );
    await writeFile(
      path.join(sourceRoot, 'shared', 'video-sdk', 'custom', 'android.mdx'),
      [
        '<PlatformWrapper platform="android">',
        'Android body for <Vpd k="SDK" />.',
        '</PlatformWrapper>',
      ].join('\n'),
    );
    await writeFile(
      path.join(sourceRoot, 'shared', 'video-sdk', 'custom', 'ios.mdx'),
      [
        '<PlatformWrapper platform="ios">',
        'iOS body.',
        '</PlatformWrapper>',
      ].join('\n'),
    );

    const expanded = expandLegacyFiles({
      projection: { platform: 'android', product: 'video-calling' },
      sourceFiles: ['video-calling/advanced-features/custom.mdx'],
      sourceRoot,
    });

    expect(expanded.resolvedFiles).toEqual([
      'video-calling/advanced-features/custom.mdx',
      'shared/video-sdk/custom/index.mdx',
      'shared/video-sdk/custom/android.mdx',
      'shared/video-sdk/custom/ios.mdx',
    ]);
    expect(expanded.content).toContain('Intro from Agora.');
    expect(expanded.content).toContain('Android body for Video SDK.');
    expect(expanded.content).not.toContain('iOS body.');
    expect(expanded.content).not.toContain('Voice-only content.');
  });

  it('projects target platform blocks before building records', () => {
    const projected = projectTargetContent(
      [
        'Shared intro.',
        '',
        '<PlatformStructured platform="android">',
        'Android body.',
        '</PlatformStructured>',
        '',
        '<PlatformStructured platform="ios">',
        'iOS body.',
        '</PlatformStructured>',
      ].join('\n'),
      {
        projection: { platform: 'android', product: 'video-calling' },
        variables: {},
      },
    );

    expect(projected).toContain('Shared intro.');
    expect(projected).toContain('Android body.');
    expect(projected).not.toContain('iOS body.');
  });

  it('normalizes records for headings, links, images, code, tabs, callouts, and lists', () => {
    const records = createIntermediateRecords({
      content: [
        '## Implement',
        '',
        '<Tabs groupId="language">',
        '<TabItem value="java" label="Java">',
        '<CodeBlock language="java">',
        '{`engine.joinChannel(token);`}',
        '</CodeBlock>',
        '</TabItem>',
        '</Tabs>',
        '',
        '<Admonition type="info" title="Information">',
        'Use `getCurrentMonotonicTimeInMs`.',
        '</Admonition>',
        '',
        '![API call sequence](https://assets-docs.agora.io/images/custom.svg)',
        '- [joinChannel]({{Global.API_REF_ANDROID_ROOT}}/class_irtcengine.html#api_irtcengine_joinchannel)',
      ].join('\n'),
      location: 'source.mdx',
      side: 'source',
    });

    expect(records.map((record) => record.kind)).toContain('heading:2');
    expect(records).toContainEqual(
      expect.objectContaining({ kind: 'tab', value: 'java' }),
    );
    expect(records).toContainEqual(
      expect.objectContaining({
        kind: 'code:java',
        value: 'engine.joinChannel(token);',
      }),
    );
    expect(records).toContainEqual(
      expect.objectContaining({ kind: 'callout', value: 'note' }),
    );
    expect(records).toContainEqual(
      expect.objectContaining({
        kind: 'image',
        value: 'API call sequence -> https://assets-docs.agora.io/images/custom.svg',
      }),
    );
    expect(records).toContainEqual(
      expect.objectContaining({
        kind: 'link',
        value:
          'joinChannel -> https://api-ref.agora.io/en/video-sdk/android/4.x/API/class_irtcengine.html#api_irtcengine_joinchannel',
      }),
    );
  });

  it('keeps nested square brackets inside link labels', () => {
    const records = createIntermediateRecords({
      content:
        '- <Link to="{{Global.API_REF_ANDROID_ROOT}}/class_irtcengine.html#api_irtcengine_pushvideoframe3">`pushExternalVideoFrameById` [2/2]</Link>',
      location: 'source.mdx',
      side: 'source',
    });

    expect(records).toContainEqual(
      expect.objectContaining({
        kind: 'link',
        value:
          'pushExternalVideoFrameById 2/2 -> https://api-ref.agora.io/en/video-sdk/android/4.x/API/class_irtcengine.html#api_irtcengine_pushvideoframe3',
      }),
    );
    expect(records).toContainEqual(
      expect.objectContaining({
        kind: 'list-item',
        value:
          'pushExternalVideoFrameById 2/2 (https://api-ref.agora.io/en/video-sdk/android/4.x/API/class_irtcengine.html#api_irtcengine_pushvideoframe3)',
      }),
    );
  });

  it('normalizes source tabs and target code tabs to the same record order', () => {
    const sourceRecords = createIntermediateRecords({
      content: [
        '<Tabs groupId="language">',
        '<TabItem value="java" label="Java">',
        '<CodeBlock language="java">',
        '{`engine.joinChannel(token);`}',
        '</CodeBlock>',
        '</TabItem>',
        '<TabItem value="kotlin" label="Kotlin">',
        '<CodeBlock language="kotlin">',
        '{`engine.joinChannel(token)`}',
        '</CodeBlock>',
        '</TabItem>',
        '</Tabs>',
      ].join('\n'),
      location: 'source.mdx',
      side: 'source',
    });
    const targetRecords = createIntermediateRecords({
      content: [
        '<CodeBlockTabs defaultValue="java">',
        '<CodeBlockTabsList>',
        '<CodeBlockTabsTrigger value="java">Java</CodeBlockTabsTrigger>',
        '<CodeBlockTabsTrigger value="kotlin">Kotlin</CodeBlockTabsTrigger>',
        '</CodeBlockTabsList>',
        '<CodeBlockTab value="java">',
        '```java',
        'engine.joinChannel(token);',
        '```',
        '</CodeBlockTab>',
        '<CodeBlockTab value="kotlin">',
        '```kotlin',
        'engine.joinChannel(token)',
        '```',
        '</CodeBlockTab>',
        '</CodeBlockTabs>',
      ].join('\n'),
      location: 'target.mdx',
      side: 'target',
    });

    expect(sourceRecords.map(({ kind, value }) => [kind, value])).toEqual([
      ['tab', 'java'],
      ['code:java', 'engine.joinChannel(token);'],
      ['tab', 'kotlin'],
      ['code:kotlin', 'engine.joinChannel(token)'],
    ]);
    expect(targetRecords.map(({ kind, value }) => [kind, value])).toEqual([
      ['tab', 'java'],
      ['code:java', 'engine.joinChannel(token);'],
      ['tab', 'kotlin'],
      ['code:kotlin', 'engine.joinChannel(token)'],
    ]);
    expect(compareRecords({ sourceRecords, targetRecords }).findings).toEqual({
      changed: [],
      extra: [],
      missing: [],
      moved: [],
      unsupported: [],
    });
  });

  it('reports manifest-backed missing, extra, changed, moved, and ignored records', async () => {
    const repoRoot = await mkTempDir('migration-parity-repo-');
    const sourceRoot = await mkTempDir('migration-parity-source-');
    const manifestPath = path.join(repoRoot, 'manifest.json');

    await writeFile(
      path.join(sourceRoot, 'video-calling', 'advanced-features', 'sample.mdx'),
      [
        '# Sample',
        '',
        'First source paragraph.',
        '',
        'Second source paragraph.',
        '',
        'A changed sentence from source.',
        '',
        'Missing sentence from source.',
      ].join('\n'),
    );
    await writeFile(
      path.join(repoRoot, 'content', 'docs', 'en', 'sample.mdx'),
      [
        '# Sample',
        '',
        'Second source paragraph.',
        '',
        'First source paragraph.',
        '',
        'A changed sentence from target.',
        '',
        'Extra sentence in target.',
        '',
        'Intentional target summary.',
      ].join('\n'),
    );
    await writeFile(
      manifestPath,
      JSON.stringify(
        {
          defaults: {
            platform: 'android',
            product: 'video-calling',
          },
          pages: [
            {
              id: 'sample',
              ignoreRules: [
                {
                  id: 'intentional-summary',
                  kind: 'paragraph',
                  side: 'target',
                  contains: 'Intentional target summary.',
                  reason: 'Added summary.',
                },
              ],
              sourceFiles: ['video-calling/advanced-features/sample.mdx'],
              targetPath: 'content/docs/en/sample.mdx',
            },
          ],
          source: {
            repository: 'AgoraIO/Doc-Source-Private',
          },
        },
        null,
        2,
      ),
    );

    const report = auditMigrationParity({
      manifestPath,
      repoRoot,
      sourceRoot,
    });
    const page = report.pages[0];

    expect(report.summary.pagesAudited).toBe(1);
    expect(page.findings.moved).toHaveLength(1);
    expect(page.findings.changed).toEqual([
      expect.objectContaining({
        source: expect.objectContaining({
          excerpt: 'A changed sentence from source.',
        }),
        target: expect.objectContaining({
          excerpt: 'A changed sentence from target.',
        }),
      }),
    ]);
    expect(page.findings.missing).toEqual([
      expect.objectContaining({ excerpt: 'Missing sentence from source.' }),
    ]);
    expect(page.findings.extra).toEqual([
      expect.objectContaining({ excerpt: 'Extra sentence in target.' }),
    ]);
    expect(page.ignored).toEqual([
      expect.objectContaining({
        reason: 'Added summary.',
        ruleId: 'intentional-summary',
      }),
    ]);
  });

  it('runs full target coverage with inferred mappings and source-only accounting', async () => {
    const repoRoot = await mkTempDir('migration-parity-repo-');
    const sourceRoot = await mkTempDir('migration-parity-source-');
    const manifestPath = path.join(repoRoot, 'manifest.json');

    await writeFile(
      path.join(sourceRoot, 'shared', 'variables', 'global.js'),
      "export const COMPANY = 'Agora';\n",
    );
    await writeFile(
      path.join(sourceRoot, 'shared', 'variables', 'product.js'),
      [
        'const data = {',
        "  'video-calling': {",
        "    NAME: 'Video Calling',",
        "    SDK: 'Video SDK',",
        '  }',
        '};',
        'export default data;',
      ].join('\n'),
    );
    await writeFile(
      path.join(sourceRoot, 'shared', 'variables', 'platform.js'),
      [
        'const data = {',
        "  'android': {",
        "    CLIENT: 'app',",
        '  }',
        '};',
        'export default data;',
      ].join('\n'),
    );
    await writeFile(
      path.join(sourceRoot, 'video-calling', 'advanced-features', 'clean.mdx'),
      [
        "import Shared from '@docs/shared/video-sdk/clean.mdx';",
        '',
        '# Clean',
        '',
        'Hello from <Vg k="COMPANY" /> <Vpd k="SDK" />.',
        '',
        '<Shared />',
      ].join('\n'),
    );
    await writeFile(
      path.join(sourceRoot, 'shared', 'video-sdk', 'clean.mdx'),
      'Shared sentence.',
    );
    await writeFile(
      path.join(
        sourceRoot,
        'video-calling',
        'advanced-features',
        'source-only.mdx',
      ),
      '# Source only',
    );
    await writeFile(
      path.join(
        repoRoot,
        'content',
        'docs',
        'en',
        'realtime-media',
        'video',
        'build',
        'clean.mdx',
      ),
      [
        '# Clean',
        '',
        'Hello from Agora Video SDK.',
        '',
        'Shared sentence.',
      ].join('\n'),
    );
    await writeFile(
      path.join(repoRoot, 'content', 'docs', 'en', 'local-only.mdx'),
      '# Local only',
    );
    await writeFile(
      manifestPath,
      JSON.stringify(
        {
          defaults: {
            platform: 'android',
            product: 'video-calling',
          },
          pages: [
            {
              id: 'placeholder',
              sourceFiles: ['video-calling/advanced-features/clean.mdx'],
              targetPath:
                'content/docs/en/realtime-media/video/build/clean.mdx',
            },
          ],
          source: {
            repository: 'AgoraIO/Doc-Source-Private',
          },
        },
        null,
        2,
      ),
    );

    const report = auditMigrationParity({
      allTargets: true,
      manifestPath,
      repoRoot,
      sourceRoot,
      targetRoot: path.join(repoRoot, 'content', 'docs', 'en'),
    });

    expect(report.fullAudit.summary).toEqual(
      expect.objectContaining({
        comparedClean: 1,
        sourceFilesTotal: 3,
        sourceOnly: 1,
        targetFilesTotal: 2,
        unmappedTarget: 1,
      }),
    );
    expect(
      report.fullAudit.sourceOnly.map(
        (entry: { sourcePath: string }) => entry.sourcePath,
      ),
    ).not.toContain('shared/video-sdk/clean.mdx');
    expect(
      report.fullAudit.pages.map(
        (page: { status: string; targetPath: string }) => [
          page.targetPath,
          page.status,
        ],
      ),
    ).toContainEqual(['content/docs/en/local-only.mdx', 'unmapped-target']);
  });

  it('uses deterministic specialized mappings for renamed migration lanes', async () => {
    const repoRoot = await mkTempDir('migration-parity-repo-');
    const sourceRoot = await mkTempDir('migration-parity-source-');
    const manifestPath = path.join(repoRoot, 'manifest.json');

    await writeFile(
      path.join(
        sourceRoot,
        'agora-chat',
        'restful-api',
        'contact-management.mdx',
      ),
      '# Contact management',
    );
    await writeFile(
      path.join(
        sourceRoot,
        'shared',
        'broadcast-streaming-private-product',
        'restful-api',
        '_watermarks.mdx',
      ),
      '# Watermarks',
    );
    await writeFile(
      path.join(
        sourceRoot,
        'extensions-marketplace',
        'develop',
        'integrate',
        'ht_3d_avatar.mdx',
      ),
      '# HT 3D Avatar',
    );
    await writeFile(
      path.join(
        sourceRoot,
        'signaling',
        'core-functionality',
        'message-channel.mdx',
      ),
      '# Message channel',
    );
    await writeFile(
      path.join(
        sourceRoot,
        'convo-ai-device-kit',
        'get-started',
        'quickstart.mdx',
      ),
      '# Device quickstart',
    );
    await writeFile(
      path.join(
        sourceRoot,
        'video-calling',
        'advanced-features',
        'custom-video.mdx',
      ),
      '# Custom video',
    );
    await writeFile(
      path.join(
        sourceRoot,
        'interactive-live-streaming',
        'advanced-features',
        'custom-video.mdx',
      ),
      '# Interactive live custom video',
    );
    await writeFile(
      path.join(
        sourceRoot,
        'agora-chat',
        'client-api',
        'messages',
        'send-receive-messages.mdx',
      ),
      '# Send and receive messages',
    );
    await writeFile(
      path.join(
        sourceRoot,
        'signaling',
        'core-functionality',
        'connection-management.mdx',
      ),
      '# Connection management',
    );
    await writeFile(
      path.join(
        sourceRoot,
        'server-gateway',
        'develop',
        'send-receive-media-streams.mdx',
      ),
      '# Send and receive media streams',
    );
    await writeFile(
      path.join(sourceRoot, 'media-gateway', 'advanced', 'abr.mdx'),
      '# Adaptive bitrate',
    );
    await writeFile(
      path.join(
        sourceRoot,
        'interactive-whiteboard',
        'develop',
        'scenes',
        'manage-scenes.mdx',
      ),
      '# Manage scenes',
    );
    await writeFile(
      path.join(
        sourceRoot,
        'flexible-classroom',
        'develop',
        'integrate',
        'embed-custom-plugin.mdx',
      ),
      '# Embed custom plugin',
    );
    await writeFile(
      path.join(
        sourceRoot,
        'broadcast-streaming',
        'advanced-features',
        'ai-noise-suppression.mdx',
      ),
      '# AI Noise Suppression',
    );
    await writeFile(
      path.join(
        sourceRoot,
        'voice-calling',
        'token-authentication',
        'authentication-workflow.mdx',
      ),
      '# Use tokens',
    );
    await writeFile(
      path.join(
        sourceRoot,
        'conversational-ai',
        'reference',
        'toolkot',
        'web.mdx',
      ),
      '# Web toolkit API',
    );
    await writeFile(
      path.join(
        sourceRoot,
        'media-gateway',
        'best-practices',
        'best-practice.mdx',
      ),
      '# Integration',
    );
    await writeFile(
      path.join(sourceRoot, 'cloud-recording', 'develop', 'composite-mode.md'),
      '# Composite mode',
    );
    await writeFile(
      path.join(
        sourceRoot,
        'cloud-recording',
        'best-practices',
        'webpage-best-practices.md',
      ),
      '# Webpage best practices',
    );
    await writeFile(
      path.join(
        sourceRoot,
        'on-premise-recording',
        'develop',
        'cloud-proxy.mdx',
      ),
      '# Cloud Proxy',
    );
    await writeFile(
      path.join(
        sourceRoot,
        'real-time-stt',
        'best-practice',
        'enable-service.mdx',
      ),
      '# Enable service',
    );
    await writeFile(
      path.join(sourceRoot, 'real-time-stt', 'develop', 'parse-data.mdx'),
      '# Parse data',
    );
    await writeFile(
      path.join(
        sourceRoot,
        'agora-analytics',
        'analyze',
        'video-voice-sdk',
        'monitor.mdx',
      ),
      '# Monitor',
    );
    await writeFile(
      path.join(
        sourceRoot,
        'agora-analytics',
        'analyze',
        'chat-sdk',
        'data-insights.mdx',
      ),
      '# Data insights',
    );
    await writeFile(
      path.join(sourceRoot, 'iot', 'develop', 'media-stream-encryption.mdx'),
      '# Media stream encryption',
    );
    await writeFile(
      path.join(
        repoRoot,
        'content',
        'docs',
        'en',
        'api-reference',
        'api-ref',
        'im',
        'contact-management.md',
      ),
      '# Contact management',
    );
    await writeFile(
      path.join(
        repoRoot,
        'content',
        'docs',
        'en',
        'api-reference',
        'api-ref',
        'broadcast-streaming',
        'watermarks.mdx',
      ),
      '# Watermarks',
    );
    await writeFile(
      path.join(
        repoRoot,
        'content',
        'docs',
        'en',
        'realtime-media',
        'marketplace',
        'build',
        'ht-3d-avatar.mdx',
      ),
      '# HT 3D Avatar',
    );
    await writeFile(
      path.join(
        repoRoot,
        'content',
        'docs',
        'en',
        'realtime-media',
        'rtm',
        'build',
        'channels',
        'message-channel.mdx',
      ),
      '# Message channel',
    );
    await writeFile(
      path.join(
        repoRoot,
        'content',
        'docs',
        'en',
        'ai',
        'device-kit',
        'start-here',
        'quickstart.mdx',
      ),
      '# Device quickstart',
    );
    await writeFile(
      path.join(
        repoRoot,
        'content',
        'docs',
        'en',
        'realtime-media',
        'video',
        'build',
        'capture-and-render-video',
        'custom-video.mdx',
      ),
      '# Custom video',
    );
    await writeFile(
      path.join(
        repoRoot,
        'content',
        'docs',
        'en',
        'realtime-media',
        'interactive-live-streaming',
        'build',
        'process-raw-and-custom-media',
        'custom-video.mdx',
      ),
      '# Interactive live custom video',
    );
    await writeFile(
      path.join(
        repoRoot,
        'content',
        'docs',
        'en',
        'realtime-media',
        'im',
        'build',
        'build-core-messaging',
        'messages',
        'send-receive-messages.md',
      ),
      '# Send and receive messages',
    );
    await writeFile(
      path.join(
        repoRoot,
        'content',
        'docs',
        'en',
        'realtime-media',
        'rtm',
        'build',
        'connect-and-authenticate',
        'connection',
        'connection-management.md',
      ),
      '# Connection management',
    );
    await writeFile(
      path.join(
        repoRoot,
        'content',
        'docs',
        'en',
        'realtime-media',
        'rtc-server-sdk',
        'build',
        'build-core-media-features',
        'send-receive-media-streams.md',
      ),
      '# Send and receive media streams',
    );
    await writeFile(
      path.join(
        repoRoot,
        'content',
        'docs',
        'en',
        'realtime-media',
        'rtmp-gateway',
        'build',
        'optimize-quality-and-monitor-events',
        'enable-adaptive-bitrate.md',
      ),
      '# Adaptive bitrate',
    );
    await writeFile(
      path.join(
        repoRoot,
        'content',
        'docs',
        'en',
        'realtime-media',
        'whiteboard',
        'build',
        'display-files-and-manage-scenes',
        'scenes',
        'manage-scenes.mdx',
      ),
      '# Manage scenes',
    );
    await writeFile(
      path.join(
        repoRoot,
        'content',
        'docs',
        'en',
        'realtime-media',
        'flexible-classroom',
        'build',
        'customize-the-ui-and-plugins',
        'embed-custom-plugin.md',
      ),
      '# Embed custom plugin',
    );
    await writeFile(
      path.join(
        repoRoot,
        'content',
        'docs',
        'en',
        'realtime-media',
        'broadcast-streaming',
        'build',
        'apply-effects-and-enhancements',
        'ai-noise-suppression.mdx',
      ),
      '# AI Noise Suppression',
    );
    await writeFile(
      path.join(
        repoRoot,
        'content',
        'docs',
        'en',
        'realtime-media',
        'voice',
        'build',
        'set-up-token-authentication',
        'use-tokens.mdx',
      ),
      '# Use tokens',
    );
    await writeFile(
      path.join(
        repoRoot,
        'content',
        'docs',
        'en',
        'api-reference',
        'api-ref',
        'conversational-ai',
        'client-toolkit',
        'web.mdx',
      ),
      '# Web toolkit API',
    );
    await writeFile(
      path.join(
        repoRoot,
        'content',
        'docs',
        'en',
        'realtime-media',
        'rtmp-gateway',
        'reference',
        'integration.md',
      ),
      '# Integration',
    );
    await writeFile(
      path.join(
        repoRoot,
        'content',
        'docs',
        'en',
        'realtime-media',
        'cloud-recording',
        'build',
        'start-a-recording',
        'composite-mode.mdx',
      ),
      '# Composite mode',
    );
    await writeFile(
      path.join(
        repoRoot,
        'content',
        'docs',
        'en',
        'realtime-media',
        'cloud-recording',
        'build',
        'best-practices',
        'webpage-best-practices.mdx',
      ),
      '# Webpage best practices',
    );
    await writeFile(
      path.join(
        repoRoot,
        'content',
        'docs',
        'en',
        'realtime-media',
        'on-premise-recording',
        'build',
        'connect-through-a-firewall',
        'cloud-proxy.mdx',
      ),
      '# Cloud Proxy',
    );
    await writeFile(
      path.join(
        repoRoot,
        'content',
        'docs',
        'en',
        'realtime-media',
        'speech-to-text',
        'build',
        'start-transcribing-and-translating',
        'enable-service.md',
      ),
      '# Enable service',
    );
    await writeFile(
      path.join(
        repoRoot,
        'content',
        'docs',
        'en',
        'realtime-media',
        'speech-to-text',
        'build',
        'process-transcription-data',
        'parse-data.mdx',
      ),
      '# Parse data',
    );
    await writeFile(
      path.join(
        repoRoot,
        'content',
        'docs',
        'en',
        'realtime-media',
        'agora-analytics',
        'build',
        'monitor-and-get-alerts',
        'monitor.md',
      ),
      '# Monitor',
    );
    await writeFile(
      path.join(
        repoRoot,
        'content',
        'docs',
        'en',
        'realtime-media',
        'agora-analytics',
        'build',
        'explore-and-analyze-data',
        'chat-data-insights.md',
      ),
      '# Data insights',
    );
    await writeFile(
      path.join(
        repoRoot,
        'content',
        'docs',
        'en',
        'realtime-media',
        'iot',
        'build',
        'set-up-authentication-and-security',
        'media-stream-encryption.md',
      ),
      '# Media stream encryption',
    );
    await writeFile(
      manifestPath,
      JSON.stringify(
        {
          defaults: {
            platform: 'android',
            product: 'video-calling',
          },
          pages: [
            {
              id: 'placeholder',
              sourceFiles: ['agora-chat/restful-api/contact-management.mdx'],
              targetPath:
                'content/docs/en/api-reference/api-ref/im/contact-management.md',
            },
          ],
          source: {
            repository: 'AgoraIO/Doc-Source-Private',
          },
        },
        null,
        2,
      ),
    );

    const report = auditMigrationParity({
      allTargets: true,
      manifestPath,
      repoRoot,
      sourceRoot,
      targetRoot: path.join(repoRoot, 'content', 'docs', 'en'),
    });
    const pagesByTarget = new Map(
      report.fullAudit.pages.map(
        (page: {
          mappingReason?: string;
          source: { files: string[] };
          targetPath: string;
        }) => [page.targetPath, page],
      ),
    );

    expect(
      pagesByTarget.get(
        'content/docs/en/realtime-media/video/build/capture-and-render-video/custom-video.mdx',
      ),
    ).toEqual(
      expect.objectContaining({
        mappingReason: 'video-sdk-build-group-alias',
        source: expect.objectContaining({
          files: ['video-calling/advanced-features/custom-video.mdx'],
        }),
      }),
    );
    expect(
      pagesByTarget.get(
        'content/docs/en/realtime-media/interactive-live-streaming/build/process-raw-and-custom-media/custom-video.mdx',
      ),
    ).toEqual(
      expect.objectContaining({
        mappingReason: 'video-sdk-build-group-alias',
        source: expect.objectContaining({
          files: [
            'interactive-live-streaming/advanced-features/custom-video.mdx',
          ],
        }),
      }),
    );
    expect(
      pagesByTarget.get(
        'content/docs/en/realtime-media/im/build/build-core-messaging/messages/send-receive-messages.md',
      ),
    ).toEqual(
      expect.objectContaining({
        mappingReason: 'chat-build-group-lane',
        source: expect.objectContaining({
          files: ['agora-chat/client-api/messages/send-receive-messages.mdx'],
        }),
      }),
    );
    expect(
      pagesByTarget.get(
        'content/docs/en/realtime-media/rtm/build/connect-and-authenticate/connection/connection-management.md',
      ),
    ).toEqual(
      expect.objectContaining({
        mappingReason: 'signaling-build-group-lane',
        source: expect.objectContaining({
          files: ['signaling/core-functionality/connection-management.mdx'],
        }),
      }),
    );
    expect(
      pagesByTarget.get(
        'content/docs/en/realtime-media/rtc-server-sdk/build/build-core-media-features/send-receive-media-streams.md',
      ),
    ).toEqual(
      expect.objectContaining({
        mappingReason: 'server-gateway-build-group-lane',
        source: expect.objectContaining({
          files: ['server-gateway/develop/send-receive-media-streams.mdx'],
        }),
      }),
    );
    expect(
      pagesByTarget.get(
        'content/docs/en/realtime-media/rtmp-gateway/build/optimize-quality-and-monitor-events/enable-adaptive-bitrate.md',
      ),
    ).toEqual(
      expect.objectContaining({
        mappingReason: 'media-gateway-build-group-lane',
        source: expect.objectContaining({
          files: ['media-gateway/advanced/abr.mdx'],
        }),
      }),
    );
    expect(
      pagesByTarget.get(
        'content/docs/en/realtime-media/whiteboard/build/display-files-and-manage-scenes/scenes/manage-scenes.mdx',
      ),
    ).toEqual(
      expect.objectContaining({
        mappingReason: 'whiteboard-build-group-lane',
        source: expect.objectContaining({
          files: ['interactive-whiteboard/develop/scenes/manage-scenes.mdx'],
        }),
      }),
    );
    expect(
      pagesByTarget.get(
        'content/docs/en/realtime-media/flexible-classroom/build/customize-the-ui-and-plugins/embed-custom-plugin.md',
      ),
    ).toEqual(
      expect.objectContaining({
        mappingReason: 'flexible-classroom-build-group-lane',
        source: expect.objectContaining({
          files: [
            'flexible-classroom/develop/integrate/embed-custom-plugin.mdx',
          ],
        }),
      }),
    );
    expect(
      pagesByTarget.get(
        'content/docs/en/api-reference/api-ref/broadcast-streaming/watermarks.mdx',
      ),
    ).toEqual(
      expect.objectContaining({
        mappingReason: 'api-ref-broadcast-streaming-private',
        source: expect.objectContaining({
          files: [
            'shared/broadcast-streaming-private-product/restful-api/_watermarks.mdx',
          ],
        }),
      }),
    );
    expect(
      pagesByTarget.get(
        'content/docs/en/realtime-media/marketplace/build/ht-3d-avatar.mdx',
      ),
    ).toEqual(
      expect.objectContaining({
        mappingReason: 'marketplace-build-lane',
        source: expect.objectContaining({
          files: ['extensions-marketplace/develop/integrate/ht_3d_avatar.mdx'],
        }),
      }),
    );
    expect(
      pagesByTarget.get(
        'content/docs/en/realtime-media/rtm/build/channels/message-channel.mdx',
      ),
    ).toEqual(
      expect.objectContaining({
        mappingReason: 'signaling-core-functionality-lane',
        source: expect.objectContaining({
          files: ['signaling/core-functionality/message-channel.mdx'],
        }),
      }),
    );
    expect(
      pagesByTarget.get(
        'content/docs/en/ai/device-kit/start-here/quickstart.mdx',
      ),
    ).toEqual(
      expect.objectContaining({
        mappingReason: 'device-kit-start-here-lane',
        source: expect.objectContaining({
          files: ['convo-ai-device-kit/get-started/quickstart.mdx'],
        }),
      }),
    );
    expect(
      pagesByTarget.get(
        'content/docs/en/realtime-media/broadcast-streaming/build/apply-effects-and-enhancements/ai-noise-suppression.mdx',
      ),
    ).toEqual(
      expect.objectContaining({
        mappingReason: 'video-sdk-build-group-alias',
        source: expect.objectContaining({
          files: [
            'broadcast-streaming/advanced-features/ai-noise-suppression.mdx',
          ],
        }),
      }),
    );
    expect(
      pagesByTarget.get(
        'content/docs/en/realtime-media/voice/build/set-up-token-authentication/use-tokens.mdx',
      ),
    ).toEqual(
      expect.objectContaining({
        mappingReason: 'video-sdk-build-group-alias',
        source: expect.objectContaining({
          files: [
            'voice-calling/token-authentication/authentication-workflow.mdx',
          ],
        }),
      }),
    );
    expect(
      pagesByTarget.get(
        'content/docs/en/api-reference/api-ref/conversational-ai/client-toolkit/web.mdx',
      ),
    ).toEqual(
      expect.objectContaining({
        mappingReason: 'api-ref-lane-alias',
        source: expect.objectContaining({
          files: ['conversational-ai/reference/toolkot/web.mdx'],
        }),
      }),
    );
    expect(
      pagesByTarget.get(
        'content/docs/en/realtime-media/rtmp-gateway/reference/integration.md',
      ),
    ).toEqual(
      expect.objectContaining({
        mappingReason: 'realtime-product-lane-alias',
        source: expect.objectContaining({
          files: ['media-gateway/best-practices/best-practice.mdx'],
        }),
      }),
    );
    expect(
      pagesByTarget.get(
        'content/docs/en/realtime-media/cloud-recording/build/start-a-recording/composite-mode.mdx',
      ),
    ).toEqual(
      expect.objectContaining({
        mappingReason: 'cloud-recording-build-group-lane',
        source: expect.objectContaining({
          files: ['cloud-recording/develop/composite-mode.md'],
        }),
      }),
    );
    expect(
      pagesByTarget.get(
        'content/docs/en/realtime-media/cloud-recording/build/best-practices/webpage-best-practices.mdx',
      ),
    ).toEqual(
      expect.objectContaining({
        mappingReason: 'cloud-recording-build-group-lane',
        source: expect.objectContaining({
          files: ['cloud-recording/best-practices/webpage-best-practices.md'],
        }),
      }),
    );
    expect(
      pagesByTarget.get(
        'content/docs/en/realtime-media/on-premise-recording/build/connect-through-a-firewall/cloud-proxy.mdx',
      ),
    ).toEqual(
      expect.objectContaining({
        mappingReason: 'on-premise-recording-build-group-lane',
        source: expect.objectContaining({
          files: ['on-premise-recording/develop/cloud-proxy.mdx'],
        }),
      }),
    );
    expect(
      pagesByTarget.get(
        'content/docs/en/realtime-media/speech-to-text/build/start-transcribing-and-translating/enable-service.md',
      ),
    ).toEqual(
      expect.objectContaining({
        mappingReason: 'speech-to-text-build-group-lane',
        source: expect.objectContaining({
          files: ['real-time-stt/best-practice/enable-service.mdx'],
        }),
      }),
    );
    expect(
      pagesByTarget.get(
        'content/docs/en/realtime-media/speech-to-text/build/process-transcription-data/parse-data.mdx',
      ),
    ).toEqual(
      expect.objectContaining({
        mappingReason: 'speech-to-text-build-group-lane',
        source: expect.objectContaining({
          files: ['real-time-stt/develop/parse-data.mdx'],
        }),
      }),
    );
    expect(
      pagesByTarget.get(
        'content/docs/en/realtime-media/agora-analytics/build/monitor-and-get-alerts/monitor.md',
      ),
    ).toEqual(
      expect.objectContaining({
        mappingReason: 'analytics-build-group-lane',
        source: expect.objectContaining({
          files: ['agora-analytics/analyze/video-voice-sdk/monitor.mdx'],
        }),
      }),
    );
    expect(
      pagesByTarget.get(
        'content/docs/en/realtime-media/agora-analytics/build/explore-and-analyze-data/chat-data-insights.md',
      ),
    ).toEqual(
      expect.objectContaining({
        mappingReason: 'analytics-build-group-lane',
        source: expect.objectContaining({
          files: ['agora-analytics/analyze/chat-sdk/data-insights.mdx'],
        }),
      }),
    );
    expect(
      pagesByTarget.get(
        'content/docs/en/realtime-media/iot/build/set-up-authentication-and-security/media-stream-encryption.md',
      ),
    ).toEqual(
      expect.objectContaining({
        mappingReason: 'iot-build-group-lane',
        source: expect.objectContaining({
          files: ['iot/develop/media-stream-encryption.mdx'],
        }),
      }),
    );
  }, 20_000);

  it('compares records without relying on raw markdown equality', () => {
    const sourceRecords = createIntermediateRecords({
      content:
        '- [SDK quickstart](../../video-calling/get-started/get-started-sdk)',
      location: 'source.mdx',
      side: 'source',
    });
    const targetRecords = createIntermediateRecords({
      content: '- [SDK quickstart](../index.mdx)',
      location: 'target.mdx',
      side: 'target',
    });

    const comparison = compareRecords({ sourceRecords, targetRecords });

    expect(comparison.findings.changed).toEqual([
      expect.objectContaining({
        source: expect.objectContaining({ kind: 'link' }),
        target: expect.objectContaining({ kind: 'link' }),
      }),
    ]);
  });
});

async function mkTempDir(prefix: string) {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), prefix));
  tempDirs.push(dir);
  return dir;
}

async function writeFile(filePath: string, content: string) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, content);
}
