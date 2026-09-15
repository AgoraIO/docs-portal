import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { isKnownPlatform, normalizePlatformKey } from '../platforms/registry';
import rtcFolderRedirects from './rtc-folder-redirects.json';

type VercelRedirect = {
  destination: string;
  has?: unknown[];
  missing?: unknown[];
  source: string;
  statusCode?: number;
};

const vercelConfig = JSON.parse(readFileSync('vercel.json', 'utf8')) as {
  redirects: VercelRedirect[];
};
const baseConfig = JSON.parse(readFileSync('vercel.base.json', 'utf8')) as {
  redirects: VercelRedirect[];
};
const expectations = Object.entries(rtcFolderRedirects.expectations);

describe('retired RTC folder redirects', () => {
  it('merges the RTC folder redirects into vercel.json after the base redirects', () => {
    const start = baseConfig.redirects.length;

    expect(
      vercelConfig.redirects.slice(
        start,
        start + rtcFolderRedirects.redirects.length,
      ),
    ).toEqual(rtcFolderRedirects.redirects);
  });

  it('sends every retired page URL to its expected destination', () => {
    const matchers = vercelConfig.redirects.map(createRedirectMatcher);
    const mismatches = expectations.flatMap(([source, expected]) => {
      const actual = resolveRedirect(matchers, source);
      return actual === expected
        ? []
        : [`${source} -> ${actual} (expected ${expected})`];
    });

    expect(mismatches).toEqual([]);
  });

  it('redirects only to pages and platforms that exist', () => {
    const missing = [
      ...new Set(expectations.map(([, destination]) => destination)),
    ].filter((destination) => !docsUrlExists(destination));

    expect(missing).toEqual([]);
  });

  it('leaves similarly named paths alone', () => {
    const matchers = vercelConfig.redirects.map(createRedirectMatcher);

    for (const pathname of [
      '/en/realtime-media/videos',
      '/en/realtime-media/voice-agent',
      '/en/realtime-media/rtc/get-started-sdk',
    ]) {
      expect(resolveRedirect(matchers, pathname), pathname).toBeNull();
    }
  });
});

type RedirectMatcher = {
  destination: string;
  names: string[];
  regex: RegExp | null;
};

// Supports the path-to-regexp syntax used in vercel.json and throws on
// anything else, so a new rule shape can't silently skip these checks.
function createRedirectMatcher(rule: VercelRedirect): RedirectMatcher {
  if (rule.has || rule.missing) {
    return { destination: rule.destination, names: [], regex: null };
  }

  const names: string[] = [];
  const tokenPattern =
    /(\/)?:([A-Za-z_]\w*)(?:\(((?:[^()]|\([^()]*\))*)\))?([?*+])?/g;
  let pattern = '';
  let lastIndex = 0;

  for (const match of rule.source.matchAll(tokenPattern)) {
    const [token, slash, name, paramPattern, modifier] = match;
    pattern += escapeLiteral(rule.source.slice(lastIndex, match.index), rule);
    names.push(name);

    if (paramPattern !== undefined && modifier !== '*' && modifier !== '+') {
      const group = `${slash ? '/' : ''}(${paramPattern})`;
      pattern += modifier === '?' ? `(?:${group})?` : group;
    } else if (paramPattern === undefined && modifier === '*' && slash) {
      pattern += '(?:/((?:[^/]+?)(?:/(?:[^/]+?))*))?';
    } else {
      throw new Error(`Unsupported redirect source syntax: ${rule.source}`);
    }

    lastIndex = match.index + token.length;
  }

  pattern += escapeLiteral(rule.source.slice(lastIndex), rule);

  return {
    destination: rule.destination,
    names,
    regex: new RegExp(`^${pattern}$`),
  };
}

function escapeLiteral(literal: string, rule: VercelRedirect) {
  if (/[()*+?]/.test(literal)) {
    throw new Error(`Unsupported redirect source syntax: ${rule.source}`);
  }

  return literal.replace(/[.^$|{}[\]\\]/g, '\\$&');
}

function resolveRedirect(matchers: RedirectMatcher[], pathname: string) {
  for (const matcher of matchers) {
    const match = matcher.regex?.exec(pathname);

    if (!match) {
      continue;
    }

    const values = Object.fromEntries(
      matcher.names.map((name, index) => [name, match[index + 1] ?? '']),
    );

    return matcher.destination.replace(
      /:([A-Za-z_]\w*)[*+]?/g,
      (token, name: string) => values[name] ?? token,
    );
  }

  return null;
}

const fileCache = new Map<string, string | null>();

function findDocsFile(url: string) {
  const base = `content/docs${url}`;

  for (const candidate of [
    `${base}.mdx`,
    `${base}.md`,
    `${base}/index.mdx`,
    `${base}/index.md`,
  ]) {
    if (existsSync(candidate)) {
      return candidate;
    }
  }

  return null;
}

function readDocsFile(url: string) {
  if (!fileCache.has(url)) {
    const file = findDocsFile(url);
    fileCache.set(url, file ? readFileSync(file, 'utf8') : null);
  }

  return fileCache.get(url) ?? null;
}

// A platform URL exists when the page has its own file for that platform, or
// renders it as one of two or more structured platform sections.
function docsUrlExists(url: string) {
  if (findDocsFile(url)) {
    return true;
  }

  const segments = url.split('/');
  const platform = segments.pop() ?? '';

  if (!isKnownPlatform(platform)) {
    return false;
  }

  const source = readDocsFile(segments.join('/'));

  if (!source) {
    return false;
  }

  const platforms = new Set(
    [...source.matchAll(/<PlatformStructured platform="([^"]+)"/g)].map(
      (match) => normalizePlatformKey(match[1]),
    ),
  );

  return platforms.size > 1 && platforms.has(normalizePlatformKey(platform));
}
