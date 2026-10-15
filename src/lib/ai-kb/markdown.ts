import remarkParse from 'remark-parse';
import { unified } from 'unified';

/** Restore only the renderer-marked platform blocks recognized by CN search.
 * This leaves genuine indented code and language fences unchanged.
 * Keep this KB-local so ordinary search publication behavior remains untouched.
 */
export function normalizeKbPlatformMarkdown(markdown: string): string {
  let tree = unified().use(remarkParse).parse(markdown);
  while (true) {
    const blocks = tree.children.filter((node) => {
      if (node.type !== 'code' || node.lang || !node.position) return false;
      const start = node.position.start.offset ?? 0;
      const source = markdown.slice(start, node.position.end.offset);
      return (
        /^(?: {4}|\t)/.test(source) &&
        !/^\s*(?:`{3,}|~{3,})/.test(source) &&
        /^\s*#{1,6}\s+.+\s+\[#.+\]\s*$/m.test(node.value)
      );
    });
    if (!blocks.length) break;
    for (const node of blocks.reverse()) {
      if (node.type !== 'code' || !node.position) continue;
      let value = node.value;
      // Slot 中的代码被序列化到表格单元格时，闭合 fence 后会残留列分隔符。
      // 只在确认存在表格代码单元格的生成块内恢复两列代码的 fence 边界。
      if (
        /^\s*\|\s*`{3,}[^`\r\n]*$/m.test(value) &&
        /^\s*\|[\s:|-]+\|\s*$/m.test(value)
      ) {
        value = value
          .replace(/^([ \t]*)\|[ \t]*(`{3,}[^`\r\n]*)$/gm, '$1$2')
          .replace(
            /^([ \t]*)(`{3,})[ \t]*\|[ \t]*(`{3,}[^`\r\n]*)$/gm,
            '$1$2\n\n$1$3',
          )
          .replace(/^([ \t]*)(`{3,})\s*\|\s*$/gm, '$1$2');
      }
      markdown =
        markdown.slice(0, node.position.start.offset) +
        value +
        markdown.slice(node.position.end.offset);
    }
    tree = unified().use(remarkParse).parse(markdown);
  }
  return markdown;
}
