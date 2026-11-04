import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import remarkParse from 'remark-parse';
import { unified } from 'unified';

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
  /\/(?:api-reference|reference|api)(?:\/|$)/.test(url);
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
  return {
    known,
    unexpected,
    retired: baseline.entries.filter(
      (entry) => available.get(findingKey(entry)) > 0,
    ),
  };
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
    return referenceSource(file, text) ? duplicateHeadings(file, text) : [];
  });
  return classifyDebt(
    findings,
    readJson(path.join(root, 'scripts/api-reference-quality-debt.json')),
  );
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
  const rows = [];
  for (const route of routes.filter((row) =>
    row.url.startsWith(`/${locale}/`),
  )) {
    const direct = path.join(
      root,
      '__static/docs',
      `${route.canonicalPath}.json`,
    );
    const payloadFile = existsSync(direct)
      ? direct
      : path.join(root, '__static/docs', route.canonicalPath, 'index.json');
    const payload = readJson(payloadFile);
    const source = payload.body?.contentPath ?? payload.contentPath;
    const text =
      source && existsSync(`content/docs/${source}`)
        ? readFileSync(`content/docs/${source}`, 'utf8')
        : '';
    if (
      !referencePath(route.url) &&
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
      kind: payload.body?.kind,
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
