import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import remarkMdx from 'remark-mdx';
import remarkParse from 'remark-parse';
import { unified } from 'unified';

const parser = unified().use(remarkParse).use(remarkMdx);
const names = new Map([
  ['Tabs', 'CodeBlockTabs'],
  ['TabsList', 'CodeBlockTabsList'],
  ['TabsTrigger', 'CodeBlockTabsTrigger'],
  ['TabsContent', 'CodeBlockTab'],
]);

function attribute(node, name) {
  return node.attributes?.find((item) => item.name === name)?.value;
}

function isEmptyAnchor(node) {
  return (
    ['mdxJsxFlowElement', 'mdxJsxTextElement'].includes(node.type) &&
    node.name === 'a' &&
    node.attributes.length > 0 &&
    node.attributes.every(
      (item) =>
        item.type === 'mdxJsxAttribute' &&
        ['id', 'name'].includes(item.name) &&
        typeof item.value === 'string',
    ) &&
    node.children.length === 0
  );
}

function isInvisible(node) {
  return (
    isEmptyAnchor(node) ||
    (node.type === 'text' && node.value.trim() === '') ||
    (node.type === 'paragraph' && node.children.every(isInvisible))
  );
}

/** Classify source structure; anchors are metadata, prose stays ordinary Tabs. */
export function inspectCodeTabs(source) {
  if (!source.includes('<Tabs')) return [];
  const root = parser.parse(source);
  const groups = [];
  function visit(node) {
    if (node.type === 'mdxJsxFlowElement' && node.name === 'Tabs') {
      const panels = node.children.filter(
        (child) => child.name === 'TabsContent',
      );
      const pure =
        panels.length > 0 &&
        node.children.every(
          (child) =>
            ['TabsList', 'TabsContent'].includes(child.name) ||
            isInvisible(child),
        ) &&
        panels.every((panel) => {
          const content = panel.children.filter((child) => !isInvisible(child));
          return content.length === 1 && content[0].type === 'code';
        });
      groups.push({ node, pure, groupId: attribute(node, 'groupId') });
    }
    node.children?.forEach(visit);
  }
  visit(root);
  const mixedGroups = new Set(
    groups
      .filter((group) => !group.pure && group.groupId)
      .map((group) => group.groupId),
  );
  return groups.map((group) => ({
    ...group,
    convertible:
      group.pure &&
      !mixedGroups.has(group.groupId) &&
      group.node.children.some((child) => child.name === 'TabsList'),
  }));
}

/** Change wrapper names at AST offsets; preserve fences, anchors and props. */
export function normalizeCodeTabs(source) {
  const groups = inspectCodeTabs(source).filter((group) => group.convertible);
  const edits = [];
  function rename(node) {
    const replacement = names.get(node.name);
    if (replacement) {
      const start = node.position.start.offset;
      const end = node.position.end.offset;
      edits.push({
        start: start + 1,
        end: start + 1 + node.name.length,
        replacement,
      });
      const closing = source.lastIndexOf(`</${node.name}`, end);
      if (closing < start) throw new Error(`Missing closing ${node.name}`);
      edits.push({
        start: closing + 2,
        end: closing + 2 + node.name.length,
        replacement,
      });
    }
    node.children?.forEach(rename);
  }
  for (const group of groups) rename(group.node);
  let output = source;
  for (const edit of edits.sort((a, b) => b.start - a.start)) {
    output =
      output.slice(0, edit.start) + edit.replacement + output.slice(edit.end);
  }
  return { source: output, count: groups.length };
}

/** @param {string} root @returns {string[]} */
export function codeTabFiles(root) {
  return readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(root, entry.name);
    return entry.isDirectory()
      ? codeTabFiles(path)
      : /\.mdx?$/.test(entry.name)
        ? [path]
        : [];
  });
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const args = process.argv.slice(2);
  const rootIndex = args.indexOf('--root');
  const root =
    rootIndex < 0 ? resolve('content/docs') : resolve(args[rootIndex + 1]);
  const write = args.includes('--write');
  const findings = [];
  for (const file of codeTabFiles(root)) {
    const input = readFileSync(file, 'utf8');
    const output = normalizeCodeTabs(input);
    if (!output.count) continue;
    findings.push({ file, groups: output.count });
    if (write) writeFileSync(file, output.source);
  }
  console.log(
    JSON.stringify({ mode: write ? 'write' : 'check', findings }, null, 2),
  );
  if (!write && findings.length) process.exitCode = 1;
}
