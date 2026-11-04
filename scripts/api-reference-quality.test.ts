import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { get } from 'node:http';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
  assertReceipt,
  selectRows,
  serveBuild,
} from './check-api-reference-quality.mjs';
import {
  classifyDebt,
  duplicateHeadings,
  inventory,
} from './lib/api-reference-quality/policy.mjs';

const directories: string[] = [];
afterEach(() => {
  for (const directory of directories.splice(0))
    rmSync(directory, { recursive: true, force: true });
});
const fixture = () => {
  const directory = mkdtempSync(path.join(tmpdir(), 'api-quality-test-'));
  directories.push(directory);
  return directory;
};
const put = (root: string, file: string, value: unknown) => {
  const dest = path.join(root, file);
  mkdirSync(path.dirname(dest), { recursive: true });
  writeFileSync(
    dest,
    typeof value === 'string' ? value : JSON.stringify(value),
  );
};

describe('API reference quality policy', () => {
  it('finds duplicate member headings even when the generator changed depth, ignoring aliases and code examples', () => {
    const text =
      '### `play`\n## play\n\nDescription\n\n```md\n## play\n## play\n```\n\n## next\n\n<a id="old-next"></a>\n\n## next';
    expect(
      duplicateHeadings('api.mdx', text).map(
        (item: { title: string }) => item.title,
      ),
    ).toEqual(['play', 'next']);
  });
  it('preserves valid Objective-C signs, declaration metadata and distinct overload descriptions', () => {
    expect(
      duplicateHeadings(
        'api.mdx',
        '## - play\nDescription\n\nDeclared In `WhitePlayer.h`\n\n## + play\nOther description\n\n## - play',
      ),
    ).toEqual([]);
  });
  it('fails new or increased defects without hiding existing debt', () => {
    const finding = {
      file: 'api.mdx',
      rule: 'adjacent-duplicate-heading',
      title: 'play',
      depth: 2,
    };
    const baseline = { entries: [{ ...finding, count: 1 }] };
    const result = classifyDebt(
      [finding, finding, { ...finding, title: 'pause' }],
      baseline,
    );
    expect(result.known).toHaveLength(1);
    expect(result.unexpected).toHaveLength(2);
    expect(classifyDebt([], baseline).retired).toHaveLength(1);
  });
  it('accounts for platform variants through canonical payloads, index payloads and OpenAPI outside the API prefix', () => {
    const root = fixture();
    put(root, '__static/docs-routes.json', [
      {
        url: '/zh-CN/api-reference/sample',
        canonicalPath: '/zh-CN/api-reference/sample',
      },
      {
        url: '/zh-CN/api-reference/sample/ios',
        canonicalPath: '/zh-CN/api-reference/sample',
        platform: 'ios',
      },
      { url: '/zh-CN/other/endpoint', canonicalPath: '/zh-CN/other/endpoint' },
    ]);
    put(root, '__static/docs/zh-CN/api-reference/sample/index.json', {
      body: { kind: 'mdx' },
    });
    put(root, '__static/docs/zh-CN/other/endpoint.json', {
      body: { kind: 'openapi' },
    });
    for (const url of [
      'api-reference/sample',
      'api-reference/sample/ios',
      'other/endpoint',
    ])
      put(root, `zh-CN/${url}/index.html`, '<article>Body</article>');
    expect(
      inventory(root, 'cn').map((row: { url: string }) => row.url),
    ).toEqual([
      '/zh-CN/api-reference/sample',
      '/zh-CN/api-reference/sample/ios',
      '/zh-CN/other/endpoint',
    ]);
    expect(() => inventory(root, 'global')).toThrow(/Empty/);
    rmSync(path.join(root, 'zh-CN/api-reference/sample/ios/index.html'));
    expect(() => inventory(root, 'cn')).toThrow(/Missing published HTML/);
  });
  it('refuses a vanished acceptance case rather than silently dropping it', () => {
    const cases = [{ urls: { cn: ['/zh-CN/api-reference/missing#member'] } }];
    expect(() => selectRows([], cases, 'all', 'cn')).toThrow(
      /missing from published inventory/,
    );
  });
  it.each(['region', 'head', 'source', 'build'])(
    'rejects evidence with a stale %s',
    (key) => {
      const receipt = {
        region: 'cn',
        head: 'abc',
        source: 'source-hash',
        build: 'build-hash',
      };
      expect(() =>
        assertReceipt(receipt, { ...receipt, [key]: 'changed' }),
      ).toThrow(key);
    },
  );
  it('serves only the selected built files, with CN public paths and real 404s', async () => {
    const root = fixture();
    put(
      root,
      'zh-CN/api-reference/sample/index.html',
      '<article>Expected build</article>',
    );
    const request = (url: string) =>
      new Promise<{ status: number | undefined; text: string }>(
        (resolve, reject) => {
          get(url, (response) => {
            let text = '';
            response.setEncoding('utf8');
            response.on('data', (chunk) => {
              text += chunk;
            });
            response.on('end', () =>
              resolve({ status: response.statusCode, text }),
            );
          }).on('error', reject);
        },
      );
    const server = await serveBuild(root, 'cn');
    try {
      const response = await request(`${server.origin}/api-reference/sample`);
      expect(response.status).toBe(200);
      expect(response.text).toContain('Expected build');
      expect(
        (await request(`${server.origin}/api-reference/missing`)).status,
      ).toBe(404);
    } finally {
      await server.close();
    }
  });
});
