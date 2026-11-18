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
const componentProseProps: Record<string, readonly string[]> = {
  DemoMedia: ['qrLabel'],
  DemoGallery: ['tags', 'platforms', 'products', 'releaseDate', 'version'],
  PlanCards: ['name', 'features', 'badge'],
  PricingCards: ['name', 'features', 'badge'],
  Parameter: ['name', 'type', 'direction', 'defaultValue', 'possibleValues'],
  ApiSignature: ['labels'],
  ProductSdkDownloads: ['versionIds'],
  DownloadResourceCards: ['platform', 'version'],
};

// Read static prose values, never JSX identifiers, configuration strings or
// executable expressions. HTML visibility is checked separately by the caller.
export function getComponentSearchText(source: string): string[] {
  const values: string[] = [];
  let component = '';
  const isProseProp = (name: string) =>
    proseProps.has(name) ||
    (componentProseProps[component]?.includes(name) ?? false);
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
          component === 'DownloadResourceCards' &&
          name === 'platform' &&
          value?.type === 'Literal'
        ) {
          if (value.value === 'ios') values.push('iOS');
          if (value.value === 'android') values.push('Android');
        }
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
        component = node.name ?? '';
        const attributes = node.attributes.filter(
          (attribute) => attribute.type === 'mdxJsxAttribute',
        );
        const booleanProp = (name: string): boolean | undefined => {
          const attribute = attributes.find(
            (attribute) => attribute.name === name,
          );
          if (!attribute) return undefined;
          if (attribute.value === null) return true;
          if (typeof attribute.value !== 'object') return undefined;
          const expression = attribute.value.data?.estree?.body[0];
          if (expression?.type !== 'ExpressionStatement') return undefined;
          const literal = expression.expression;
          return literal.type === 'Literal' &&
            typeof literal.value === 'boolean'
            ? literal.value
            : undefined;
        };
        if (
          component === 'ApiReturns' &&
          !attributes.some((a) => a.name === 'title')
        )
          values.push('Returns');
        if (component === 'Parameter' || component === 'ParameterList') {
          const required = booleanProp('required');
          if (required === true) values.push('required');
          else if (required === false || booleanProp('optional') === true)
            values.push('optional', 'Optional');
          if (booleanProp('nullable') === true)
            values.push('nullable', ' | null');
        }
        for (const attribute of node.attributes) {
          if (attribute.type !== 'mdxJsxAttribute') continue;
          const prose = isProseProp(attribute.name);
          if (typeof attribute.value === 'string') {
            if (prose) values.push(attribute.value);
          } else if (attribute.value)
            if (
              component === 'ProductSdkDownloads' &&
              attribute.name === 'versionIds'
            ) {
              const start = values.length;
              collect(attribute.value.data?.estree, prose);
              const ids = values.splice(start);
              for (const id of ids) {
                const version = id.match(/^v?(\d+(?:\.\d+)+)/)?.[1];
                if (version) values.push(version);
              }
            } else collect(attribute.value.data?.estree, prose);
        }
      }
    } catch {
      // Malformed or unsupported props cannot supply verified static prose.
    }
  });
  return values;
}
