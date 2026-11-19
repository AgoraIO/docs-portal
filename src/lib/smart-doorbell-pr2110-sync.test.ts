import { readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { compile } from '@mdx-js/mdx';
import { getTableOfContents } from 'fumadocs-core/content/toc';
import { remarkGfm } from 'fumadocs-core/mdx-plugins';
import { describe, expect, it } from 'vitest';

const productRoot = resolve(
  process.cwd(),
  'content/docs/zh-CN/solutions/smart-doorbell',
);
const obsoleteDiagramId = '1666592737672';
const obsoleteDiagramUrl = `https://web-cdn.agora.io/docs-files/${obsoleteDiagramId}`;

function readContent(relativePath: string) {
  return readFileSync(join(productRoot, relativePath), 'utf8');
}

function listContentFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = join(directory, entry.name);
    return entry.isDirectory() ? listContentFiles(entryPath) : [entryPath];
  });
}

describe('Smart Doorbell upstream PR #2110 parity', () => {
  it('removes the explicitly deleted diagram from the actual overview', () => {
    const overview = readContent('index.mdx');

    expect(overview).not.toContain(obsoleteDiagramUrl);
    expect(overview).not.toContain(obsoleteDiagramId);
  });

  it('does not retain the obsolete diagram in any nested doorbell MDX', () => {
    const pages = listContentFiles(productRoot).filter((file) =>
      file.endsWith('.mdx'),
    );

    expect(pages.length).toBeGreaterThan(1);
    for (const page of pages) {
      expect(readFileSync(page, 'utf8'), page).not.toContain(obsoleteDiagramId);
    }
  });

  it('preserves the PaaS-only description and SDK integration scope', () => {
    const overview = readContent('index.mdx');

    expect(overview).toContain('声网针对智能门铃场景提供 PaaS 解决方案。');
    expect(overview).toContain(
      '该方案基于声网实时互动、云信令、离线推送等服务，通过设备端 SDK 和客户端 SDK，提供简单易用的上云方案。',
    );
    expect(overview).not.toMatch(/aPaaS|灵隼物联网云平台|云芯一体/i);
  });

  it('keeps aPaaS out of every doorbell navigation file', () => {
    const navigationFiles = listContentFiles(productRoot).filter((file) =>
      file.endsWith('/meta.json'),
    );

    expect(navigationFiles.length).toBeGreaterThan(0);
    for (const file of navigationFiles) {
      const navigation = JSON.parse(readFileSync(file, 'utf8'));
      expect(navigation.pages.length, file).toBeGreaterThan(0);
      expect(JSON.stringify(navigation), file).not.toMatch(/apaas/i);
    }
    expect(JSON.parse(readContent('build/meta.json')).pages).toContain(
      'paas-overview',
    );
  });

  it('preserves the PaaS-only table structure and key content', () => {
    const technicalSolution = readContent('index.mdx')
      .split('## 技术方案\n')[1]
      .split('## 技术架构\n')[0];
    const rows = technicalSolution
      .split('\n')
      .filter((line) => line.startsWith('|'))
      .map((line) =>
        line
          .split('|')
          .slice(1, -1)
          .map((cell) => cell.trim()),
      );

    expect(rows[0]).toEqual(['说明', 'PaaS 解决方案']);
    expect(rows.slice(2).map(([label]) => label)).toEqual([
      '方案介绍',
      '适用对象',
      '开发成本',
      '通用功能',
      '设备连接管理',
      '双向音视频呼叫/呼叫管理',
      '事件云存储',
      '告警服务（消息推送）',
      'OTA',
      '交付物',
    ]);
    for (const row of rows) expect(row).toHaveLength(2);
    expect(technicalSolution).toContain('纯传输，高代码');
    expect(technicalSolution).toContain('客户自行实现或对接第三方 OSS');
    expect(rows.at(-1)).toEqual(['交付物', 'SDK']);
  });

  it('preserves the architecture introduction and a real local fragment target', () => {
    const overview = readContent('index.mdx');
    const architectureHref =
      '/zh-CN/solutions/smart-doorbell/build/paas-overview#方案架构';

    expect(overview).toContain('## 技术架构');
    expect(overview).toContain(
      '智能门铃 PaaS 方案通过 RTSA Lite SDK、RTC SDK 和 RTM SDK 实现设备端与客户端的实时音视频和信令交互。',
    );
    expect(overview).toContain(`[智能门铃 PaaS 方案介绍](${architectureHref})`);
    const [route, fragment] = architectureHref.split('#');
    const target = readFileSync(
      resolve(process.cwd(), `content/docs${route}.mdx`),
      'utf8',
    );
    expect(getTableOfContents(target).map((heading) => heading.url)).toContain(
      `#${fragment}`,
    );
  });

  it('compiles the actual overview body with both GFM tables intact', async () => {
    const body = readContent('index.mdx').replace(
      /^---\r?\n[\s\S]*?\r?\n---\r?\n/,
      '',
    );
    const compiled = String(
      await compile(body, {
        format: 'mdx',
        jsx: true,
        remarkPlugins: [remarkGfm],
      }),
    );

    expect(compiled.match(/<_components\.table>/g)).toHaveLength(2);
    expect(compiled).toContain('PaaS 解决方案');
    expect(compiled).toContain(
      `build/paas-overview#${encodeURIComponent('方案架构')}`,
    );
  });
});
