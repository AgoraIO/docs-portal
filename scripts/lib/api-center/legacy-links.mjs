import { isLegacyDocsHref, rewriteLegacyHref } from './migration-framework.mjs';

const MARKDOWN_LINK_PATTERN =
  /(?<!!)\[((?:[^[\]\n]|\[[^\]\n]*])*)]\(([^)\s]+)((?:\s+"[^"]*")?\s*)\)/g;
const REFERENCE_LINK_PATTERN = /^(\s{0,3}\[[^\]\n]+]:\s*)(\S+)(.*)$/gm;
const HREF_ATTRIBUTE_PATTERN = /(\bhref\s*=\s*)(["'])([^"']+)\2/gi;
const CODE_FENCE_PATTERN =
  /(^|\n)(`{3,}|~{3,})[^\n]*\n[\s\S]*?\n\2[^\n]*(?=\n|$)/g;

function isRewritableHref(href, sourceUrl, routeMap) {
  if (isLegacyDocsHref(href, sourceUrl)) return true;
  try {
    const url = new URL(href, sourceUrl);
    return (
      routeMap.has(url.href) ||
      routeMap.has(`${url.pathname}${url.search}`) ||
      routeMap.has(url.pathname)
    );
  } catch {
    return false;
  }
}

export function splitRawFrontmatter(source) {
  const match = String(source).match(/^---\r?\n[\s\S]*?\r?\n---\s*(?:\r?\n|$)/);
  return match
    ? { body: String(source).slice(match[0].length), prefix: match[0] }
    : { body: String(source), prefix: '' };
}

export function findLegacyBodyLinks(source, { sourcePath = '' } = {}) {
  const { body } = splitRawFrontmatter(source);
  const links = [];
  mapOutsideCodeFences(body, (segment) => {
    for (const match of segment.matchAll(MARKDOWN_LINK_PATTERN)) {
      if (isLegacyDocsHref(match[2])) {
        links.push({ href: match[2], source: 'markdown', sourcePath });
      }
    }
    for (const match of segment.matchAll(REFERENCE_LINK_PATTERN)) {
      if (isLegacyDocsHref(match[2])) {
        links.push({ href: match[2], source: 'reference', sourcePath });
      }
    }
    for (const match of segment.matchAll(HREF_ATTRIBUTE_PATTERN)) {
      if (isLegacyDocsHref(match[3])) {
        links.push({ href: match[3], source: 'attribute', sourcePath });
      }
    }
    return segment;
  });
  return links;
}

export function rewriteLegacyBodyLinks(
  source,
  { routeMap, sourcePath = '', sourceUrl },
) {
  const { body, prefix } = splitRawFrontmatter(source);
  const changes = [];
  const unresolved = [];
  const rewrittenBody = mapOutsideCodeFences(body, (segment) => {
    let output = segment.replace(
      MARKDOWN_LINK_PATTERN,
      (raw, label, href, suffix) => {
        if (!isRewritableHref(href, sourceUrl, routeMap)) return raw;
        const result = rewriteLegacyHref(href, { routeMap, sourceUrl });
        if (result.href) {
          changes.push({
            action: result.href.startsWith('/')
              ? 'rewritten-local'
              : 'rewritten-external',
            href,
            source: 'markdown',
            sourcePath,
            targetHref: result.href,
          });
          return `[${label}](${result.href}${suffix})`;
        }
        changes.push({
          action: 'rendered-as-text',
          href,
          source: 'markdown',
          sourcePath,
          targetHref: null,
        });
        return label;
      },
    );
    output = output.replace(
      REFERENCE_LINK_PATTERN,
      (raw, prefixValue, href, suffix) => {
        if (!isRewritableHref(href, sourceUrl, routeMap)) return raw;
        const result = rewriteLegacyHref(href, { routeMap, sourceUrl });
        if (!result.href) {
          unresolved.push({
            href,
            reason: 'reference-link-has-no-local-target',
            source: 'reference',
            sourcePath,
          });
          return raw;
        }
        changes.push({
          action: result.href.startsWith('/')
            ? 'rewritten-local'
            : 'rewritten-external',
          href,
          source: 'reference',
          sourcePath,
          targetHref: result.href,
        });
        return `${prefixValue}${result.href}${suffix}`;
      },
    );
    output = output.replace(
      HREF_ATTRIBUTE_PATTERN,
      (raw, assignment, quote, href) => {
        if (!isRewritableHref(href, sourceUrl, routeMap)) return raw;
        const result = rewriteLegacyHref(href, { routeMap, sourceUrl });
        if (!result.href) {
          unresolved.push({
            href,
            reason: 'href-attribute-has-no-local-target',
            source: 'attribute',
            sourcePath,
          });
          return raw;
        }
        changes.push({
          action: result.href.startsWith('/')
            ? 'rewritten-local'
            : 'rewritten-external',
          href,
          source: 'attribute',
          sourcePath,
          targetHref: result.href,
        });
        return `${assignment}${quote}${result.href}${quote}`;
      },
    );
    return output;
  });
  return { changes, source: `${prefix}${rewrittenBody}`, unresolved };
}

export function reconcileMappedBodyLink(
  source,
  { fromHref, sourcePath = '', toHref },
) {
  if (!fromHref || fromHref === toHref) {
    return { changes: [], source, unresolved: [] };
  }
  const { body, prefix } = splitRawFrontmatter(source);
  const changes = [];
  const unresolved = [];
  const rewrittenBody = mapOutsideCodeFences(body, (segment) => {
    let output = segment.replace(
      MARKDOWN_LINK_PATTERN,
      (raw, label, href, suffix) => {
        if (href !== fromHref) return raw;
        const action = toHref
          ? toHref.startsWith('/')
            ? 'rewritten-local'
            : 'rewritten-external'
          : 'rendered-as-text';
        changes.push({
          action,
          href: fromHref,
          source: 'markdown',
          sourcePath,
          targetHref: toHref,
        });
        return toHref ? `[${label}](${toHref}${suffix})` : label;
      },
    );
    output = output.replace(
      HREF_ATTRIBUTE_PATTERN,
      (raw, assignment, quote, href) => {
        if (href !== fromHref) return raw;
        if (!toHref) {
          unresolved.push({
            href,
            reason: 'href-attribute-has-no-local-target',
            source: 'attribute',
            sourcePath,
          });
          return raw;
        }
        changes.push({
          action: toHref.startsWith('/')
            ? 'rewritten-local'
            : 'rewritten-external',
          href: fromHref,
          source: 'attribute',
          sourcePath,
          targetHref: toHref,
        });
        return `${assignment}${quote}${toHref}${quote}`;
      },
    );
    return output;
  });
  return { changes, source: `${prefix}${rewrittenBody}`, unresolved };
}

function mapOutsideCodeFences(source, transform) {
  let cursor = 0;
  let output = '';
  for (const match of source.matchAll(CODE_FENCE_PATTERN)) {
    output += transform(source.slice(cursor, match.index));
    output += match[0];
    cursor = match.index + match[0].length;
  }
  output += transform(source.slice(cursor));
  return output;
}
