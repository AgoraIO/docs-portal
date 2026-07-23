import fs from 'node:fs/promises';
import path from 'node:path';
import { maskFencedCode } from '../markdown-code.mjs';

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
    .replace(
      /(?<!!)\[((?:[^[\]\n]|\[[^\]\n]*])*)]\((?:<[^>\n]+>|[^)\n]+)\)/g,
      '$1',
    )
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

function fragmentComparisonKeys(value) {
  const raw = decode(String(value ?? '').replace(/^#/, ''));
  const variants = new Set([raw]);
  const withoutGeneratedSuffix = raw.replace(/-\d+$/, '');
  if (withoutGeneratedSuffix !== raw) variants.add(withoutGeneratedSuffix);

  for (const variant of [...variants]) {
    const withoutOwner = variant.replace(
      /^(?:api|callback)_[^_]+_/i,
      '',
    );
    if (withoutOwner !== variant) variants.add(withoutOwner);
  }
  for (const variant of [...variants]) {
    const withoutType = variant.replace(
      /^(?:class|struct|interface|enum)_/i,
      '',
    );
    if (withoutType !== variant) variants.add(withoutType);
  }
  for (const variant of [...variants]) {
    const withoutMemberKind = variant.replace(
      /_(?:method|property|function)$/i,
      '',
    );
    if (withoutMemberKind !== variant) variants.add(withoutMemberKind);
  }

  return new Set([...variants].map(comparisonKey).filter(Boolean));
}

function maskCode(source) {
  return maskFencedCode(source);
}

export function targetPathToRoute(targetPath) {
  const relative = posix(targetPath)
    .replace(/^content\/docs\//, '')
    .replace(/\.mdx?$/i, '');
  const segments = relative
    .split('/')
    .filter((segment) => !ROUTE_GROUP.test(segment));
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
  const directKey = comparisonKey(raw);
  const directMatches = [];
  for (const anchor of anchors) {
    if (anchor.toLowerCase() === rawLower) return anchor;
    if (directKey && comparisonKey(anchor) === directKey) {
      directMatches.push(anchor);
    }
  }
  if (directMatches.length === 1) return directMatches[0];
  if (directMatches.length > 1) return null;

  const requestedKeys = fragmentComparisonKeys(raw);
  const canonicalMatches = [...anchors].filter((anchor) =>
    requestedKeys.has(comparisonKey(anchor)),
  );
  if (canonicalMatches.length === 1) return canonicalMatches[0];
  if (canonicalMatches.length > 1) return null;

  const matches = [];
  for (const anchor of anchors) {
    const anchorKeys = fragmentComparisonKeys(anchor);
    if ([...anchorKeys].some((key) => requestedKeys.has(key))) {
      matches.push(anchor);
    }
  }
  return matches.length === 1 ? matches[0] : null;
}

export function collectSamePageFragments(source) {
  const fragments = new Set();
  const scannable = maskCode(source);
  for (const match of scannable.matchAll(
    /(?<!!)\[((?:[^[\]\n]|\[[^\]\n]*])*)]\(#([^\s)]+)(?:\s+"[^"]*")?\s*\)/g,
  )) {
    fragments.add(decode(match[2]));
  }
  for (const match of scannable.matchAll(
    /\bhref\s*=\s*(?:"#([^"]+)"|'#([^']+)')/gi,
  )) {
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

function isContainedHeadingMatch(candidate, fragment) {
  const fragmentTitle = cleanHeadingText(decode(fragment).replace(/^#/, ''));
  const fragmentKey = comparisonKey(fragmentTitle);
  const candidateKey = candidate.key;
  if (
    !fragmentKey ||
    !candidateKey ||
    (!candidateKey.includes(fragmentKey) && !fragmentKey.includes(candidateKey))
  ) {
    return false;
  }
  if (/\p{Script=Han}/u.test(`${candidate.title}${fragmentTitle}`)) {
    return true;
  }
  if (fragmentKey.length >= candidateKey.length) return false;
  return (candidate.title.toLowerCase().match(/[a-z0-9]+/g) ?? []).includes(
    fragmentKey,
  );
}

function doxygenHeadingKey(fragment) {
  const decoded = decode(String(fragment ?? '').replace(/^#/, ''));
  const normalized = decoded
    .replace(/^(?:class|struct|interface|enum)_/i, '')
    .replace(/_(?:method|property|function)$/i, '');
  if (normalized === decoded) return null;
  return comparisonKey(normalized);
}

function findHeadingForFragment(candidates, fragment) {
  const key = comparisonKey(fragment);
  if (!key) return null;
  const exact = candidates.filter((candidate) => candidate.key === key);
  if (exact.length === 1) return exact[0];
  const withoutGeneratedSuffix = comparisonKey(
    decode(fragment).replace(/-\d+$/, ''),
  );
  if (withoutGeneratedSuffix !== key) {
    const generated = candidates.filter(
      (candidate) => candidate.key === withoutGeneratedSuffix,
    );
    if (generated.length === 1) return generated[0];
  }
  const doxygenKey = doxygenHeadingKey(fragment);
  if (doxygenKey) {
    const doxygen = candidates.filter(
      (candidate) => candidate.key === doxygenKey,
    );
    if (doxygen.length === 1) return doxygen[0];
  }
  const contained = candidates.filter((candidate) =>
    isContainedHeadingMatch(candidate, fragment),
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
    if (!requested || existing.has(requested)) continue;
    const needsStableAlias =
      /-\d+$/.test(requested) ||
      /^(?:class|struct|interface|enum)_.+_(?:method|property|function)$/i.test(
        requested,
      );
    if (!needsStableAlias && findBestFragmentAnchor(existing, requested)) {
      continue;
    }
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
  for (const insertion of insertions.sort(
    (left, right) => right.index - left.index,
  )) {
    const escaped = insertion.anchor
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;');
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
      const source = page.virtual
        ? page.body
        : await fs.readFile(page.absolute, 'utf8');
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
    /(?<!!)\[((?:[^[\]\n]|\[[^\]\n]*])*)]\(([^)\s]+)(?:\s+"[^"]*")?\s*\)/g,
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
  { fragmentIndex, preserveUnresolved = false, sourceRoute },
) {
  const warnings = [];
  const replacements = [];
  const scannable = maskCode(source);
  for (const match of scannable.matchAll(
    /(?<!!)\[((?:[^[\]\n]|\[[^\]\n]*])*)]\(([^)\s]+)(?:\s+"[^"]*")?\s*\)/g,
  )) {
    const parsed = parseLocalFragmentHref(match[2], sourceRoute);
    if (!parsed?.fragment) continue;
    const anchors = await fragmentIndex.anchorsFor(parsed.route);
    if (!anchors) continue;
    const mapped = findBestFragmentAnchor(anchors, parsed.fragment);
    if (!mapped && preserveUnresolved) {
      warnings.push({
        from: match[2],
        to: match[2],
        unresolved: true,
      });
      continue;
    }
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
  for (const replacement of replacements.sort(
    (left, right) => right.start - left.start,
  )) {
    body = `${body.slice(0, replacement.start)}${replacement.value}${body.slice(replacement.end)}`;
  }
  return { body, warnings };
}
