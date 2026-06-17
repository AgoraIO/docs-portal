import fs from 'node:fs';
import path from 'node:path';

const DEFAULT_STATIC_ROOT = path.join('.vercel', 'output', 'static');
const DEFAULT_DOCS_ROOT = path.join('content', 'docs');
const ASSET_FILE_PATTERN = /\.(png|jpe?g|webp|gif|svg)$/i;
const DOC_FILE_PATTERN = /\.(md|mdx)$/i;
const TEXT_FILE_PATTERN = /\.(html|js|css|json|xml|txt|map)$/i;
const INDEX_FILE_PATTERN = /^index\.(md|mdx)$/i;

if (isMainModule()) {
  main();
}

export function main({
  cwd = process.cwd(),
  docsRoot = path.join(cwd, DEFAULT_DOCS_ROOT),
  staticRoot = path.join(cwd, DEFAULT_STATIC_ROOT),
} = {}) {
  const report = buildStaticAssetAudit({
    docsRoot,
    staticRoot,
  });

  process.stdout.write(`${formatAuditReport(report)}\n`);
}

export function buildStaticAssetAudit({ docsRoot, staticRoot }) {
  const assetPaths = listFiles(staticRoot, ASSET_FILE_PATTERN).map((filePath) =>
    normalizeSlashes(path.relative(staticRoot, filePath)),
  );
  const staticAssetRefs = collectStaticAssetRefs(staticRoot, assetPaths);
  const docsFiles = listFiles(docsRoot, DOC_FILE_PATTERN);
  const docRefsByAssetPath = collectDocRefsByAssetPath({
    assetPaths,
    docsFiles,
    docsRoot,
    staticRoot,
  });
  const entries = assetPaths
    .map((assetPath) =>
      buildAssetEntry({
        assetPath,
        docRefs: docRefsByAssetPath.get(assetPath) ?? [],
        isReferencedByStaticOutput: staticAssetRefs.has(assetPath),
        staticRoot,
      }),
    )
    .sort(compareEntriesBySize);

  const summary = summarizeEntries(entries);

  return {
    entries,
    summary,
  };
}

export function formatAuditReport(report) {
  const lines = [
    '# Static Asset Audit',
    '',
    `assets: ${report.summary.assetCount}`,
    `referencedByStaticOutput: ${report.summary.referencedByStaticOutputCount}`,
    `unreferencedByStaticOutput: ${report.summary.unreferencedByStaticOutputCount}`,
    `noDocsRefs: ${report.summary.noDocsRefs.count} (${report.summary.noDocsRefs.bytes} bytes)`,
    `onlyNonPrerenderedDocRefs: ${report.summary.onlyNonPrerenderedDocRefs.count} (${report.summary.onlyNonPrerenderedDocRefs.bytes} bytes)`,
    `hasPrerenderedDocRefs: ${report.summary.hasPrerenderedDocRefs.count} (${report.summary.hasPrerenderedDocRefs.bytes} bytes)`,
  ];

  appendSection(lines, 'Top No-Docs-Ref Candidates', report.entries, (entry) => {
    return (
      !entry.isReferencedByStaticOutput &&
      entry.docRefs.length === 0
    );
  });
  appendSection(
    lines,
    'Top Only-Non-Prerendered-Doc-Ref Candidates',
    report.entries,
    (entry) =>
      !entry.isReferencedByStaticOutput &&
      entry.docRefs.length > 0 &&
      entry.docRefs.every((ref) => !ref.isPrerendered),
  );
  appendSection(lines, 'Top Has-Prerendered-Doc-Refs', report.entries, (entry) => {
    return (
      !entry.isReferencedByStaticOutput &&
      entry.docRefs.some((ref) => ref.isPrerendered)
    );
  });

  return lines.join('\n');
}

export function getDocRoute(contentPath) {
  const segments = normalizeSlashes(contentPath).split('/');
  const fileName = segments.pop();

  if (!fileName) {
    return null;
  }

  if (!INDEX_FILE_PATTERN.test(fileName)) {
    segments.push(fileName.replace(DOC_FILE_PATTERN, ''));
  }

  return `/${segments.join('/')}`;
}

export function isDocRoutePrerendered(route) {
  if (isRedirectOnlyAliasRoute(route)) {
    return false;
  }

  if (isLegacyBestPracticesRedirectRoute(route)) {
    return false;
  }

  if (isRtcAndroidApiReferenceRoute(route)) {
    return /^\/(en|zh-CN)\/api-reference\/rtc\/android$/.test(route);
  }

  if (isConversationalAiApiReferenceRoute(route)) {
    return /^\/(en|zh-CN)\/api-reference\/conversational-ai(?:\/(client-toolkit|rest-api(?:\/agent)?|server-sdk))?$/.test(
      route,
    );
  }

  if (isAiModelsRoute(route)) {
    return /^\/(en|zh-CN)\/ai\/models(?:\/(asr|avatar|llm|mllm|tts))?$/.test(
      route,
    );
  }

  if (isAiBuildRoute(route)) {
    return /^\/(en|zh-CN)\/ai\/build$/.test(route);
  }

  if (isAiStudioRoute(route)) {
    return /^\/en\/ai\/studio$/.test(route);
  }

  if (isAiDeviceKitRoute(route)) {
    return /^\/(en|zh-CN)\/ai\/device-kit$/.test(route);
  }

  if (isRtmApiReferenceRoute(route)) {
    return /^\/(en|zh-CN)\/api-reference\/rtm$/.test(route);
  }

  if (isMeetingApiReferenceRoute(route)) {
    return /^\/en\/api-reference\/meeting$/.test(route);
  }

  if (isWhiteboardApiReferenceRoute(route)) {
    return /^\/(en|zh-CN)\/api-reference\/whiteboard$/.test(route);
  }

  if (isRecipesApiReferenceRoute(route)) {
    return /^\/(en|zh-CN)\/api-reference\/recipes$/.test(route);
  }

  if (isMultiPlatformApiReferenceRoute(route)) {
    return /^\/en\/api-reference\/(im|micro-calling|online-art-teaching|online-ktv|online-music-teaching|private-room|rtc-server-sdk|rtsa)$/.test(
      route,
    );
  }

  if (isRealtimeMediaRtcRoute(route)) {
    return /^\/(en|zh-CN)\/realtime-media\/rtc(?:\/(android|macOS))?$/.test(
      route,
    );
  }

  return true;
}

function buildAssetEntry({
  assetPath,
  docRefs,
  isReferencedByStaticOutput,
  staticRoot,
}) {
  const size = fs.statSync(path.join(staticRoot, assetPath)).size;

  return {
    assetPath,
    docRefs,
    isReferencedByStaticOutput,
    size,
  };
}

function summarizeEntries(entries) {
  const summary = {
    assetCount: entries.length,
    referencedByStaticOutputCount: 0,
    unreferencedByStaticOutputCount: 0,
    noDocsRefs: { bytes: 0, count: 0 },
    onlyNonPrerenderedDocRefs: { bytes: 0, count: 0 },
    hasPrerenderedDocRefs: { bytes: 0, count: 0 },
  };

  for (const entry of entries) {
    if (entry.isReferencedByStaticOutput) {
      summary.referencedByStaticOutputCount += 1;
      continue;
    }

    summary.unreferencedByStaticOutputCount += 1;

    if (entry.docRefs.length === 0) {
      summary.noDocsRefs.count += 1;
      summary.noDocsRefs.bytes += entry.size;
      continue;
    }

    if (entry.docRefs.some((ref) => ref.isPrerendered)) {
      summary.hasPrerenderedDocRefs.count += 1;
      summary.hasPrerenderedDocRefs.bytes += entry.size;
      continue;
    }

    summary.onlyNonPrerenderedDocRefs.count += 1;
    summary.onlyNonPrerenderedDocRefs.bytes += entry.size;
  }

  return summary;
}

function collectStaticAssetRefs(staticRoot, assetPaths) {
  const refs = new Set();
  const textFiles = listFiles(staticRoot, TEXT_FILE_PATTERN);

  for (const filePath of textFiles) {
    const text = fs.readFileSync(filePath, 'utf8');

    for (const assetPath of assetPaths) {
      if (text.includes(`/${assetPath}`)) {
        refs.add(assetPath);
      }
    }
  }

  return refs;
}

function collectDocRefsByAssetPath({ assetPaths, docsFiles, docsRoot, staticRoot }) {
  const refsByAssetPath = new Map();

  for (const filePath of docsFiles) {
    const contentPath = normalizeSlashes(path.relative(docsRoot, filePath));
    const routePath = getDocRoute(contentPath);
    const text = fs.readFileSync(filePath, 'utf8');

    for (const assetPath of assetPaths) {
      if (!text.includes(`/${assetPath}`)) {
        continue;
      }

      const refs = refsByAssetPath.get(assetPath) ?? [];
      const staticHtmlPath = routePath
        ? path.join(staticRoot, routePath.slice(1), 'index.html')
        : null;

      refs.push({
        contentPath,
        isBuilt: staticHtmlPath ? fs.existsSync(staticHtmlPath) : false,
        isPrerendered: routePath ? isDocRoutePrerendered(routePath) : false,
        routePath,
      });
      refsByAssetPath.set(assetPath, refs);
    }
  }

  return refsByAssetPath;
}

function appendSection(lines, title, entries, predicate, maxEntries = 12) {
  lines.push('');
  lines.push(`## ${title}`);
  const sectionEntries = entries.filter(predicate).slice(0, maxEntries);

  if (sectionEntries.length === 0) {
    lines.push('none');
    return;
  }

  for (const entry of sectionEntries) {
    lines.push(`- ${entry.assetPath} (${entry.size} bytes)`);

    if (entry.docRefs.length === 0) {
      lines.push('  refs: none');
      continue;
    }

    for (const ref of entry.docRefs.slice(0, 3)) {
      lines.push(
        `  ref: ${ref.routePath} prerender=${ref.isPrerendered} built=${ref.isBuilt} file=${ref.contentPath}`,
      );
    }
  }
}

function listFiles(root, pattern) {
  const files = [];

  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    const entryPath = path.join(root, entry.name);

    if (entry.isDirectory()) {
      files.push(...listFiles(entryPath, pattern));
      continue;
    }

    if (pattern.test(entry.name)) {
      files.push(entryPath);
    }
  }

  return files.sort();
}

function compareEntriesBySize(left, right) {
  return right.size - left.size || left.assetPath.localeCompare(right.assetPath);
}

function normalizeSlashes(value) {
  return value.split(path.sep).join('/');
}

function isRedirectOnlyAliasRoute(route) {
  return (
    route === '/en/ai/conversational-ai' ||
    route === '/en/ai/choose-your-path/quickstart-coding' ||
    route === '/en/ai/device-kit' ||
    route === '/en/ai/choose-your-path/quickstart-device-kit' ||
    route === '/zh-CN/ai/device-kit' ||
    route === '/en/api-reference/voice-ai-recipes' ||
    route === '/zh-CN/api-reference/voice-ai-recipes' ||
    route === '/en/best-practices/audio-settings' ||
    route === '/zh-CN/best-practices/audio-settings' ||
    route === '/en/best-practices/opt-latency' ||
    route === '/zh-CN/best-practices/opt-latency' ||
    route === '/en/best-practices/http-basic-auth' ||
    route === '/zh-CN/best-practices/http-basic-auth'
  );
}

function isLegacyBestPracticesRedirectRoute(route) {
  return (
    route === '/en/best-practices/geofencing' ||
    route === '/zh-CN/best-practices/geofencing' ||
    route === '/zh-CN/best-practices/release-notes'
  );
}

function isRtcAndroidApiReferenceRoute(route) {
  return route.includes('/api-reference/rtc/android/');
}

function isConversationalAiApiReferenceRoute(route) {
  return /^\/(en|zh-CN)\/api-reference\/conversational-ai(?:\/|$)/.test(route);
}

function isAiModelsRoute(route) {
  return /^\/(en|zh-CN)\/ai\/models(?:\/|$)/.test(route);
}

function isAiBuildRoute(route) {
  return /^\/(en|zh-CN)\/ai\/build(?:\/|$)/.test(route);
}

function isAiStudioRoute(route) {
  return /^\/en\/ai\/studio(?:\/|$)/.test(route);
}

function isAiDeviceKitRoute(route) {
  return /^\/(en|zh-CN)\/ai\/device-kit(?:\/|$)/.test(route);
}

function isRtmApiReferenceRoute(route) {
  return /^\/(en|zh-CN)\/api-reference\/rtm(?:\/|$)/.test(route);
}

function isMeetingApiReferenceRoute(route) {
  return /^\/en\/api-reference\/meeting(?:\/|$)/.test(route);
}

function isWhiteboardApiReferenceRoute(route) {
  return /^\/(en|zh-CN)\/api-reference\/whiteboard(?:\/|$)/.test(route);
}

function isRecipesApiReferenceRoute(route) {
  return /^\/(en|zh-CN)\/api-reference\/recipes(?:\/|$)/.test(route);
}

function isMultiPlatformApiReferenceRoute(route) {
  return /^\/en\/api-reference\/(im|micro-calling|online-art-teaching|online-ktv|online-music-teaching|private-room|rtc-server-sdk|rtsa)(?:\/|$)/.test(
    route,
  );
}

function isRealtimeMediaRtcRoute(route) {
  return /^\/(en|zh-CN)\/realtime-media\/rtc(?:\/|$)/.test(route);
}

function isMainModule() {
  return import.meta.url === pathToFileUrl(process.argv[1]);
}

function pathToFileUrl(filePath) {
  return filePath ? new URL(`file://${path.resolve(filePath)}`).href : '';
}
