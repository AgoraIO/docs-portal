import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { getOpenApiPrerenderPaths } from '../src/lib/openapi/lanes';
import {
  auditDocsLinks,
  checkExternalLinks,
  formatReport,
  getOpenApiRoutePathsForAudit,
  getZhCnOpenApiSourcePaths,
} from './audit-doc-links.mjs';

const tempDirs: string[] = [];

type AuditEntry = {
  anchor?: string;
  href: string;
  normalizedHref: string;
  reason?: string;
  resolution: string;
  resolvedTargetPath: string;
  sourcePath: string;
  target?: string;
};

async function writeDoc(filePath: string, markdown = '# Test\n') {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, markdown);
}

describe('auditDocsLinks', () => {
  afterEach(async () => {
    await Promise.all(
      tempDirs
        .splice(0)
        .map((dir) => rm(dir, { force: true, recursive: true })),
    );
  });

  it('keeps the OpenAPI generated route list aligned with the site registry', () => {
    expect(getOpenApiRoutePathsForAudit()).toEqual(getOpenApiPrerenderPaths());
  });

  it('resolves route-equivalent and generated OpenAPI markdown links', async () => {
    const docsRoot = await mkdtemp(path.join(os.tmpdir(), 'docs-link-audit-'));
    tempDirs.push(docsRoot);

    await writeDoc(
      path.join(docsRoot, 'en', 'ai', 'index.md'),
      [
        '[mdx route](quickstart.md)',
        '[index route](guide.md)',
        '[legacy operation](../operations/start-agent.md#llm-max_history)',
        '[generated endpoint](../api-reference/conversational-ai/rest-api/agent/join.md)',
        '[api macro]({{Global.API_REF_ANDROID_ROOT}}/class_irtcengine.html#api_irtcengine_joinchannel)',
        '[lowercase api macro]({{global.API_REF_IOS_ROOT}}/agorartckit/agorartcenginekit/joinchannel(bytoken:channelid:uid:mediaoptions:joinsuccess:))',
        '[missing](missing.md)',
      ].join('\n'),
    );
    await writeDoc(path.join(docsRoot, 'en', 'ai', 'quickstart.mdx'));
    await writeDoc(path.join(docsRoot, 'en', 'ai', 'guide', 'index.mdx'));

    const stats = auditDocsLinks({ docsRoot });
    const missingRelativeMarkdownLinks =
      stats.missingRelativeMarkdownLinks as AuditEntry[];
    const resolvedByHref = new Map(
      (stats.relativeMarkdownLinks as AuditEntry[]).map((entry) => [
        entry.href,
        entry,
      ]),
    );

    expect(missingRelativeMarkdownLinks).toHaveLength(1);
    expect(missingRelativeMarkdownLinks[0]).toMatchObject({
      href: 'missing.md',
      normalizedHref: '/en/ai/missing',
    });
    expect(resolvedByHref.get('quickstart.md')).toMatchObject({
      normalizedHref: '/en/ai/quickstart',
      resolution: 'route',
      resolvedTargetPath: 'en/ai/quickstart.mdx',
    });
    expect(resolvedByHref.get('guide.md')).toMatchObject({
      normalizedHref: '/en/ai/guide',
      resolution: 'route',
      resolvedTargetPath: 'en/ai/guide/index.mdx',
    });
    expect(
      resolvedByHref.get('../operations/start-agent.md#llm-max_history'),
    ).toMatchObject({
      normalizedHref:
        '/en/api-reference/api-ref/conversational-ai/join#llm-max_history',
      resolution: 'openapi-route',
      resolvedTargetPath:
        'openapi:/en/api-reference/api-ref/conversational-ai/join',
    });
    expect(
      resolvedByHref.get(
        '../api-reference/conversational-ai/rest-api/agent/join.md',
      ),
    ).toMatchObject({
      normalizedHref: '/en/api-reference/api-ref/conversational-ai/join',
      resolution: 'openapi-route',
      resolvedTargetPath:
        'openapi:/en/api-reference/api-ref/conversational-ai/join',
    });
    expect(stats.apiReferenceMacroLinks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          href: '{{Global.API_REF_ANDROID_ROOT}}/class_irtcengine.html#api_irtcengine_joinchannel',
          reason: 'api-reference-macro',
        }),
        expect.objectContaining({
          href: '{{global.API_REF_IOS_ROOT}}/agorartckit/agorartcenginekit/joinchannel(bytoken:channelid:uid:mediaoptions:joinsuccess:',
          reason: 'api-reference-macro',
        }),
      ]),
    );
  });

  it('validates anchors after indented fenced code blocks', async () => {
    const docsRoot = await mkdtemp(path.join(os.tmpdir(), 'docs-link-audit-'));
    tempDirs.push(docsRoot);

    await writeDoc(
      path.join(docsRoot, 'en', 'guide.mdx'),
      [
        '  ```shell',
        '  npm install',
        '```',
        '',
        '## Target section',
        '',
        '```ts',
        'const ready = true;',
        '```',
        '',
        '[Continue](#target-section)',
      ].join('\n'),
    );

    const stats = auditDocsLinks({ docsRoot });

    expect(stats.missingHashLinks).toEqual([]);
    expect(stats.validHashLinks).toEqual([
      expect.objectContaining({
        anchor: 'target-section',
        href: '#target-section',
      }),
    ]);
  });

  it('validates anchors on docs routes whose names look like assets', async () => {
    const docsRoot = await mkdtemp(path.join(os.tmpdir(), 'docs-link-audit-'));
    tempDirs.push(docsRoot);

    await writeDoc(
      path.join(docsRoot, 'zh-CN', 'guide.mdx'),
      [
        '[valid](/zh-CN/api-reference/python-api/client.python#connect)',
        '[missing](/zh-CN/api-reference/python-api/client.python#missing)',
      ].join('\n'),
    );
    await writeDoc(
      path.join(
        docsRoot,
        'zh-CN',
        'api-reference',
        'python-api',
        'client.python.mdx',
      ),
      '<a id="connect"></a>\n## connect\n',
    );

    const stats = auditDocsLinks({ docsRoot });

    expect(stats.validHashLinks).toEqual([
      expect.objectContaining({
        anchor: 'connect',
        href: '/zh-CN/api-reference/python-api/client.python#connect',
      }),
    ]);
    expect(stats.missingHashLinks).toEqual([
      expect.objectContaining({
        anchor: 'missing',
        href: '/zh-CN/api-reference/python-api/client.python#missing',
      }),
    ]);
  });

  it('checks root JSX links against known docs and OpenAPI routes', async () => {
    const docsRoot = await mkdtemp(path.join(os.tmpdir(), 'docs-link-audit-'));
    tempDirs.push(docsRoot);

    await writeDoc(
      path.join(docsRoot, 'en', 'introduction', 'index.mdx'),
      [
        '<Card href="/en/ai" />',
        '<Card href="/en/api-reference/api-ref/rtc/query-channel-list" />',
        '<Card href="/en/api-reference/rtc/android/overview" />',
        '<Card href="/en/api-reference/rtc/android/(current)/broken" />',
        '<Card href="/en/api-reference/rtc/android/video/video-basic#api_irtcengine_enablevideo" />',
        '<Card href="/zh-CN/api-reference/rtc/android/video/video-basic#api_irtcengine_enablevideo" />',
        '<Card href="/en/missing-page" />',
        '<Card href="https://example.com/docs" />',
      ].join('\n'),
    );
    await writeDoc(path.join(docsRoot, 'en', 'ai', 'index.mdx'));
    await writeDoc(
      path.join(
        docsRoot,
        'en',
        'api-reference',
        'rtc',
        'android',
        '(current)',
        'video',
        'video-basic.mdx',
      ),
      ['# Video basic', '', '<a id="api_irtcengine_enablevideo"></a>'].join(
        '\n',
      ),
    );
    await writeDoc(
      path.join(
        docsRoot,
        'zh-CN',
        'api-reference',
        'rtc',
        'android',
        '(current)',
        'video',
        'video-basic.mdx',
      ),
      ['# Video basic', '', '<a id="api_irtcengine_enablevideo"></a>'].join(
        '\n',
      ),
    );

    const stats = auditDocsLinks({ docsRoot });
    const rootLinks = stats.rootLinks as AuditEntry[];
    const skippedRootLinks = stats.skippedRootLinks as AuditEntry[];
    const missingRootLinks = stats.missingRootLinks as AuditEntry[];
    const validHashLinks = stats.validHashLinks as AuditEntry[];

    expect(rootLinks.map((entry) => entry.href)).toEqual([
      '/en/ai',
      '/en/api-reference/api-ref/rtc/query-channel-list',
      '/en/api-reference/rtc/android/video/video-basic#api_irtcengine_enablevideo',
      '/zh-CN/api-reference/rtc/android/video/video-basic#api_irtcengine_enablevideo',
    ]);
    expect(rootLinks.at(1)).toMatchObject({
      resolution: 'openapi-route',
      resolvedTargetPath:
        'openapi:/en/api-reference/api-ref/rtc/query-channel-list',
    });
    expect(rootLinks.at(2)).toMatchObject({
      resolution: 'route',
      resolvedTargetPath:
        'en/api-reference/rtc/android/(current)/video/video-basic.mdx',
    });
    expect(rootLinks.at(3)).toMatchObject({
      resolution: 'route',
      resolvedTargetPath:
        'zh-CN/api-reference/rtc/android/(current)/video/video-basic.mdx',
    });
    expect(validHashLinks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          href: '/en/api-reference/rtc/android/video/video-basic#api_irtcengine_enablevideo',
          anchor: 'api_irtcengine_enablevideo',
        }),
        expect.objectContaining({
          href: '/zh-CN/api-reference/rtc/android/video/video-basic#api_irtcengine_enablevideo',
          anchor: 'api_irtcengine_enablevideo',
        }),
      ]),
    );
    expect(skippedRootLinks).toEqual([
      expect.objectContaining({
        href: '/en/api-reference/rtc/android/overview',
        resolution: 'hosted-reference',
      }),
    ]);
    expect(missingRootLinks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          href: '/en/api-reference/rtc/android/(current)/broken',
          normalizedHref: '/en/api-reference/rtc/android/(current)/broken',
          sourcePath: 'en/introduction/index.mdx',
        }),
        expect.objectContaining({
          href: '/en/missing-page',
          normalizedHref: '/en/missing-page',
          sourcePath: 'en/introduction/index.mdx',
        }),
      ]),
    );
    expect(missingRootLinks).toHaveLength(2);
    expect(stats.externalLinks).toBe(1);
  });

  it('audits Markdown links embedded in OpenAPI YAML sources', async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), 'docs-link-audit-'));
    tempDirs.push(tempRoot);
    const docsRoot = path.join(tempRoot, 'docs');
    const openApiRoot = path.join(tempRoot, 'openapi');

    await writeDoc(
      path.join(docsRoot, 'en', 'ai', 'models', 'asr', 'openai.mdx'),
      '# OpenAI ASR\n',
    );
    await writeDoc(
      path.join(
        docsRoot,
        'en',
        'api-reference',
        'api-ref',
        'conversational-ai',
        'index.mdx',
      ),
      '# Conversational AI API\n',
    );
    await writeDoc(
      path.join(openApiRoot, 'conversational-ai', 'rest-api.en.yaml'),
      [
        'openapi: 3.1.0',
        'info:',
        '  title: Test API',
        '  version: 1.0.0',
        'paths:',
        '  /v1/test:',
        '    get:',
        '      summary: Test',
        '      description: |',
        '        Use [OpenAI ASR](/en/ai/models/asr/openai).',
        '        See [Leave endpoint](leave).',
        '        See [local generated anchor](#properties-test).',
        '        See [missing topic](/en/ai/missing-topic).',
        '        See [wrapped',
        '        missing topic](/en/ai/wrapped-missing-topic).',
        '        See [external docs](https://example.com/openapi).',
      ].join('\n'),
    );

    const stats = auditDocsLinks({ docsRoot });
    const relativeMarkdownLinks = stats.relativeMarkdownLinks as AuditEntry[];
    const rootLinks = stats.rootLinks as AuditEntry[];
    const missingRootLinks = stats.missingRootLinks as AuditEntry[];
    const missingHashLinks = stats.missingHashLinks as AuditEntry[];

    expect(stats.openapiFiles).toBe(1);
    expect(rootLinks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          href: '/en/ai/models/asr/openai',
          sourcePath: 'openapi/conversational-ai/rest-api.en.yaml',
        }),
      ]),
    );
    expect(relativeMarkdownLinks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          href: 'leave',
          normalizedHref: '/en/api-reference/api-ref/conversational-ai/leave',
          resolution: 'openapi-route',
          resolvedTargetPath:
            'openapi:/en/api-reference/api-ref/conversational-ai/leave',
          sourcePath: 'openapi/conversational-ai/rest-api.en.yaml',
        }),
      ]),
    );
    expect(missingRootLinks).toEqual([
      expect.objectContaining({
        href: '/en/ai/missing-topic',
        normalizedHref: '/en/ai/missing-topic',
        sourcePath: 'openapi/conversational-ai/rest-api.en.yaml',
      }),
      expect.objectContaining({
        href: '/en/ai/wrapped-missing-topic',
        normalizedHref: '/en/ai/wrapped-missing-topic',
        sourcePath: 'openapi/conversational-ai/rest-api.en.yaml',
      }),
    ]);
    expect(
      missingHashLinks.filter(
        (entry) =>
          entry.sourcePath === 'openapi/conversational-ai/rest-api.en.yaml',
      ),
    ).toEqual([]);
    expect(stats.externalLinks).toBe(1);
  });

  it('audits only zh-CN OpenAPI YAML when openApiSourcePaths is provided', async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), 'docs-link-audit-'));
    tempDirs.push(tempRoot);
    const docsRoot = path.join(tempRoot, 'docs');
    const openApiRoot = path.join(tempRoot, 'openapi');

    await writeDoc(
      path.join(
        docsRoot,
        'zh-CN',
        'api-reference',
        'api-ref',
        'conversational-ai',
        'index.mdx',
      ),
      '# 对话式 AI API\n',
    );
    await writeDoc(path.join(docsRoot, 'zh-CN', 'ai', 'build', 'valid.mdx'));
    await writeDoc(path.join(docsRoot, 'en', 'ai', 'build', 'valid.mdx'));

    await writeDoc(
      path.join(openApiRoot, 'conversational-ai', 'rest-api.zh-CN.yaml'),
      [
        'openapi: 3.1.0',
        'info:',
        '  title: Test API',
        '  version: 1.0.0',
        'paths:',
        '  /v1/test:',
        '    get:',
        '      summary: Test',
        '      description: |',
        '        See [valid topic](/zh-CN/ai/build/valid).',
        '        See [missing topic](/zh-CN/ai/build/missing).',
        '        See [legacy host](https://doc.shengwang.cn/doc/convoai/restful/landing-page).',
        '        See [protocol-relative legacy host](//doc.shengwang.cn/doc/convoai/restful/protocol-relative).',
        '        See [Join endpoint](join).',
      ].join('\n'),
    );
    await writeDoc(
      path.join(openApiRoot, 'conversational-ai', 'rest-api.en.yaml'),
      [
        'openapi: 3.1.0',
        'info:',
        '  title: Test API',
        '  version: 1.0.0',
        'paths:',
        '  /v1/test:',
        '    get:',
        '      summary: Test',
        '      description: |',
        '        See [legacy host](https://doc.shengwang.cn/doc/convoai/restful/landing-page).',
        '        See [missing topic](/en/ai/build/missing).',
      ].join('\n'),
    );

    const stats = auditDocsLinks({
      docsRoot,
      openApiSourcePaths: ['openapi/conversational-ai/rest-api.zh-CN.yaml'],
    });

    expect(stats.docsFiles).toBe(0);
    expect(stats.openapiFiles).toBe(1);
    expect(stats.legacyShengwangDocHostLinks).toEqual([
      expect.objectContaining({
        href: 'https://doc.shengwang.cn/doc/convoai/restful/landing-page',
        reason: 'legacy-shengwang-doc-host',
        sourcePath: 'openapi/conversational-ai/rest-api.zh-CN.yaml',
        target: 'https://doc.shengwang.cn/doc/convoai/restful/landing-page',
      }),
      expect.objectContaining({
        href: '//doc.shengwang.cn/doc/convoai/restful/protocol-relative',
        reason: 'legacy-shengwang-doc-host',
        sourcePath: 'openapi/conversational-ai/rest-api.zh-CN.yaml',
        target: '//doc.shengwang.cn/doc/convoai/restful/protocol-relative',
      }),
    ]);
    expect(stats.invalidInternalLinks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          href: '/zh-CN/ai/build/missing',
          reason: 'missing-internal-path',
          sourcePath: 'openapi/conversational-ai/rest-api.zh-CN.yaml',
        }),
        expect.objectContaining({
          href: 'https://doc.shengwang.cn/doc/convoai/restful/landing-page',
          reason: 'legacy-shengwang-doc-host',
          sourcePath: 'openapi/conversational-ai/rest-api.zh-CN.yaml',
        }),
        expect.objectContaining({
          href: '//doc.shengwang.cn/doc/convoai/restful/protocol-relative',
          reason: 'legacy-shengwang-doc-host',
          sourcePath: 'openapi/conversational-ai/rest-api.zh-CN.yaml',
        }),
      ]),
    );
    expect(stats.externalLinkCandidates).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          href: '//doc.shengwang.cn/doc/convoai/restful/protocol-relative',
          sourcePath: 'openapi/conversational-ai/rest-api.zh-CN.yaml',
        }),
      ]),
    );
    expect(stats.invalidInternalLinks).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          href: '/en/ai/build/missing',
          sourcePath: 'openapi/conversational-ai/rest-api.en.yaml',
        }),
      ]),
    );
    expect(stats.relativeMarkdownLinks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          href: 'join',
          normalizedHref: '/zh-CN/api-reference/api-ref/conversational-ai/join',
          resolution: 'openapi-route',
          sourcePath: 'openapi/conversational-ai/rest-api.zh-CN.yaml',
        }),
      ]),
    );
  });

  it('lists only zh-CN OpenAPI source paths for the focused CLI mode', async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), 'docs-link-audit-'));
    tempDirs.push(tempRoot);
    const openApiRoot = path.join(tempRoot, 'openapi');

    await writeDoc(path.join(openApiRoot, 'a', 'one.zh-CN.yaml'));
    await writeDoc(path.join(openApiRoot, 'a', 'one.en.yaml'));
    await writeDoc(path.join(openApiRoot, 'b', 'two.zh-CN.yml'));

    expect(getZhCnOpenApiSourcePaths(openApiRoot)).toEqual([
      'openapi/a/one.zh-CN.yaml',
      'openapi/b/two.zh-CN.yml',
    ]);
  });

  it('reports missing internal paths and missing hash anchors with source, target, and reason', async () => {
    const docsRoot = await mkdtemp(path.join(os.tmpdir(), 'docs-link-audit-'));
    tempDirs.push(docsRoot);

    await writeDoc(
      path.join(docsRoot, 'en', 'ai', 'index.mdx'),
      [
        '# Source',
        '',
        '## Local Section',
        '',
        '[extensionless route](guide)',
        '[valid target hash](guide#target-heading)',
        '[valid code hash](guide#loadaudiosettings)',
        '[valid explicit hash](guide#explicit-anchor)',
        '[valid local hash](#local-section)',
        '[missing target hash](guide#missing-anchor)',
        '[missing local hash](#missing-local)',
        '[missing extensionless route](missing-topic)',
        '<Card href="/en/ai/missing-root#never" />',
      ].join('\n'),
    );
    await writeDoc(
      path.join(docsRoot, 'en', 'ai', 'guide.mdx'),
      [
        '# Guide',
        '',
        '## Target Heading',
        '',
        '### `loadAudioSettings`',
        '',
        '<a id="explicit-anchor" />',
      ].join('\n'),
    );

    const stats = auditDocsLinks({ docsRoot });
    const validHashLinks = stats.validHashLinks as AuditEntry[];
    const missingHashLinks = stats.missingHashLinks as AuditEntry[];
    const invalidInternalLinks = stats.invalidInternalLinks as AuditEntry[];
    const report = formatReport(stats, 30);

    expect(
      (stats.relativeMarkdownLinks as AuditEntry[]).map((entry) => entry.href),
    ).toContain('guide');
    expect(stats.missingRelativeMarkdownLinks).toHaveLength(1);
    expect(stats.missingRootLinks).toHaveLength(1);
    expect(validHashLinks.map((entry) => entry.anchor)).toEqual(
      expect.arrayContaining([
        'target-heading',
        'loadaudiosettings',
        'explicit-anchor',
        'local-section',
      ]),
    );
    expect(missingHashLinks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          anchor: 'missing-anchor',
          href: 'guide#missing-anchor',
          reason: 'missing-hash-anchor',
          sourcePath: 'en/ai/index.mdx',
          target: '/en/ai/guide#missing-anchor',
        }),
        expect.objectContaining({
          anchor: 'missing-local',
          href: '#missing-local',
          reason: 'missing-hash-anchor',
          sourcePath: 'en/ai/index.mdx',
          target: '#missing-local',
        }),
      ]),
    );
    expect(
      validHashLinks.some(
        (entry) =>
          entry.href === 'guide#missing-anchor' &&
          entry.resolution === 'generated-anchor',
      ),
    ).toBe(false);
    expect(invalidInternalLinks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          href: 'missing-topic',
          reason: 'missing-internal-path',
          target: '/en/ai/missing-topic',
        }),
        expect.objectContaining({
          href: '/en/ai/missing-root#never',
          reason: 'missing-internal-path',
          target: '/en/ai/missing-root#never',
        }),
        expect.objectContaining({
          href: 'guide#missing-anchor',
          reason: 'missing-hash-anchor',
          target: '/en/ai/guide#missing-anchor',
        }),
      ]),
    );
    expect(report).toContain(
      'source: en/ai/index.mdx | target: /en/ai/guide#missing-anchor | reason: missing-hash-anchor | href: guide#missing-anchor',
    );
    expect(report).toContain(
      'source: en/ai/index.mdx | target: /en/ai/missing-topic | reason: missing-internal-path | href: missing-topic',
    );
  });

  it('checks external links with retry, timeout, and allowlist controls', async () => {
    const docsRoot = await mkdtemp(path.join(os.tmpdir(), 'docs-link-audit-'));
    tempDirs.push(docsRoot);

    await writeDoc(
      path.join(docsRoot, 'en', 'ai', 'index.mdx'),
      [
        '[ok](https://ok.example/docs)',
        '[gone](https://gone.example/missing)',
        '[flaky](https://flaky.example/retry)',
        '[allowed](https://allowed.example/page)',
        '[auth](https://auth.example/page)',
        '[slow](https://slow.example/page)',
      ].join('\n'),
    );

    const attempts = new Map<string, number>();
    const fetchImpl = async (
      url: unknown,
      init: { signal?: AbortSignal | null } = {},
    ) => {
      const target = String(url);
      const signal = init?.signal ?? undefined;
      const attempt = (attempts.get(target) ?? 0) + 1;

      attempts.set(target, attempt);

      if (target.includes('ok.example')) {
        return { status: 204 } as Response;
      }

      if (target.includes('gone.example')) {
        return { status: 404 } as Response;
      }

      if (target.includes('flaky.example') && attempt === 1) {
        throw new Error('temporary network error');
      }

      if (target.includes('flaky.example')) {
        return { status: 200 } as Response;
      }

      if (target.includes('auth.example')) {
        return { status: 403 } as Response;
      }

      if (target.includes('slow.example')) {
        return new Promise<Response>((_resolve, reject) => {
          signal?.addEventListener('abort', () => {
            const error = new Error('aborted');

            error.name = 'AbortError';
            reject(error);
          });
        });
      }

      return { status: 500 } as Response;
    };

    const stats = auditDocsLinks({ docsRoot });

    await checkExternalLinks(stats, {
      allowlist: ['allowed.example'],
      fetchImpl: fetchImpl as unknown as typeof fetch,
      retries: 1,
      retryDelayMs: 0,
      timeoutMs: 1,
    });

    expect(stats.checkedExternalLinks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ target: 'https://ok.example/docs' }),
        expect.objectContaining({ target: 'https://flaky.example/retry' }),
      ]),
    );
    expect(stats.invalidExternalLinks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          reason: 'external-http-404',
          target: 'https://gone.example/missing',
        }),
        expect.objectContaining({
          reason: 'external-request-timeout',
          target: 'https://slow.example/page',
        }),
      ]),
    );
    expect(stats.skippedExternalLinks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          reason: 'external-allowlisted',
          target: 'https://allowed.example/page',
        }),
        expect.objectContaining({
          reason: 'external-http-403-not-actionable',
          target: 'https://auth.example/page',
        }),
      ]),
    );
    expect(attempts.get('https://allowed.example/page')).toBeUndefined();
    expect(attempts.get('https://flaky.example/retry')).toBe(2);
  });

  it('keeps visible English overview cards and toolkit links routable', () => {
    const docsRoot = path.join(process.cwd(), 'content', 'docs');
    const stats = auditDocsLinks({
      docsRoot,
      sourcePaths: [
        'en/introduction/index.mdx',
        'en/ai/index.mdx',
        'en/realtime-media/overview.mdx',
        'en/api-reference/index.mdx',
      ],
    });

    expect(stats.docsFiles).toBe(4);
    expect(stats.rootLinks).not.toHaveLength(0);
    expect(stats.missingRootLinks).toEqual([]);
    expect(stats.missingRelativeMarkdownLinks).toEqual([]);
  }, 120_000);
});
