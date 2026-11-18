import remarkMdx from 'remark-mdx';
import remarkParse from 'remark-parse';
import { unified } from 'unified';
import { stripSearchComponentTags } from './search-prose';

const parser = unified().use(remarkParse).use(remarkMdx);
const proseProps = new Set([
  'title',
  'description',
  'label',
  'text',
  'summary',
  'caption',
  'cta',
  'alt',
  'children',
]);

// Read static prose values, never JSX identifiers, configuration strings or
// executable expressions. HTML visibility is checked separately by the caller.
export function getComponentSearchText(source: string): string[] {
  const values: string[] = [];
  let component = '';
  const isProseProp = (name: string) =>
    proseProps.has(name) ||
    (component === 'DemoMedia' && name === 'qrLabel') ||
    (component === 'DemoGallery' &&
      ['tags', 'platforms', 'products', 'releaseDate', 'version'].includes(
        name,
      ));
  function collect(value: unknown, prose = false): void {
    if (Array.isArray(value)) {
      for (const child of value) collect(child, prose);
      return;
    }
    if (!value || typeof value !== 'object') return;
    const node = value as Record<string, unknown>;
    switch (node.type) {
      case 'Program':
        collect(node.body, prose);
        break;
      case 'ExpressionStatement':
      case 'JSXExpressionContainer':
        collect(node.expression, prose);
        break;
      case 'ArrayExpression':
        collect(node.elements, prose);
        break;
      case 'ObjectExpression':
        collect(node.properties);
        break;
      case 'Property': {
        if (node.computed || node.kind !== 'init') break;
        const key = node.key as Record<string, unknown> | undefined;
        const name = key?.type === 'Identifier' ? key.name : key?.value;
        const value = node.value as Record<string, unknown> | undefined;
        if (
          component === 'DemoGallery' &&
          (name === 'platforms' || name === 'products') &&
          value?.type === 'ArrayExpression' &&
          Array.isArray(value.elements) &&
          value.elements.every(
            (entry) =>
              entry?.type === 'Literal' && typeof entry.value === 'string',
          )
        ) {
          // These two visible metadata fields render as one joined text node.
          values.push(value.elements.map((entry) => entry.value).join('、'));
        } else
          collect(node.value, typeof name === 'string' && isProseProp(name));
        break;
      }
      case 'JSXElement':
        if (prose) collect(node.openingElement, prose);
        collect(node.children, prose);
        break;
      case 'JSXFragment':
        collect(node.children, prose);
        break;
      case 'JSXOpeningElement':
        collect(node.attributes, prose);
        break;
      case 'JSXAttribute': {
        const name = node.name as Record<string, unknown> | undefined;
        if (typeof name?.name === 'string' && proseProps.has(name.name))
          collect(node.value, prose);
        break;
      }
      case 'Literal':
      case 'JSXText':
        if (prose && typeof node.value === 'string') values.push(node.value);
        break;
      case 'TemplateLiteral':
        if (
          prose &&
          Array.isArray(node.expressions) &&
          !node.expressions.length
        )
          for (const quasi of node.quasis as { value: { cooked: string } }[])
            values.push(quasi.value.cooked);
        break;
    }
  }
  stripSearchComponentTags(source, false, [], ({ source: tag }) => {
    if (tag.startsWith('</')) return;
    // Removed spans are individual opening tags, possibly across section
    // boundaries. Make each independently parseable without evaluating JSX.
    const standalone = tag.endsWith('/>') ? tag : `${tag.slice(0, -1)} />`;
    try {
      const tree = parser.parse(standalone);
      for (const node of tree.children) {
        if (
          node.type !== 'mdxJsxFlowElement' &&
          node.type !== 'mdxJsxTextElement'
        )
          continue;
        for (const attribute of node.attributes) {
          if (attribute.type !== 'mdxJsxAttribute') continue;
          component = node.name ?? '';
          const prose = isProseProp(attribute.name);
          if (typeof attribute.value === 'string') {
            if (prose) values.push(attribute.value);
          } else if (attribute.value)
            collect(attribute.value.data?.estree, prose);
        }
      }
    } catch {
      // Malformed or unsupported props cannot supply verified static prose.
    }
  });
  return values;
}
