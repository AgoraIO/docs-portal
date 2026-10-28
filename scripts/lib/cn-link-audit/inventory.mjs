import fs from 'node:fs';
import path from 'node:path';
import { load } from 'cheerio';
import { remarkGfm } from 'fumadocs-core/mdx-plugins';
import GithubSlugger from 'github-slugger';
import yaml from 'js-yaml';
import remarkDirective from 'remark-directive';
import remarkMdx from 'remark-mdx';
import remarkParse from 'remark-parse';
import { unified } from 'unified';
import { normalizeDocsHref } from '../../../src/lib/docs-link-normalize.ts';
import { getSourceSlugsFromContentPath } from '../../../src/lib/docs-routing.ts';
import {
  getOpenApiEndpointUrl,
  getOpenApiLaneLocales,
  getOpenApiLanes,
} from '../../../src/lib/openapi/lanes.ts';
import { isRetiredCnDocsPath } from '../../../src/lib/retired-cn-docs.mjs';

const mdParser = unified().use(remarkParse).use(remarkGfm).use(remarkDirective);
const mdxParser = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkDirective)
  .use(remarkMdx);
const linkKeys = new Set([
  'href',
  'to',
  'src',
  'srcSet',
  'srcset',
  'poster',
  'url',
  'downloadUrl',
]);
const resourceKeys = new Set([
  'src',
  'srcSet',
  'srcset',
  'poster',
  'backgroundImage',
]);
export const LOCAL_ORIGIN = 'https://cn-link-audit.invalid';
export const publicPath = (value) =>
  value.replace(/^\/zh-CN(?=\/|[?#]|$)/, '') || '/';

export function sourceRoute(sourcePath) {
  const contentPath = sourcePath.replace(/^content\/docs\//, '');
  const locale = contentPath.split('/')[0];
  return publicPath(
    `/${locale}/${getSourceSlugsFromContentPath(contentPath)
      .filter((segment) => !/^\(.+\)$/.test(segment))
      .join('/')}`,
  );
}

function staticValue(expression) {
  if (!expression) return undefined;
  if (expression.type === 'Literal') return expression.value;
  if (
    expression.type === 'TemplateLiteral' &&
    expression.expressions.length === 0
  )
    return expression.quasis[0].value.cooked;
  return undefined;
}

function expressionOf(attribute) {
  return attribute?.value?.data?.estree?.body?.[0]?.expression;
}

export function extractDocument(
  text,
  { sourcePath = '', pageUrl = sourceRoute(sourcePath) } = {},
) {
  const links = [],
    gaps = [],
    anchors = [],
    includes = [],
    states = [];
  let frontmatter = {};
  const fm = text.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (fm) {
    try {
      frontmatter = yaml.load(fm[1]) ?? {};
    } catch (error) {
      gaps.push({
        sourcePath,
        pageUrl,
        reason: 'frontmatter-parse-error',
        detail: error.message,
      });
    }
    text = fm[0].replace(/[^\n]/g, ' ') + text.slice(fm[0].length);
  }
  let tree;
  try {
    tree = (sourcePath.endsWith('.md') ? mdParser : mdxParser).parse(text);
  } catch (error) {
    gaps.push({
      sourcePath,
      pageUrl,
      line: error.line,
      column: error.column,
      reason: 'parse-error',
      detail: error.message,
    });
    return { links, gaps, anchors, includes, states, frontmatter };
  }
  const definitions = new Map();
  const slugger = new GithubSlugger();
  function visitAll(node, fn) {
    fn(node);
    for (const child of node.children ?? []) visitAll(child, fn);
  }
  visitAll(tree, (node) => {
    if (node.type === 'definition')
      definitions.set(node.identifier.toLowerCase(), node.url);
  });
  const textOf = (node) =>
    typeof node.value === 'string'
      ? node.value
      : (node.children ?? []).map(textOf).join('');
  const position = (node) => ({
    line: node.position?.start?.line ?? node.loc?.start?.line,
    column: node.position?.start?.column ?? node.loc?.start?.column,
  });
  function gap(node, reason, context, detail) {
    gaps.push({
      sourcePath,
      pageUrl,
      ...position(node),
      ...context,
      reason,
      detail,
    });
  }
  function add(href, key, node, context, source = 'source') {
    if (typeof href !== 'string') return;
    // Empty href/src still represents a rendered reference; report it explicitly.
    const values = /srcset/i.test(key) ? parseSrcset(href) : [href];
    for (const value of values)
      links.push({
        sourcePath,
        pageUrl,
        ...position(node),
        ...context,
        href: value,
        kind: resourceKeys.has(key) ? 'resource' : 'link',
        source,
        attribute: key,
      });
  }
  function scanEstree(node, context, origin) {
    if (!node || typeof node !== 'object') return;
    if (node.type === 'Property') {
      const key = node.key.name ?? node.key.value;
      if (linkKeys.has(key)) {
        const value = staticValue(node.value);
        if (typeof value === 'string')
          add(value, key, origin, context, 'expression');
        else gap(origin, 'dynamic-link-expression', context, String(key));
      }
      if (key === 'backgroundImage') {
        const value = staticValue(node.value);
        if (typeof value === 'string') {
          for (const match of value.matchAll(/url\(["']?([^)'"\s]+)["']?\)/g))
            add(match[1], 'backgroundImage', origin, context, 'expression');
        } else gap(origin, 'dynamic-resource-expression', context, key);
      }
    }
    if (node.type === 'JSXAttribute') {
      const key = node.name?.name;
      if (linkKeys.has(key)) {
        const value =
          node.value?.type === 'JSXExpressionContainer'
            ? staticValue(node.value.expression)
            : staticValue(node.value);
        if (typeof value === 'string')
          add(value, key, origin, context, 'expression');
        else gap(origin, 'dynamic-link-expression', context, String(key));
      }
    }
    for (const [key, value] of Object.entries(node)) {
      if (['loc', 'position', 'comments'].includes(key)) continue;
      if (Array.isArray(value))
        for (const child of value) scanEstree(child, context, origin);
      else if (value && typeof value === 'object')
        scanEstree(value, context, origin);
    }
  }
  function walk(node, context = {}) {
    if (['code', 'inlineCode', 'definition'].includes(node.type)) return;
    if (
      node.type === 'mdxFlowExpression' ||
      node.type === 'mdxTextExpression'
    ) {
      if (node.data?.estree?.body?.length) {
        scanEstree(node.data?.estree, context, node);
        gap(
          node,
          'dynamic-content-expression',
          context,
          node.value.slice(0, 160),
        );
      }
      return;
    }
    if (node.type === 'mdxjsEsm') {
      gap(node, 'module-generated-content', context, node.value.slice(0, 160));
      return;
    }
    if (node.type === 'heading') {
      const heading = textOf(node);
      const custom = heading.match(/\s*\{#([^}]+)\}$/)?.[1];
      anchors.push(custom ?? slugger.slug(heading));
    }
    if (['link', 'image'].includes(node.type))
      add(node.url, node.type === 'image' ? 'src' : 'href', node, context);
    if (['linkReference', 'imageReference'].includes(node.type)) {
      const url = definitions.get(node.identifier.toLowerCase());
      if (url !== undefined)
        add(
          url,
          node.type === 'imageReference' ? 'src' : 'href',
          node,
          context,
        );
      else gap(node, 'missing-reference-definition', context, node.identifier);
    }
    if (node.type === 'html') {
      const $ = load(node.value, { sourceCodeLocationInfo: true }, false);
      $('[href], [src], [srcset], [poster]').each((_i, element) => {
        for (const key of ['href', 'src', 'srcset', 'poster'])
          if ($(element).attr(key) !== undefined) {
            const location = element.sourceCodeLocation?.attrs?.[key];
            const at = location
              ? {
                  position: {
                    start: {
                      line: node.position.start.line + location.startLine - 1,
                      column:
                        location.startCol +
                        (location.startLine === 1
                          ? node.position.start.column - 1
                          : 0),
                    },
                  },
                }
              : node;
            add($(element).attr(key), key, at, context, 'html');
          }
        for (const match of ($(element).attr('style') ?? '').matchAll(
          /url\(\s*(?:"([^"]*)"|'([^']*)'|([^)]*?))\s*\)/gi,
        ))
          add(
            match[1] ?? match[2] ?? match[3],
            'backgroundImage',
            node,
            context,
            'html',
          );
      });
      $('[id], a[name]').each((_i, element) =>
        anchors.push($(element).attr('id') ?? $(element).attr('name')),
      );
    }
    if (
      node.type === 'mdxJsxFlowElement' ||
      node.type === 'mdxJsxTextElement'
    ) {
      const attrs = node.attributes ?? [];
      const attributeValue = (name) => {
        const attr = attrs.find((a) => a.name === name);
        return typeof attr?.value === 'string'
          ? attr.value
          : staticValue(expressionOf(attr));
      };
      if (/^Platform/.test(node.name ?? '')) {
        context = {
          ...context,
          platform: attributeValue('platform') ?? 'unknown',
        };
        states.push({ ...context, component: node.name });
      }
      if (['Accordion', 'Tab'].includes(node.name)) {
        context = {
          ...context,
          state:
            attributeValue('id') ??
            attributeValue('value') ??
            attributeValue('title') ??
            node.name,
        };
        states.push({ ...context, component: node.name });
      }
      const id =
        attributeValue('id') ??
        (node.name === 'a' ? attributeValue('name') : undefined);
      if (typeof id === 'string') anchors.push(id);
      if (node.name === 'include') {
        includes.push({
          path: attributeValue('file') ?? attributeValue('src'),
          ...position(node),
        });
        return;
      }
      for (const attribute of attrs) {
        if (attribute.type === 'mdxJsxExpressionAttribute') {
          gap(node, 'spread-attributes', context, attribute.value);
          continue;
        }
        const key = attribute.name;
        if (linkKeys.has(key)) {
          const value =
            typeof attribute.value === 'string'
              ? attribute.value
              : staticValue(expressionOf(attribute));
          if (typeof value === 'string')
            add(value, key, attribute, context, 'jsx');
          else gap(attribute, 'dynamic-link-expression', context, key);
        } else if (attribute.value?.data?.estree) {
          scanEstree(attribute.value.data.estree, context, attribute);
          const expression = expressionOf(attribute);
          if (
            expression &&
            ![
              'Literal',
              'ObjectExpression',
              'ArrayExpression',
              'JSXElement',
              'JSXFragment',
            ].includes(expression.type)
          )
            gap(attribute, 'dynamic-component-prop', context, key);
        }
      }
    }
    if (node.type.endsWith('Directive'))
      for (const [key, value] of Object.entries(node.attributes ?? {}))
        if (linkKeys.has(key)) add(value, key, node, context, 'directive');
    for (const child of node.children ?? []) walk(child, context);
  }
  walk(tree);
  return {
    links,
    gaps,
    anchors: [...new Set(anchors)],
    includes,
    states,
    frontmatter,
  };
}

export function resolveOccurrence(occurrence) {
  const { href, pageUrl, kind } = occurrence;
  if (typeof href !== 'string' || !href.trim())
    return { status: 'unverified', reason: 'empty-link' };
  if (/^(mailto|tel|data|blob):/i.test(href))
    return {
      status: 'not-applicable',
      reason: 'non-http-protocol',
      target: href,
    };
  if (/^[a-z][a-z\d+.-]*:/i.test(href) && !/^https?:/i.test(href))
    return {
      status: 'unverified',
      reason: 'unsupported-protocol',
      target: href,
    };
  if (/\{\{|\}\}/.test(href))
    return {
      status: 'unverified',
      reason: 'unexpanded-template',
      target: href,
    };
  try {
    const normalized =
      kind === 'link' &&
      occurrence.source !== 'rendered' &&
      (occurrence.contentPath ||
        occurrence.sourcePath?.startsWith('content/docs/'))
        ? normalizeDocsHref(href, {
            contentPath:
              occurrence.contentPath ??
              occurrence.sourcePath.replace(/^content\/docs\//, ''),
          }).href
        : href;
    const url = new URL(normalized, `${LOCAL_ORIGIN}${pageUrl}`);
    if (url.origin !== LOCAL_ORIGIN)
      return { target: url.href, external: true };
    // Source application links undergo the CN public URL rewrite. Rendered hrefs are already final.
    if (occurrence.source !== 'rendered' && kind === 'link')
      url.pathname = publicPath(url.pathname);
    return {
      target: `${url.pathname}${url.search}${url.hash}`,
      pathname: decodeURIComponent(url.pathname),
      hash: url.hash,
      external: false,
    };
  } catch (error) {
    return {
      status: 'broken',
      reason: 'malformed-url',
      detail: error.message,
      target: href,
    };
  }
}

export function listFiles(root) {
  if (!fs.existsSync(root)) return [];
  return fs
    .readdirSync(root, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => path.join(entry.parentPath ?? entry.path, entry.name))
    .sort();
}

export function inventorySources({
  repoRoot = process.cwd(),
  onProgress = () => {},
} = {}) {
  const documents = [],
    links = [],
    gaps = [],
    excluded = [],
    routes = new Map();
  const files = listFiles(path.join(repoRoot, 'content/docs/zh-CN')).filter(
    (file) => /\.mdx?$/.test(file),
  );
  const cached = new Map();
  function parse(file, pageUrl, chain = []) {
    const relative = path.relative(repoRoot, file).split(path.sep).join('/');
    if (chain.includes(file)) {
      gaps.push({ sourcePath: relative, pageUrl, reason: 'include-cycle' });
      return;
    }
    if (!fs.existsSync(file)) {
      gaps.push({ sourcePath: relative, pageUrl, reason: 'missing-include' });
      return;
    }
    if (!cached.has(file))
      cached.set(
        file,
        extractDocument(fs.readFileSync(file, 'utf8'), {
          sourcePath: relative,
        }),
      );
    const result = cached.get(file);
    links.push(...result.links.map((link) => ({ ...link, pageUrl })));
    gaps.push(...result.gaps.map((gap) => ({ ...gap, pageUrl })));
    for (const include of result.includes) {
      if (typeof include.path !== 'string')
        gaps.push({ sourcePath: relative, pageUrl, reason: 'dynamic-include' });
      else
        parse(path.resolve(path.dirname(file), include.path), pageUrl, [
          ...chain,
          file,
        ]);
    }
    return result;
  }
  for (const [index, file] of files.entries()) {
    const sourcePath = path.relative(repoRoot, file).split(path.sep).join('/');
    if (isRetiredCnDocsPath(sourcePath.replace(/^content\/docs\//, ''))) {
      excluded.push({ sourcePath, reason: 'retired-source' });
      continue;
    }
    const pageUrl = sourceRoute(sourcePath);
    const result = parse(file, pageUrl);
    const document = {
      sourcePath,
      pageUrl,
      anchors: result?.anchors ?? [],
      states: result?.states ?? [],
      frontmatter: result?.frontmatter ?? {},
    };
    documents.push(document);
    routes.set(pageUrl, document);
    if (index % 200 === 0)
      onProgress({ phase: 'inventory', completed: index, total: files.length });
  }
  const metadataFiles = listFiles(
    path.join(repoRoot, 'content/docs/zh-CN'),
  ).filter((file) => /\/meta\.(json|yaml)$/.test(file));
  for (const file of metadataFiles) {
    const sourcePath = path.relative(repoRoot, file).split(path.sep).join('/');
    if (isRetiredCnDocsPath(sourcePath.replace(/^content\/docs\//, '')))
      continue;
    const scope = sourceRoute(
      sourcePath.replace(/meta\.(json|yaml)$/, 'index.mdx'),
    );
    const raw = fs.readFileSync(file, 'utf8');
    try {
      const data = file.endsWith('.json') ? JSON.parse(raw) : yaml.load(raw);
      function scanMetadata(value, pointer = '') {
        if (!value || typeof value !== 'object') return;
        for (const [key, child] of Object.entries(value)) {
          const next = `${pointer}/${key}`;
          let href;
          if (['href', 'url'].includes(key) && typeof child === 'string')
            href = child;
          else if (typeof child === 'string')
            href = child.match(/^\[[^\]]+\]\((.+)\)$/)?.[1];
          if (href) {
            const offset = raw.indexOf(href),
              before = offset < 0 ? '' : raw.slice(0, offset);
            links.push({
              sourcePath,
              pageUrl: scope,
              metadataScope: scope,
              pointer: next,
              href,
              kind: 'link',
              source: 'metadata',
              line: offset < 0 ? undefined : before.split('\n').length,
              column:
                offset < 0 ? undefined : offset - before.lastIndexOf('\n'),
            });
          }
          scanMetadata(child, next);
        }
      }
      scanMetadata(data);
    } catch (error) {
      gaps.push({
        sourcePath,
        pageUrl: scope,
        reason: 'metadata-parse-error',
        detail: error.message,
      });
    }
  }
  // Generated endpoint pages have no MDX file; enumerate the actual lane registry.
  const openapiFiles = new Map();
  for (const lane of getOpenApiLanes()) {
    if (!getOpenApiLaneLocales(lane).includes('zh-CN')) continue;
    for (const operationId of Object.keys(lane.operations)) {
      const pageUrl = publicPath(
        getOpenApiEndpointUrl(lane, 'zh-CN', operationId),
      );
      const sourcePath = lane.sourcePath['zh-CN'];
      if (!routes.has(pageUrl))
        routes.set(pageUrl, {
          pageUrl,
          sourcePath,
          generated: true,
          anchors: [],
        });
    }
    openapiFiles.set(lane.sourcePath['zh-CN'], lane);
  }
  for (const [sourcePath, lane] of openapiFiles) {
    try {
      const result = extractOpenApiDocument(
        fs.readFileSync(path.resolve(repoRoot, sourcePath), 'utf8'),
        { sourcePath, lane },
      );
      links.push(...result.links);
      gaps.push(...result.gaps);
    } catch (error) {
      gaps.push({
        sourcePath,
        reason: 'openapi-parse-error',
        detail: error.message,
      });
    }
  }
  return {
    documents,
    links,
    gaps,
    excluded,
    routes,
    counts: {
      sourceFiles: files.length,
      metadataFiles: metadataFiles.length,
      documents: documents.length,
      openapiFiles: openapiFiles.size,
      expectedRoutes: routes.size,
    },
  };
}

// URL tokens may themselves contain commas (including data URLs); descriptors
// delimit candidates, unlike splitting the attribute on every comma.
export function parseSrcset(value) {
  const urls = [];
  let rest = value.trim();
  while (rest) {
    rest = rest.replace(/^[,\s]+/, '');
    if (!rest) break;
    const token = rest.match(/^\S+/)[0];
    rest = rest.slice(token.length);
    urls.push(token.replace(/,+$/, ''));
    if (!token.endsWith(',')) {
      const comma = rest.indexOf(',');
      rest = comma < 0 ? '' : rest.slice(comma + 1);
    }
  }
  return urls;
}

export function extractOpenApiDocument(raw, { sourcePath, lane }) {
  const links = [],
    gaps = [],
    scalarRanges = new Map(),
    stack = [];
  const data = yaml.load(raw, {
    listener(event, state) {
      if (event === 'open') stack.push(state.position);
      else {
        const start = stack.pop();
        if (typeof state.result === 'string') {
          if (!scalarRanges.has(state.result))
            scalarRanges.set(state.result, []);
          scalarRanges.get(state.result).push([start, state.position]);
        }
      }
    },
  });
  const lookup = (ref) =>
    ref
      .slice(2)
      .split('/')
      .reduce(
        (value, key) => value?.[key.replace(/~1/g, '/').replace(/~0/g, '~')],
        data,
      );
  const processed = new Set();
  function scan(value, pointer, pageUrl, seen = new Set()) {
    if (!value || typeof value !== 'object' || seen.has(value)) return;
    seen.add(value);
    if (typeof value.$ref === 'string') {
      if (value.$ref.startsWith('#/'))
        scan(lookup(value.$ref), value.$ref.slice(1), pageUrl, seen);
      else
        gaps.push({
          sourcePath,
          pageUrl,
          pointer,
          reason: 'external-openapi-ref',
          detail: value.$ref,
        });
    }
    for (const [key, child] of Object.entries(value)) {
      const next = `${pointer}/${key.replace(/~/g, '~0').replace(/\//g, '~1')}`;
      if (
        (key === 'description' || key === 'markdown') &&
        typeof child === 'string'
      ) {
        const identity = `${pageUrl}\0${next}`;
        if (processed.has(identity)) continue;
        processed.add(identity);
        const result = extractDocument(child, {
          sourcePath: `${sourcePath}.md`,
          pageUrl,
        });
        for (const link of result.links) {
          const range = (scalarRanges.get(child) ?? []).find(([start, end]) => {
            const i = raw.indexOf(link.href, start);
            return i >= start && i < end;
          });
          const offset = range ? raw.indexOf(link.href, range[0]) : -1;
          const before = offset < 0 ? '' : raw.slice(0, offset);
          links.push({
            ...link,
            sourcePath,
            contentPath: `zh-CN${pageUrl}.mdx`,
            pointer: next,
            fragmentLine: link.line,
            fragmentColumn: link.column,
            line: offset < 0 ? undefined : before.split('\n').length,
            column: offset < 0 ? undefined : offset - before.lastIndexOf('\n'),
            source: 'openapi',
          });
        }
        gaps.push(
          ...result.gaps.map((gap) => ({
            ...gap,
            sourcePath,
            pointer: next,
            line: undefined,
            column: undefined,
          })),
        );
      } else if (key === 'externalDocs' && typeof child?.url === 'string') {
        links.push({
          sourcePath,
          pageUrl,
          pointer: `${next}/url`,
          href: child.url,
          kind: 'link',
          source: 'openapi',
          contentPath: `zh-CN${pageUrl}.mdx`,
        });
      } else scan(child, next, pageUrl, seen);
    }
  }
  for (const [route, item] of Object.entries(data?.paths ?? {})) {
    for (const [method, operation] of Object.entries(item ?? {})) {
      if (!lane.operations[operation?.operationId]) continue;
      const pageUrl = publicPath(
        getOpenApiEndpointUrl(lane, 'zh-CN', operation.operationId),
      );
      const pointer = `/paths/${route.replace(/~/g, '~0').replace(/\//g, '~1')}`;
      scan(item.parameters, `${pointer}/parameters`, pageUrl);
      scan(operation, `${pointer}/${method}`, pageUrl);
    }
  }
  scan(data?.info, '/info', publicPath(lane.parentUrl['zh-CN']));
  scan(
    data?.externalDocs ? { externalDocs: data.externalDocs } : undefined,
    '',
    publicPath(lane.parentUrl['zh-CN']),
  );
  return { links, gaps };
}
