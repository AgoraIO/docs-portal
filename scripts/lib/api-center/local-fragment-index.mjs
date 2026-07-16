import fs from 'node:fs/promises';
import path from 'node:path';

const ROUTE_GROUP = /^\(.+\)$/;

function posix(value) {
  return value.split(path.sep).join('/');
}

function decode(value) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function cleanHeadingText(value) {
  return String(value ?? '')
    .replace(/\s+\{#[^}\s]+\}\s*$/, '')
    .replace(/!\[[^\]]*]\([^)]+\)/g, '')
    .replace(/\[([^\]]+)]\([^)]+\)/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/[`*_~]/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();
}

function headingSlug(value) {
  return cleanHeadingText(value)
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}\p{Mark}\s_-]/gu, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function comparisonKey(value) {
  return decode(String(value ?? ''))
    .toLowerCase()
    .replace(/^#/, '')
    .replace(/(?:^|_)api_/g, '')
    .replace(/[^\p{Letter}\p{Number}]/gu, '');
}

function maskCode(source) {
  return String(source).replace(
    /(^|\n)(`{3,}|~{3,})[^\n]*\n[\s\S]*?\n\2[^\n]*(?=\n|$)/g,
    (match) => match.replace(/[^\n]/g, ' '),
  );
}

export function targetPathToRoute(targetPath) {
  const relative = posix(targetPath)
    .replace(/^content\/docs\//, '')
    .replace(/\.mdx?$/i, '');
  const segments = relative.split('/').filter((segment) => !ROUTE_GROUP.test(segment));
  if (segments.at(-1) === 'index') segments.pop();
  return `/${segments.join('/')}`;
}

export function extractMdxAnchors(source) {
  const anchors = new Set();
  const counts = new Map();
  const scannable = maskCode(source);
  for (const match of scannable.matchAll(
    /<[\w:-]+\s+[^>]*(?:\bid|\bname)\s*=\s*(?:"([^"]+)"|'([^']+)')[^>]*>/gi,
  )) {
    const anchor = (match[1] ?? match[2] ?? '').trim();
    if (anchor) anchors.add(anchor);
  }
  for (const match of scannable.matchAll(/^(#{1,6})\s+(.+?)\s*#*\s*$/gm)) {
    const custom = match[2].match(/\s+\{#([^}\s]+)\}\s*$/)?.[1];
    if (custom) anchors.add(custom);
    const base = headingSlug(match[2]);
    if (!base) continue;
    const count = counts.get(base) ?? 0;
    counts.set(base, count + 1);
    anchors.add(count === 0 ? base : `${base}-${count}`);
  }
  return anchors;
}

export function findBestFragmentAnchor(anchors, requested) {
  const raw = decode(String(requested ?? '').replace(/^#/, ''));
  if (!raw) return null;
  if (anchors.has(raw)) return raw;
  const rawLower = raw.toLowerCase();
  const rawKey = comparisonKey(raw);
  const scored = [];
  for (const anchor of anchors) {
    const lower = anchor.toLowerCase();
    const key = comparisonKey(anchor);
    let score = 0;
    if (lower === rawLower) score = 90;
    else if (rawKey && key === rawKey) score = 80;
    else if (rawKey.length >= 4 && key.endsWith(rawKey)) score = 70;
    else if (key.length >= 4 && rawKey.endsWith(key)) score = 60;
    if (score) scored.push({ anchor, score });
  }
  const bestScore = Math.max(0, ...scored.map((item) => item.score));
  const best = scored.filter((item) => item.score === bestScore);
  return best.length === 1 ? best[0].anchor : null;
}

export function collectSamePageFragments(source) {
  const fragments = new Set();
  const scannable = maskCode(source);
  for (const match of scannable.matchAll(
    /(?<!!)\[((?:[^\[\]\n]|\[[^\]\n]*])*)]\(#([^\s)]+)(?:\s+"[^"]*")?\s*\)/g,
  )) {
    fragments.add(decode(match[2]));
  }
  for (const match of scannable.matchAll(/\bhref\s*=\s*(?:"#([^"]+)"|'#([^']+)')/gi)) {
    fragments.add(decode(match[1] ?? match[2]));
  }
  return fragments;
}

function headingCandidates(source) {
  const candidates = [];
  const scannable = maskCode(source);
  for (const match of scannable.matchAll(/^(#{1,6})\s+(.+?)\s*#*\s*$/gm)) {
    const title = cleanHeadingText(match[2]);
    if (!title) continue;
    candidates.push({
      index: match.index,
      key: comparisonKey(title),
      title,
    });
  }
  return candidates;
}

function findHeadingForFragment(candidates, fragment) {
  const key = comparisonKey(fragment);
  if (!key) return null;
  const exact = candidates.filter((candidate) => candidate.key === key);
  if (exact.length === 1) return exact[0];
  const contained = candidates.filter(
    (candidate) =>
      candidate.key.length >= 4 &&
      (candidate.key.includes(key) || key.includes(candidate.key)),
  );
  return contained.length === 1 ? contained[0] : null;
}

export function insertFragmentAliases(source, requestedFragments) {
  const existing = extractMdxAnchors(source);
  const candidates = headingCandidates(source);
  const insertions = [];
  const inserted = [];
  const unresolved = [];
  for (const requested of new Set([...requestedFragments].map(decode))) {
    if (!requested || findBestFragmentAnchor(existing, requested)) continue;
    const heading = findHeadingForFragment(candidates, requested);
    if (!heading) {
      unresolved.push(requested);
      continue;
    }
    insertions.push({ index: heading.index, anchor: requested });
    existing.add(requested);
    inserted.push(requested);
  }
  let output = source;
  for (const insertion of insertions.sort((left, right) => right.index - left.index)) {
    const escaped = insertion.anchor.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
    output = `${output.slice(0, insertion.index)}<a id="${escaped}"></a>\n${output.slice(insertion.index)}`;
  }
  return { body: output, inserted, unresolved };
}

async function listMdxFiles(root) {
  const files = [];
  async function visit(directory) {
    for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
      const absolute = path.join(directory, entry.name);
      if (entry.isDirectory()) await visit(absolute);
      else if (/\.mdx?$/i.test(entry.name)) files.push(absolute);
    }
  }
  try {
    await visit(root);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  return files;
}

/**
 * @param {object} options
 * @param {string} options.repoRoot
 * @param {{ targetPath: string, body: string }[]} [options.virtualPages]
 */
export async function buildLocalFragmentIndex({ repoRoot, virtualPages = [] }) {
  const docsRoot = path.resolve(repoRoot, 'content/docs');
  const routes = new Map();
  for (const absolute of await listMdxFiles(docsRoot)) {
    const targetPath = posix(path.relative(repoRoot, absolute));
    routes.set(targetPathToRoute(targetPath), { absolute, targetPath });
  }
  for (const page of virtualPages) {
    routes.set(targetPathToRoute(page.targetPath), {
      body: page.body,
      targetPath: page.targetPath,
      virtual: true,
    });
  }
  const cache = new Map();
  return {
    routes,
    async anchorsFor(route) {
      const normalized = route.replace(/\/$/, '') || '/';
      if (cache.has(normalized)) return cache.get(normalized);
      const page = routes.get(normalized);
      if (!page) return null;
      const source = page.virtual ? page.body : await fs.readFile(page.absolute, 'utf8');
      const anchors = extractMdxAnchors(source);
      cache.set(normalized, anchors);
      return anchors;
    },
  };
}

function parseLocalFragmentHref(href, sourceRoute) {
  if (href.startsWith('#')) {
    return { fragment: decode(href.slice(1)), route: sourceRoute };
  }
  if (!href.startsWith('/zh-CN/') || !href.includes('#')) return null;
  const hashIndex = href.indexOf('#');
  return {
    fragment: decode(href.slice(hashIndex + 1)),
    route: href.slice(0, hashIndex).replace(/\/$/, ''),
  };
}

export function collectLocalFragmentReferences(source, sourceRoute) {
  const references = [];
  const scannable = maskCode(source);
  for (const match of scannable.matchAll(
    /(?<!!)\[((?:[^\[\]\n]|\[[^\]\n]*])*)]\(([^)\s]+)(?:\s+"[^"]*")?\s*\)/g,
  )) {
    const parsed = parseLocalFragmentHref(match[2], sourceRoute);
    if (parsed?.fragment) references.push(parsed);
  }
  for (const match of scannable.matchAll(
    /\bhref\s*=\s*(?:"([^"]+)"|'([^']+)')/gi,
  )) {
    const parsed = parseLocalFragmentHref(match[1] ?? match[2], sourceRoute);
    if (parsed?.fragment) references.push(parsed);
  }
  return references;
}

export async function rewriteLocalFragmentLinks(
  source,
  { fragmentIndex, sourceRoute },
) {
  const warnings = [];
  const replacements = [];
  const scannable = maskCode(source);
  for (const match of scannable.matchAll(
    /(?<!!)\[((?:[^\[\]\n]|\[[^\]\n]*])*)]\(([^)\s]+)(?:\s+"[^"]*")?\s*\)/g,
  )) {
    const parsed = parseLocalFragmentHref(match[2], sourceRoute);
    if (!parsed?.fragment) continue;
    const anchors = await fragmentIndex.anchorsFor(parsed.route);
    if (!anchors) continue;
    const mapped = findBestFragmentAnchor(anchors, parsed.fragment);
    const href = mapped
      ? `${parsed.route === sourceRoute && match[2].startsWith('#') ? '' : parsed.route}#${mapped}`
      : parsed.route;
    if (href === match[2]) continue;
    replacements.push({
      end: match.index + match[0].length,
      start: match.index,
      value: `[${match[1]}](${href})`,
    });
    warnings.push({
      from: match[2],
      to: href,
      unresolved: !mapped,
    });
  }
  let body = source;
  for (const replacement of replacements.sort((left, right) => right.start - left.start)) {
    body = `${body.slice(0, replacement.start)}${replacement.value}${body.slice(replacement.end)}`;
  }
  return { body, warnings };
}
