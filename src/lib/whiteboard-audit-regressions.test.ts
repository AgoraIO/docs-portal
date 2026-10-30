import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import remarkGfm from 'remark-gfm';
import remarkMdx from 'remark-mdx';
import remarkParse from 'remark-parse';
import { unified } from 'unified';
import { visit } from 'unist-util-visit';
import { describe, expect, it } from 'vitest';

const orderedListTargets = [
  'content/docs/en/realtime-media/whiteboard/build/display-files-and-manage-scenes/file-conversion-overview.md',
  'content/docs/en/realtime-media/whiteboard/build/draw-and-edit-content/appliance-plugin.mdx',
];

function readContent(path: string) {
  return readFileSync(resolve(process.cwd(), path), 'utf8');
}

function findRepeatedOneMarkerRuns(source: string) {
  const runs: Array<{ indent: number; lines: number[] }> = [];
  const currentRuns = new Map<number, number[]>();
  let inFence = false;

  source.split(/\r?\n/).forEach((line, index) => {
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      return;
    }

    if (inFence) {
      return;
    }

    if (/^#{1,6}\s/.test(line)) {
      currentRuns.clear();
      return;
    }

    const marker = line.match(/^(\s*)(\d+)\.\s+\S/);

    if (!marker) {
      return;
    }

    const indent = marker[1].length;
    const value = Number(marker[2]);

    if (value !== 1) {
      currentRuns.delete(indent);
      return;
    }

    const run = currentRuns.get(indent) ?? [];
    run.push(index + 1);
    currentRuns.set(indent, run);

    if (run.length === 3) {
      runs.push({ indent, lines: [...run] });
    }
  });

  return runs;
}

function findTokenOutsideFences(source: string, token: string) {
  const lines: number[] = [];
  let inFence = false;

  source.split(/\r?\n/).forEach((line, index) => {
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      return;
    }

    if (!inFence && line.includes(token)) {
      lines.push(index + 1);
    }
  });

  return lines;
}

describe('whiteboard audit regressions', () => {
  it('keeps HarmonyOS overview type entries and indexes as actual links', () => {
    const source = readContent(
      'content/docs/zh-CN/api-reference/whiteboard/whiteboard-sdk/harmonyos/(current)/overview.mdx',
    ).replace(/^---\n[\s\S]*?\n---\n/, '');
    const ast = unified()
      .use(remarkParse)
      .use(remarkMdx)
      .use(remarkGfm)
      .parse(source);
    const links: { label: string; url: string }[] = [];
    visit(ast, 'link', (node) => {
      links.push({
        label: node.children
          .map((child) => ('value' in child ? child.value : ''))
          .join(''),
        url: node.url,
      });
    });
    for (const label of [
      '类型列表',
      '成员索引',
      'WhiteboardController',
      'BackgroundImageSource',
      'Whiteboard',
      'DynamicConfigOptions',
    ]) {
      expect(
        links.some((link) => link.label === label),
        label,
      ).toBe(true);
    }
    let typeRows = 0;
    visit(ast, 'table', (table) => {
      for (const row of table.children.slice(1)) {
        typeRows++;
        expect(
          row.children[0].children.some((child) => child.type === 'link'),
        ).toBe(true);
      }
    });
    expect(typeRows).toBeGreaterThan(0);
    expect(
      links.every((link) =>
        link.url.startsWith(
          '/zh-CN/api-reference/whiteboard/whiteboard-sdk/harmonyos/',
        ),
      ),
    ).toBe(true);
  });

  it('keeps ordered procedures source-numbered after the first step', () => {
    for (const path of orderedListTargets) {
      expect(findRepeatedOneMarkerRuns(readContent(path)), path).toEqual([]);
    }
  });

  it('keeps undefined scene-map values inside code fences', () => {
    const path =
      'content/docs/en/realtime-media/whiteboard/build/display-files-and-manage-scenes/scenes/manage-scenes.mdx';

    expect(findTokenOutsideFences(readContent(path), 'undefined')).toEqual([]);
  });
});
