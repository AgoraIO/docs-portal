import { readFile, writeFile } from 'node:fs/promises';

export function normalizePathForComparison(pathname) {
  let normalized = pathname.startsWith('/') ? pathname : `/${pathname}`;

  try {
    normalized = decodeURI(normalized);
  } catch {
    // Keep malformed paths comparable without making the triage command fail.
  }

  return normalized.replace(/\/+$/, '').replace(/_/g, '-').toLowerCase() || '/';
}

export function classifyPostHog404Path({
  pathname,
  events,
  status,
  inventory,
  existingRules,
}) {
  const normalizedPath = normalizePathForComparison(pathname);
  const existingRule = existingRules.find(
    (rule) => normalizePathForComparison(rule.legacyPath) === normalizedPath,
  );

  if (existingRule) {
    return {
      pathname,
      events,
      status,
      classification: 'already-covered',
      candidateTarget: existingRule.target,
      reason:
        'A source rule already exists; verify generated artifacts or deployment.',
    };
  }

  const exactTarget = inventory.find(
    (route) => normalizePathForComparison(route.routePath) === normalizedPath,
  );

  if (exactTarget) {
    return {
      pathname,
      events,
      status,
      classification: 'inventory-exact',
      candidateTarget: exactTarget.routePath,
      reason:
        'The path differs from a current route only by legacy URL normalization.',
    };
  }

  const leafCandidates = inventory.filter(
    (route) => normalizeLeaf(route.routePath) === normalizeLeaf(pathname),
  );
  const compatibleCandidates = leafCandidates.filter((route) =>
    arePathContextsCompatible(pathname, route.routePath),
  );

  if (compatibleCandidates.length === 1) {
    return {
      pathname,
      events,
      status,
      classification: 'inventory-unique-leaf',
      candidateTarget: compatibleCandidates[0].routePath,
      reason:
        'A single current route has the same leaf slug and compatible product family.',
    };
  }

  return {
    pathname,
    events,
    status,
    classification: 'unresolved',
    candidateTarget: null,
    reason:
      compatibleCandidates.length > 1 || leafCandidates.length > 1
        ? 'The leaf slug maps to multiple current routes.'
        : 'No compatible current route was found.',
  };
}

export function triagePostHog404Paths({ rows, inventory, existingRules }) {
  return rows
    .filter((row) => row.is_http_404 ?? row.status === 404)
    .map((row) =>
      classifyPostHog404Path({
        pathname: row.pathname,
        events: row.observed_events ?? row.events ?? 0,
        status: row.status ?? 404,
        inventory,
        existingRules,
      }),
    );
}

function normalizeLeaf(pathname) {
  const normalized = normalizePathForComparison(pathname);
  const leaf = normalized.split('/').filter(Boolean).at(-1) ?? '';

  return leaf
    .replace(/\.(html?|mdx?)$/, '')
    .replace(/-?index$/, '')
    .replace(/[^a-z0-9]+/g, '-');
}

function getLegacyProductFamily(pathname) {
  const parts = normalizePathForComparison(pathname).split('/').filter(Boolean);
  const product = parts[1] ?? '';

  if (['faq', 'faqs', 'help', 'all'].includes(product)) return 'faq';
  if (
    [
      'video-calling',
      'video',
      'video-call-4.x',
      'video-call-4.x-beta',
    ].includes(product)
  ) {
    return 'video';
  }
  if (product === 'broadcast-streaming') return 'broadcast-streaming';
  if (
    [
      'interactive broadcast',
      'interactive+broadcast',
      'interactivebroadcast',
      'interactive-live-streaming',
    ].includes(product)
  ) {
    return 'interactive-live-streaming';
  }
  if (
    [
      'voice-calling',
      'voice',
      'audio broadcast',
      'audio+broadcast',
      'voice-call-4.x-beta',
    ].includes(product)
  ) {
    return 'voice';
  }
  if (['real-time-messaging', 'signaling', 'rtm'].includes(product)) {
    return 'rtm';
  }
  if (['interactive-whiteboard', 'whiteboard'].includes(product)) {
    return 'whiteboard';
  }
  if (['agora-chat', 'im'].includes(product)) return 'im';
  if (['conversational-ai', 'ai'].includes(product)) return 'ai';
  if (['flexible-classroom', 'agora-class'].includes(product)) {
    return 'flexible-classroom';
  }
  if (['cloud-recording', 'recording'].includes(product)) {
    return 'cloud-recording';
  }
  if (product === 'on-premise-recording') return 'on-premise-recording';
  if (product === 'agora-analytics') return 'agora-analytics';
  if (product === 'extensions-marketplace') return 'marketplace';
  if (product === 'iot') return 'iot';

  return null;
}

function getCurrentProductFamily(pathname) {
  const normalized = normalizePathForComparison(pathname);
  if (normalized.startsWith('/en/api-reference/faq/')) return 'faq';
  if (normalized.startsWith('/en/ai/')) return 'ai';
  if (normalized.startsWith('/en/realtime-media/video/')) return 'video';
  if (normalized.startsWith('/en/realtime-media/broadcast-streaming/')) {
    return 'broadcast-streaming';
  }
  if (normalized.startsWith('/en/realtime-media/interactive-live-streaming/')) {
    return 'interactive-live-streaming';
  }
  if (normalized.startsWith('/en/realtime-media/voice/')) return 'voice';
  if (normalized.startsWith('/en/realtime-media/rtm/')) return 'rtm';
  if (normalized.startsWith('/en/realtime-media/whiteboard/'))
    return 'whiteboard';
  if (normalized.startsWith('/en/realtime-media/im/')) return 'im';
  if (normalized.startsWith('/en/realtime-media/flexible-classroom/')) {
    return 'flexible-classroom';
  }
  if (normalized.startsWith('/en/realtime-media/cloud-recording/')) {
    return 'cloud-recording';
  }
  if (normalized.startsWith('/en/realtime-media/on-premise-recording/')) {
    return 'on-premise-recording';
  }
  if (normalized.startsWith('/en/realtime-media/agora-analytics/')) {
    return 'agora-analytics';
  }
  if (normalized.startsWith('/en/realtime-media/marketplace/')) {
    return 'marketplace';
  }
  if (normalized.startsWith('/en/realtime-media/iot/')) return 'iot';
  return null;
}

function arePathContextsCompatible(legacyPath, currentPath) {
  const legacyFamily = getLegacyProductFamily(legacyPath);
  if (!legacyFamily || legacyFamily !== getCurrentProductFamily(currentPath)) {
    return false;
  }

  const legacyCategory = getAiModelCategory(legacyPath);
  const currentCategory = getAiModelCategory(currentPath);

  return !legacyCategory || legacyCategory === currentCategory;
}

function getAiModelCategory(pathname) {
  const match = normalizePathForComparison(pathname).match(
    /\/models\/(asr|llm|tts|mllm)\//,
  );
  return match?.[1] ?? null;
}

async function runCli() {
  const args = parseArgs(process.argv.slice(2));
  const input = JSON.parse(await readFile(args.input, 'utf8'));
  const inventory = JSON.parse(
    await readFile('src/lib/legacy-sitemap/new-docs-inventory.json', 'utf8'),
  ).routes;
  const redirects = JSON.parse(
    await readFile('src/lib/legacy-sitemap/redirects.json', 'utf8'),
  ).rules;
  const gscRules = JSON.parse(
    await readFile(
      'src/lib/legacy-sitemap/gsc-observed-redirects.json',
      'utf8',
    ),
  );
  const rows = triagePostHog404Paths({
    rows: input.results,
    inventory,
    existingRules: [...redirects, ...gscRules],
  });
  const summary = Object.groupBy(rows, (row) => row.classification);
  const output = {
    generatedAt: new Date().toISOString(),
    source: args.input,
    sourcePathCount: rows.length,
    summary: Object.fromEntries(
      Object.entries(summary).map(([key, value]) => [key, value.length]),
    ),
    rows,
  };
  await writeFile(args.output, `${JSON.stringify(output, null, 2)}\n`);
  console.log(JSON.stringify(output.summary, null, 2));
}

function parseArgs(argv) {
  const args = {};
  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index].startsWith('--')) {
      args[argv[index].slice(2)] = argv[index + 1];
      index += 1;
    }
  }
  if (!args.input || !args.output) {
    throw new Error(
      'Usage: node triage-posthog-404-redirects.mjs --input <file> --output <file>',
    );
  }
  return args;
}

if (process.argv[1]?.endsWith('triage-posthog-404-redirects.mjs')) {
  await runCli();
}
