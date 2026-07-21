import { describe, expect, it } from 'vitest';
import {
  compareOpenApiZhLinkBaseline,
  createOpenApiZhLinkBaseline,
} from './check-openapi-zh-link-baseline.mjs';

describe('OpenAPI zh-CN link baseline check', () => {
  it('groups invalid links into stable baseline entries', () => {
    const baseline = createOpenApiZhLinkBaseline({
      invalidInternalLinks: [
        {
          sourcePath: 'openapi/example/rest.zh-CN.yaml',
          href: '/zh-CN/missing',
          target: '/zh-CN/missing',
          reason: 'missing-internal-path',
        },
        {
          sourcePath: 'openapi/example/rest.zh-CN.yaml',
          href: '/zh-CN/missing',
          target: '/zh-CN/missing',
          reason: 'missing-internal-path',
        },
        {
          sourcePath: 'openapi/example/rest.zh-CN.yaml',
          href: 'https://doc.shengwang.cn/doc/example',
          target: 'https://doc.shengwang.cn/doc/example',
          reason: 'legacy-shengwang-doc-host',
        },
      ],
    });

    expect(baseline).toEqual([
      {
        sourcePath: 'openapi/example/rest.zh-CN.yaml',
        href: 'https://doc.shengwang.cn/doc/example',
        target: 'https://doc.shengwang.cn/doc/example',
        reason: 'legacy-shengwang-doc-host',
        count: 1,
      },
      {
        sourcePath: 'openapi/example/rest.zh-CN.yaml',
        href: '/zh-CN/missing',
        target: '/zh-CN/missing',
        reason: 'missing-internal-path',
        count: 2,
      },
    ]);
  });

  it('fails only when invalid links are new or exceed the baseline', () => {
    const baseline = [
      {
        sourcePath: 'openapi/example/rest.zh-CN.yaml',
        href: '/zh-CN/missing',
        target: '/zh-CN/missing',
        reason: 'missing-internal-path',
        count: 2,
      },
      {
        sourcePath: 'openapi/example/rest.zh-CN.yaml',
        href: 'https://doc.shengwang.cn/doc/example',
        target: 'https://doc.shengwang.cn/doc/example',
        reason: 'legacy-shengwang-doc-host',
        count: 1,
      },
    ];

    expect(
      compareOpenApiZhLinkBaseline(
        [
          {
            sourcePath: 'openapi/example/rest.zh-CN.yaml',
            href: '/zh-CN/missing',
            target: '/zh-CN/missing',
            reason: 'missing-internal-path',
            count: 1,
          },
          {
            sourcePath: 'openapi/example/rest.zh-CN.yaml',
            href: 'https://doc.shengwang.cn/doc/example',
            target: 'https://doc.shengwang.cn/doc/example',
            reason: 'legacy-shengwang-doc-host',
            count: 2,
          },
          {
            sourcePath: 'openapi/example/rest.zh-CN.yaml',
            href: '/zh-CN/new-missing',
            target: '/zh-CN/new-missing',
            reason: 'missing-internal-path',
            count: 1,
          },
        ],
        baseline,
      ),
    ).toEqual({
      newOrIncreased: [
        {
          sourcePath: 'openapi/example/rest.zh-CN.yaml',
          href: 'https://doc.shengwang.cn/doc/example',
          target: 'https://doc.shengwang.cn/doc/example',
          reason: 'legacy-shengwang-doc-host',
          count: 2,
          baselineCount: 1,
        },
        {
          sourcePath: 'openapi/example/rest.zh-CN.yaml',
          href: '/zh-CN/new-missing',
          target: '/zh-CN/new-missing',
          reason: 'missing-internal-path',
          count: 1,
          baselineCount: 0,
        },
      ],
      resolvedOrReduced: [
        {
          sourcePath: 'openapi/example/rest.zh-CN.yaml',
          href: '/zh-CN/missing',
          target: '/zh-CN/missing',
          reason: 'missing-internal-path',
          count: 2,
          currentCount: 1,
        },
      ],
    });
  });
});
