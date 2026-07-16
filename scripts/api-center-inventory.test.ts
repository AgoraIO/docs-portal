import { execFileSync } from 'node:child_process';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it } from 'vitest';
import {
  buildManifest,
  compareLiveAndSource,
  normalizeSourceApiCenter,
  parseLiveApiCenterBaseline,
  parseLiveApiCenterHtml,
  renderManifestMarkdown,
  mergeManifestProgress,
} from './lib/api-center/inventory.mjs';

const SCRIPT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  'api-center-inventory.mjs',
);
const tempDirs: string[] = [];

async function makeTempDir() {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'api-center-'));
  tempDirs.push(directory);
  return directory;
}

const apiData = [
  {
    category: '基础能力',
    children: [
      {
        title: '产品 A',
        desc: '产品描述',
        clientApis: [
          { platform: 'android', text: 'Android', link: '/api-ref/a/android' },
        ],
        serverApis: [
          { platform: 'restful', text: 'RESTful', link: '/doc/a/restful' },
        ],
      },
    ],
  },
  {
    category: '解决方案',
    children: [
      {
        category: '社交娱乐',
        children: [
          {
            title: '产品 B',
            desc: '方案描述',
            useCases: [
              {
                title: '方案一',
                desc: '方案一描述',
                clientApis: [
                  {
                    platform: 'ios',
                    text: 'iOS',
                    link: '/doc/b/ios/api',
                  },
                ],
                serverApis: [],
              },
            ],
          },
        ],
      },
    ],
  },
];

const platforms = [
  { label: 'Android', value: 'android', icon: '/android.svg' },
];

function renderedHtml() {
  return `<!doctype html>
<html><head><title>API 中心</title></head><body>
  <section>
    <div><div class="custom-category-title">产品 A</div><div>产品描述</div>
      <div>客户端 API</div><div><div class="custom-api-card">Android</div></div>
      <div>服务端 API</div><div><div class="custom-api-card">RESTful</div></div>
    </div>
    <div><div class="custom-category-title">产品 B</div><div>方案描述</div>
      <div><div class="w-text-lg">方案一</div><div>方案一描述</div>
        <div>客户端 API</div><div><div class="custom-api-card">iOS</div></div>
      </div>
    </div>
  </section>
</body></html>`;
}

describe('api-center inventory', () => {
  afterEach(async () => {
    await Promise.all(
      tempDirs
        .splice(0)
        .map((directory) =>
          fs.rm(directory, { force: true, recursive: true }),
        ),
    );
  });

  it('preserves categories, nested subcategories, use cases, API groups, and entry order', () => {
    const source = normalizeSourceApiCenter(apiData, platforms);

    expect(
      source.categories.map((category: { title: string }) => category.title),
    ).toEqual([
      '基础能力',
      '解决方案',
    ]);
    expect(source.products).toHaveLength(2);
    expect(source.entries).toHaveLength(3);
    expect(source.entries[2]).toMatchObject({
      category: '解决方案',
      subcategories: ['社交娱乐'],
      product: '产品 B',
      useCase: '方案一',
      apiGroup: 'client',
      label: 'iOS',
      legacyPath: '/doc/b/ios/api',
      pageGraph: { status: 'pending' },
    });
    expect(
      new Set(source.entries.map((entry: { id: string }) => entry.id)).size,
    ).toBe(3);
  });

  it('extracts the rendered product, use-case, API-group, and label structure', () => {
    const live = parseLiveApiCenterHtml(
      renderedHtml(),
      'https://doc.shengwang.cn/api-center',
    );

    expect(live.productCount).toBe(2);
    expect(live.apiEntryCount).toBe(3);
    expect(live.products[1]).toMatchObject({
      title: '产品 B',
      useCases: [
        {
          title: '方案一',
          apiGroups: [{ apiGroup: 'client', labels: ['iOS'] }],
        },
      ],
    });
  });

  it('reports exact rendered DOM parity and visible-label snapshot parity', () => {
    const source = normalizeSourceApiCenter(apiData, platforms);
    const live = parseLiveApiCenterHtml(
      renderedHtml(),
      'https://doc.shengwang.cn/api-center',
    );
    expect(compareLiveAndSource(live, source)).toMatchObject({
      status: 'matched',
      basis: 'rendered-dom-structure',
      warnings: [],
    });

    const baseline = parseLiveApiCenterBaseline({
      title: 'API 中心',
      url: 'https://doc.shengwang.cn/api-center',
      productCount: 2,
      apiEntryCount: 3,
      products: [
        { title: '产品 A', apiLabels: ['Android', 'RESTful'] },
        { title: '产品 B', apiLabels: ['iOS'] },
      ],
    });
    expect(compareLiveAndSource(baseline, source)).toMatchObject({
      status: 'matched',
      basis: 'visible-product-and-entry-labels',
      warnings: [],
    });
  });

  it('reports live/source structure drift without discarding the inventory', () => {
    const source = normalizeSourceApiCenter(apiData, platforms);
    const live = parseLiveApiCenterBaseline({
      title: 'API 中心',
      url: 'https://doc.shengwang.cn/api-center',
      productCount: 2,
      apiEntryCount: 3,
      products: [
        { title: '产品 A', apiLabels: ['Android'] },
        { title: '产品 B', apiLabels: ['iOS'] },
      ],
    });
    const parity = compareLiveAndSource(live, source);

    expect(parity.status).toBe('drift');
    expect(parity.warnings).toContainEqual(
      expect.objectContaining({
        code: 'live-source-product-structure-drift',
        productOrder: 0,
      }),
    );
  });

  it('renders a deterministic manifest with pending page graph state', () => {
    const source = normalizeSourceApiCenter(apiData, platforms);
    const live = parseLiveApiCenterHtml(
      renderedHtml(),
      'https://doc.shengwang.cn/api-center',
    );
    const manifest = buildManifest({
      live,
      source,
      sourceCommit: 'abc123',
      sourcePath: 'data/apiCenter.ts',
    });
    const markdown = renderManifestMarkdown(manifest);

    expect(manifest.counts).toMatchObject({
      categories: 2,
      products: 2,
      entries: 3,
      pendingPageGraphs: 3,
    });
    expect(markdown).toContain('解决方案 / 社交娱乐');
    expect(markdown).toContain('产品 B / 方案一');
  });

  it('retains page-graph progress for unchanged stable entry IDs', () => {
    const source = normalizeSourceApiCenter(apiData, platforms);
    const live = parseLiveApiCenterHtml(
      renderedHtml(),
      'https://doc.shengwang.cn/api-center',
    );
    const initial = buildManifest({
      live,
      source,
      sourceCommit: 'abc123',
      sourcePath: 'data/apiCenter.ts',
    });
    const previous = structuredClone(initial);
    previous.entries[0].pageGraph = {
      status: 'resolved',
      pages: [{ path: '/api-ref/a/android' }],
      warnings: [],
    };
    previous.pageGraphSummary = { entryCount: 3, uniquePageCount: 1 };

    const merged = mergeManifestProgress(initial, previous);
    expect(merged.entries[0].pageGraph.status).toBe('resolved');
    expect(merged.counts.resolvedPageGraphs).toBe(1);
    expect(merged.pageGraphSummary).toEqual(previous.pageGraphSummary);
  });

  it('writes and checks the same manifest from fixtures', async () => {
    const root = await makeTempDir();
    const sourceRoot = path.join(root, 'legacy');
    const outputRoot = path.join(root, 'output');
    const baselinePath = path.join(root, 'live.json');
    await fs.mkdir(path.join(sourceRoot, 'data'), { recursive: true });
    await fs.writeFile(
      path.join(sourceRoot, 'data', 'apiCenter.ts'),
      `export const platforms = ${JSON.stringify(platforms)};\nexport const apiData = ${JSON.stringify(apiData)};\n`,
    );
    await fs.writeFile(
      baselinePath,
      JSON.stringify({
        title: 'API 中心',
        url: 'https://doc.shengwang.cn/api-center',
        productCount: 2,
        apiEntryCount: 3,
        products: [
          { title: '产品 A', apiLabels: ['Android', 'RESTful'] },
          { title: '产品 B', apiLabels: ['iOS'] },
        ],
      }),
    );
    execFileSync('git', ['init', '-q'], { cwd: sourceRoot });
    execFileSync('git', ['add', '.'], { cwd: sourceRoot });
    execFileSync(
      'git',
      ['-c', 'user.name=Test', '-c', 'user.email=test@example.com', 'commit', '-qm', 'fixture'],
      { cwd: sourceRoot },
    );

    const args = [
      SCRIPT,
      '--source-root',
      sourceRoot,
      '--live-baseline',
      baselinePath,
      '--out-json',
      path.join(outputRoot, 'manifest.json'),
      '--out-markdown',
      path.join(outputRoot, 'manifest.md'),
    ];
    const output = execFileSync('bun', args, { encoding: 'utf8' });
    expect(output).toContain('Live/source parity: matched');
    expect(
      execFileSync('bun', [...args, '--check'], { encoding: 'utf8' }),
    ).toContain('Generated inventory is current.');
  });
});
