import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { pathToFileURL } from 'node:url';
import { auditDocsLinks } from './audit-doc-links.mjs';

const DEFAULT_OUTPUT_PATH =
  'docs/agents/reports/2026-06-30-doc-link-strict-classification.md';
const DEFAULT_MAX_SAMPLES = 8;

const BUCKET_ORDER = [
  'true-missing-internal-route',
  'missing-hash-anchor',
  'stale-legacy-docs-path',
  'hosted-api-reference-route',
  'current-version-api-reference-alias',
  'unresolved-template-variable',
  'md-mdx-route-normalization',
];

const BUCKET_DEFINITIONS = {
  'true-missing-internal-route': {
    fixBucket: 'content-fix/manual-review',
    title: 'True missing internal routes',
  },
  'missing-hash-anchor': {
    fixBucket: 'content-fix/manual-review',
    title: 'Missing hash anchors',
  },
  'stale-legacy-docs-path': {
    fixBucket: 'content-fix/manual-review',
    title: 'Stale legacy docs paths/redirect candidates',
  },
  'hosted-api-reference-route': {
    fixBucket: 'audit-script-fix',
    title: 'Hosted/API-reference routes',
  },
  'current-version-api-reference-alias': {
    fixBucket: 'audit-script-fix/manual-review',
    title: 'Current-version API-reference alias/parser cases',
  },
  'unresolved-template-variable': {
    fixBucket: 'content-fix/manual-review',
    title: 'Unresolved template variables',
  },
  'md-mdx-route-normalization': {
    fixBucket: 'mixed',
    title: '.md/.mdx route normalization issues',
  },
};

const HOSTED_API_REFERENCE_ROUTE_PATTERN =
  /^\/(?:en|zh-CN)\/api-reference\/(?:rtc|whiteboard)(?:\/|$)/;
const CURRENT_VERSION_API_REFERENCE_ALIAS_PATTERN = /\(current(?:\)|$)/;
const TEMPLATE_VARIABLE_PATTERN = /\{\{?\s*(?:Global|global)\.[^}\s]+\}?\}/;
const MARKDOWN_EXTENSION_PATTERN = /\.mdx?(?:[#?]|$)/i;
const STALE_LEGACY_ROUTE_PATTERNS = [
  /^\/doc\//,
  /^\/help(?:\/|$)/,
  /^\/(?:en|zh-CN)\/3\.x\//,
  /^\/(?:en\/)?video-calling(?:\/|$)/,
  /^\/(?:en\/)?interactive-live-streaming(?:\/|$)/,
  /^\/(?:en\/)?cloud-recording(?:\/|$)/,
  /^\/(?:en\/)?on-premise-recording(?:\/|$)/,
  /^\/(?:en\/)?signaling(?:\/|$)/,
  /^\/(?:en\/)?agora-analytics(?:\/|$)/,
  /^\/(?:en|zh-CN)\/realtime-media\/rtc\//,
  /^\/media-push(?:\/|$)/,
  /^\/sdks(?:\/|$)/,
  /^\/api-reference(?:\/|$)/,
];

const LAUNCH_GATES = [
  {
    id: 'voice-agent',
    label: 'Voice Agent',
    scope: '`content/docs/{en,zh-CN}/ai/**`',
    sourcePathPattern: /^(?:en|zh-CN)\/ai\//,
  },
  {
    id: 'rtc-voice-video',
    label: 'RTC Voice/Video',
    scope: '`content/docs/{en,zh-CN}/realtime-media/{voice,video}/**`',
    sourcePathPattern: /^(?:en|zh-CN)\/realtime-media\/(?:voice|video)\//,
  },
];

export function classifyDocLinkStats(
  stats,
  {
    docsRoot = path.join(process.cwd(), 'content', 'docs'),
    routePaths = getContentRoutePathsForAudit(docsRoot),
  } = {},
) {
  const buckets = createBuckets();
  const invalidInternalLinks = list(stats.invalidInternalLinks);
  const classifiedInvalidInternalLinks = [];

  for (const entry of invalidInternalLinks) {
    const bucketId = classifyInvalidInternalLink(entry);
    const classifiedEntry = enrichClassifiedEntry(entry, {
      bucketId,
      routePaths,
    });

    buckets[bucketId].entries.push(classifiedEntry);
    classifiedInvalidInternalLinks.push(classifiedEntry);
  }

  for (const bucket of Object.values(buckets)) {
    bucket.count = bucket.entries.length;
    bucket.safeAutomatedCount = countSafeAutomatedEntries(bucket);
    bucket.manualReviewCount = bucket.count - bucket.safeAutomatedCount;
    bucket.topTargets = getTopTargetPrefixes(bucket.entries);
  }

  const auditScriptFixCount =
    buckets['hosted-api-reference-route'].safeAutomatedCount +
    buckets['current-version-api-reference-alias'].safeAutomatedCount +
    buckets['md-mdx-route-normalization'].safeAutomatedCount;
  const contentFixManualReviewCount =
    invalidInternalLinks.length - auditScriptFixCount;

  return {
    buckets,
    fixBuckets: {
      auditScriptFix: auditScriptFixCount,
      contentFixManualReview: contentFixManualReviewCount,
    },
    intentionalRoutes: getIntentionalRouteCounts(stats),
    launchGates: getLaunchGates(classifiedInvalidInternalLinks),
    stats: getStatsSummary(stats),
  };
}

export function formatClassificationReport(
  classification,
  { maxSamples = DEFAULT_MAX_SAMPLES } = {},
) {
  const lines = [
    '# Docs Link Strict Failure Classification',
    '',
    'Generated from `scripts/audit-doc-links.mjs` stats. This report classifies current `docs:links:strict` failures before any broad broken-link cleanup.',
    '',
    'Regenerate with:',
    '',
    '```bash',
    'bun run docs:links:classify',
    '```',
    '',
    'Check drift with:',
    '',
    '```bash',
    'bun run docs:links:classify:check',
    '```',
    '',
    '## Audit Baseline',
    '',
    `- Docs files scanned: ${classification.stats.docsFiles}`,
    `- Total links scanned: ${classification.stats.totalLinks}`,
    `- Invalid internal links: ${classification.stats.invalidInternalLinks}`,
    `- Missing internal paths: ${classification.stats.missingInternalPaths}`,
    `- Missing hash anchors: ${classification.stats.missingHashAnchors}`,
    `- Missing root links: ${classification.stats.missingRootLinks}`,
    `- Missing relative Markdown links: ${classification.stats.missingRelativeMarkdownLinks}`,
    '',
    '## Strict Failure Buckets',
    '',
    'Buckets are exclusive. Hash failures are counted first; unresolved template variables, `.md/.mdx` normalization issues, current-version API-reference alias/parser cases, hosted/API-reference candidates, and stale legacy paths are removed before the remaining failures are counted as true missing internal routes.',
    '',
    '| Bucket | Count | Fix bucket | Safe automated | Manual review |',
    '| --- | ---: | --- | ---: | ---: |',
  ];

  for (const bucketId of BUCKET_ORDER) {
    const bucket = classification.buckets[bucketId];

    lines.push(
      `| ${bucket.title} | ${bucket.count} | ${bucket.fixBucket} | ${bucket.safeAutomatedCount} | ${bucket.manualReviewCount} |`,
    );
  }

  lines.push(
    '',
    '## Content-Fix vs Audit-Script-Fix',
    '',
    `- Audit-script-fix candidates: ${classification.fixBuckets.auditScriptFix}`,
    `- Content-fix/manual-review candidates: ${classification.fixBuckets.contentFixManualReview}`,
    '',
    'Audit-script-fix candidates are links the current strict audit should classify more precisely before content cleanup starts. Content-fix/manual-review candidates still need page-level decisions.',
    '',
    '## Intentional Valid Route Handling',
    '',
    '| Class | Count | Notes |',
    '| --- | ---: | --- |',
    `| Hosted references already skipped | ${classification.intentionalRoutes.hostedReferenceSkipped} | Existing \`hosted-reference\` skips from \`audit-doc-links\`. |`,
    `| Generated OpenAPI routes resolved | ${classification.intentionalRoutes.generatedOpenApiRoutes} | Existing \`openapi-route\` resolutions. |`,
    `| Known redirect routes resolved | ${classification.intentionalRoutes.knownRedirectRoutes} | Existing \`redirect\` resolutions. |`,
    `| Route-resolved relative Markdown links | ${classification.intentionalRoutes.routeResolvedRelativeMarkdownLinks} | Relative \`.md/.mdx\` links that already resolve through route normalization. |`,
    `| Legacy paths already normalized/resolved | ${classification.intentionalRoutes.legacyPathsAlreadyResolved} | Existing legacy normalizer coverage; do not rewrite these during issue #564. |`,
    `| API-reference macro links already skipped | ${classification.intentionalRoutes.apiReferenceMacroLinks} | Existing \`{{Global.API_REF_*}}\` / \`{{global.API_REF_*}}\` skips from \`audit-doc-links\`. |`,
    '',
    '## Safe Automated Fixes',
    '',
    `- Audit policy: treat hosted API-reference route prefixes as intentional when ownership confirms they are externally hosted or generated. Current safe candidate count: ${classification.buckets['hosted-api-reference-route'].safeAutomatedCount}.`,
    `- Audit normalization: strip root-link \`.md/.mdx\` suffixes only when the extensionless route exists. Current safe candidate count: ${classification.buckets['md-mdx-route-normalization'].safeAutomatedCount}.`,
    '- Report refresh: rerun the classifier and review drift before changing launch gates.',
    '',
    '## Manual Review Required',
    '',
    `- Missing hash anchors: ${classification.buckets['missing-hash-anchor'].count}. Confirm the intended heading or update the link target.`,
    `- True missing internal routes: ${classification.buckets['true-missing-internal-route'].count}. Decide whether to restore content, redirect, or remove the link.`,
    `- Stale legacy docs paths/redirect candidates: ${classification.buckets['stale-legacy-docs-path'].count}. Add deterministic redirect mappings only after confirming the replacement route.`,
    `- Unresolved template variables: ${classification.buckets['unresolved-template-variable'].count}. Replace legacy \`{{Global.*}}\` style values with concrete hosted API-reference URLs or supported variables.`,
    `- Current-version API-reference alias/parser cases: ${classification.buckets['current-version-api-reference-alias'].manualReviewCount}. These require audit parser/alias review before being treated as intentional hosted links.`,
    `- Remaining \`.md/.mdx\` normalization issues: ${classification.buckets['md-mdx-route-normalization'].manualReviewCount}. These do not resolve after extension stripping and need page-level review.`,
    '',
    '## Launch Gate',
    '',
    '| Gate | Scope | Blocking invalid links | Audit-script candidates | Content/manual candidates | Status |',
    '| --- | --- | ---: | ---: | ---: | --- |',
  );

  for (const gate of classification.launchGates) {
    lines.push(
      `| ${gate.label} | ${gate.scope} | ${gate.blockingInvalidLinks} | ${gate.auditScriptCandidates} | ${gate.contentManualCandidates} | ${gate.status} |`,
    );
  }

  lines.push(
    '',
    'Launch rule: Voice Agent and RTC Voice/Video can launch only when their scoped blocking invalid links are zero, or when remaining links are explicitly classified as intentional hosted/API-reference audit-policy skips. Do not use unrelated broad-link cleanup to satisfy this gate.',
    '',
    '## Bucket Samples',
  );

  for (const bucketId of BUCKET_ORDER) {
    appendBucketSamples(lines, classification.buckets[bucketId], maxSamples);
  }

  return `${lines.join('\n')}\n`;
}

function createBuckets() {
  return Object.fromEntries(
    BUCKET_ORDER.map((bucketId) => [
      bucketId,
      {
        ...BUCKET_DEFINITIONS[bucketId],
        count: 0,
        entries: [],
        id: bucketId,
        manualReviewCount: 0,
        safeAutomatedCount: 0,
        topTargets: [],
      },
    ]),
  );
}

function classifyInvalidInternalLink(entry) {
  if (
    entry.reason === 'missing-hash-anchor' ||
    entry.reason === 'empty-hash-anchor'
  ) {
    return 'missing-hash-anchor';
  }

  if (isUnresolvedTemplateVariable(entry)) {
    return 'unresolved-template-variable';
  }

  if (isMarkdownExtensionRouteIssue(entry)) {
    return 'md-mdx-route-normalization';
  }

  if (isCurrentVersionApiReferenceAlias(entry)) {
    return 'current-version-api-reference-alias';
  }

  if (isHostedApiReferenceRouteCandidate(entry)) {
    return 'hosted-api-reference-route';
  }

  if (isStaleLegacyDocsPath(entry)) {
    return 'stale-legacy-docs-path';
  }

  return 'true-missing-internal-route';
}

function enrichClassifiedEntry(entry, { bucketId, routePaths }) {
  if (bucketId === 'hosted-api-reference-route') {
    return {
      ...entry,
      safeAutomated: !isCurrentVersionApiReferenceAlias(entry),
    };
  }

  if (bucketId === 'current-version-api-reference-alias') {
    return {
      ...entry,
      safeAutomated: false,
    };
  }

  if (bucketId !== 'md-mdx-route-normalization') {
    return entry;
  }

  const routeCandidate = getMarkdownRouteCandidate(entry);
  const routePath = routeCandidate ? splitHref(routeCandidate).path : '';

  return {
    ...entry,
    routeCandidate,
    safeAutomated: Boolean(routePath && routePaths.has(routePath)),
  };
}

function countSafeAutomatedEntries(bucket) {
  if (bucket === undefined) return 0;

  return bucket.entries.filter((entry) => entry.safeAutomated).length;
}

function getIntentionalRouteCounts(stats) {
  const rootLinks = list(stats.rootLinks);
  const relativeMarkdownLinks = list(stats.relativeMarkdownLinks);
  const resolvedLinks = [...rootLinks, ...relativeMarkdownLinks];

  return {
    generatedOpenApiRoutes: resolvedLinks.filter(
      (entry) => entry.resolution === 'openapi-route',
    ).length,
    hostedReferenceSkipped: list(stats.skippedRootLinks).length,
    knownRedirectRoutes: resolvedLinks.filter(
      (entry) => entry.resolution === 'redirect',
    ).length,
    apiReferenceMacroLinks: list(stats.apiReferenceMacroLinks).length,
    legacyPathsAlreadyResolved: resolvedLinks.filter((entry) =>
      isStaleLegacyHref(entry.href),
    ).length,
    routeResolvedRelativeMarkdownLinks: list(
      stats.resolvedRelativeMarkdownLinks,
    ).length,
  };
}

function getLaunchGates(classifiedInvalidInternalLinks) {
  return LAUNCH_GATES.map((gate) => {
    const scopedEntries = classifiedInvalidInternalLinks.filter((entry) =>
      gate.sourcePathPattern.test(entry.sourcePath),
    );
    const auditScriptCandidates = scopedEntries.filter((entry) => {
      return Boolean(entry.safeAutomated);
    }).length;

    return {
      auditScriptCandidates,
      blockingInvalidLinks: scopedEntries.length,
      contentManualCandidates: scopedEntries.length - auditScriptCandidates,
      label: gate.label,
      scope: gate.scope,
      status:
        scopedEntries.length === 0 ||
        scopedEntries.length === auditScriptCandidates
          ? 'pass'
          : 'blocked',
    };
  });
}

function getStatsSummary(stats) {
  return {
    docsFiles: numberStat(stats.docsFiles),
    invalidInternalLinks: list(stats.invalidInternalLinks).length,
    missingHashAnchors: list(stats.missingHashLinks).length,
    missingInternalPaths: list(stats.invalidInternalLinks).filter(
      (entry) => entry.reason === 'missing-internal-path',
    ).length,
    missingRelativeMarkdownLinks: list(stats.missingRelativeMarkdownLinks)
      .length,
    missingRootLinks: list(stats.missingRootLinks).length,
    totalLinks: numberStat(stats.totalLinks),
  };
}

function appendBucketSamples(lines, bucket, maxSamples) {
  lines.push('', `### ${bucket.title}`, '');

  if (bucket.count === 0 || maxSamples === 0) {
    lines.push(bucket.count === 0 ? 'None.' : 'Samples omitted.');
    return;
  }

  if (bucket.topTargets.length > 0) {
    lines.push('Top target prefixes:');
    for (const [prefix, count] of bucket.topTargets.slice(0, 5)) {
      lines.push(`- \`${prefix}\`: ${count}`);
    }
    lines.push('');
  }

  lines.push('Samples:');
  for (const entry of bucket.entries.slice(0, maxSamples)) {
    const safeSuffix =
      entry.safeAutomated === undefined
        ? ''
        : ` | safeAutomated: ${entry.safeAutomated}`;
    const routeCandidateSuffix = entry.routeCandidate
      ? ` | routeCandidate: ${entry.routeCandidate}`
      : '';

    lines.push(
      `- source: \`${entry.sourcePath}\` | target: \`${targetOf(entry)}\` | reason: \`${entry.reason}\` | href: \`${entry.href}\`${routeCandidateSuffix}${safeSuffix}`,
    );
  }

  if (bucket.count > maxSamples) {
    lines.push(`- ... ${bucket.count - maxSamples} more`);
  }
}

function getTopTargetPrefixes(entries) {
  const counts = new Map();

  for (const entry of entries) {
    const prefix = getTargetPrefix(targetOf(entry));

    counts.set(prefix, (counts.get(prefix) ?? 0) + 1);
  }

  return [...counts.entries()].sort(
    ([leftKey, leftCount], [rightKey, rightCount]) =>
      rightCount - leftCount || leftKey.localeCompare(rightKey),
  );
}

function getTargetPrefix(target) {
  const pathOnly = splitHref(target).path;
  const segments = pathOnly.split('/').filter(Boolean);

  if (segments.length === 0) {
    return target || '(empty)';
  }

  return `/${segments.slice(0, 4).join('/')}`;
}

function isHostedApiReferenceRouteCandidate(entry) {
  return HOSTED_API_REFERENCE_ROUTE_PATTERN.test(targetOf(entry));
}

function isCurrentVersionApiReferenceAlias(entry) {
  return entryValues(entry).some((value) =>
    CURRENT_VERSION_API_REFERENCE_ALIAS_PATTERN.test(value),
  );
}

function isUnresolvedTemplateVariable(entry) {
  return entryValues(entry).some((value) =>
    TEMPLATE_VARIABLE_PATTERN.test(value),
  );
}

function isMarkdownExtensionRouteIssue(entry) {
  return entryValues(entry).some((value) =>
    MARKDOWN_EXTENSION_PATTERN.test(value),
  );
}

function isStaleLegacyDocsPath(entry) {
  return entryValues(entry).some((value) => isStaleLegacyHref(value));
}

function isStaleLegacyHref(href) {
  const hrefPath = splitHref(href).path;

  return STALE_LEGACY_ROUTE_PATTERNS.some((pattern) => pattern.test(hrefPath));
}

function getMarkdownRouteCandidate(entry) {
  const target = targetOf(entry);
  const strippedTarget = stripMarkdownExtensionFromPath(target);

  if (strippedTarget) {
    return strippedTarget;
  }

  if (MARKDOWN_EXTENSION_PATTERN.test(entry.href ?? '')) {
    return target;
  }

  return '';
}

function stripMarkdownExtensionFromPath(href) {
  const parsed = splitHref(href);
  const strippedPath = parsed.path.replace(/\.mdx?$/i, '');

  if (strippedPath === parsed.path) {
    return '';
  }

  return `${strippedPath}${parsed.search}${parsed.hash}`;
}

function targetOf(entry) {
  return entry.target ?? entry.normalizedHref ?? entry.href ?? '';
}

function entryValues(entry) {
  return [entry.href, entry.target, entry.normalizedHref].filter(Boolean);
}

function list(value) {
  return Array.isArray(value) ? value : [];
}

function numberStat(value) {
  return Number.isFinite(value) ? value : 0;
}

function getContentRoutePathsForAudit(docsRoot) {
  const routePaths = new Set();

  for (const filePath of listMarkdownFiles(docsRoot)) {
    const routePath = getRoutePath(toContentPath(docsRoot, filePath));

    if (routePath) {
      routePaths.add(routePath);
    }
  }

  return routePaths;
}

function listMarkdownFiles(root) {
  const results = [];

  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    const fullPath = path.join(root, entry.name);

    if (entry.isDirectory()) {
      results.push(...listMarkdownFiles(fullPath));
      continue;
    }

    if (/\.(md|mdx)$/i.test(entry.name)) {
      results.push(fullPath);
    }
  }

  return results.sort();
}

function toContentPath(docsRoot, filePath) {
  return path.relative(docsRoot, filePath).split(path.sep).join(path.posix.sep);
}

function getRoutePath(contentPath) {
  const segments = contentPath.split('/').filter(Boolean);
  const [locale, tab, ...rest] = segments;
  const fileName = rest.at(-1);

  if (!locale || !tab || !fileName) {
    return '';
  }

  const slugSegments =
    fileName === 'index.md' || fileName === 'index.mdx'
      ? rest.slice(0, -1)
      : [...rest.slice(0, -1), fileName.replace(/\.mdx?$/i, '')];

  return `/${[locale, tab, ...slugSegments].filter(Boolean).join('/')}`;
}

function splitHref(href) {
  const hashIndex = href.indexOf('#');
  const beforeHash = hashIndex === -1 ? href : href.slice(0, hashIndex);
  const hash = hashIndex === -1 ? '' : href.slice(hashIndex);
  const searchIndex = beforeHash.indexOf('?');

  if (searchIndex === -1) {
    return { hash, path: beforeHash, search: '' };
  }

  return {
    hash,
    path: beforeHash.slice(0, searchIndex),
    search: beforeHash.slice(searchIndex),
  };
}

function parseArgs(args) {
  return {
    check: args.includes('--check'),
    docsRoot:
      args.find((arg) => arg.startsWith('--docs-root='))?.slice(12) ??
      path.join(process.cwd(), 'content', 'docs'),
    maxSamples: parseNumberArg(args, '--max-samples=', DEFAULT_MAX_SAMPLES),
    out:
      args.find((arg) => arg.startsWith('--out='))?.slice(6) ??
      DEFAULT_OUTPUT_PATH,
  };
}

function parseNumberArg(args, prefix, fallback) {
  const rawValue = args
    .find((arg) => arg.startsWith(prefix))
    ?.slice(prefix.length);
  const parsed = Number.parseInt(rawValue ?? `${fallback}`, 10);

  return Number.isFinite(parsed) ? parsed : fallback;
}

function writeOrCheckReport({ check, out, report }) {
  if (check) {
    const existing = fs.existsSync(out) ? fs.readFileSync(out, 'utf8') : '';

    if (existing !== report) {
      console.error(`${out} is stale. Run bun run docs:links:classify.`);
      process.exitCode = 1;
      return;
    }

    console.log(`${out} is current.`);
    return;
  }

  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, report);
  console.log(`Wrote ${out}.`);
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const stats = auditDocsLinks({ docsRoot: options.docsRoot });
  const classification = classifyDocLinkStats(stats, {
    docsRoot: options.docsRoot,
  });
  const report = formatClassificationReport(classification, {
    maxSamples: options.maxSamples,
  });

  writeOrCheckReport({
    check: options.check,
    out: options.out,
    report,
  });
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
