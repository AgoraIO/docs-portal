import { createHash } from 'node:crypto';
import { load } from 'cheerio';
import { docsContentEvidence } from './content-evidence.mjs';

const defaults = {
  concurrency: 8,
  hostConcurrency: 2,
  timeoutMs: 10_000,
  retries: 1,
  maxBytes: 8 * 1024 * 1024,
  maxRedirects: 5,
};

function decode(value) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

// GitHub uses heading aliases and LC line cells rather than the URL fragment ID.
export function networkFragmentFailure(value, anchors) {
  const url = new URL(value);
  const fragment = decode(url.hash.slice(1));
  if (!fragment) return undefined;
  if (fragment.startsWith('/'))
    return {
      status: 'unverified',
      reason: 'spa-route-needs-content-verification',
    };
  const github = url.hostname === 'github.com';
  const range = github && fragment.match(/^L(\d+)(?:-L(\d+))?$/);
  let found = anchors?.includes(fragment);
  if (range) {
    const start = Number(range[1]),
      end = Number(range[2] ?? range[1]);
    found =
      Number.isSafeInteger(start) &&
      Number.isSafeInteger(end) &&
      start > 0 &&
      end >= start &&
      (anchors?.includes(`L${start}`) || anchors?.includes(`LC${start}`)) &&
      (anchors?.includes(`L${end}`) || anchors?.includes(`LC${end}`));
  } else if (github) found ||= anchors?.includes(`user-content-${fragment}`);
  return found
    ? undefined
    : {
        status: 'unverified',
        reason: anchors ? 'fragment-not-in-html' : 'fragment-not-verifiable',
      };
}

function requestUrl(value) {
  const url = new URL(value);
  url.hash = '';
  return url.href;
}

function hostLimiter(limit) {
  const hosts = new Map();
  return async (hostname, operation) => {
    if (!hosts.has(hostname)) hosts.set(hostname, { active: 0, queue: [] });
    const host = hosts.get(hostname);
    if (host.active >= limit)
      await new Promise((resolve) => host.queue.push(resolve));
    else host.active++;
    try {
      return await operation();
    } finally {
      const next = host.queue.shift();
      if (next) next();
      else host.active--;
    }
  };
}

function htmlEvidence(body) {
  const $ = load(body);
  const anchors = new Set();
  $('[id], a[name]').each((_, element) => {
    for (const value of [$(element).attr('id'), $(element).attr('name')]) {
      if (value) anchors.add(value);
    }
  });
  const title = $('title').first().text().trim();
  const evidence = {
    detectedHtml: true,
    anchors: [...anchors],
    digest: createHash('sha256').update(body).digest('hex'),
    ...docsContentEvidence(body),
  };
  if (
    /^(?:404(?:\s|\b)|(?:page |document |file )?not found\b|页面不存在|页面未找到|找不到页面)/i.test(
      title,
    )
  ) {
    return { ...evidence, status: 'broken', reason: 'error-page' };
  }
  if (
    !evidence.hasDocsBody &&
    /^(?:just a moment|access denied|attention required|verify (?:you|your)|security check|forbidden|sign in|log in|login|登录|访问受限)/i.test(
      title,
    )
  ) {
    return { ...evidence, status: 'unverified', reason: 'access-challenge' };
  }
  if (
    $(
      '#challenge-form, #cf-challenge-running, iframe[src*="challenges.cloudflare.com"]',
    ).length
  ) {
    return { ...evidence, status: 'unverified', reason: 'access-challenge' };
  }
  if ($('input[type="password"]').length) {
    return {
      ...evidence,
      status: 'unverified',
      reason: 'authentication-required',
    };
  }
  const content = $('body').clone();
  content
    .find(
      'script, style, head, template, noscript, [hidden], [aria-hidden="true"]',
    )
    .remove();
  content.find('[style]').each((_, element) => {
    if (
      /(?:^|;)\s*(?:display\s*:\s*none|visibility\s*:\s*(?:hidden|collapse)|content-visibility\s*:\s*hidden)\s*(?:!important\s*)?(?:;|$)/i.test(
        $(element).attr('style') ?? '',
      )
    )
      $(element).remove();
  });
  const hasMedia =
    content.find(
      'img[src], video[src], video source[src], audio[src], audio source[src], svg > *, canvas, iframe[src], object[data], embed[src]',
    ).length > 0;
  if (!content.text().trim() && !hasMedia) {
    return { ...evidence, status: 'unverified', reason: 'javascript-shell' };
  }
  return { ...evidence, status: 'valid', reason: 'reachable-html' };
}

async function inspectBody(response, maxBytes) {
  const contentType =
    response.headers.get('content-type')?.split(';')[0].toLowerCase() ?? '';
  const contentLength = response.headers.get('content-length');
  const evidence = {
    contentType,
    contentLength: contentLength === null ? null : Number(contentLength),
  };
  if (!response.body || contentLength === '0') {
    await response.body?.cancel();
    return { ...evidence, status: 'unverified', reason: 'empty-response' };
  }
  const reader = response.body.getReader();
  const chunks = [];
  let bytes = 0;
  let html = /(?:text\/html|application\/xhtml\+xml)/i.test(contentType);
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!chunks.length && !html) {
        // Inspect only the first chunk for resources: catch HTML error pages
        // disguised as downloads without transferring the entire resource.
        html = /^\s*(?:<!doctype\s+html|<html\b|<head\b|<title\b)/i.test(
          Buffer.from(value.subarray(0, 1024)).toString(),
        );
        if (!html)
          return { ...evidence, status: 'valid', reason: 'reachable-resource' };
      }
      bytes += value.byteLength;
      if (bytes > maxBytes)
        return {
          ...evidence,
          status: 'unverified',
          reason: 'body-too-large',
          truncated: true,
        };
      chunks.push(Buffer.from(value));
    }
    if (!bytes)
      return { ...evidence, status: 'unverified', reason: 'empty-response' };
    return {
      ...evidence,
      ...htmlEvidence(Buffer.concat(chunks).toString('utf8')),
    };
  } finally {
    await reader.cancel().catch(() => {});
    reader.releaseLock();
  }
}

async function probeOnce(original, options, limitHost) {
  let current = original;
  const redirects = [];
  const visited = new Set();
  const evidence = () => ({
    finalUrl: current,
    redirects: [...redirects],
    checkedAt: new Date().toISOString(),
  });
  while (true) {
    const url = new URL(current);
    const key = requestUrl(current);
    if (visited.has(key))
      return {
        ...evidence(),
        status: 'unverified',
        reason: 'redirect-loop',
        httpStatus: redirects.at(-1)?.status ?? null,
      };
    visited.add(key);
    const result = await limitHost(url.hostname, async () => {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), options.timeoutMs);
      let httpStatus = null;
      try {
        const response = await fetch(key, {
          method: 'GET',
          redirect: 'manual',
          signal: controller.signal,
          headers: { 'user-agent': 'DocsPortal-LinkAudit/1.0', accept: '*/*' },
        });
        httpStatus = response.status;
        if ([301, 302, 303, 307, 308].includes(httpStatus)) {
          await response.body?.cancel();
          const location = response.headers.get('location');
          if (!location)
            return {
              status: 'unverified',
              reason: 'redirect-without-location',
              httpStatus,
            };
          let target;
          try {
            target = new URL(location, current);
          } catch {
            return {
              status: 'unverified',
              reason: 'invalid-redirect',
              httpStatus,
            };
          }
          if (!['http:', 'https:'].includes(target.protocol))
            return {
              status: 'unverified',
              reason: 'unsupported-redirect',
              httpStatus,
            };
          if (!location.includes('#')) target.hash = url.hash;
          return { redirect: target.href, httpStatus };
        }
        if (httpStatus < 200 || httpStatus >= 300) {
          await response.body?.cancel();
          return {
            status: [404, 410].includes(httpStatus) ? 'broken' : 'unverified',
            reason: `http-${httpStatus}`,
            httpStatus,
          };
        }
        return {
          ...(await inspectBody(response, options.maxBytes)),
          httpStatus,
        };
      } catch (error) {
        return {
          status: 'unverified',
          reason: controller.signal.aborted ? 'timeout' : 'network-error',
          httpStatus,
          error: error.message,
        };
      } finally {
        clearTimeout(timer);
      }
    });
    if (!result.redirect) return { ...evidence(), ...result };
    if (redirects.length >= options.maxRedirects)
      return {
        ...evidence(),
        status: 'unverified',
        reason: 'too-many-redirects',
        httpStatus: result.httpStatus,
      };
    redirects.push({
      from: current,
      to: result.redirect,
      status: result.httpStatus,
    });
    current = result.redirect;
    if (
      /(?:^|\/)(?:login|signin|sign-in|sign_in|log-in|log_in|oauth|authorize)(?:\/|$)/i.test(
        new URL(current).pathname,
      )
    ) {
      return {
        ...evidence(),
        status: 'unverified',
        reason: 'login-redirect',
        httpStatus: result.httpStatus,
      };
    }
  }
}

/** Probe unique HTTP resources, then validate each original URL's fragment.
 * onProgress receives { url, result, completed, total } once per original URL.
 * Missing HTML fragments remain unverified because external JS may create them.
 */
export async function probeUrls(targets, options = {}) {
  const settings = { ...defaults, ...options };
  for (const name of [
    'concurrency',
    'hostConcurrency',
    'timeoutMs',
    'maxBytes',
  ]) {
    if (!Number.isSafeInteger(settings[name]) || settings[name] < 1)
      throw new Error(`Invalid ${name}`);
  }
  for (const name of ['retries', 'maxRedirects']) {
    if (!Number.isSafeInteger(settings[name]) || settings[name] < 0)
      throw new Error(`Invalid ${name}`);
  }
  const originals = [
    ...new Set(
      Array.from(targets, (target) =>
        typeof target === 'string' ? target : target.url,
      ),
    ),
  ];
  const groups = new Map();
  const results = new Map();
  let completed = 0;
  const save = (url, result) => {
    results.set(url, result);
    settings.onProgress?.({
      url,
      result,
      completed: ++completed,
      total: originals.length,
    });
  };
  for (const original of originals) {
    try {
      const url = new URL(original);
      if (!['http:', 'https:'].includes(url.protocol))
        throw new Error('Unsupported protocol');
      const key = requestUrl(original);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(original);
    } catch {
      save(original, {
        status: 'unverified',
        reason: 'invalid-http-url',
        httpStatus: null,
        finalUrl: original,
        redirects: [],
        checkedAt: new Date().toISOString(),
      });
    }
  }
  const queue = [...groups.entries()];
  const limitHost = hostLimiter(settings.hostConcurrency);
  let next = 0;
  await Promise.all(
    Array.from(
      { length: Math.min(settings.concurrency, queue.length) },
      async () => {
        while (next < queue.length) {
          const [url, sources] = queue[next++];
          let result;
          for (let attempt = 0; attempt <= settings.retries; attempt++) {
            result = await probeOnce(url, settings, limitHost);
            if (
              !['timeout', 'network-error', 'http-429'].includes(
                result.reason,
              ) &&
              !(result.httpStatus >= 500)
            )
              break;
            if (attempt < settings.retries)
              await new Promise((resolve) =>
                setTimeout(resolve, 100 * (attempt + 1)),
              );
          }
          for (const original of sources) {
            const final = new URL(result.finalUrl);
            if (!final.href.includes('#')) final.hash = new URL(original).hash;
            const fragmentFailure =
              result.status === 'valid'
                ? networkFragmentFailure(final.href, result.anchors)
                : undefined;
            save(original, {
              ...result,
              finalUrl: final.href,
              ...fragmentFailure,
            });
          }
        }
      },
    ),
  );
  return results;
}
