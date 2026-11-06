import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { load } from 'js-yaml';
import remarkGfm from 'remark-gfm';
import remarkMdx from 'remark-mdx';
import remarkParse from 'remark-parse';
import { unified } from 'unified';
import { normalizeApiPrototypeLanguages } from '../api-center/code-language.mjs';
import { planTypeDocStructure } from '../api-center/typedoc-structure.mjs';

export const digest = (value) =>
  createHash('sha256').update(value).digest('hex');
export const git = (...args) =>
  execFileSync('git', args, { encoding: 'utf8' }).trim();
export const readJson = (file) => JSON.parse(readFileSync(file, 'utf8'));
export const localeFor = (region) => {
  if (!['cn', 'global'].includes(region))
    throw new Error('Expected --region cn or global');
  return region === 'cn' ? 'zh-CN' : 'en';
};
export const referencePath = (url) =>
  /\/(?:api-reference|api)(?:\/|$)/.test(url) ||
  /\/reference\/[^/]*(?:api|restful)[^/]*(?:\/|$)/.test(url);
export const referenceSource = (file, text) =>
  referencePath(file) ||
  /<(?:ApiSignature|ApiParameterTable|ApiReturns|ApiOverload|APIPage)\b/.test(
    text,
  );

// Use parsed headings so code examples and Objective-C method markers stay intact.
export function duplicateHeadings(file, text) {
  const root = unified().use(remarkParse).parse(text);
  const label = (node) =>
    node.value ?? (node.children ?? []).map(label).join('');
  const findings = [];
  function visit(parent) {
    let previous;
    for (const node of parent.children ?? []) {
      if (node.type === 'heading') {
        const title = label(node).trim();
        if (previous && previous.title === title)
          findings.push({
            file,
            rule: 'adjacent-duplicate-heading',
            title,
            depth: node.depth,
            line: node.position.start.line,
          });
        previous = { title, depth: node.depth };
      } else if (!/^\s*<a\b[^>]*(?:><\/a>|\/>)\s*$/.test(label(node))) {
        previous = undefined;
      }
      if (node.type !== 'heading') visit(node);
    }
  }
  visit(root);
  return findings;
}
export const findingKey = ({ file, rule, title, depth }) =>
  JSON.stringify([file, rule, title, depth]);
export function classifyDebt(findings, baseline) {
  const available = new Map(
    baseline.entries.map((entry) => [findingKey(entry), entry.count]),
  );
  const known = [],
    unexpected = [];
  for (const finding of findings) {
    const key = findingKey(finding),
      remaining = available.get(key) ?? 0;
    if (remaining > 0) {
      known.push(finding);
      available.set(key, remaining - 1);
    } else unexpected.push(finding);
  }
  const retired = baseline.entries.filter(
    (entry) => available.get(findingKey(entry)) > 0,
  );
  return {
    status:
      unexpected.length || retired.length
        ? 'FAIL'
        : known.length
          ? 'PASS_WITH_DEBT'
          : 'PASS',
    known,
    unexpected,
    retired,
  };
}
export function prototypeLanguageFindings(file, text) {
  return normalizeApiPrototypeLanguages(text).changes.map((change) => ({
    file,
    rule: 'api-prototype-language',
    title: change.anchor,
    depth: 0,
    line: change.line,
    actual: change.from,
    expected: change.to,
  }));
}

export function sourceAudit(root = '.') {
  const files = git(
    'ls-files',
    '--cached',
    '--others',
    '--exclude-standard',
    '-z',
    '--',
    'content/docs',
  )
    .split('\0')
    .filter((file) => /\.mdx?$/.test(file));
  const findings = files.flatMap((file) => {
    const text = readFileSync(path.join(root, file), 'utf8');
    return referenceSource(file, text)
      ? [
          ...duplicateHeadings(file, text),
          ...prototypeLanguageFindings(file, text),
          ...generatedStructureFindings(file, text),
        ]
      : [];
  });
  return classifyDebt(
    findings,
    readJson(path.join(root, 'scripts/api-reference-quality-debt.json')),
  );
}

const generatedParser = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkMdx);

export function generatedStructureFindings(file, source) {
  const frontmatter = source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  const generator = frontmatter && load(frontmatter[1])?._migration?.generator;
  if (generator === 'typedoc')
    return planTypeDocStructure(source).map(({ rule, title, line }) => ({
      file,
      rule,
      title,
      line,
      depth: 0,
    }));
  if (generator !== 'doxygen') return [];
  const findings = [];
  const lineOffset = frontmatter[0].split('\n').length - 1;
  const add = (rule, title, node) =>
    findings.push({
      file,
      rule,
      title,
      depth: 0,
      line: lineOffset + node.position.start.line,
    });
  const blank = (node) =>
    (node.type === 'text' && !node.value.trim()) ||
    (node.type === 'paragraph' && node.children.every(blank));
  const destination = (node) =>
    node.attributes?.some((attribute) =>
      ['id', 'name'].includes(attribute.name),
    );
  function visit(node) {
    if (
      node.type === 'tableRow' &&
      node.children.every((cell) =>
        cell.children.every(
          (child) => child.type === 'text' && !child.value.trim(),
        ),
      )
    )
      add('empty-generated-table-row', 'Empty generated table row', node);
    if (node.name === 'tr' && !destination(node)) {
      const cells = node.children.filter((child) => !blank(child));
      if (
        cells.length &&
        cells.every(
          (cell) =>
            ['td', 'th'].includes(cell.name) &&
            !destination(cell) &&
            cell.children.every(blank),
        )
      )
        add('empty-generated-table-row', 'Empty generated table row', node);
    }
    if (
      (node.type === 'paragraph' || ['td', 'th', 'p'].includes(node.name)) &&
      node.children[0]?.type === 'text'
    ) {
      const leaked = node.children[0].value.match(
        /^\s*\/(?:zh-CN|en)\/api-reference\/[^\s#]+#[^\s]+/,
      );
      if (leaked) add('leaked-generated-anchor', leaked[0], node);
    }
    for (const child of node.children ?? []) visit(child);
  }
  visit(generatedParser.parse(source.slice(frontmatter[0].length)));
  return findings;
}
export function sourceFingerprint() {
  const files = git(
    'ls-files',
    '--cached',
    '--others',
    '--exclude-standard',
    '-z',
    '--',
    'content',
    'src',
    'public',
    'scripts',
    'patches',
    'docs/api-reference-quality.md',
    'AGENTS.md',
    'package.json',
    'bun.lock',
    'source.config.ts',
    'vite.config.ts',
    'tsconfig.json',
    'vercel*.json',
    '.github',
  )
    .split('\0')
    .filter(
      (file) =>
        file &&
        !/^(?:src\/generated\/|src\/routeTree\.gen\.ts$|public\/(?:__static|openapi)\/)/.test(
          file,
        ),
    )
    .sort();
  return digest(
    files
      .map(
        (file) =>
          `${file}\0${existsSync(file) ? digest(readFileSync(file)) : 'deleted'}`,
      )
      .join('\n'),
  );
}
export function inventory(root, region) {
  const locale = localeFor(region),
    routes = readJson(path.join(root, '__static/docs-routes.json'));
  const byUrl = new Map(routes.map((route) => [route.url, route]));
  const payloads = new Map();
  const load = (route) => {
    if (payloads.has(route.canonicalPath))
      return payloads.get(route.canonicalPath);
    const direct = path.join(
      root,
      '__static/docs',
      `${route.canonicalPath}.json`,
    );
    const file = existsSync(direct)
      ? direct
      : path.join(root, '__static/docs', route.canonicalPath, 'index.json');
    const value = { file, payload: readJson(file) };
    payloads.set(route.canonicalPath, value);
    return value;
  };
  const redirectTarget = (route) =>
    load(route).payload.redirectUrl ?? route.defaultVersionTarget;
  const destination = (route) => {
    const seen = new Set();
    let current = route,
      expectedPath = route.url;
    for (
      let target = redirectTarget(current);
      target;
      target = redirectTarget(current)
    ) {
      if (seen.has(current.url))
        throw new Error(`Cyclic published redirect: ${route.url}`);
      seen.add(current.url);
      expectedPath = target;
      if (!expectedPath.startsWith('/') || expectedPath.startsWith('//'))
        throw new Error(
          `External redirect requires a dedicated entrance audit: ${route.url}`,
        );
      const pathname = new URL(expectedPath, 'https://built.invalid').pathname;
      current = byUrl.get(pathname) ?? byUrl.get(decodeURI(pathname));
      if (!current)
        throw new Error(
          `Missing published redirect target: ${route.url} -> ${expectedPath}`,
        );
    }
    return expectedPath;
  };
  const registered = new Set(
    readJson('scripts/api-reference-quality-cases.json')
      .flatMap((entry) => entry.urls[region] ?? [])
      .map((url) => url.split('#')[0]),
  );
  const rows = [];
  for (const route of routes.filter((row) =>
    row.url.startsWith(`/${locale}/`),
  )) {
    const { file: payloadFile, payload } = load(route);
    const source = payload.body?.contentPath ?? payload.contentPath;
    const text =
      source && existsSync(`content/docs/${source}`)
        ? readFileSync(`content/docs/${source}`, 'utf8')
        : '';
    if (
      !referencePath(route.url) &&
      !referencePath(redirectTarget(route) ?? '') &&
      !registered.has(route.url) &&
      payload.body?.kind !== 'openapi' &&
      !referenceSource(source ?? '', text)
    )
      continue;
    const htmlFile = path.join(root, route.url, 'index.html');
    if (!existsSync(htmlFile))
      throw new Error(`Missing published HTML: ${route.url}`);
    rows.push({
      url: route.url,
      canonicalPath: route.canonicalPath,
      platform: route.platform ?? null,
      source,
      kind: redirectTarget(route) ? 'redirect' : payload.body?.kind,
      expectedPath: destination(route),
      htmlHash: digest(readFileSync(htmlFile)),
      payloadHash: digest(readFileSync(payloadFile)),
    });
  }
  if (!rows.length)
    throw new Error(`Empty ${region} API inventory; check build region`);
  return rows;
}
export const matrix = [
  { name: 'desktop', width: 1280, height: 900 },
  { name: 'tablet-landscape', width: 1024, height: 768 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'phone-landscape', width: 844, height: 391 },
  { name: 'phone', width: 391, height: 844 },
  { name: 'compact', width: 320, height: 568 },
];

// Compare across pages as well: imported declarations often have no ordinary
// code example on the same page. Missing reference evidence cannot pass.
export function sharedCodeFrameFindings(results) {
  const references = new Map();
  const key = (state) => `${state.viewport}/${state.theme}`;
  const styleKey = (frame) =>
    ['backgroundColor', 'borderRadius', 'borderWidth', 'fontFamily', 'fontSize']
      .map((property) => frame[property])
      .join('\0');
  for (const result of results)
    for (const state of result.states) {
      const group = references.get(key(state)) ?? new Set();
      for (const frame of state.codeFrames?.ordinary ?? [])
        group.add(styleKey(frame));
      if (group.size) references.set(key(state), group);
    }
  const findings = [];
  for (const [resultIndex, result] of results.entries())
    for (const [stateIndex, state] of result.states.entries()) {
      for (const frame of state.codeFrames?.signatures ?? []) {
        if (!references.get(key(state))?.has(styleKey(frame)))
          findings.push({
            resultIndex,
            stateIndex,
            rule: 'inconsistent-code-frame',
            text: result.url,
            actual: frame,
            reason: references.has(key(state))
              ? 'No matching ordinary code frame'
              : 'No ordinary code-frame reference collected for this viewport/theme',
          });
      }
    }
  return findings;
}
