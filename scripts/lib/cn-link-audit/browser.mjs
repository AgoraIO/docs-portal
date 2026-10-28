import { execFile } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';
import { getPlatformForUrl } from '../../../src/lib/platforms/query-route.ts';
import {
  normalizePlatformKey,
  platformRegistry,
} from '../../../src/lib/platforms/registry.ts';

const execute = promisify(execFile);

// Deliberately self-contained: the exact same collector runs in Chromium and tests.
export function collectDomEvidence() {
  const body = document.querySelector('[data-static-docs-body]');
  const visible = (element) => {
    for (let current = element; current; current = current.parentElement) {
      if (current.hidden || current.getAttribute('aria-hidden') === 'true')
        return false;
      const style = getComputedStyle(current);
      if (
        style.display === 'none' ||
        style.visibility === 'hidden' ||
        style.visibility === 'collapse' ||
        style.contentVisibility === 'hidden'
      )
        return false;
      if (
        current.parentElement?.tagName === 'DETAILS' &&
        !current.parentElement.open &&
        current.tagName !== 'SUMMARY'
      )
        return false;
    }
    return true;
  };
  const scope = [
    ...document.querySelectorAll(
      'article, [data-static-docs-body], [data-platform-header-tabs], [role="menu"][aria-label="文档版本"], [role="menu"][aria-label="Documentation versions"]',
    ),
  ];
  const inScope = (element) => scope.some((root) => root.contains(element));
  const anchors = new Set(),
    visibleAnchors = new Set();
  for (const element of document.querySelectorAll('[id], a[name]')) {
    for (const value of [element.id, element.getAttribute('name')]) {
      if (!value) continue;
      anchors.add(value);
      if (visible(element)) visibleAnchors.add(value);
    }
  }
  // Keep this token parser in sync with inventory.parseSrcset. The collector
  // is serialized into the browser, so it cannot reference module imports.
  const parseSrcset = (value) => {
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
  };
  const links = [];
  for (const element of document.querySelectorAll(
    '[href], [src], [srcset], [poster], [style]',
  )) {
    if (
      !inScope(element) ||
      element.closest('script, style, template, link, base')
    )
      continue;
    for (const attribute of ['href', 'src', 'srcset', 'poster']) {
      const value = element.getAttribute(attribute);
      if (value === null) continue;
      const values = attribute === 'srcset' ? parseSrcset(value) : [value];
      for (const href of values)
        links.push({
          href,
          attribute,
          kind:
            attribute === 'href' && ['A', 'AREA'].includes(element.tagName)
              ? 'link'
              : 'resource',
          visible: visible(element),
        });
    }
    for (const match of (element.getAttribute('style') ?? '').matchAll(
      /url\(\s*(?:"([^"]*)"|'([^']*)'|([^)]*?))\s*\)/gi,
    ))
      links.push({
        href: match[1] ?? match[2] ?? match[3],
        attribute: 'style',
        kind: 'resource',
        visible: visible(element),
      });
  }
  const selector = (element) => {
    const parts = [];
    for (
      let current = element;
      current && current !== document.documentElement;
      current = current.parentElement
    ) {
      parts.unshift(
        `${current.tagName.toLowerCase()}:nth-child(${[...current.parentElement.children].indexOf(current) + 1})`,
      );
    }
    return `html > ${parts.join(' > ')}`;
  };
  const controls = [];
  for (const element of document.querySelectorAll(
    '[role="tab"], [aria-expanded], summary, [data-platform-header-tabs] [role="menuitem"]',
  )) {
    if (
      !element.closest(
        '[data-static-docs-body], [data-platform-header-tabs]',
      ) &&
      !element.matches(
        '[aria-label="选择文档版本"], [aria-label="Select documentation version"]',
      )
    )
      continue;
    const platformMenu = Boolean(
      (element.closest('[data-platform-header-tabs]') ||
        element.matches(
          '[aria-label="选择文档版本"], [aria-label="Select documentation version"]',
        )) &&
        (element.getAttribute('aria-haspopup') === 'menu' ||
          element.getAttribute('role') === 'menuitem'),
    );
    const kind =
      element.tagName === 'SUMMARY' &&
      element.parentElement?.tagName === 'DETAILS'
        ? 'details'
        : element.getAttribute('role') === 'tab'
          ? 'tab'
          : platformMenu
            ? 'platform-menu'
            : 'accordion';
    const safe =
      !element.closest('form, a[href], [contenteditable="true"]') &&
      (kind === 'details' ||
        (element.tagName === 'BUTTON' &&
          element.getAttribute('type') !== 'submit' &&
          !element.hasAttribute('form') &&
          (kind === 'tab' ||
            platformMenu ||
            (!element.hasAttribute('aria-haspopup') &&
              (element.hasAttribute('aria-controls') ||
                element.closest(
                  '[data-slot*="accordion"], .openapi-schema-tree',
                ))))));
    controls.push({
      selector: selector(element),
      kind,
      safe: Boolean(safe),
      visible: visible(element),
      disabled:
        element.disabled || element.getAttribute('aria-disabled') === 'true',
      label: (element.textContent ?? '').trim(),
      selected: element.getAttribute('aria-selected'),
      expanded:
        kind === 'details'
          ? String(element.parentElement.open)
          : element.getAttribute('aria-expanded'),
    });
  }
  const content = body?.cloneNode(true);
  for (const element of content?.querySelectorAll('script, style, template') ??
    [])
    element.remove();
  const hasDocsBody = Boolean(
    body &&
      !body.matches(
        '[data-testid="docs-content-skeleton"], [data-slot="skeleton"], [data-skeleton-line]',
      ) &&
      !body.querySelector(
        '[data-testid="docs-content-skeleton"], [data-slot="skeleton"], [data-skeleton-line]',
      ) &&
      (content.textContent.trim() ||
        content.querySelector('img, video, audio, table, pre, code')),
  );
  const stateSignature = JSON.stringify({
    controls,
    anchors: [...visibleAnchors],
    links,
  });
  return {
    url: location.href,
    documentUrl: document.documentURI,
    timeOrigin: performance.timeOrigin,
    navigationUrl: performance.getEntriesByType?.('navigation')?.[0]?.name,
    hasReadableBody: Boolean(document.body?.innerText?.trim()),
    browserErrorPage: Boolean(
      /^(?:chrome-error:|about:neterror)/i.test(document.documentURI) ||
        document.body?.classList.contains('neterror') ||
        document.querySelector('#main-frame-error .error-code'),
    ),
    responseStatus:
      performance.getEntriesByType?.('navigation')?.[0]?.responseStatus ?? 0,
    title: document.title,
    hasDocsBody,
    appRenderError:
      !hasDocsBody &&
      /^Something went wrong!/.test(
        document.body?.innerText?.trim() ??
          document.body?.textContent?.trim() ??
          '',
      ) &&
      [...document.querySelectorAll('button')].some((button) =>
        /^(?:Show|Hide) Error$/.test(button.textContent?.trim() ?? ''),
      ),
    anchors: [...anchors],
    visibleAnchors: [...visibleAnchors],
    links,
    controls,
    stateSignature,
  };
}

// Self-contained and intentionally independent of the full state collector.
// Single-target navigation must not enumerate every reference in an API page.
export function collectNavigationEvidence(rawHash = '') {
  const body = document.querySelector('[data-static-docs-body]');
  const skeletonSelector =
    '[data-testid="docs-content-skeleton"], [data-slot="skeleton"], [data-skeleton-line]';
  let hasDocsBody = false;
  if (
    body &&
    !body.matches(skeletonSelector) &&
    !body.querySelector(skeletonSelector)
  ) {
    const text = document.createTreeWalker(body, NodeFilter.SHOW_TEXT);
    let node = text.nextNode();
    while (node) {
      if (
        node.textContent.trim() &&
        !node.parentElement?.closest('script, style, template')
      ) {
        hasDocsBody = true;
        break;
      }
      node = text.nextNode();
    }
    if (!hasDocsBody)
      hasDocsBody = Boolean(
        body.querySelector('img, video, audio, table, pre, code'),
      );
  }
  const readableText =
    document.body?.innerText?.trim() ??
    document.body?.textContent?.trim() ??
    '';
  const visible = (element) => {
    let visualCodeLayer;
    if (
      github &&
      /^LC\d+$/.test(element.id) &&
      element.classList.contains('react-file-line')
    ) {
      const rect = element.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0)
        visualCodeLayer = element.parentElement?.closest(
          '.react-code-file-contents',
        );
    }
    for (let current = element; current; current = current.parentElement) {
      // GitHub exposes a separate accessible code representation. Its visible
      // LC cells can sit inside an aria-hidden visual layer; no other hiding
      // (including aria-hidden on an outer ancestor or the cell) is waived.
      if (
        current.hidden ||
        (current.getAttribute('aria-hidden') === 'true' &&
          current !== visualCodeLayer)
      )
        return false;
      const style = getComputedStyle(current);
      if (
        style.display === 'none' ||
        style.visibility === 'hidden' ||
        style.visibility === 'collapse' ||
        style.contentVisibility === 'hidden'
      )
        return false;
      if (
        current.parentElement?.tagName === 'DETAILS' &&
        !current.parentElement.open &&
        current.tagName !== 'SUMMARY'
      )
        return false;
    }
    return true;
  };
  let fragment;
  try {
    fragment = decodeURIComponent(rawHash.replace(/^#/, ''));
  } catch {
    fragment = null;
  }
  // Query only exact requested IDs/names, including duplicate platform anchors.
  const findTargets = (value) => [
    ...document.querySelectorAll(
      `[id="${CSS.escape(value)}"], a[name="${CSS.escape(value)}"]`,
    ),
  ];
  const github = new URL(location.href).hostname === 'github.com';
  const lineRange = github && fragment?.match(/^L(\d+)(?:-L(\d+))?$/);
  let groups = [];
  if (fragment && !fragment.startsWith('/')) {
    if (lineRange) {
      const start = Number(lineRange[1]);
      const end = Number(lineRange[2] ?? lineRange[1]);
      if (
        Number.isSafeInteger(start) &&
        Number.isSafeInteger(end) &&
        start > 0 &&
        end >= start
      )
        groups = [...new Set([start, end])].map((line) => [
          ...findTargets(`L${line}`),
          ...findTargets(`LC${line}`),
        ]);
    } else {
      groups = [
        [
          ...findTargets(fragment),
          ...(github ? findTargets(`user-content-${fragment}`) : []),
        ],
      ];
    }
  }
  const found =
    groups.length > 0 && groups.every((targets) => targets.length > 0);
  const visibleGroups = groups.map((targets) => targets.filter(visible));
  const visibleTargets = visibleGroups.flat();
  let targetVisible =
    found && visibleGroups.every((targets) => targets.length > 0);
  let openApiLegacyTarget;
  const fieldName = new URL(location.href).searchParams.get('s-highlight');
  if (fieldName && !github && found) {
    for (const target of groups[0]) {
      const row = target.closest(
        '.openapi-schema-field-row[data-openapi-schema-highlighted]',
      );
      if (
        !row ||
        !visible(row) ||
        row.querySelector('code')?.textContent.trim() !== fieldName
      )
        continue;
      // OpenAPI's zero-size legacy alias is aria-hidden for accessibility.
      // Only this empty, direct-child alias may inherit its visible field row.
      const style = getComputedStyle(target);
      const visibleAlias =
        target.parentElement === row &&
        target.matches('span[aria-hidden="true"]') &&
        !target.childNodes.length &&
        !target.hidden &&
        style.display !== 'none' &&
        !['hidden', 'collapse'].includes(style.visibility) &&
        style.contentVisibility !== 'hidden';
      if (!visible(target) && !visibleAlias) continue;
      targetVisible = true;
      if (!visibleTargets.includes(target)) visibleTargets.push(target);
      openApiLegacyTarget = { fragment, fieldName, rowId: row.id };
      break;
    }
  }
  const targetPanels = visibleTargets.map((target) =>
    target.closest('[data-platform-panel]'),
  );
  const targetPlatforms = [
    ...new Set(
      targetPanels
        .map((panel) => panel?.getAttribute('data-platform-panel'))
        .filter(Boolean),
    ),
  ];
  const selectedPlatforms = [
    ...document.querySelectorAll(
      '[data-platform-header-tabs] [data-platform-tab][aria-selected="true"]',
    ),
  ]
    .filter(visible)
    .map((tab) => tab.getAttribute('data-platform-tab'));
  const platformGroups = new Map();
  for (const panel of document.querySelectorAll('[data-platform-panel]')) {
    if (panel.parentElement?.closest('[data-platform-panel]')) continue;
    const group = panel.closest('[data-platform-group]');
    if (group && !visible(group)) continue;
    if (!platformGroups.has(group))
      platformGroups.set(group, { platforms: [], visible: [] });
    const entry = platformGroups.get(group);
    const platform = panel.getAttribute('data-platform-panel');
    entry.platforms.push(platform);
    if (visible(panel)) entry.visible.push(platform);
  }
  const navigation = performance.getEntriesByType?.('navigation')?.[0];
  return {
    url: location.href,
    documentUrl: document.documentURI,
    timeOrigin: performance.timeOrigin,
    navigationUrl: navigation?.name,
    responseStatus: navigation?.responseStatus ?? 0,
    title: document.title,
    hasDocsBody,
    hasReadableBody: Boolean(readableText),
    accessChallenge: Boolean(
      document.querySelector(
        'input[type="password"], #challenge-form, #cf-challenge-running, iframe[src*="challenges.cloudflare.com"]',
      ),
    ),
    browserErrorPage: Boolean(
      /^(?:chrome-error:|about:neterror)/i.test(document.documentURI) ||
        document.body?.classList.contains('neterror') ||
        document.querySelector('#main-frame-error .error-code'),
    ),
    appRenderError:
      !hasDocsBody &&
      /^Something went wrong!/.test(readableText) &&
      [...document.getElementsByTagName('button')].some((button) =>
        /^(?:Show|Hide) Error$/.test(button.textContent?.trim() ?? ''),
      ),
    anchors: found ? [fragment] : [],
    visibleAnchors: targetVisible ? [fragment] : [],
    hasPlatformPanels: Boolean(document.querySelector('[data-platform-panel]')),
    targetPlatforms,
    selectedPlatforms,
    platformGroups: [...platformGroups.values()],
    sharedTarget: targetPanels.some((panel) => !panel),
    ...(openApiLegacyTarget ? { openApiLegacyTarget } : {}),
  };
}

async function createDriver({
  executable = process.env.CN_LINK_BROWSER_EXECUTABLE || 'agent-browser',
  timeoutMs = 15000,
} = {}) {
  const directory = await mkdtemp(path.join(tmpdir(), 'cn-link-browser-'));
  const config = path.join(directory, 'config.json');
  await writeFile(config, '{}');
  const session = `cn-link-audit-${randomUUID()}`;
  // Do not inherit a user's attached browser, persistent profile, or auth state.
  const env = Object.fromEntries(
    Object.entries(process.env).filter(
      ([key]) => !key.startsWith('AGENT_BROWSER_'),
    ),
  );
  env.AGENT_BROWSER_DEFAULT_TIMEOUT = String(timeoutMs);
  const run = async (...args) => {
    let stdout, executionError;
    try {
      ({ stdout } = await execute(
        executable,
        ['--config', config, '--session', session, '--json', ...args],
        {
          env,
          // Native 0.25.4 open waits 25s even with DEFAULT_TIMEOUT set.
          // Let it return before snapshotting; killing only its client leaves
          // the daemon busy and blocks evidence for this and the next target.
          timeout:
            args[0] === 'open'
              ? Math.max(28000, timeoutMs + 3000)
              : timeoutMs + 3000,
          maxBuffer: 32 * 1024 * 1024,
        },
      ));
    } catch (error) {
      executionError = error;
      stdout = error.stdout;
    }
    let parsed;
    try {
      parsed = JSON.parse(stdout);
    } catch {
      throw executionError ?? new Error('invalid-browser-json');
    }
    if (parsed.success !== true)
      throw new Error(
        typeof parsed.error === 'string'
          ? parsed.error
          : JSON.stringify(parsed.error ?? parsed),
      );
    if (executionError) throw executionError;
    return parsed.data;
  };
  const evaluate = async (script) => (await run('eval', script)).result;
  const snapshot = () => evaluate(`(${collectDomEvidence.toString()})()`);
  const navigationSnapshot = (rawHash = '') =>
    evaluate(
      `(${collectNavigationEvidence.toString()})(${JSON.stringify(rawHash)})`,
    );
  const settle = async (readSnapshot = snapshot) => {
    let evidence = await readSnapshot();
    const deadline = Date.now() + timeoutMs;
    while (
      !evidence.hasDocsBody &&
      !browserNavigationFailure(evidence) &&
      Date.now() < deadline
    ) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      evidence = await readSnapshot();
    }
    return evidence;
  };
  return {
    run,
    evaluate,
    snapshot,
    navigationSnapshot,
    settle,
    navigationSettle: (rawHash = '') =>
      settle(() => navigationSnapshot(rawHash)),
    close: async () => {
      try {
        await run('close');
      } catch {
        /* Still remove our configuration after a launch failure. */
      } finally {
        await rm(directory, { recursive: true, force: true });
      }
    },
  };
}

const normalizePath = (value) => value.replace(/\/+$/, '') || '/';
const pagePath = (url) =>
  normalizePath(new URL(url).pathname.replace(/^\/zh-CN(?=\/|$)/, '') || '/');
export function sameQuery(actual, expected) {
  const entries = (url) =>
    [...url.searchParams]
      .map(([key, value]) => JSON.stringify([key, value]))
      .sort();
  return JSON.stringify(entries(actual)) === JSON.stringify(entries(expected));
}
const samePage = (actual, expected) => {
  const a = new URL(actual),
    b = new URL(expected);
  return (
    a.origin === b.origin &&
    normalizePath(a.pathname) === normalizePath(b.pathname) &&
    sameQuery(a, b)
  );
};
// Preserve strict page identity except for a proven OpenAPI legacy-field reveal.
export function matchesBrowserPage(
  evidence,
  expected,
  { requireHash = false } = {},
) {
  let matchingHash = true;
  if (requireHash) {
    try {
      matchingHash =
        decodeURIComponent(new URL(evidence.url).hash.slice(1)) ===
        decodeURIComponent(new URL(expected).hash.slice(1));
    } catch {
      matchingHash = false;
    }
  }
  if (samePage(evidence.url, expected) && matchingHash) return true;
  const actual = new URL(evidence.url),
    original = new URL(expected);
  const target = evidence.openApiLegacyTarget;
  let fragment;
  try {
    fragment = decodeURIComponent(original.hash.slice(1));
  } catch {
    return false;
  }
  if (
    actual.origin !== original.origin ||
    normalizePath(actual.pathname) !== normalizePath(original.pathname) ||
    !fragment ||
    !target ||
    target.fragment !== fragment ||
    !target.rowId ||
    !evidence.visibleAnchors?.includes(fragment) ||
    original.searchParams.has('path') ||
    original.searchParams.has('s-highlight') ||
    actual.searchParams.getAll('path').length !== 1 ||
    !actual.searchParams.get('path') ||
    actual.searchParams.getAll('s-highlight').length !== 1 ||
    actual.searchParams.get('s-highlight') !== target.fieldName
  )
    return false;
  const businessQuery = [...actual.searchParams].filter(
    ([key]) => key !== 'path' && key !== 's-highlight',
  );
  return (
    JSON.stringify(businessQuery) === JSON.stringify([...original.searchParams])
  );
}

export function browserFragmentFailure(
  fragment,
  evidence,
  expectedUrl,
  platformIndex,
) {
  if (fragment === null)
    return { status: 'broken', reason: 'malformed-anchor' };
  if (fragment?.startsWith('/'))
    return {
      status: 'unverified',
      reason: 'spa-route-needs-content-verification',
    };
  if (fragment && !evidence.visibleAnchors.includes(fragment))
    return {
      status: 'unverified',
      reason: evidence.anchors.includes(fragment)
        ? 'deep-link-target-hidden'
        : 'fragment-not-in-browser',
    };
  if (
    fragment &&
    expectedUrl &&
    evidence.hasPlatformPanels &&
    !evidence.sharedTarget
  ) {
    const requested = new URL(expectedUrl);
    const suffix = requested.pathname.split('/').filter(Boolean).at(-1);
    const pathPlatform = normalizePlatformKey(suffix ?? '');
    const platform = platformIndex
      ? getPlatformForUrl(requested, platformIndex)
      : Object.hasOwn(platformRegistry, pathPlatform)
        ? pathPlatform
        : normalizePlatformKey(requested.searchParams.get('platform') ?? '');
    if (
      Object.hasOwn(platformRegistry, platform) &&
      !evidence.targetPlatforms?.some(
        (candidate) => normalizePlatformKey(candidate) === platform,
      )
    )
      return { status: 'unverified', reason: 'fragment-platform-mismatch' };
  }
  return undefined;
}

// `platform` is also a business filter on pages such as the SDK downloads.
// Interpret it as page selection only for a published platform family.
export function hasPlatformQueryScope(url, index) {
  let pathname;
  try {
    pathname = decodeURI(url.pathname).replace(/\/+$/, '') || '/';
  } catch {
    return false;
  }
  const publicPath = pathname.replace(/^\/zh-CN(?=\/|$)/, '') || '/';
  return [pathname, publicPath, `/zh-CN${publicPath}`].some(
    (key) =>
      Object.hasOwn(index.targets, key) || Object.hasOwn(index.platforms, key),
  );
}

export function browserPlatformFailure(evidence, expectedUrl, platformIndex) {
  if (!platformIndex) return undefined;
  const requested = new URL(expectedUrl);
  const platform = getPlatformForUrl(requested, platformIndex);
  if (!platform)
    return requested.searchParams.has('platform') &&
      hasPlatformQueryScope(requested, platformIndex)
      ? { status: 'unverified', reason: 'unsupported-platform-query' }
      : undefined;
  const normalized = (values) =>
    (values ?? []).map((value) => normalizePlatformKey(value.toLowerCase()));
  const selected = normalized(evidence.selectedPlatforms);
  const groups = (evidence.platformGroups ?? []).filter((group) =>
    normalized(group.platforms).includes(platform),
  );
  if (
    (selected.length && !selected.includes(platform)) ||
    groups.some((group) => !normalized(group.visible).includes(platform))
  )
    return { status: 'unverified', reason: 'page-platform-mismatch' };
  if (!selected.includes(platform) && !groups.length)
    return { status: 'unverified', reason: 'page-platform-evidence-missing' };
  return undefined;
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function inspectBrowserPages(urls, options = {}) {
  const { origin, maxStates = 128, onProgress } = options;
  if (!Number.isSafeInteger(maxStates) || maxStates < 1)
    throw new Error('Invalid maxStates');
  const pages = new Map(),
    gaps = [],
    links = [];
  const targets = [...new Set(urls)].map((url) => {
    const parsed = new URL(url, origin);
    if (!['http:', 'https:'].includes(parsed.protocol))
      throw new Error('Unsupported browser URL');
    return parsed.href;
  });
  const driver = await createDriver(options);
  try {
    for (const url of targets) {
      const page = { url, states: [], complete: true };
      const gap = (reason, detail) => {
        page.complete = false;
        gaps.push({
          pageUrl: pagePath(url),
          sourcePath: `browser:${url}`,
          reason,
          ...(detail ? { detail } : {}),
        });
      };
      pages.set(pagePath(url), page);
      try {
        await driver.run('open', url);
        const initial = await driver.settle();
        const storage = await driver.evaluate(
          '({ local: { ...localStorage }, session: { ...sessionStorage } })',
        );
        const queue = [{ evidence: initial, replay: [] }],
          visited = new Set([initial.stateSignature]);
        const discoveredControls = new Map(),
          reachableControls = new Set();
        let capped = false;
        while (queue.length && !capped) {
          const { evidence, replay } = queue.shift();
          const state = `state-${page.states.length}`;
          page.states.push({ ...evidence, state, replay });
          for (const link of evidence.links)
            links.push({
              ...link,
              source: 'rendered',
              sourcePath: `browser:${url}`,
              pageUrl: pagePath(url),
              state,
            });
          if (!evidence.hasDocsBody || !samePage(evidence.url, url)) {
            gap('browser-page-identity-or-body-missing');
            break;
          }
          for (const control of evidence.controls) {
            const controlKey = `${control.selector}:${control.kind}:${control.label}`;
            discoveredControls.set(controlKey, control);
            if (control.visible && !control.disabled)
              reachableControls.add(controlKey);
            if (!control.safe) {
              gap('unsupported-browser-control', control.label);
              continue;
            }
            if (
              !control.visible ||
              control.disabled ||
              (control.kind === 'tab' && control.selected === 'true')
            )
              continue;
            if (visited.size >= maxStates) {
              gap('browser-state-limit', String(maxStates));
              capped = true;
              break;
            }
            try {
              await driver.evaluate(
                `(() => { const saved = ${JSON.stringify(storage)}; localStorage.clear(); sessionStorage.clear(); for (const [k,v] of Object.entries(saved.local)) localStorage.setItem(k,v); for (const [k,v] of Object.entries(saved.session)) sessionStorage.setItem(k,v); })()`,
              );
              await driver.run('open', url);
              let current = await driver.settle();
              if (current.stateSignature !== initial.stateSignature)
                throw new Error('non-deterministic-reset');
              for (const step of replay) {
                const found = current.controls.find(
                  (entry) =>
                    entry.selector === step.selector &&
                    entry.kind === step.kind &&
                    entry.label === step.label,
                );
                if (!found?.safe || !found.visible || found.disabled)
                  throw new Error('replay-control-unreachable');
                await driver.run('click', found.selector);
                await sleep(100);
                current = await driver.settle();
              }
              if (current.stateSignature !== evidence.stateSignature)
                throw new Error('non-deterministic-replay');
              await driver.run('click', control.selector);
              await sleep(100);
              const next = await driver.settle();
              if (next.stateSignature === current.stateSignature) {
                gap('browser-control-did-not-change-state', control.label);
                continue;
              }
              if (!visited.has(next.stateSignature)) {
                visited.add(next.stateSignature);
                queue.push({ evidence: next, replay: [...replay, control] });
              }
            } catch (error) {
              gap(
                'browser-control-unreachable',
                `${control.label}: ${error.message}`,
              );
            }
          }
          onProgress?.({
            phase: 'browser-state',
            url,
            completed: page.states.length,
            total: maxStates,
          });
        }
        for (const [key, control] of discoveredControls) {
          if (control.safe && !control.disabled && !reachableControls.has(key))
            gap('browser-control-never-reachable', control.label);
        }
        // Keep evidence discovered at the cap even though traversal is incomplete.
        for (const { evidence, replay } of queue) {
          const state = `state-${page.states.length}`;
          page.states.push({ ...evidence, state, replay });
          links.push(
            ...evidence.links.map((link) => ({
              ...link,
              source: 'rendered',
              sourcePath: `browser:${url}`,
              pageUrl: pagePath(url),
              state,
            })),
          );
        }
      } catch (error) {
        gap('browser-inspection-failed', error.message);
      }
      onProgress?.({
        phase: 'browser-page',
        url,
        completed: pages.size,
        total: targets.length,
      });
    }
  } finally {
    await driver.close();
  }
  return { pages, gaps, links };
}

// Cleanup belongs only to this isolated session and must never block a new URL.
export async function navigateBrowserTarget(driver, target, result) {
  try {
    await driver.evaluate(
      '(() => { localStorage.clear(); sessionStorage.clear(); })()',
    );
  } catch (error) {
    result.storageResetFailed = true;
    result.storageResetError = error.message;
  }
  await driver.run('open', 'about:blank');
  const beforeNavigation = await driver.navigationSnapshot();
  let navigationError;
  try {
    await driver.run('open', target);
  } catch (error) {
    navigationError = error;
  }
  const evidence = await driver.navigationSnapshot(new URL(target).hash);
  if (navigationError) {
    result.finalUrl = evidence.url;
    if (
      !canRecoverTimedOutNavigation(
        beforeNavigation,
        evidence,
        target,
        navigationError,
      )
    ) {
      Object.assign(
        result,
        browserNavigationFailure(evidence) ?? {
          status: 'unverified',
          reason: 'browser-navigation-not-proven',
        },
      );
      throw navigationError;
    }
    result.navigationRecovered = true;
    result.navigationError = navigationError.message;
  }
  return evidence;
}

export async function verifyBrowserTargets(urls, options = {}) {
  const results = new Map();
  const targets = [...new Set(urls)];
  const driver = options.driver ?? (await createDriver(options));
  try {
    for (const target of targets) {
      let result = {
        status: 'unverified',
        reason: 'browser-verification-failed',
        finalUrl: target,
        checkedAt: new Date().toISOString(),
      };
      try {
        const entry = new URL(target, options.origin);
        const expected = new URL(
          options.expectedUrls?.get(target) ?? target,
          options.origin,
        );
        if (!['http:', 'https:'].includes(expected.protocol))
          throw new Error('unsupported-url');
        const internal =
          options.origin && expected.origin === new URL(options.origin).origin;
        let evidence = await navigateBrowserTarget(driver, entry.href, result);
        if (internal) evidence = await driver.navigationSettle(expected.hash);
        let fragment;
        try {
          fragment = decodeURIComponent(expected.hash.slice(1));
        } catch {
          fragment = null;
        }
        // React may expand a hash-selected tab/accordion after the body mounts.
        // Observe that direct-navigation behavior without clicking any controls.
        const fragmentDeadline = Date.now() + (options.timeoutMs ?? 15000);
        while (
          (fragment ||
            (internal &&
              getPlatformForUrl(
                expected,
                options.platformIndex ?? { targets: {}, platforms: {} },
              ))) &&
          !fragment?.startsWith('/') &&
          !browserNavigationFailure(evidence) &&
          (browserFragmentFailure(
            fragment,
            evidence,
            expected.href,
            options.platformIndex,
          ) ||
            (internal &&
              browserPlatformFailure(
                evidence,
                expected.href,
                options.platformIndex,
              ))) &&
          Date.now() < fragmentDeadline
        ) {
          await sleep(
            Math.min(200, Math.max(0, fragmentDeadline - Date.now())),
          );
          evidence = await driver.navigationSnapshot(expected.hash);
        }
        result.finalUrl = evidence.url;
        result.responseStatus = evidence.responseStatus;
        result.timeOrigin = evidence.timeOrigin;
        result.navigationUrl = evidence.navigationUrl;
        result.hasPlatformPanels = evidence.hasPlatformPanels;
        result.targetPlatforms = evidence.targetPlatforms;
        result.sharedTarget = evidence.sharedTarget;
        result.selectedPlatforms = evidence.selectedPlatforms;
        result.platformGroups = evidence.platformGroups;
        const navigationFailure = browserNavigationFailure(evidence);
        if (navigationFailure) Object.assign(result, navigationFailure);
        else if (
          !evidence.hasDocsBody &&
          (/^(?:just a moment|access denied|attention required|verify (?:you|your)|security check|forbidden|sign in|log in|login|登录|访问受限)/i.test(
            evidence.title,
          ) ||
            /(?:^|\/)(?:login|signin|sign-in|sign_in|log-in|log_in|oauth|authorize)(?:\/|$)/i.test(
              new URL(evidence.url).pathname,
            ))
        )
          result.reason = 'access-challenge';
        else if (
          /^(?:404\b|(?:page |document |file )?not found\b|页面不存在|页面未找到|找不到页面)/i.test(
            evidence.title,
          )
        )
          result = {
            ...result,
            status: 'broken',
            reason: 'browser-error-page',
          };
        else if (
          internal &&
          (!evidence.hasDocsBody ||
            !matchesBrowserPage(evidence, expected.href, {
              requireHash: Boolean(
                options.platformIndex &&
                  getPlatformForUrl(expected, options.platformIndex),
              ),
            }))
        )
          result.reason = 'browser-page-identity-or-body-missing';
        else if (
          internal &&
          browserPlatformFailure(evidence, expected.href, options.platformIndex)
        )
          Object.assign(
            result,
            browserPlatformFailure(
              evidence,
              expected.href,
              options.platformIndex,
            ),
          );
        else if (
          browserFragmentFailure(
            fragment,
            evidence,
            expected.href,
            options.platformIndex,
          )
        )
          Object.assign(
            result,
            browserFragmentFailure(
              fragment,
              evidence,
              expected.href,
              options.platformIndex,
            ),
          );
        else {
          if (evidence.accessChallenge) result.reason = 'access-challenge';
          else if (evidence.hasReadableBody)
            result = {
              ...result,
              status: 'valid',
              reason: fragment
                ? 'browser-visible-deep-link'
                : 'browser-reachable-page',
            };
          else result.reason = 'empty-browser-page';
        }
      } catch (error) {
        result.error = error.message;
      }
      results.set(target, result);
      options.onProgress?.({
        phase: 'browser-target',
        url: target,
        result,
        completed: results.size,
        total: targets.length,
      });
    }
  } finally {
    await driver.close();
  }
  return results;
}

export function canRecoverTimedOutNavigation(before, evidence, target, error) {
  const timedOut =
    /\btimeout\b|timed out|ETIMEDOUT/i.test(error?.message ?? '') ||
    (error?.killed === true && error?.signal === 'SIGTERM');
  if (
    !timedOut ||
    !Number.isFinite(before?.timeOrigin) ||
    !Number.isFinite(evidence?.timeOrigin) ||
    evidence.timeOrigin <= before.timeOrigin ||
    !evidence.hasReadableBody ||
    browserNavigationFailure(evidence) ||
    !(evidence.responseStatus >= 200 && evidence.responseStatus < 300)
  )
    return false;
  try {
    return (
      ['http:', 'https:'].includes(new URL(evidence.url).protocol) &&
      samePage(evidence.url, target) &&
      samePage(evidence.navigationUrl, evidence.url) &&
      samePage(evidence.documentUrl, evidence.url)
    );
  } catch {
    return false;
  }
}

export function browserNavigationFailure(evidence) {
  if (evidence.appRenderError)
    return { status: 'broken', reason: 'browser-render-error' };
  if (
    evidence.browserErrorPage ||
    /^(?:chrome-error:|about:neterror)/i.test(
      evidence.documentUrl ?? evidence.url ?? '',
    )
  )
    return { status: 'unverified', reason: 'browser-network-error' };
  const status = Number(evidence.responseStatus ?? 0);
  if (status >= 400)
    return {
      status: status === 404 || status === 410 ? 'broken' : 'unverified',
      reason: `browser-http-${status}`,
    };
  if (
    !status &&
    /^(?:4\d\d|5\d\d)\s+(?:not |forbidden|unauthorized|internal|bad |service|gateway|too many)/i.test(
      evidence.title ?? '',
    )
  )
    return {
      status: 'unverified',
      reason: 'browser-error-response-status-unknown',
    };
  return undefined;
}
