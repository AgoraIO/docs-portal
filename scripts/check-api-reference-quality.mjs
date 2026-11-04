import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';
import { connectChrome } from './lib/api-reference-quality/chrome.mjs';
import { fontFixtures } from './lib/api-reference-quality/fonts.mjs';
import {
  digest,
  git,
  inventory,
  localeFor,
  matrix,
  readJson,
  sourceAudit,
  sourceFingerprint,
} from './lib/api-reference-quality/policy.mjs';
import {
  canaryHtml,
  canaryRules,
  inspectReference,
} from './lib/api-reference-quality/probe.mjs';

const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const expression = `(${inspectReference.toString()})()`;
const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
};

export async function serveBuild(root, region) {
  root = path.resolve(root);
  const server = createServer((request, response) => {
    try {
      const pathname = decodeURIComponent(
        new URL(request.url, 'http://localhost').pathname,
      );
      let file = path.resolve(root, `.${pathname}`);
      if (!file.startsWith(`${root}${path.sep}`) && file !== root)
        throw new Error('Invalid path');
      if (existsSync(path.join(file, 'index.html')))
        file = path.join(file, 'index.html');
      else if (region === 'cn' && !path.extname(pathname))
        file = path.join(root, 'zh-CN', pathname, 'index.html');
      if (!existsSync(file)) {
        response.writeHead(404);
        response.end('Missing built artifact');
        return;
      }
      response.writeHead(200, {
        'Content-Type': mime[path.extname(file)] ?? 'application/octet-stream',
        'Cache-Control': 'no-store',
      });
      response.end(readFileSync(file));
    } catch {
      response.writeHead(400);
      response.end('Invalid built artifact request');
    }
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  return {
    origin: `http://127.0.0.1:${server.address().port}`,
    close: () => new Promise((resolve) => server.close(resolve)),
  };
}

export function selectRows(rows, cases, scope, region) {
  if (!['smoke', 'all'].includes(scope))
    throw new Error('Expected --scope smoke or all');
  const urls = new Set(cases.flatMap((entry) => entry.urls[region] ?? []));
  for (const url of urls)
    if (!rows.some((row) => row.url === url.split('#')[0]))
      throw new Error(
        `Acceptance case missing from published inventory: ${url}`,
      );
  const selected =
    scope === 'all'
      ? rows
      : rows.filter(
          (row) =>
            urls.has(row.url) ||
            [...urls].some((url) => url.split('#')[0] === row.url),
        );
  if (!selected.length) throw new Error('No API pages selected');
  return selected.map((row) => ({
    ...row,
    acceptanceCase: [...urls].some((url) => url.split('#')[0] === row.url),
  }));
}
async function buildIdentity(root, region) {
  const rows = inventory(root, region);
  // Build directories are ignored; list them directly instead of relying on Git state.
  return import('node:fs').then(({ readdirSync }) => ({
    rows,
    hash: digest(
      JSON.stringify(rows) +
        readdirSync(path.join(root, 'assets'))
          .sort()
          .map(
            (name) =>
              `${name}:${digest(readFileSync(path.join(root, 'assets', name)))}`,
          )
          .join('\n'),
    ),
  }));
}
export function assertReceipt(receipt, expected) {
  for (const key of ['region', 'head', 'source', 'build'])
    if (receipt[key] !== expected[key])
      throw new Error(`Stale or wrong build receipt: ${key}`);
}
async function ready(chrome, sessionId, url) {
  const result = await chrome.send('Page.navigate', { url }, sessionId);
  if (result.errorText) throw new Error(result.errorText);
  for (let n = 0; n < 200; n++) {
    const done = await chrome.evaluate(
      sessionId,
      `(() => { const roots = [...document.querySelectorAll('article .docs-body, article .openapi-operation')].filter(e => e.checkVisibility()); return location.href === ${JSON.stringify(url)} && document.readyState !== 'loading' && roots.length > 0 && roots.every(e => Object.keys(e).some(k => k.startsWith('__reactProps$'))) && !document.querySelector('[data-testid="docs-content-skeleton"]') && !!getComputedStyle(document.documentElement).getPropertyValue('--font-sans').trim(); })()`,
    );
    if (done) {
      await chrome.evaluate(
        sessionId,
        `(async () => { await document.fonts.ready; if ([...document.fonts].some(f => f.status === 'error')) throw Error('Document font failed to load'); })()`,
      );
      return;
    }
    await pause(100);
  }
  throw new Error(`Body, CSS, or hydration not ready: ${url}`);
}
async function settle(chrome, sid) {
  await chrome.evaluate(
    sid,
    `new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))`,
  );
}
async function nativeToggle(chrome, sid) {
  const target = await chrome.evaluate(
    sid,
    `(() => { const e = [...document.querySelectorAll('[data-openapi-field-toggle]')].find(e => e.checkVisibility()); if (!e) return null; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return {x:r.x+r.width*.7,y:r.y+r.height/2,before:e.getAttribute('aria-expanded'),name:e.textContent.trim()}; })()`,
  );
  if (!target) return { checked: false };
  await settle(chrome, sid);
  await chrome.send(
    'Input.dispatchMouseEvent',
    {
      type: 'mousePressed',
      x: target.x,
      y: target.y,
      button: 'left',
      clickCount: 1,
    },
    sid,
  );
  await chrome.send(
    'Input.dispatchMouseEvent',
    {
      type: 'mouseReleased',
      x: target.x,
      y: target.y,
      button: 'left',
      clickCount: 1,
    },
    sid,
  );
  await settle(chrome, sid);
  const changed = await chrome.evaluate(
    sid,
    `(() => { const e=[...document.querySelectorAll('[data-openapi-field-toggle]')].find(e=>e.textContent.trim()===${JSON.stringify(target.name)}); return e?.getAttribute('aria-expanded') !== ${JSON.stringify(target.before)} && !!e; })()`,
  );
  if (!changed)
    throw new Error(`Field name click did not toggle: ${target.name}`);
  await chrome.evaluate(
    sid,
    `(() => { const e=[...document.querySelectorAll('[data-openapi-field-toggle]')].find(e=>e.textContent.trim()===${JSON.stringify(target.name)}); e.focus(); })()`,
  );
  for (const modifiers of [0, 8]) {
    await chrome.send(
      'Input.dispatchKeyEvent',
      {
        type: 'keyDown',
        key: 'Tab',
        code: 'Tab',
        windowsVirtualKeyCode: 9,
        modifiers,
      },
      sid,
    );
    await chrome.send(
      'Input.dispatchKeyEvent',
      {
        type: 'keyUp',
        key: 'Tab',
        code: 'Tab',
        windowsVirtualKeyCode: 9,
        modifiers,
      },
      sid,
    );
  }
  const focused = await chrome.evaluate(
    sid,
    `document.activeElement?.matches('[data-openapi-field-toggle]') && document.activeElement.textContent.trim() === ${JSON.stringify(target.name)}`,
  );
  if (!focused)
    throw new Error(`Tab/Shift+Tab did not return to field: ${target.name}`);
  await chrome.send(
    'Input.dispatchKeyEvent',
    {
      type: 'keyDown',
      key: 'Enter',
      code: 'Enter',
      text: '\r',
      windowsVirtualKeyCode: 13,
    },
    sid,
  );
  await chrome.send(
    'Input.dispatchKeyEvent',
    { type: 'keyUp', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 },
    sid,
  );
  await settle(chrome, sid);
  const restored = await chrome.evaluate(
    sid,
    `document.activeElement?.getAttribute('aria-expanded') === ${JSON.stringify(target.before)}`,
  );
  if (!restored)
    throw new Error(`Focused field Enter did not toggle: ${target.name}`);
  return {
    checked: true,
    field: target.name,
    click: true,
    tab: true,
    enter: true,
  };
}
async function browserAudit({
  root,
  region,
  scope,
  out,
  receipt,
  workers,
  fonts: fontMode,
}) {
  const identity = await buildIdentity(root, region);
  assertReceipt(receipt, {
    region,
    head: git('rev-parse', 'HEAD'),
    source: sourceFingerprint(),
    build: identity.hash,
  });
  const selected = selectRows(
    identity.rows,
    readJson('scripts/api-reference-quality-cases.json'),
    scope,
    region,
  );
  const report = {
    status: 'INCOMPLETE',
    region,
    scope,
    head: receipt.head,
    source: receipt.source,
    build: receipt.build,
    startedAt: new Date().toISOString(),
    inventory: identity.rows.length,
    selected: selected.length,
    expectedPages: selected.map((row) => row.url),
    results: [],
    limitations:
      'Geometry and field click/Enter checks; semantic correctness, visual judgement, touch, bulk controls, code tabs, and navigation require recorded human acceptance.',
  };
  const save = () =>
    writeFile(path.join(out, 'browser.json'), JSON.stringify(report, null, 2));
  await save();
  let chrome, server;
  try {
    const fontData = await fontFixtures(fontMode);
    report.fontDelivery = {
      mode: fontMode,
      fixtures: [...fontData].map(([url, { hash, bytes }]) => ({
        url,
        hash,
        bytes,
      })),
      limitation:
        fontMode === 'fixture'
          ? 'Exact declared font bytes delivered via CDP for stable layout; verify CDN delivery/CORS separately on the real preview origin.'
          : null,
    };
    server = await serveBuild(root, region);
    chrome = await connectChrome();
    report.browser = await chrome.send('Browser.getVersion');
    const { targetId } = await chrome.send('Target.createTarget', {
      url: 'about:blank',
    });
    const { sessionId } = await chrome.send('Target.attachToTarget', {
      targetId,
      flatten: true,
    });
    await chrome.send('Page.enable', {}, sessionId);
    const frame = await chrome.send('Page.getFrameTree', {}, sessionId);
    await chrome.send(
      'Page.setDocumentContent',
      { frameId: frame.frameTree.frame.id, html: canaryHtml },
      sessionId,
    );
    const detected = new Set(
      (await chrome.evaluate(sessionId, expression)).issues.map(
        (issue) => issue.rule,
      ),
    );
    for (const rule of canaryRules)
      if (!detected.has(rule))
        throw new Error(`Regression detector calibration failed: ${rule}`);
    report.calibration = canaryRules;
    await chrome.send('Target.closeTarget', { targetId });
    const pending = [...selected];
    let aborted = false;
    async function worker() {
      const { browserContextId } = await chrome.send(
        'Target.createBrowserContext',
        { disposeOnDetach: true },
      );
      try {
        const { targetId } = await chrome.send('Target.createTarget', {
          url: 'about:blank',
          browserContextId,
        });
        const { sessionId: sid } = await chrome.send('Target.attachToTarget', {
          targetId,
          flatten: true,
        });
        await chrome.send('Page.enable', {}, sid);
        if (fontData.size) {
          chrome.events.set(sid, [
            (message) => {
              if (message.method !== 'Fetch.requestPaused') return;
              const font = fontData.get(message.params.request.url);
              const response = font
                ? chrome.send(
                    'Fetch.fulfillRequest',
                    {
                      requestId: message.params.requestId,
                      responseCode: 200,
                      responseHeaders: [
                        { name: 'Content-Type', value: 'font/woff2' },
                        { name: 'Access-Control-Allow-Origin', value: '*' },
                      ],
                      body: font.body,
                    },
                    sid,
                  )
                : chrome.send(
                    'Fetch.continueRequest',
                    { requestId: message.params.requestId },
                    sid,
                  );
              response.catch(() => {
                aborted = true;
              });
            },
          ]);
          await chrome.send(
            'Fetch.enable',
            {
              patterns: [...fontData.keys()].map((urlPattern) => ({
                urlPattern,
                requestStage: 'Request',
              })),
            },
            sid,
          );
        }
        while (!aborted && pending.length) {
          const row = pending.shift();
          const result = {
            url: row.url,
            source: row.source,
            states: [],
            errors: [],
          };
          try {
            const url = new URL(
              region === 'cn' ? row.url.replace(/^\/zh-CN/, '') : row.url,
              server.origin,
            ).href;
            await ready(chrome, sid, url);
            const detailed =
              row.acceptanceCase ||
              (await chrome.evaluate(sid, expression)).detailed;
            const viewports = detailed ? matrix : [matrix[0], matrix[4]];
            result.expectedStates = detailed ? matrix.length * 2 : 2;
            for (const viewport of viewports)
              for (const theme of detailed
                ? ['light', 'dark']
                : [viewport.name === 'desktop' ? 'light' : 'dark']) {
                await chrome.send(
                  'Emulation.setDeviceMetricsOverride',
                  {
                    width: viewport.width,
                    height: viewport.height,
                    deviceScaleFactor: 1,
                    mobile: false,
                  },
                  sid,
                );
                await chrome.send(
                  'Emulation.setEmulatedMedia',
                  {
                    features: [{ name: 'prefers-color-scheme', value: theme }],
                  },
                  sid,
                );
                await chrome.evaluate(
                  sid,
                  `document.documentElement.classList.toggle('dark', ${theme === 'dark'}); window.scrollTo(0,0)`,
                );
                await settle(chrome, sid);
                const evidence = await chrome.evaluate(sid, expression);
                result.states.push({
                  viewport: viewport.name,
                  width: viewport.width,
                  height: viewport.height,
                  theme,
                  ...evidence,
                });
                if (evidence.issues.length && !result.screenshot) {
                  const image = await chrome.send(
                    'Page.captureScreenshot',
                    { format: 'png' },
                    sid,
                  );
                  result.screenshot = `${digest(row.url).slice(0, 16)}.png`;
                  await writeFile(
                    path.join(out, result.screenshot),
                    Buffer.from(image.data, 'base64'),
                  );
                }
              }
            result.fieldInteraction = await nativeToggle(chrome, sid);
          } catch (error) {
            result.errors.push(String(error));
            if (
              /font|Chrome timeout|Chrome disconnected/i.test(String(error))
            ) {
              aborted = true;
              report.results.push(result);
              throw error;
            }
          }
          result.complete =
            result.states.length === result.expectedStates &&
            !result.errors.length;
          report.results.push(result);
          if (report.results.length % 100 === 0) {
            console.log(
              `API QA: ${report.results.length}/${selected.length} pages`,
            );
            await save();
          }
        }
      } finally {
        await chrome.send('Target.disposeBrowserContext', { browserContextId });
      }
    }
    const completed = await Promise.allSettled(
      Array.from({ length: workers }, worker),
    );
    const failed = completed.find((result) => result.status === 'rejected');
    if (failed) throw failed.reason;
    assertReceipt(receipt, {
      region,
      head: git('rev-parse', 'HEAD'),
      source: sourceFingerprint(),
      build: (await buildIdentity(root, region)).hash,
    });
    report.status =
      report.results.length === selected.length &&
      report.results.every(
        (result) =>
          result.complete &&
          result.states.every((state) => !state.issues.length),
      )
        ? 'PASS'
        : 'FAIL';
  } catch (error) {
    report.error = String(error);
  } finally {
    await chrome?.close();
    await server?.close();
    report.finishedAt = new Date().toISOString();
    await save();
  }
  console.log(
    JSON.stringify({
      status: report.status,
      region,
      scope,
      pages: report.results.length,
      states: report.results.reduce((n, result) => n + result.states.length, 0),
      out,
    }),
  );
  if (report.status !== 'PASS')
    throw new Error(`API quality ${report.status}: see ${out}/browser.json`);
}
export async function main() {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      region: { type: 'string' },
      scope: { type: 'string', default: 'smoke' },
      fonts: { type: 'string', default: 'fixture' },
      origin: { type: 'string' },
      root: { type: 'string', default: 'dist/client' },
      out: { type: 'string' },
      workers: { type: 'string', default: '4' },
      help: { type: 'boolean' },
    },
  });
  const mode = positionals[0] ?? 'run';
  if (values.help) {
    console.log(
      'bun run qa:api [source|run|prepare|seal|browser|checklist] --region cn|global [--scope smoke|all] [--root dist/client] [--out .agent/artifacts/...] [--workers 4] [--fonts fixture|remote] [--origin https://preview.example]\nrun = source checks + fresh production build + sealed browser audit. CI may prepare before its existing build, seal afterwards, then browser.',
    );
    return;
  }
  const region = values.region,
    locale = localeFor(region),
    out = values.out ?? `.agent/artifacts/api-reference-quality/${region}`;
  const workers = Number(values.workers);
  if (!Number.isInteger(workers) || workers < 1 || workers > 8)
    throw new Error('--workers must be 1..8');
  if (
    !['source', 'run', 'prepare', 'seal', 'browser', 'checklist'].includes(mode)
  )
    throw new Error(`Unknown mode: ${mode}`);
  await mkdir(out, { recursive: true });
  if (mode === 'checklist') {
    const origin = new URL(values.origin ?? 'http://127.0.0.1:3110');
    if (!['http:', 'https:'].includes(origin.protocol))
      throw new Error('Checklist origin must be HTTP(S)');
    const escapeHtml = (value) =>
      String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('"', '&quot;');
    const cases = readJson('scripts/api-reference-quality-cases.json');
    const html = cases
      .map((entry) => {
        const links = (entry.urls[region] ?? [])
          .map((url) => {
            const href = new URL(
              region === 'cn' ? url.replace(/^\/zh-CN/, '') : url,
              origin.origin,
            ).href;
            return `<li><a href="${escapeHtml(href)}">${escapeHtml(url)}</a></li>`;
          })
          .join('');
        return `<section><h2>${escapeHtml(entry.id)}: ${escapeHtml(entry.name)}</h2><ul>${links || '<li>N/A: renderer case absent from this locale</li>'}</ul><p>${escapeHtml(entry.accept)}</p><label><input type="checkbox"> Independently checked; record outcome in the PR</label></section>`;
      })
      .join('');
    await writeFile(
      path.join(out, 'acceptance.html'),
      `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>API reference acceptance</title><style>body{font:16px/1.7 system-ui;max-width:900px;margin:32px auto;padding:0 24px}section{border-top:1px solid #bbb;padding:18px 0}a{overflow-wrap:anywhere}input{width:22px;height:22px}</style><h1>API reference acceptance: ${region}</h1><p>Candidate checkout: ${git('rev-parse', 'HEAD')}. Verify that the preview serves this commit. Follow docs/api-reference-quality.md and record reviewer, browser, viewports, feedback outcomes and open debt. Checkboxes alone are not durable acceptance.</p>${html}`,
    );
    console.log(`${out}/acceptance.html`);
    return;
  }
  const receiptFile = path.join(out, 'build.json');
  if (['source', 'run', 'prepare'].includes(mode)) {
    const audit = sourceAudit();
    await writeFile(
      path.join(out, 'source.json'),
      JSON.stringify(
        {
          status: audit.unexpected.length
            ? 'FAIL'
            : audit.known.length
              ? 'PASS_WITH_DEBT'
              : 'PASS',
          head: git('rev-parse', 'HEAD'),
          ...audit,
        },
        null,
        2,
      ),
    );
    console.log(
      `Source QA: ${audit.unexpected.length} new, ${audit.known.length} known duplicate headings`,
    );
    if (audit.unexpected.length)
      throw new Error(`New source defects: see ${out}/source.json`);
    if (mode === 'source') return;
    await writeFile(
      receiptFile,
      JSON.stringify({
        region,
        locale,
        head: git('rev-parse', 'HEAD'),
        source: sourceFingerprint(),
      }),
    );
    if (mode === 'prepare') return;
    execFileSync('bun', ['run', 'build'], {
      stdio: 'inherit',
      env: { ...process.env, VITE_DOCS_REGION: region },
    });
  }
  if (['run', 'seal'].includes(mode)) {
    const receipt = readJson(receiptFile);
    assertReceipt(receipt, {
      region,
      head: git('rev-parse', 'HEAD'),
      source: sourceFingerprint(),
      build: receipt.build,
    });
    const identity = await buildIdentity(values.root, region);
    await writeFile(
      receiptFile,
      JSON.stringify(
        {
          ...receipt,
          build: identity.hash,
          pages: identity.rows.length,
          builtAt: new Date().toISOString(),
        },
        null,
        2,
      ),
    );
    if (mode === 'seal') return;
  }
  const receipt = readJson(receiptFile);
  if (!receipt.build) throw new Error('Build receipt not sealed; build first');
  await browserAudit({ ...values, out, region, workers, receipt });
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
)
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
