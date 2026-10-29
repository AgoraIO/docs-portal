import { readdir, readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import remarkGfm from 'remark-gfm';
import remarkMdx from 'remark-mdx';
import remarkParse from 'remark-parse';
import { unified } from 'unified';
import { remarkTableSlots } from '../src/lib/mdx/remark-table-slots.ts';

const markdown = unified().use(remarkParse).use(remarkGfm);
const mdx = unified().use(remarkParse).use(remarkGfm).use(remarkMdx);

export function auditTableStructure(source, isMdx = true) {
  const body = source.replace(/^---\r?\n[\s\S]*?\r?\n---/, (s) =>
    s.replace(/[^\r\n]/g, ' '),
  );
  const diagnostics = [];
  const tree = (isMdx ? mdx : markdown).parse(body);
  function walk(node) {
    if (node.type === 'table') {
      const width = node.children[0].children.length;
      const text = (cell) =>
        cell.value ?? cell.children?.map(text).join('') ?? '';
      const headers = node.children[0].children.map((cell) =>
        text(cell).trim().toLowerCase(),
      );
      const keyColumn = headers.indexOf('key');
      const typeColumn = headers.findIndex(
        (label) => label === 'type' || label === '类型',
      );
      for (const row of node.children.slice(1)) {
        if (row.children.length !== width)
          diagnostics.push({
            line: row.position.start.line,
            message: `Expected ${width} cells, found ${row.children.length}`,
          });
        if (
          headers.includes('option') &&
          keyColumn >= 0 &&
          typeColumn >= 0 &&
          /^(?:bool(?:ean)?|int|float|double|string|number)$/i.test(
            text(row.children[keyColumn] ?? {}).trim(),
          )
        ) {
          diagnostics.push({
            line: row.position.start.line,
            message:
              'A type appears in the key column; check merged option cells',
          });
        }
      }
    }
    if (
      (node.type === 'html' && /<table\b/i.test(node.value)) ||
      (node.type === 'mdxJsxFlowElement' &&
        node.name?.toLowerCase() === 'table')
    ) {
      diagnostics.push({
        line: node.position.start.line,
        message: 'Use a native GFM table with Slot blocks for rich cells',
      });
    }
    for (const child of node.children ?? []) walk(child);
  }
  walk(tree);
  try {
    // Use the publication transform to validate adjacency and reusable rich
    // definitions, not just whether matching names occur somewhere in a file.
    remarkTableSlots()(tree);
    const checkRawSlots = (node) => {
      if (
        node.type === 'tableCell' &&
        node.children.some(
          (child) => child.type === 'html' && /<Slot\s+name=/.test(child.value),
        )
      ) {
        diagnostics.push({
          line: node.position.start.line,
          message: 'Missing adjacent Slot definition for rich table cell',
        });
      }
      for (const child of node.children ?? []) checkRawSlots(child);
    };
    checkRawSlots(tree);
  } catch (error) {
    diagnostics.push({ line: 1, message: error.message });
  }
  return diagnostics;
}

export async function auditDocTables(root = 'content/docs') {
  const files = (await readdir(root, { recursive: true })).filter((file) =>
    /\.mdx?$/.test(file),
  );
  const diagnostics = [];
  for (const file of files) {
    try {
      for (const issue of auditTableStructure(
        await readFile(`${root}/${file}`, 'utf8'),
        file.endsWith('.mdx'),
      )) {
        diagnostics.push({ file: `${root}/${file}`, ...issue });
      }
    } catch (error) {
      diagnostics.push({
        file: `${root}/${file}`,
        line: error.line ?? 1,
        message: error.message,
      });
    }
  }
  return { files: files.length, diagnostics };
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  const result = await auditDocTables(process.argv[2]);
  for (const issue of result.diagnostics)
    console.error(`${issue.file}:${issue.line}: ${issue.message}`);
  console.log(
    `Audited ${result.files} documents; ${result.diagnostics.length} table structure errors.`,
  );
  if (result.diagnostics.length) process.exitCode = 1;
}
