import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { pathToFileURL } from 'node:url';

const MARKDOWN_FILE_PATTERN = /\.(md|mdx)$/i;
const DEFAULT_MANIFEST_PATH = 'docs/agents/migration-parity-manifest.json';
const DEFAULT_OUT_PATH = 'docs/agents/reports/migration-parity-audit';
const DEFAULT_TARGET_ROOT = 'content/docs/en';
const DEFAULT_SOURCE_ROOT_HINTS = [
  process.env.DOC_SOURCE_PRIVATE_ROOT,
  '/Users/gaolinjie/.codex/cache/docs-portal/Doc-Source-Private',
  '/Users/czhen/Documents/GitHub/AgoraIO/Doc-Source-Private',
  '/Users/yangyixuan/Documents/GitHub/Doc-Source-Private',
  '/Users/yejiayi/Documents/Doc-Source-Private',
].filter(Boolean);

const DEFAULT_VARIABLES = {
  Vg: {
    COMPANY: 'Agora',
    CONSOLE: 'Agora Console',
    CP: 'Cloud Proxy',
    VSDK: 'Video SDK',
  },
  Vpd: {
    NAME: 'Video Calling',
    SDK: 'Video SDK',
  },
  Vpl: {
    CLIENT: 'app',
  },
};

const DEFAULT_LINK_VARIABLES = {
  '{{Global.API_REF_ANDROID_ROOT}}':
    'https://api-ref.agora.io/en/video-sdk/android/4.x/API',
  '{{global.API_REF_ANDROID_ROOT}}':
    'https://api-ref.agora.io/en/video-sdk/android/4.x/API',
  '{{Global.AGORA_CONSOLE_URL}}': 'https://console.agora.io/',
  '{{global.AGORA_CONSOLE_URL}}': 'https://console.agora.io/',
};

const FULL_AUDIT_PRODUCT_RULES = [
  {
    sourceProduct: 'video-calling',
    targetPrefix: 'realtime-media/video',
  },
  {
    sourceProduct: 'voice-calling',
    targetPrefix: 'realtime-media/voice',
  },
  {
    sourceProduct: 'broadcast-streaming',
    targetPrefix: 'realtime-media/broadcast-streaming',
  },
  {
    sourceProduct: 'cloud-recording',
    targetPrefix: 'realtime-media/cloud-recording',
  },
  {
    sourceProduct: 'real-time-stt',
    targetPrefix: 'realtime-media/speech-to-text',
  },
  {
    sourceProduct: 'interactive-whiteboard',
    targetPrefix: 'realtime-media/whiteboard',
  },
  {
    sourceProduct: 'agora-chat',
    targetPrefix: 'realtime-media/im',
  },
  {
    sourceProduct: 'signaling',
    targetPrefix: 'realtime-media/rtm',
  },
  {
    sourceProduct: 'media-pull',
    targetPrefix: 'realtime-media/media-pull',
  },
  {
    sourceProduct: 'media-push',
    targetPrefix: 'realtime-media/media-push',
  },
  {
    sourceProduct: 'on-premise-recording',
    targetPrefix: 'realtime-media/on-premise-recording',
  },
  {
    sourceProduct: 'cloud-transcoding',
    targetPrefix: 'realtime-media/transcoding',
  },
  {
    sourceProduct: 'extensions-marketplace',
    targetPrefix: 'realtime-media/marketplace',
  },
  {
    sourceProduct: 'agora-analytics',
    targetPrefix: 'solutions/agora-analytics',
  },
  {
    sourceProduct: 'flexible-classroom',
    targetPrefix: 'solutions/flexible-classroom',
  },
  {
    sourceProduct: 'interactive-live-streaming',
    targetPrefix: 'solutions/interactive-live-streaming',
  },
  {
    sourceProduct: 'iot',
    targetPrefix: 'solutions/iot',
  },
  {
    sourceProduct: 'conversational-ai',
    targetPrefix: 'ai',
  },
];

const SOURCE_PRODUCT_ALIASES = {
  'convo-ai-device-kit': {
    product: 'conversational-ai',
    reason: 'device-kit-lane',
  },
  'open-ai-integration': {
    product: 'conversational-ai',
    reason: 'open-ai-integration-lane',
  },
  'server-gateway': {
    product: 'video-calling',
    reason: 'server-gateway-lane',
  },
  signaling: {
    product: 'signaling',
    reason: 'signaling-lane',
  },
};

const KNOWN_STRUCTURAL_COMPONENTS = new Set([
  'CodeBlockTab',
  'CodeBlockTabs',
  'CodeBlockTabsList',
  'CodeBlockTabsTrigger',
  'PlatformInline',
  'PlatformStructured',
  'ProductWrapper',
  'TabItem',
  'Tabs',
]);

/**
 * @typedef {{
 *   id?: string;
 *   kind?: string;
 *   contains?: string;
 *   equals?: string;
 *   regex?: string;
 *   reason: string;
 *   side?: 'source' | 'target' | 'both';
 * }} IgnoreRule
 */

/**
 * @typedef {{
 *   kind: string;
 *   value: string;
 *   raw: string;
 *   side: 'source' | 'target';
 *   location: string;
 *   line: number;
 *   order: number;
 *   hash: string;
 * }} AuditRecord
 */

/**
 * @typedef {{
 *   allTargets?: boolean;
 *   manifestPath?: string;
 *   repoRoot?: string;
 *   sourceRoot?: string;
 *   targetRoot?: string;
 * }} AuditMigrationParityOptions
 */

/**
 * @param {AuditMigrationParityOptions} [options]
 */
export function auditMigrationParity({
  allTargets = false,
  manifestPath = path.resolve(DEFAULT_MANIFEST_PATH),
  repoRoot = process.cwd(),
  sourceRoot,
  targetRoot = path.resolve(repoRoot, DEFAULT_TARGET_ROOT),
} = {}) {
  const manifest = loadManifest(manifestPath);
  const resolvedSourceRoot = resolveSourceRoot({
    manifest,
    sourceRoot,
  });
  const sourceVariables = loadSourceVariables(resolvedSourceRoot);
  const sourceRef = readGitRef(resolvedSourceRoot);
  const manifestPages = manifest.pages.map((page) =>
    auditManifestPage({
      manifest,
      page,
      repoRoot,
      sourceVariables,
      sourceRef,
      sourceRoot: resolvedSourceRoot,
    }),
  );
  const fullAudit = allTargets
    ? createFullAudit({
        manifest,
        manifestPages,
        repoRoot,
        sourceVariables,
        sourceRef,
        sourceRoot: resolvedSourceRoot,
        targetRoot,
      })
    : null;

  return createReport({
    fullAudit,
    manifest,
    manifestPath,
    pageReports: manifestPages,
    repoRoot,
    sourceRef,
    sourceRoot: resolvedSourceRoot,
  });
}

export function loadManifest(manifestPath) {
  const raw = fs.readFileSync(manifestPath, 'utf8');
  const manifest = JSON.parse(raw);

  if (!Array.isArray(manifest.pages) || manifest.pages.length === 0) {
    throw new Error(`Migration parity manifest has no pages: ${manifestPath}`);
  }

  return manifest;
}

export function auditManifestPage({
  manifest,
  page,
  repoRoot,
  sourceVariables,
  sourceRef,
  sourceRoot,
}) {
  const sourceFiles = page.sourceFiles ?? page.source?.files ?? [];

  if (sourceFiles.length === 0) {
    throw new Error(`Manifest page has no source files: ${page.id}`);
  }

  const projection = {
    platform: page.platform ?? manifest.defaults?.platform,
    product: page.product ?? manifest.defaults?.product,
  };
  const variables = mergeVariables(
    DEFAULT_VARIABLES,
    getVariablesForProjection(sourceVariables, projection),
    manifest.variables,
    page.variables,
  );
  const linkVariables = {
    ...DEFAULT_LINK_VARIABLES,
    ...(manifest.linkVariables ?? {}),
    ...(page.linkVariables ?? {}),
  };
  const expansion = expandLegacyFiles({
    projection,
    sourceFiles,
    sourceRoot,
    variables,
  });
  const targetPath = path.resolve(repoRoot, page.targetPath);

  if (!fs.existsSync(targetPath)) {
    throw new Error(`Target page does not exist: ${page.targetPath}`);
  }

  const targetRaw = fs.readFileSync(targetPath, 'utf8');
  const targetProjected = projectTargetContent(targetRaw, {
    projection,
    variables,
  });
  const sourceRecords = createIntermediateRecords({
    content: expansion.content,
    linkVariables,
    location: sourceFiles.join(', '),
    side: 'source',
  });
  const targetRecords = createIntermediateRecords({
    content: targetProjected,
    linkVariables,
    location: page.targetPath,
    side: 'target',
  });
  const ignored = applyIgnoreRules({
    ignoreRules: page.ignoreRules ?? [],
    records: [...sourceRecords, ...targetRecords],
  });
  const ignoredRecordIds = new Set(ignored.map((entry) => entry.recordId));
  const comparison = compareRecords({
    sourceRecords: sourceRecords.filter(
      (record) => !ignoredRecordIds.has(recordId(record)),
    ),
    targetRecords: targetRecords.filter(
      (record) => !ignoredRecordIds.has(recordId(record)),
    ),
  });

  return {
    id: page.id,
    ignored,
    migrationMode: page.migrationMode ?? manifest.defaults?.migrationMode,
    projection,
    source: {
      files: sourceFiles,
      ref: page.source?.ref ?? manifest.source?.defaultRef ?? sourceRef,
      repository: page.source?.repository ?? manifest.source?.repository,
      resolvedFiles: expansion.resolvedFiles,
    },
    targetPath: page.targetPath,
    totals: {
      sourceRecords: sourceRecords.length,
      targetRecords: targetRecords.length,
    },
    ...comparison,
  };
}

function resolveSourceRoot({ manifest, sourceRoot }) {
  const hints = [
    sourceRoot,
    process.env.DOC_SOURCE_PRIVATE_ROOT,
    ...(manifest.sourceRootHints ?? []),
    ...DEFAULT_SOURCE_ROOT_HINTS,
  ].filter(Boolean);

  for (const hint of hints) {
    const normalized = normalizeRootHint(hint);

    if (normalized && fs.existsSync(normalized)) {
      return fs.realpathSync(normalized);
    }
  }

  throw new Error(
    [
      'Unable to find Doc-Source-Private source root.',
      'Pass --source-root=/absolute/path or set DOC_SOURCE_PRIVATE_ROOT.',
    ].join(' '),
  );
}

function normalizeRootHint(hint) {
  if (!hint || hint.startsWith('$')) {
    return null;
  }

  return path.resolve(hint);
}

function loadSourceVariables(sourceRoot) {
  const variablesRoot = path.join(sourceRoot, 'shared', 'variables');

  return {
    Vg: readNamedVariableExports(path.join(variablesRoot, 'global.js')),
    Vpd: readDefaultObjectByKey(path.join(variablesRoot, 'product.js')),
    Vpl: readDefaultObjectByKey(path.join(variablesRoot, 'platform.js')),
  };
}

function getVariablesForProjection(sourceVariables, projection) {
  return {
    Vg: sourceVariables.Vg,
    Vpd: sourceVariables.Vpd[projection.product] ?? {},
    Vpl: sourceVariables.Vpl[projection.platform] ?? {},
  };
}

function readNamedVariableExports(filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }

  const values = {};
  const content = stripLineComments(fs.readFileSync(filePath, 'utf8'));
  const exportPattern = /export\s+const\s+([A-Z0-9_]+)\s*=\s*([^;\n]+);?/g;

  for (const match of content.matchAll(exportPattern)) {
    const [, key, expression] = match;
    const value = evaluateStaticExpression(expression.trim(), values);

    if (value !== null) {
      values[key] = value;
    }
  }

  return values;
}

function readDefaultObjectByKey(filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }

  const content = stripLineComments(fs.readFileSync(filePath, 'utf8'));
  const result = {};
  const objectPattern = /['"]([^'"]+)['"]\s*:\s*\{(?<body>[\s\S]*?)\n\s*\}/g;

  for (const match of content.matchAll(objectPattern)) {
    const key = match[1];
    const body = match.groups?.body ?? '';
    const values = {};
    const propertyPattern = /([A-Z0-9_-]+)\s*:\s*([^,\n]+),?/g;

    for (const propertyMatch of body.matchAll(propertyPattern)) {
      const [, propertyKey, expression] = propertyMatch;
      const value = evaluateStaticExpression(expression.trim(), values);

      if (value !== null) {
        values[propertyKey] = value;
      }
    }

    result[key] = values;
  }

  return result;
}

function stripLineComments(content) {
  return content.replace(/^\s*\/\/.*$/gm, '');
}

function evaluateStaticExpression(expression, scope) {
  const trimmed = expression.replace(/,$/, '').trim();

  if (/^['"][\s\S]*['"]$/.test(trimmed)) {
    return trimmed.slice(1, -1);
  }

  if (/^`[\s\S]*`$/.test(trimmed)) {
    return trimmed
      .slice(1, -1)
      .replace(/\$\{([A-Z0-9_]+)\}/g, (_match, key) => scope[key] ?? '');
  }

  const lowerMatch = /^([A-Z0-9_]+)\.toLowerCase\(\)$/.exec(trimmed);

  if (lowerMatch) {
    return scope[lowerMatch[1]]?.toLowerCase() ?? null;
  }

  if (/^[A-Z0-9_]+$/.test(trimmed)) {
    return scope[trimmed] ?? null;
  }

  return null;
}

function createFullAudit({
  manifest,
  manifestPages,
  repoRoot,
  sourceVariables,
  sourceRef,
  sourceRoot,
  targetRoot,
}) {
  const targetFiles = listMarkdownFiles(targetRoot);
  const sourceFiles = listMarkdownFiles(sourceRoot)
    .map((filePath) => toPosixPath(path.relative(sourceRoot, filePath)))
    .filter((filePath) => !isSourceNonContentFile(filePath));
  const sourceFileSet = new Set(sourceFiles);
  const manifestPageByTargetPath = new Map(
    manifestPages.map((page) => [page.targetPath, page]),
  );
  const pages = [];
  const mappedSourceFiles = new Set();

  for (const targetFile of targetFiles) {
    const targetPath = toRepoPath(targetFile, repoRoot);
    const targetContentPath = toPosixPath(
      path.relative(targetRoot, targetFile),
    );
    const manifestPage = manifestPageByTargetPath.get(targetPath);

    if (manifestPage) {
      for (const sourceFile of [
        ...manifestPage.source.files,
        ...(manifestPage.source.resolvedFiles ?? []),
      ]) {
        mappedSourceFiles.add(sourceFile);
      }

      pages.push({
        coverage: 'compared',
        id: manifestPage.id,
        manifest: true,
        parity: summarizePageParity(manifestPage),
        source: manifestPage.source,
        status: getParityStatus(manifestPage),
        targetPath,
      });
      continue;
    }

    const mapping = inferSourceMapping({
      sourceFileSet,
      targetContentPath,
    });

    if (mapping.status === 'mapped' && mapping.sourceFiles[0]) {
      const sourceFile = mapping.sourceFiles[0];
      const product =
        mapping.sourceProduct ?? getProjectionProductForSource(sourceFile);
      mappedSourceFiles.add(sourceFile);

      try {
        const page = auditManifestPage({
          manifest,
          page: {
            id: targetContentPath.replace(/\.(md|mdx)$/i, ''),
            migrationMode: 'inferred-full-audit-path-rule',
            platform: manifest.defaults?.platform ?? 'android',
            product,
            sourceFiles: [sourceFile],
            targetPath,
          },
          repoRoot,
          sourceVariables,
          sourceRef,
          sourceRoot,
        });

        for (const resolvedFile of page.source.resolvedFiles ?? []) {
          mappedSourceFiles.add(resolvedFile);
        }

        pages.push({
          coverage: 'compared',
          id: page.id,
          manifest: false,
          mappingReason: mapping.reason,
          parity: summarizePageParity(page),
          source: page.source,
          status: getParityStatus(page),
          targetPath,
        });
        continue;
      } catch (error) {
        pages.push({
          coverage: 'uncompared',
          error: error instanceof Error ? error.message : String(error),
          id: targetContentPath.replace(/\.(md|mdx)$/i, ''),
          manifest: false,
          mappingReason: mapping.reason,
          source: {
            files: mapping.sourceFiles,
            ref: sourceRef,
            repository: manifest.source?.repository,
          },
          status: 'compare-error',
          targetPath,
        });
        continue;
      }
    }

    pages.push({
      coverage: 'uncompared',
      id: targetContentPath.replace(/\.(md|mdx)$/i, ''),
      manifest: false,
      mappingReason: mapping.reason,
      source: {
        files: mapping.sourceFiles,
        ref: sourceRef,
        repository: manifest.source?.repository,
      },
      status: mapping.status,
      targetPath,
    });
  }

  const sourceOnly = sourceFiles
    .filter((filePath) => !mappedSourceFiles.has(filePath))
    .map((filePath) => ({
      reason: inferSourceOnlyReason(filePath),
      sourcePath: filePath,
      status: 'source-only',
    }));

  return {
    sourceOnly,
    summary: summarizeFullAudit(pages, sourceFiles, sourceOnly),
    targetRoot: toRepoPath(targetRoot, repoRoot),
    pages,
  };
}

function listMarkdownFiles(root) {
  if (!fs.existsSync(root)) {
    return [];
  }

  const result = [];
  const entries = fs.readdirSync(root, { withFileTypes: true });

  for (const entry of entries) {
    const entryPath = path.join(root, entry.name);

    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.git') {
        continue;
      }

      result.push(...listMarkdownFiles(entryPath));
      continue;
    }

    if (entry.isFile() && MARKDOWN_FILE_PATTERN.test(entry.name)) {
      result.push(entryPath);
    }
  }

  return result.sort();
}

function isSourceNonContentFile(filePath) {
  return (
    filePath.startsWith('.github/') ||
    filePath.startsWith('scripts/') ||
    filePath.startsWith('assets/') ||
    filePath.startsWith('shared/variables/')
  );
}

function inferSourceMapping({ sourceFileSet, targetContentPath }) {
  const candidates = getSourceCandidatesForTarget(targetContentPath).filter(
    (candidate) => sourceFileSet.has(candidate.sourceFile),
  );
  const uniqueCandidates = uniqueBy(
    candidates,
    (candidate) => candidate.sourceFile,
  );

  if (uniqueCandidates.length === 1) {
    return {
      reason: uniqueCandidates[0].reason,
      sourceProduct: uniqueCandidates[0].sourceProduct,
      sourceFiles: [uniqueCandidates[0].sourceFile],
      status: 'mapped',
    };
  }

  if (uniqueCandidates.length > 1) {
    return {
      reason: 'multiple path-rule candidates',
      sourceProducts: uniqueCandidates.map(
        (candidate) => candidate.sourceProduct,
      ),
      sourceFiles: uniqueCandidates.map((candidate) => candidate.sourceFile),
      status: 'ambiguous-source',
    };
  }

  return {
    reason: 'no deterministic source path rule matched',
    sourceFiles: [],
    status: 'unmapped-target',
  };
}

function getSourceCandidatesForTarget(targetContentPath) {
  const candidates = [];

  for (const rule of FULL_AUDIT_PRODUCT_RULES) {
    if (!targetContentPath.startsWith(`${rule.targetPrefix}/`)) {
      continue;
    }

    const rest = targetContentPath.slice(rule.targetPrefix.length + 1);
    const ext = path.posix.extname(rest);
    const stem = rest.slice(0, -ext.length);
    const extensionCandidates = getExtensionCandidates(ext);

    for (const sourceStem of getSourceStemCandidates(stem)) {
      for (const sourceExt of extensionCandidates) {
        candidates.push({
          reason: 'path-rule',
          sourceFile: `${rule.sourceProduct}/${sourceStem}${sourceExt}`,
          sourceProduct: rule.sourceProduct,
        });
      }
    }
  }

  candidates.push(...getSpecializedSourceCandidates(targetContentPath));

  return candidates;
}

function getSpecializedSourceCandidates(targetContentPath) {
  const target = stripMarkdownExtension(targetContentPath);
  const candidates = [];

  addConversationalAiCandidates(candidates, target);
  addDeviceKitCandidates(candidates, target);
  addOpenAiIntegrationCandidates(candidates, target);
  addApiReferenceCandidates(candidates, target);
  addVideoSdkBuildGroupCandidates(candidates, target);
  addRealtimeProductAliasCandidates(candidates, target);
  addProductRootAliasCandidates(candidates, target);
  addIntroductionAliasCandidates(candidates, target);
  addSolutionsAliasCandidates(candidates, target);

  return candidates;
}

function addConversationalAiCandidates(candidates, target) {
  const exactMappings = {
    'ai/best-practices/record-agent-conversation':
      'conversational-ai/best-practices/cloud-recording',
    'ai/build/architecture': 'conversational-ai/develop/build-server-client',
    'ai/build/shape-the-conversation/filler-words':
      'conversational-ai/best-practices/filler-words',
  };

  for (const [targetPath, sourceFile] of Object.entries(exactMappings)) {
    addExactCandidate(candidates, {
      reason: 'conversational-ai-page-split',
      sourceFile,
      sourceProduct: 'conversational-ai',
      target,
      targetPath,
    });
  }

  addMappedStemCandidates(candidates, {
    reason: 'conversational-ai-build-subsection',
    sourceProduct: 'conversational-ai',
    sourcePrefix: 'develop',
    target,
    targetPrefix: 'ai/build/custom-model-integration',
  });
  addMappedStemCandidates(candidates, {
    reason: 'conversational-ai-build-subsection',
    sourceProduct: 'conversational-ai',
    sourcePrefix: 'develop',
    target,
    targetPrefix: 'ai/build/shape-the-conversation',
  });
  addMappedStemCandidates(candidates, {
    reason: 'conversational-ai-runtime-events-subsection',
    sourceProduct: 'conversational-ai',
    sourcePrefix: 'develop',
    target,
    targetPrefix: 'ai/build/handle-runtime-events',
  });
  addExactCandidate(candidates, {
    reason: 'conversational-ai-runtime-events-subsection',
    sourceFile: 'conversational-ai/develop/event-types',
    sourceProduct: 'conversational-ai',
    target,
    targetPath: 'ai/reference/event-types',
  });
  addExactCandidate(candidates, {
    reason: 'conversational-ai-studio-overview',
    sourceFile: 'conversational-ai/studio/overview',
    sourceProduct: 'conversational-ai',
    target,
    targetPath: 'ai/studio/index',
  });
}

function addDeviceKitCandidates(candidates, target) {
  const splitPageMappings = {
    'ai/device-kit/build/architecture-overview':
      'convo-ai-device-kit/overview/architecture',
    'ai/device-kit/build/build-and-flash-firmware':
      'convo-ai-device-kit/get-started/run-the-demo',
    'ai/device-kit/build/configure-device-network':
      'convo-ai-device-kit/get-started/run-the-demo',
    'ai/device-kit/build/demo-server-apis':
      'convo-ai-device-kit/get-started/run-the-demo',
    'ai/device-kit/build/run-the-demo-server':
      'convo-ai-device-kit/get-started/run-the-demo',
    'ai/device-kit/build/specifications-and-compatibility':
      'convo-ai-device-kit/overview/architecture',
  };

  for (const [targetPath, sourceFile] of Object.entries(splitPageMappings)) {
    addExactCandidate(candidates, {
      reason: 'device-kit-page-split',
      sourceFile,
      sourceProduct: 'convo-ai-device-kit',
      target,
      targetPath,
    });
  }

  addMappedStemCandidates(candidates, {
    reason: 'device-kit-build-lane',
    sourceProduct: 'convo-ai-device-kit',
    sourcePrefix: 'get-started',
    target,
    targetPrefix: 'ai/device-kit/build',
  });
  addMappedStemCandidates(candidates, {
    reason: 'device-kit-build-lane',
    sourceProduct: 'convo-ai-device-kit',
    sourcePrefix: 'overview',
    target,
    targetPrefix: 'ai/device-kit/build',
  });
  addMappedStemCandidates(candidates, {
    reason: 'device-kit-reference-lane',
    sourceProduct: 'convo-ai-device-kit',
    sourcePrefix: 'get-started',
    target,
    targetPrefix: 'ai/device-kit/reference',
  });
  addMappedStemCandidates(candidates, {
    reason: 'device-kit-reference-lane',
    sourceProduct: 'convo-ai-device-kit',
    sourcePrefix: 'overview',
    target,
    targetPrefix: 'ai/device-kit/reference',
  });
  addMappedStemCandidates(candidates, {
    reason: 'device-kit-get-started-lane',
    sourceProduct: 'convo-ai-device-kit',
    sourcePrefix: 'get-started',
    target,
    targetPrefix: 'ai/device-kit/get-started',
  });
  addMappedStemCandidates(candidates, {
    reason: 'device-kit-start-here-lane',
    sourceProduct: 'convo-ai-device-kit',
    sourcePrefix: 'get-started',
    target,
    targetPrefix: 'ai/device-kit/start-here',
  });
  addExactCandidate(candidates, {
    reason: 'device-kit-index',
    sourceFile: 'convo-ai-device-kit/overview/product-overview',
    sourceProduct: 'convo-ai-device-kit',
    target,
    targetPath: 'ai/device-kit/index',
  });
  addExactCandidate(candidates, {
    reason: 'device-kit-build-lane',
    sourceFile: 'convo-ai-device-kit/reference/device-controls',
    sourceProduct: 'convo-ai-device-kit',
    target,
    targetPath: 'ai/device-kit/build/device-controls',
  });
  addExactCandidate(candidates, {
    reason: 'device-kit-build-lane',
    sourceFile: 'convo-ai-device-kit/get-started/run-the-demo',
    sourceProduct: 'convo-ai-device-kit',
    target,
    targetPath: 'ai/device-kit/build/run-the-r1-demo',
  });
  addExactCandidate(candidates, {
    reason: 'device-kit-start-here-lane',
    sourceFile: 'convo-ai-device-kit/get-started/quickstart',
    sourceProduct: 'convo-ai-device-kit',
    target,
    targetPath: 'ai/device-kit/start-here/quickstart',
  });
  addExactCandidate(candidates, {
    reason: 'device-kit-reference-lane',
    sourceFile: 'convo-ai-device-kit/get-started/enable-services',
    sourceProduct: 'convo-ai-device-kit',
    target,
    targetPath: 'ai/device-kit/reference/enable-services',
  });
}

function addOpenAiIntegrationCandidates(candidates, target) {
  addExactCandidate(candidates, {
    reason: 'open-ai-integration-lane',
    sourceFile: 'open-ai-integration/overview/product-overview',
    sourceProduct: 'open-ai-integration',
    target,
    targetPath: 'ai/reference/openai-realtime-integration',
  });
}

function addApiReferenceCandidates(candidates, target) {
  addApiReferenceExactCandidates(candidates, target);
  addChatRestApiCandidates(candidates, target);
  addRtcChannelManagementCandidates(candidates, target);
  addBroadcastStreamingApiCandidates(candidates, target);
  addWhiteboardApiCandidates(candidates, target);
  addRestApiLaneCandidates(candidates, {
    reason: 'api-ref-cloud-recording',
    sourceProduct: 'cloud-recording',
    sourcePrefix: 'rest-api',
    target,
    targetPrefix: 'api-reference/api-ref/cloud-recording',
  });
  addRestApiLaneCandidates(candidates, {
    reason: 'api-ref-cloud-transcoding',
    sourceProduct: 'cloud-transcoding',
    sourcePrefix: 'rest-api',
    target,
    targetPrefix: 'api-reference/api-ref/cloud-transcoding',
  });
  addRestApiLaneCandidates(candidates, {
    reason: 'api-ref-conversational-ai',
    sourceProduct: 'conversational-ai',
    sourcePrefix: 'rest-api',
    target,
    targetPrefix: 'api-reference/api-ref/conversational-ai',
  });
  addRestApiLaneCandidates(candidates, {
    reason: 'api-ref-speech-to-text',
    sourceProduct: 'real-time-stt',
    sourcePrefix: 'rest-api',
    target,
    targetPrefix: 'api-reference/api-ref/speech-to-text',
    transformRestStem: transformSpeechToTextRestStem,
  });
  addRestApiLaneCandidates(candidates, {
    reason: 'api-ref-signaling',
    sourceProduct: 'signaling',
    sourcePrefix: 'rest-api',
    target,
    targetPrefix: 'api-reference/api-ref/signaling',
  });
}

function addApiReferenceExactCandidates(candidates, target) {
  const exactMappings = {
    'api-reference/api-ref/agora-analytics/analytics-rest-api':
      'agora-analytics/reference/api',
    'api-reference/api-ref/agora-analytics/analytics-restful-authentication':
      'agora-analytics/reference/restful-authentication',
    'api-reference/api-ref/cloud-recording/api-callback-service':
      'cloud-recording/develop/receive-notifications',
    'api-reference/api-ref/cloud-transcoding/index':
      'cloud-transcoding/rest-api/overview',
    'api-reference/api-ref/cloud-transcoding/status-codes':
      'cloud-transcoding/reference/status-codes',
    'api-reference/api-ref/console/solutions-agora-console-rest-api':
      'agora-analytics/reference/agora-console-rest-api',
    'api-reference/api-ref/conversational-ai/client-toolkit/android':
      'conversational-ai/reference/toolkot/android',
    'api-reference/api-ref/conversational-ai/client-toolkit/ios':
      'conversational-ai/reference/toolkot/ios',
    'api-reference/api-ref/conversational-ai/client-toolkit/web':
      'conversational-ai/reference/toolkot/web',
    'api-reference/api-ref/conversational-ai/status-codes':
      'conversational-ai/rest-api/reference',
    'api-reference/api-ref/conversational-ai/index':
      'conversational-ai/rest-api/reference',
    'api-reference/api-ref/extensions-marketplace/provisioning':
      'extensions-marketplace/develop/implement/provisioning',
    'api-reference/api-ref/extensions-marketplace/signature-algorithm':
      'extensions-marketplace/develop/implement/signature-algorithm',
    'api-reference/api-ref/extensions-marketplace/usage':
      'extensions-marketplace/develop/implement/usage',
    'api-reference/api-ref/flexible-classroom/classroom-rest-api':
      'flexible-classroom/reference/agora-console-rest-api',
    'api-reference/api-ref/flexible-classroom/classroom-sdk':
      'flexible-classroom/client-api/classroom-sdk',
    'api-reference/api-ref/iot-channel-management-rest-api':
      'iot/reference/channel-management-rest-api',
    'api-reference/api-ref/media-pull/index':
      'media-pull/reference/restful-api',
    'api-reference/api-ref/media-pull/restful-authentication':
      'media-pull/reference/restful-authentication',
    'api-reference/api-ref/media-push/index': 'media-push/develop/restful-api',
    'api-reference/api-ref/media-push/restful-authentication':
      'media-push/reference/restful-authentication',
    'api-reference/api-ref/media-push/restful-type-definition':
      'media-push/reference/restful-type-definition',
    'api-reference/api-ref/on-premise-recording/index':
      'on-premise-recording/reference/api-reference',
    'api-reference/api-ref/rtmp-gateway/authentication':
      'media-gateway/reference/restful-authentication',
    'api-reference/api-ref/rtmp-gateway/index':
      'media-gateway/reference/rest-api/overview',
    'api-reference/api-ref/rtmp-gateway/limitations':
      'media-gateway/reference/rest-api/limitations',
    'api-reference/api-ref/rtmp-gateway/media-gateway-event-types':
      'media-gateway/reference/rest-api/webhooks/media-gateway-event-type',
    'api-reference/api-ref/rtmp-gateway/response-status-codes':
      'media-gateway/reference/rest-api/response-status-codes',
    'api-reference/api-ref/rtmp-gateway/restful-authentication':
      'media-gateway/reference/restful-authentication',
    'api-reference/api-ref/server-sdk/go': 'server-gateway/reference/api',
    'api-reference/api-ref/server-sdk/python': 'server-gateway/reference/api',
    'api-reference/api-ref/server-sdk/typescript':
      'server-gateway/reference/api',
    'api-reference/api-ref/uikit-sdk':
      'interactive-whiteboard/reference/uikit-sdk',
    'api-reference/api-ref/video/api-sunset':
      'video-calling/reference/api-sunset',
    'api-reference/api-ref/video/index':
      'video-calling/channel-management-api/overview',
    'api-reference/api-ref/voice/api-sunset':
      'voice-calling/reference/api-sunset',
    'api-reference/api-ref/voice/index':
      'voice-calling/channel-management-api/overview',
    'api-reference/api-ref/rtc/ensure-service-reliability':
      'shared/common/_switch-domain-name',
  };

  for (const [targetPath, sourceFile] of Object.entries(exactMappings)) {
    addExactCandidate(candidates, {
      reason: 'api-ref-lane-alias',
      sourceFile,
      sourceProduct: sourceFile.split('/')[0],
      target,
      targetPath,
    });
  }
}

function addChatRestApiCandidates(candidates, target) {
  const prefix = 'api-reference/api-ref/im';

  if (!target.startsWith(`${prefix}/`)) {
    return;
  }

  const rest = target.slice(prefix.length + 1);
  const exactMappings = {
    index: 'agora-chat/restful-api/restful-overview',
    'http-status-codes': 'agora-chat/reference/http-status-codes',
    limitations: 'agora-chat/reference/limitations',
  };

  if (exactMappings[rest]) {
    addCandidate(candidates, {
      reason: 'api-ref-chat-rest',
      sourceFile: exactMappings[rest],
      sourceProduct: 'agora-chat',
    });
    return;
  }

  addCandidate(candidates, {
    reason: 'api-ref-chat-rest',
    sourceFile: `agora-chat/restful-api/${rest}`,
    sourceProduct: 'agora-chat',
  });
}

function addRtcChannelManagementCandidates(candidates, target) {
  const prefix = 'api-reference/api-ref/rtc';

  if (!target.startsWith(`${prefix}/`)) {
    return;
  }

  const rest = target.slice(prefix.length + 1);
  const stem = {
    authentication: 'authorization',
    'ban-user-privileges-best-practices': 'best-practices/ban-user-privileges',
    'channel-event-types': 'webhooks/channel-event-type',
    'how-to-call-api': 'how-to-call-api',
    index: '_overview',
    'response-status-codes': 'response-status-code',
  }[rest];

  if (!stem) {
    return;
  }

  addCandidate(candidates, {
    reason: 'api-ref-shared-channel-management',
    sourceFile: `shared/common/channel-management-api/${stem}`,
    sourceProduct: 'video-calling',
  });
}

function addBroadcastStreamingApiCandidates(candidates, target) {
  const prefix = 'api-reference/api-ref/broadcast-streaming';

  if (!target.startsWith(`${prefix}/`)) {
    return;
  }

  const rest = target.slice(prefix.length + 1);
  const exactMappings = {
    'api-sunset': 'broadcast-streaming/reference/api-sunset',
    index:
      'shared/broadcast-streaming-private-product/restful-api/_api-overview',
  };
  const sourceStem =
    exactMappings[rest] ??
    `shared/broadcast-streaming-private-product/restful-api/${prefixUnderscoreBasename(rest)}`;

  addCandidate(candidates, {
    reason: 'api-ref-broadcast-streaming-private',
    sourceFile: sourceStem,
    sourceProduct: 'broadcast-streaming',
  });
}

function addWhiteboardApiCandidates(candidates, target) {
  const prefix = 'api-reference/api-ref/whiteboard';

  if (!target.startsWith(`${prefix}/`)) {
    return;
  }

  const rest = target.slice(prefix.length + 1);
  const sourceStem =
    rest === 'index'
      ? 'interactive-whiteboard/reference/whiteboard-api/overview'
      : `interactive-whiteboard/reference/whiteboard-api/${rest}`;

  addCandidate(candidates, {
    reason: 'api-ref-whiteboard',
    sourceFile: sourceStem,
    sourceProduct: 'interactive-whiteboard',
  });
}

function addVideoSdkBuildGroupCandidates(candidates, target) {
  const productRules = [
    {
      sourceProduct: 'video-calling',
      targetPrefix: 'realtime-media/video/build',
      groups: {
        'add-advanced-video-features': 'advanced-features',
        'apply-video-effects': 'advanced-features',
        'authenticate-users': {
          defaultSourcePrefix: 'token-authentication',
          stems: {
            'use-tokens': 'token-authentication/authentication-workflow',
          },
        },
        'capture-and-render-video': {
          defaultSourcePrefix: 'advanced-features',
          stems: {
            'optimize-frame-rendering':
              'best-practices/optimize-frame-rendering',
          },
        },
        'control-audio-and-devices': {
          defaultSourcePrefix: 'advanced-features',
          stems: {
            'volume-control-and-mute': 'get-started/volume-control-and-mute',
          },
        },
        'customize-audio-processing': 'advanced-features',
        'enhance-the-audio-experience': {
          defaultSourcePrefix: 'advanced-features',
          stems: {
            'best-practices-sound-quality':
              'best-practices/best-practices-sound-quality',
          },
        },
        'join-and-manage-channels': {
          defaultSourcePrefix: 'advanced-features',
          stems: {
            'compile-run-sample-project':
              'get-started/compile-run-sample-project',
            'preload-channels': 'best-practices/preload-channels',
          },
        },
        'manage-connection-and-quality': {
          defaultSourcePrefix: 'advanced-features',
          stems: {
            'connection-status-management':
              'enhance-call-quality/connection-status-management',
            'in-call-quality-monitoring':
              'enhance-call-quality/in-call-quality-monitoring',
            'optimize-multihost-video':
              'best-practices/optimize-multihost-video',
            'pre-call-tests': 'enhance-call-quality/pre-call-tests',
          },
        },
        'optimize-and-operate': {
          defaultSourcePrefix: 'best-practices',
          stems: {
            'audio-strength-stream-selection':
              'advanced-features/audio-strength-stream-selection',
            'receive-notifications': 'advanced-features/receive-notifications',
          },
        },
        'secure-and-protect-channels': {
          defaultSourcePrefix: 'advanced-features',
          stems: {
            'prevent-stream-bombing': 'best-practices/prevent-stream-bombing',
          },
        },
      },
    },
    {
      sourceProduct: 'broadcast-streaming',
      targetPrefix: 'realtime-media/broadcast-streaming/build',
      groups: {
        'apply-effects-and-enhancements': 'advanced-features',
        'authenticate-users': {
          defaultSourcePrefix: 'token-authentication',
          stems: {
            'use-tokens': 'token-authentication/authentication-workflow',
          },
        },
        'connect-across-channels': 'advanced-features',
        'control-audio-and-devices': {
          defaultSourcePrefix: 'advanced-features',
          stems: {
            autoplay: 'best-practices/autoplay',
            'configure-audio-encoding':
              'enhance-call-quality/configure-audio-encoding',
            'volume-control-and-mute': 'get-started/volume-control-and-mute',
          },
        },
        'manage-video-and-streaming': {
          defaultSourcePrefix: 'advanced-features',
          stems: {
            'configure-video-encoding':
              'enhance-call-quality/configure-video-encoding',
          },
        },
        'optimize-quality-and-connection': {
          defaultSourcePrefix: 'best-practices',
          stems: {
            'cloud-proxy': 'advanced-features/cloud-proxy',
            'connection-status-management':
              'enhance-call-quality/connection-status-management',
            'in-call-quality-monitoring':
              'enhance-call-quality/in-call-quality-monitoring',
            'media-stream-fallback': 'advanced-features/media-stream-fallback',
            'pre-call-tests': 'enhance-call-quality/pre-call-tests',
            'video-transmission-optimization':
              'enhance-call-quality/video-transmission-optimization',
          },
        },
        'process-raw-and-custom-media': 'advanced-features',
        'secure-and-protect-channels': {
          defaultSourcePrefix: 'advanced-features',
          stems: {
            'prevent-stream-bombing': 'best-practices/prevent-stream-bombing',
          },
        },
        'set-up-your-project': 'get-started',
      },
    },
    {
      sourceProduct: 'voice-calling',
      targetPrefix: 'realtime-media/voice/build',
      groups: {
        'control-audio-and-devices': {
          defaultSourcePrefix: 'advanced-features',
          stems: {
            'configure-audio-encoding':
              'enhance-call-quality/configure-audio-encoding',
            'volume-control-and-mute': 'get-started/volume-control-and-mute',
          },
        },
        'customize-audio-processing': 'advanced-features',
        'enhance-the-audio-experience': {
          defaultSourcePrefix: 'advanced-features',
          stems: {
            'best-practices-sound-quality':
              'best-practices/best-practices-sound-quality',
          },
        },
        'manage-connection-and-quality': {
          defaultSourcePrefix: 'enhance-call-quality',
          stems: {
            'cloud-proxy': 'advanced-features/cloud-proxy',
            geofencing: 'advanced-features/geofencing',
          },
        },
        'optimize-and-operate': {
          defaultSourcePrefix: 'best-practices',
          stems: {
            'audio-strength-stream-selection':
              'advanced-features/audio-strength-stream-selection',
            'receive-notifications': 'advanced-features/receive-notifications',
          },
        },
        'secure-and-protect-channels': {
          defaultSourcePrefix: 'advanced-features',
          stems: {
            'prevent-stream-bombing': 'best-practices/prevent-stream-bombing',
          },
        },
        'set-up-token-authentication': {
          defaultSourcePrefix: 'token-authentication',
          stems: {
            'use-tokens': 'token-authentication/authentication-workflow',
          },
        },
        'set-up-your-project': 'get-started',
      },
    },
    {
      sourceProduct: 'interactive-live-streaming',
      targetPrefix: 'solutions/interactive-live-streaming/build',
      groups: {
        'apply-effects-and-enhancements': 'advanced-features',
        'authenticate-users': {
          defaultSourcePrefix: 'token-authentication',
          stems: {
            'use-tokens': 'token-authentication/authentication-workflow',
          },
        },
        'connect-across-channels': 'advanced-features',
        'control-audio-and-devices': {
          defaultSourcePrefix: 'advanced-features',
          stems: {
            autoplay: 'best-practices/autoplay',
            'configure-audio-encoding':
              'enhance-call-quality/configure-audio-encoding',
            'volume-control-and-mute': 'get-started/volume-control-and-mute',
          },
        },
        'manage-video-and-streaming': {
          defaultSourcePrefix: 'advanced-features',
          stems: {
            'configure-video-encoding':
              'enhance-call-quality/configure-video-encoding',
          },
        },
        'optimize-quality-and-connection': {
          defaultSourcePrefix: 'best-practices',
          stems: {
            'cloud-proxy': 'advanced-features/cloud-proxy',
            'connection-status-management':
              'enhance-call-quality/connection-status-management',
            'in-call-quality-monitoring':
              'enhance-call-quality/in-call-quality-monitoring',
            'media-stream-fallback': 'advanced-features/media-stream-fallback',
            'pre-call-tests': 'enhance-call-quality/pre-call-tests',
            'video-transmission-optimization':
              'enhance-call-quality/video-transmission-optimization',
          },
        },
        'process-raw-and-custom-media': 'advanced-features',
        'secure-and-protect-channels': {
          defaultSourcePrefix: 'advanced-features',
          stems: {
            'prevent-stream-bombing': 'best-practices/prevent-stream-bombing',
          },
        },
        'set-up-your-project': 'get-started',
      },
    },
  ];

  for (const rule of productRules) {
    if (!target.startsWith(`${rule.targetPrefix}/`)) {
      continue;
    }

    const rest = target.slice(rule.targetPrefix.length + 1);
    const [group, stem] = rest.split('/');
    const groupRule = rule.groups[group];

    if (!groupRule || !stem || rest.split('/').length !== 2) {
      continue;
    }

    const sourceStem =
      typeof groupRule === 'string'
        ? `${groupRule}/${stem}`
        : (groupRule.stems?.[stem] ??
          `${groupRule.defaultSourcePrefix}/${stem}`);

    addCandidate(candidates, {
      reason: 'video-sdk-build-group-alias',
      sourceFile: `${rule.sourceProduct}/${sourceStem}`,
      sourceProduct: rule.sourceProduct,
    });
  }
}

function addRestApiLaneCandidates(
  candidates,
  {
    reason,
    sourcePrefix,
    sourceProduct,
    target,
    targetPrefix,
    transformRestStem,
  },
) {
  if (!target.startsWith(`${targetPrefix}/`)) {
    return;
  }

  const rest = target.slice(targetPrefix.length + 1);
  const sourceStem = transformRestStem
    ? transformRestStem(rest)
    : transformGenericRestStem(rest);
  const sourceFile = sourceStem.includes('/')
    ? `${sourceProduct}/${sourceStem}`
    : `${sourceProduct}/${sourcePrefix}/${sourceStem}`;

  addCandidate(candidates, {
    reason,
    sourceFile,
    sourceProduct,
  });
}

function addRealtimeProductAliasCandidates(candidates, target) {
  addChatBuildGroupCandidates(candidates, target);
  addMappedStemCandidates(candidates, {
    reason: 'chat-client-api-lane',
    sourceProduct: 'agora-chat',
    sourcePrefix: 'client-api',
    target,
    targetPrefix: 'realtime-media/im/build',
  });
  addMappedStemCandidates(candidates, {
    reason: 'chat-agora-console-lane',
    sourceProduct: 'agora-chat',
    sourcePrefix: 'agora-console',
    target,
    targetPrefix: 'realtime-media/im/reference/console',
  });
  addMappedStemCandidates(candidates, {
    reason: 'server-gateway-build-lane',
    sourceProduct: 'server-gateway',
    sourcePrefix: 'develop',
    target,
    targetPrefix: 'realtime-media/rtc-server-sdk/build',
  });
  addServerGatewayBuildCandidates(candidates, target);
  addSignalingBuildCandidates(candidates, target);
  addMappedStemCandidates(candidates, {
    reason: 'signaling-core-functionality-lane',
    sourceProduct: 'signaling',
    sourcePrefix: 'core-functionality',
    target,
    targetPrefix: 'realtime-media/rtm/build/channels',
  });
  addMappedStemCandidates(candidates, {
    reason: 'signaling-core-functionality-lane',
    sourceProduct: 'signaling',
    sourcePrefix: 'core-functionality',
    target,
    targetPrefix: 'realtime-media/rtm/build/connection',
  });
  addMappedStemCandidates(candidates, {
    reason: 'signaling-core-functionality-lane',
    sourceProduct: 'signaling',
    sourcePrefix: 'core-functionality',
    target,
    targetPrefix: 'realtime-media/rtm/build/messaging',
  });
  addMappedStemCandidates(candidates, {
    reason: 'signaling-core-functionality-lane',
    sourceProduct: 'signaling',
    sourcePrefix: 'core-functionality',
    target,
    targetPrefix: 'realtime-media/rtm/build/storage',
  });
  addMappedStemCandidates(candidates, {
    reason: 'media-gateway-build-lane',
    sourceProduct: 'media-gateway',
    sourcePrefix: 'get-started',
    target,
    targetPrefix: 'realtime-media/rtmp-gateway/build',
  });
  addMediaGatewayBuildCandidates(candidates, target);
  addMappedStemCandidates(candidates, {
    reason: 'media-gateway-reference-lane',
    sourceProduct: 'media-gateway',
    sourcePrefix: 'overview',
    target,
    targetPrefix: 'realtime-media/rtmp-gateway/reference',
  });
  addMappedStemCandidates(candidates, {
    reason: 'media-gateway-reference-lane',
    sourceProduct: 'media-gateway',
    sourcePrefix: 'reference',
    target,
    targetPrefix: 'realtime-media/rtmp-gateway/reference',
  });
  addMarketplaceBuildCandidates(candidates, target);
  addCloudRecordingBuildCandidates(candidates, target);
  addOnPremiseRecordingBuildCandidates(candidates, target);
  addSpeechToTextBuildCandidates(candidates, target);
  addWhiteboardBuildCandidates(candidates, target);

  const exactMappings = {
    'realtime-media/im/build/access-token-2':
      'agora-chat/reference/access-token-2',
    'realtime-media/im/build/authentication':
      'agora-chat/develop/authentication',
    'realtime-media/im/build/callbacks-events':
      'agora-chat/reference/callbacks-events',
    'realtime-media/im/build/ip-allowlist': 'agora-chat/develop/ip_allowlist',
    'realtime-media/im/build/ip-whitelist-rest-api':
      'agora-chat/agora-console/ip_whitelist',
    'realtime-media/im/get-started-sdk':
      'agora-chat/get-started/get-started-sdk',
    'realtime-media/im/get-started-uikit':
      'agora-chat/get-started/get-started-uikit',
    'realtime-media/im/get-started/manage-agora-account':
      'agora-chat/agora-console/manage-agora-account',
    'realtime-media/im/index': 'agora-chat/overview/product-overview',
    'realtime-media/im/reference/operations/account-settlement':
      'agora-chat/overview/account-settlement',
    'realtime-media/cloud-recording/middleware-quickstart':
      'cloud-recording/get-started/middleware-quickstart',
    'realtime-media/cloud-recording/pricing-webpage-recording':
      'cloud-recording/overview/pricing-webpage-recording',
    'realtime-media/cloud-recording/reference/common-errors':
      'cloud-recording/rest-api/status-codes',
    'realtime-media/cloud-recording/reference/restful-api':
      'cloud-recording/rest-api/overview',
    'realtime-media/cloud-recording/rest-quickstart':
      'cloud-recording/get-started/getstarted',
    'realtime-media/marketplace/quickstart-implement':
      'extensions-marketplace/get-started/quickstart-implement',
    'realtime-media/marketplace/quickstart-integrate':
      'extensions-marketplace/get-started/quickstart-integrate',
    'realtime-media/on-premise-recording/quickstart':
      'on-premise-recording/get-started/quickstart',
    'realtime-media/on-premise-recording/reference/pricing':
      'on-premise-recording/overview/billing',
    'realtime-media/rtc-server-sdk/index':
      'server-gateway/overview/product-overview',
    'realtime-media/rtc-server-sdk/build/compile-run-sample-project':
      'server-gateway/get-started/compile-run-sample-project',
    'realtime-media/rtc-server-sdk/build/manage-agora-account':
      'server-gateway/get-started/manage-agora-account',
    'realtime-media/rtc-server-sdk/quickstart':
      'server-gateway/get-started/integrate-sdk',
    'realtime-media/rtc-server-sdk/reference/billing-policies':
      'server-gateway/reference/billing-policies',
    'realtime-media/rtc-server-sdk/reference/downloads':
      'server-gateway/reference/download',
    'realtime-media/rtc-server-sdk/reference/glossary':
      'server-gateway/reference/glossary',
    'realtime-media/rtc-server-sdk/reference/pricing':
      'server-gateway/overview/pricing',
    'realtime-media/rtc-server-sdk/reference/release-notes':
      'server-gateway/overview/release-notes',
    'realtime-media/rtc-server-sdk/reference/security':
      'server-gateway/reference/security',
    'realtime-media/rtm/beginners-guide': 'signaling/overview/beginners-guide',
    'realtime-media/rtm/build/authentication-workflow':
      'signaling/get-started/authentication-workflow',
    'realtime-media/rtm/build/channels/channel-basics':
      'signaling/get-started/channel-basics',
    'realtime-media/rtm/build/client-configuration':
      'signaling/get-started/client-configuration',
    'realtime-media/rtm/build/data-encryption':
      'signaling/core-functionality/data-encryption',
    'realtime-media/rtm/build/geofencing':
      'signaling/core-functionality/geofencing',
    'realtime-media/rtm/build/messaging/add-event-listener':
      'signaling/get-started/add-event-listener',
    'realtime-media/rtm/build/presence':
      'signaling/core-functionality/presence',
    'realtime-media/rtm/console-overview':
      'signaling/reference/console-overview',
    'realtime-media/rtm/index': 'signaling/overview/product-overview',
    'realtime-media/rtm/quickstart': 'signaling/get-started/sdk-quickstart',
    'realtime-media/rtm/reference/channel-naming':
      'signaling/core-functionality/channel-naming',
    'realtime-media/rtm/security': 'signaling/reference/security',
    'realtime-media/rtmp-gateway/build/enable-adaptive-bitrate':
      'media-gateway/advanced/abr',
    'realtime-media/rtmp-gateway/build/enable-media-gateway':
      'media-gateway/get-started/enable-media-gateway',
    'realtime-media/rtmp-gateway/build/pvc-and-super-quality-configuration':
      'media-gateway/advanced/low-bitrate-hd',
    'realtime-media/rtmp-gateway/build/quickstart-best-practices':
      'media-gateway/best-practices/best-practice',
    'realtime-media/rtmp-gateway/build/receive-notifications':
      'media-gateway/develop/receive-notifications',
    'realtime-media/rtmp-gateway/index':
      'media-gateway/overview/product-overview',
    'realtime-media/rtmp-gateway/quickstart':
      'media-gateway/get-started/quickstart',
    'realtime-media/rtmp-gateway/reference/core-concepts':
      'media-gateway/overview/core-concepts',
    'realtime-media/rtmp-gateway/reference/media-gateway-features':
      'media-gateway/overview/product-features',
    'realtime-media/rtmp-gateway/reference/integration':
      'media-gateway/best-practices/best-practice',
    'realtime-media/speech-to-text/build/enable-service':
      'real-time-stt/best-practice/enable-service',
    'realtime-media/speech-to-text/build/optimize-quality':
      'real-time-stt/best-practice/optimize-quality',
    'realtime-media/speech-to-text/reference/manage-agora-account':
      'real-time-stt/get-started/manage-agora-account',
    'realtime-media/speech-to-text/reference/supported-languages':
      'real-time-stt/develop/supported-languages',
    'realtime-media/transcoding/build/receive-ncs-events':
      'cloud-transcoding/reference/webhooks/receive-ncs-events',
    'realtime-media/transcoding/reference/ncs-events':
      'cloud-transcoding/reference/webhooks/ncs-events',
    'realtime-media/transcoding/rest-quickstart':
      'cloud-transcoding/get-started/rest-quickstart',
    'realtime-media/transcoding/sdk-quickstart':
      'cloud-transcoding/get-started/quickstart',
    'realtime-media/video/get-started-sdk':
      'video-calling/get-started/get-started-sdk',
    'realtime-media/rtmp-gateway/reference/srt-streaming':
      'media-gateway/best-practices/srt-streaming',
  };

  for (const [targetPath, sourceFile] of Object.entries(exactMappings)) {
    addExactCandidate(candidates, {
      reason: 'realtime-product-lane-alias',
      sourceFile,
      sourceProduct: sourceFile.split('/')[0],
      target,
      targetPath,
    });
  }
}

function addChatBuildGroupCandidates(candidates, target) {
  addGroupedBuildCandidate(candidates, {
    chooseSourceStem: (stem, group) => {
      const groupPrefixes = {
        'build-core-messaging': 'client-api',
        'build-core-messaging/messages': 'client-api/messages',
        'build-groups-rooms-and-threads/chat-group': 'client-api/chat-group',
        'build-groups-rooms-and-threads/chat-room': 'client-api/chat-room',
        'build-groups-rooms-and-threads/threading': 'client-api/threading',
        'moderate-and-manage-client-behavior': 'develop',
        'notifications-and-event-handling/offline-push': 'develop/offline-push',
      };
      const exactMappings = {
        'notifications-and-event-handling/callbacks-events':
          'reference/callbacks-events',
        'notifications-and-event-handling/setup-webhooks':
          'develop/setup-webhooks',
        'secure-access-and-authentication/access-token-2':
          'reference/access-token-2',
        'secure-access-and-authentication/authentication':
          'develop/authentication',
        'secure-access-and-authentication/ip-allowlist': 'develop/ip_allowlist',
        'secure-access-and-authentication/ip-whitelist-rest-api':
          'agora-console/ip_whitelist',
        'secure-access-and-authentication/proxy': 'develop/proxy',
      };
      const exactSourceStem = exactMappings[`${group}/${stem}`];

      if (exactSourceStem) {
        return exactSourceStem;
      }

      const sourcePrefix = groupPrefixes[group];

      return sourcePrefix ? `${sourcePrefix}/${stem}` : null;
    },
    reason: 'chat-build-group-lane',
    sourceProduct: 'agora-chat',
    target,
    targetPrefix: 'realtime-media/im/build',
  });
}

function addServerGatewayBuildCandidates(candidates, target) {
  addGroupedBuildCandidate(candidates, {
    chooseSourceStem: (stem, group) => {
      const groupPrefixes = {
        'build-core-media-features': 'develop',
        'secure-and-optimize-connections': 'develop',
        'set-up-your-project': 'get-started',
      };
      const sourcePrefix = groupPrefixes[group];

      return sourcePrefix ? `${sourcePrefix}/${stem}` : null;
    },
    reason: 'server-gateway-build-group-lane',
    sourceProduct: 'server-gateway',
    target,
    targetPrefix: 'realtime-media/rtc-server-sdk/build',
  });
}

function addSignalingBuildCandidates(candidates, target) {
  addGroupedBuildCandidate(candidates, {
    chooseSourceStem: (stem, group) => {
      const exactMappings = {
        'connect-and-authenticate/authentication-workflow':
          'get-started/authentication-workflow',
        'connect-and-authenticate/client-configuration':
          'get-started/client-configuration',
        'connect-and-authenticate/connection/connection-management':
          'core-functionality/connection-management',
        'connect-and-authenticate/connection/connection-state-transitions':
          'core-functionality/connection-state-transitions',
        'manage-presence-and-metadata/presence': 'core-functionality/presence',
        'manage-presence-and-metadata/storage/store-channel-metadata':
          'core-functionality/store-channel-metadata',
        'manage-presence-and-metadata/storage/store-user-metadata':
          'core-functionality/store-user-metadata',
        'secure-your-app-and-data/data-encryption':
          'core-functionality/data-encryption',
        'secure-your-app-and-data/geofencing': 'core-functionality/geofencing',
        'send-and-receive-messages/messaging/add-event-listener':
          'get-started/add-event-listener',
        'send-and-receive-messages/messaging/message-history':
          'core-functionality/message-history',
        'send-and-receive-messages/messaging/message-payload-structuring':
          'core-functionality/message-payload-structuring',
        'work-with-channels/channels/channel-basics':
          'get-started/channel-basics',
        'work-with-channels/channels/message-channel':
          'core-functionality/message-channel',
        'work-with-channels/channels/stream-channel':
          'core-functionality/stream-channel',
        'work-with-channels/channels/topics': 'core-functionality/topics',
        'work-with-channels/channels/user-channel':
          'core-functionality/user-channel',
      };

      return exactMappings[`${group}/${stem}`] ?? null;
    },
    reason: 'signaling-build-group-lane',
    sourceProduct: 'signaling',
    target,
    targetPrefix: 'realtime-media/rtm/build',
  });
}

function addMediaGatewayBuildCandidates(candidates, target) {
  addGroupedBuildCandidate(candidates, {
    chooseSourceStem: (stem, group) => {
      const exactMappings = {
        'optimize-quality-and-monitor-events/enable-adaptive-bitrate':
          'advanced/abr',
        'optimize-quality-and-monitor-events/pvc-and-super-quality-configuration':
          'advanced/low-bitrate-hd',
        'optimize-quality-and-monitor-events/receive-notifications':
          'develop/receive-notifications',
        'set-up-and-authenticate/enable-media-gateway':
          'get-started/enable-media-gateway',
        'set-up-and-authenticate/quickstart-best-practices':
          'best-practices/best-practice',
      };

      return exactMappings[`${group}/${stem}`] ?? null;
    },
    reason: 'media-gateway-build-group-lane',
    sourceProduct: 'media-gateway',
    target,
    targetPrefix: 'realtime-media/rtmp-gateway/build',
  });
}

function addWhiteboardBuildCandidates(candidates, target) {
  addGroupedBuildCandidate(candidates, {
    chooseSourceStem: (stem, group) => {
      const groupPrefixes = {
        'authenticate-users': 'develop',
        'display-files-and-manage-scenes': 'develop',
        'display-files-and-manage-scenes/scenes': 'develop/scenes',
        'draw-and-edit-content': 'develop',
        'manage-room-state-and-events': 'develop',
        'migrate-and-accelerate-development': 'develop',
        'set-up-and-build-your-first-app': 'get-started',
      };
      const sourcePrefix = groupPrefixes[group];

      return sourcePrefix ? `${sourcePrefix}/${stem}` : null;
    },
    reason: 'whiteboard-build-group-lane',
    sourceProduct: 'interactive-whiteboard',
    target,
    targetPrefix: 'realtime-media/whiteboard/build',
  });
}

function addMarketplaceBuildCandidates(candidates, target) {
  const implementPages = new Set([
    'audio-filter',
    'implementation-guide',
    'provisioning',
    'publish-extension',
    'signature-algorithm',
    'usage',
    'video-filter',
  ]);
  const integrateStemAliases = {
    'ht-3d-avatar': 'ht_3d_avatar',
  };

  addGroupedBuildCandidate(candidates, {
    chooseSourceStem: (stem) =>
      implementPages.has(stem)
        ? `develop/implement/${stem}`
        : `develop/integrate/${integrateStemAliases[stem] ?? stem}`,
    reason: 'marketplace-build-lane',
    sourceProduct: 'extensions-marketplace',
    target,
    targetPrefix: 'realtime-media/marketplace/build',
  });
}

function addCloudRecordingBuildCandidates(candidates, target) {
  const sourcePrefixesByGroup = {
    'best-practices': 'best-practices',
    'customize-the-recording': 'develop',
    'handle-events': 'develop',
    'process-recorded-files': 'develop',
    'set-up-authentication': 'develop',
    'start-a-recording': 'develop',
  };

  addGroupedBuildCandidate(candidates, {
    chooseSourceStem: (stem, group) =>
      sourcePrefixesByGroup[group]
        ? `${sourcePrefixesByGroup[group]}/${stem}`
        : null,
    reason: 'cloud-recording-build-group-lane',
    sourceProduct: 'cloud-recording',
    target,
    targetPrefix: 'realtime-media/cloud-recording/build',
  });
}

function addOnPremiseRecordingBuildCandidates(candidates, target) {
  addGroupedBuildCandidate(candidates, {
    chooseSourceStem: (stem) => `develop/${stem}`,
    reason: 'on-premise-recording-build-group-lane',
    sourceProduct: 'on-premise-recording',
    target,
    targetPrefix: 'realtime-media/on-premise-recording/build',
  });
}

function addSpeechToTextBuildCandidates(candidates, target) {
  const bestPracticePages = new Set(['enable-service', 'optimize-quality']);

  addGroupedBuildCandidate(candidates, {
    chooseSourceStem: (stem) =>
      bestPracticePages.has(stem) ? `best-practice/${stem}` : `develop/${stem}`,
    reason: 'speech-to-text-build-group-lane',
    sourceProduct: 'real-time-stt',
    target,
    targetPrefix: 'realtime-media/speech-to-text/build',
  });
}

function addGroupedBuildCandidate(
  candidates,
  { chooseSourceStem, reason, sourceProduct, target, targetPrefix },
) {
  if (!target.startsWith(`${targetPrefix}/`)) {
    return;
  }

  const rest = target.slice(targetPrefix.length + 1);
  const parts = rest.split('/');

  const stem = parts.at(-1);
  const group = parts.slice(0, -1).join('/');
  const sourceStem = chooseSourceStem(stem, group);

  if (!sourceStem) {
    return;
  }

  addCandidate(candidates, {
    reason,
    sourceFile: `${sourceProduct}/${sourceStem}`,
    sourceProduct,
  });
}

function addProductRootAliasCandidates(candidates, target) {
  for (const rule of FULL_AUDIT_PRODUCT_RULES) {
    if (!target.startsWith(`${rule.targetPrefix}/`)) {
      continue;
    }

    const rest = target.slice(rule.targetPrefix.length + 1);
    const sourceStem =
      getProductRootSourceStem(rest) ?? getProductReferenceSourceStem(rest);

    if (!sourceStem) {
      continue;
    }

    addCandidate(candidates, {
      reason: 'product-root-lane-alias',
      sourceFile: `${rule.sourceProduct}/${sourceStem}`,
      sourceProduct: rule.sourceProduct,
    });
  }
}

function getProductReferenceSourceStem(rest) {
  if (!rest.startsWith('reference/')) {
    return null;
  }

  const referenceRest = rest.slice('reference/'.length);
  const overviewMappings = {
    'account-settlement': 'overview/account-settlement',
    pricing: 'overview/pricing',
    'release-notes': 'overview/release-notes',
    'subscription-packages': 'overview/subscription-packages',
    'supported-platforms': 'overview/supported-platforms',
  };
  const referenceMappings = {
    'billing-policies': 'reference/billing-policies',
    downloads: 'reference/downloads',
    glossary: 'reference/glossary',
    security: 'reference/security',
  };

  return (
    overviewMappings[referenceRest] ?? referenceMappings[referenceRest] ?? null
  );
}

function getProductRootSourceStem(rest) {
  const overviewMappings = {
    'account-settlement': 'overview/account-settlement',
    billing: 'overview/billing',
    'core-concepts': 'overview/core-concepts',
    'product-overview': 'overview/product-overview',
    pricing: 'overview/pricing',
    'release-notes': 'overview/release-notes',
    'subscription-packages': 'overview/subscription-packages',
  };
  const getStartedMappings = {
    'manage-agora-account': 'get-started/manage-agora-account',
    mcp: 'get-started/mcp',
    skills: 'get-started/skills',
  };
  const referenceMappings = {
    'billing-policies': 'reference/billing-policies',
    downloads: 'reference/downloads',
    glossary: 'reference/glossary',
    security: 'reference/security',
  };

  return (
    overviewMappings[rest] ??
    getStartedMappings[rest] ??
    referenceMappings[rest] ??
    null
  );
}

function addIntroductionAliasCandidates(candidates, target) {
  const exactMappings = {
    'introduction/account': 'shared/common/manage-agora-account/index',
    'introduction/agora-mcp': 'shared/common/build-with-ai/mcp',
    'introduction/agora-skills': 'shared/common/build-with-ai/skills',
    'introduction/billing/account-settlement':
      'shared/common/policies/_account-settlement',
    'introduction/core-concepts': 'shared/common/_core-concepts',
    'introduction/firewall': 'shared/common/_firewall',
    'introduction/glossary': 'shared/common/_glossary',
    'introduction/projects':
      'shared/common/manage-agora-account/_manage-projects',
  };

  for (const [targetPath, sourceFile] of Object.entries(exactMappings)) {
    addExactCandidate(candidates, {
      reason: 'introduction-shared-page-alias',
      sourceFile,
      sourceProduct: 'shared',
      target,
      targetPath,
    });
  }
}

function addSolutionsAliasCandidates(candidates, target) {
  addMappedStemCandidates(candidates, {
    reason: 'analytics-build-lane',
    sourceProduct: 'agora-analytics',
    sourcePrefix: 'analyze/video-voice-sdk',
    target,
    targetPrefix: 'solutions/agora-analytics/build',
  });
  addMappedStemCandidates(candidates, {
    reason: 'flexible-classroom-build-lane',
    sourceProduct: 'flexible-classroom',
    sourcePrefix: 'develop/best-practices',
    target,
    targetPrefix: 'solutions/flexible-classroom/build',
  });
  addMappedStemCandidates(candidates, {
    reason: 'flexible-classroom-build-lane',
    sourceProduct: 'flexible-classroom',
    sourcePrefix: 'develop/integrate',
    target,
    targetPrefix: 'solutions/flexible-classroom/build',
  });
  addAnalyticsGroupedBuildCandidates(candidates, target);
  addFlexibleClassroomGroupedBuildCandidates(candidates, target);
  addIotGroupedBuildCandidates(candidates, target);

  const exactMappings = {
    'solutions/agora-analytics/activation':
      'agora-analytics/get-started/activation',
    'solutions/agora-analytics/build/chat-data-insights':
      'agora-analytics/analyze/chat-sdk/data-insights',
    'solutions/agora-analytics/build/chat-data-metrics':
      'agora-analytics/analyze/chat-sdk/data-metrics',
    'solutions/agora-analytics/build/datadog-integration':
      'agora-analytics/analyze/datadog-integration',
    'solutions/agora-analytics/build/manage-agora-account':
      'agora-analytics/reference/manage-agora-account',
    'solutions/agora-analytics/product-overview':
      'agora-analytics/overview/product-overview',
    'solutions/flexible-classroom/build/authentication-workflow':
      'flexible-classroom/develop/integrate/authentication-workflow',
    'solutions/flexible-classroom/build/customize-classroom':
      'flexible-classroom/develop/integrate/customize-ui/customize-classroom',
    'solutions/flexible-classroom/build/customize-ui-scene-sdk':
      'flexible-classroom/develop/integrate/customize-ui/customize-ui-scene-sdk',
    'solutions/flexible-classroom/build/integrate-flexible-classroom':
      'flexible-classroom/develop/integrate/integrate-flexible-classroom/integrate',
    'solutions/flexible-classroom/build/integrate-flexible-classroom-fcr':
      'flexible-classroom/develop/integrate/integrate-flexible-classroom/integrate-flexible-classroom-fcr',
    'solutions/flexible-classroom/product-overview':
      'flexible-classroom/overview/product-overview',
    'solutions/flexible-classroom/quickstart':
      'flexible-classroom/get-started/demo-quickstart',
    'solutions/flexible-classroom/reference/classroom-rest-api':
      'flexible-classroom/reference/agora-console-rest-api',
    'solutions/flexible-classroom/reference/migration-guide':
      'flexible-classroom/develop/migration-guide',
    'solutions/interactive-live-streaming/build/use-tokens':
      'interactive-live-streaming/token-authentication/authentication-workflow',
    'solutions/iot/reference/communicate-with-rtc-sdk':
      'iot/reference/communicate_with_rtc_sdk',
    'solutions/iot/reference/licensing': 'iot/develop/licensing',
  };

  for (const [targetPath, sourceFile] of Object.entries(exactMappings)) {
    addExactCandidate(candidates, {
      reason: 'solutions-lane-alias',
      sourceFile,
      sourceProduct: sourceFile.split('/')[0],
      target,
      targetPath,
    });
  }
}

function addFlexibleClassroomGroupedBuildCandidates(candidates, target) {
  addGroupedBuildCandidate(candidates, {
    chooseSourceStem: (stem, group) => {
      const exactMappings = {
        'customize-the-ui-and-plugins/customize-classroom':
          'develop/integrate/customize-ui/customize-classroom',
        'customize-the-ui-and-plugins/customize-ui-scene-sdk':
          'develop/integrate/customize-ui/customize-ui-scene-sdk',
        'customize-the-ui-and-plugins/disable-whiteboard-module':
          'develop/best-practices/disable-whiteboard-module',
        'customize-the-ui-and-plugins/embed-custom-plugin':
          'develop/integrate/embed-custom-plugin',
        'enable-teaching-features/proctor-exams-online':
          'develop/proctor-exams-online',
        'enable-teaching-features/record-a-class':
          'develop/best-practices/record-a-class',
        'enable-teaching-features/supply-course-materials':
          'develop/best-practices/supply-course-materials',
        'integrate-the-sdks/integrate-flexible-classroom':
          'develop/integrate/integrate-flexible-classroom/integrate',
        'integrate-the-sdks/integrate-flexible-classroom-fcr':
          'develop/integrate/integrate-flexible-classroom/integrate-flexible-classroom-fcr',
        'integrate-the-sdks/integrate-system':
          'develop/integrate/integrate-system',
        'secure-your-classrooms/classroom-security':
          'develop/best-practices/classroom-security',
        'set-up-your-account-and-authentication/authentication-workflow':
          'develop/integrate/authentication-workflow',
        'set-up-your-account-and-authentication/enable-flexible-classroom':
          'get-started/enable-flexible-classroom',
      };

      return exactMappings[`${group}/${stem}`] ?? null;
    },
    reason: 'flexible-classroom-build-group-lane',
    sourceProduct: 'flexible-classroom',
    target,
    targetPrefix: 'solutions/flexible-classroom/build',
  });
}

function addAnalyticsGroupedBuildCandidates(candidates, target) {
  const chatPages = {
    'chat-data-insights': 'chat-sdk/data-insights',
    'chat-data-metrics': 'chat-sdk/data-metrics',
  };
  const rootAnalyzePages = new Set(['datadog-integration']);

  addGroupedBuildCandidate(candidates, {
    chooseSourceStem: (stem) => {
      if (chatPages[stem]) {
        return `analyze/${chatPages[stem]}`;
      }

      if (rootAnalyzePages.has(stem)) {
        return `analyze/${stem}`;
      }

      return `analyze/video-voice-sdk/${stem}`;
    },
    reason: 'analytics-build-group-lane',
    sourceProduct: 'agora-analytics',
    target,
    targetPrefix: 'solutions/agora-analytics/build',
  });
}

function addIotGroupedBuildCandidates(candidates, target) {
  addGroupedBuildCandidate(candidates, {
    chooseSourceStem: (stem) => `develop/${stem}`,
    reason: 'iot-build-group-lane',
    sourceProduct: 'iot',
    target,
    targetPrefix: 'solutions/iot/build',
  });
}

function addMappedStemCandidates(
  candidates,
  { reason, sourcePrefix, sourceProduct, target, targetPrefix },
) {
  if (!target.startsWith(`${targetPrefix}/`)) {
    return;
  }

  const rest = target.slice(targetPrefix.length + 1);
  addCandidate(candidates, {
    reason,
    sourceFile: `${sourceProduct}/${sourcePrefix}/${rest}`,
    sourceProduct,
  });
}

function addExactCandidate(
  candidates,
  { reason, sourceFile, sourceProduct, target, targetPath },
) {
  if (target !== targetPath) {
    return;
  }

  addCandidate(candidates, {
    reason,
    sourceFile,
    sourceProduct,
  });
}

function addCandidate(candidates, { reason, sourceFile, sourceProduct }) {
  for (const candidateFile of getSourceFileExtensionCandidates(sourceFile)) {
    candidates.push({
      reason,
      sourceFile: candidateFile,
      sourceProduct,
    });
  }
}

function getSourceFileExtensionCandidates(sourceFile) {
  const ext = path.posix.extname(sourceFile);

  if (ext === '.md' || ext === '.mdx') {
    return [sourceFile];
  }

  return [
    `${sourceFile}.mdx`,
    `${sourceFile}.md`,
    path.posix.join(sourceFile, 'index.mdx'),
    path.posix.join(sourceFile, 'index.md'),
  ];
}

function stripMarkdownExtension(filePath) {
  return filePath.replace(/\.(md|mdx)$/i, '');
}

function prefixUnderscoreBasename(stem) {
  const dirname = path.posix.dirname(stem);
  const basename = path.posix.basename(stem);
  const mapped = `_${basename}`;

  return dirname === '.' ? mapped : path.posix.join(dirname, mapped);
}

function transformGenericRestStem(rest) {
  const mappings = {
    authentication: 'restful-authentication',
    index: 'overview',
  };

  return mappings[rest] ?? rest;
}

function transformSpeechToTextRestStem(rest) {
  if (rest.startsWith('rest-api-v5/')) {
    return `rest-api/${rest.replace('rest-api-v5/', 'v5.x/')}`;
  }

  if (rest.startsWith('rest-api-v6/')) {
    return `rest-api/${rest.replace('rest-api-v6/', 'v6.x/')}`;
  }

  if (rest === 'api-callback-service') {
    return 'develop/api-callback-service';
  }

  return `rest-api/${transformGenericRestStem(rest)}`;
}

function getProjectionProductForSource(sourceFile) {
  const sourceProduct = sourceFile.split('/')[0];

  return SOURCE_PRODUCT_ALIASES[sourceProduct]?.product ?? sourceProduct;
}

function getSourceStemCandidates(stem) {
  const candidates = [stem];

  if (stem === 'index') {
    candidates.push('overview/product-overview');
  }

  if (stem === 'quickstart') {
    candidates.push('get-started/get-started-sdk');
  }

  if (stem.startsWith('build/')) {
    const suffix = stem.slice('build/'.length);
    candidates.push(`advanced-features/${suffix}`);
    candidates.push(`enhance-call-quality/${suffix}`);
    candidates.push(`best-practices/${suffix}`);
    candidates.push(`token-authentication/${suffix}`);
    candidates.push(`develop/${suffix}`);
    candidates.push(`get-started/${suffix}`);
  }

  if (stem.startsWith('reference/')) {
    const suffix = stem.slice('reference/'.length);
    candidates.push(`overview/${suffix}`);
    candidates.push(`troubleshooting/${suffix}`);
    candidates.push(`rest-api/${suffix}`);
    candidates.push(`channel-management-api/${suffix}`);
  }

  return [...new Set(candidates)];
}

function getExtensionCandidates(ext) {
  if (ext === '.md' || ext === '.mdx') {
    return [ext, ext === '.md' ? '.mdx' : '.md'];
  }

  return ['.mdx', '.md'];
}

function summarizePageParity(page) {
  return {
    changed: page.findings.changed.length,
    exactMatches: page.matches.exact,
    extra: page.findings.extra.length,
    ignored: page.ignored.length,
    missing: page.findings.missing.length,
    moved: page.findings.moved.length,
    sourceRecords: page.totals.sourceRecords,
    targetRecords: page.totals.targetRecords,
    unsupported: page.findings.unsupported.length,
    unresolvedDifferences:
      page.findings.changed.length +
      page.findings.extra.length +
      page.findings.missing.length +
      page.findings.moved.length +
      page.findings.unsupported.length,
  };
}

function getParityStatus(page) {
  return summarizePageParity(page).unresolvedDifferences === 0
    ? 'compared-clean'
    : 'compared-differences';
}

function summarizeFullAudit(pages, sourceFiles, sourceOnly) {
  const statusCounts = countBy(pages, (page) => page.status);
  const parityTotals = sumFullAuditParity(pages);

  return {
    ambiguousSource: statusCounts['ambiguous-source'] ?? 0,
    compareErrors: statusCounts['compare-error'] ?? 0,
    comparedClean: statusCounts['compared-clean'] ?? 0,
    comparedDifferences: statusCounts['compared-differences'] ?? 0,
    parityTotals,
    sourceOnly: sourceOnly.length,
    sourceFilesTotal: sourceFiles.length,
    targetFilesTotal: pages.length,
    unmappedTarget: statusCounts['unmapped-target'] ?? 0,
  };
}

function sumFullAuditParity(pages) {
  return pages.reduce(
    (totals, page) => {
      if (!page.parity) {
        return totals;
      }

      totals.changed += page.parity.changed;
      totals.extra += page.parity.extra;
      totals.missing += page.parity.missing;
      totals.moved += page.parity.moved;
      totals.unsupported += page.parity.unsupported;
      totals.unresolvedDifferences += page.parity.unresolvedDifferences;

      return totals;
    },
    {
      changed: 0,
      extra: 0,
      missing: 0,
      moved: 0,
      unsupported: 0,
      unresolvedDifferences: 0,
    },
  );
}

function inferSourceOnlyReason(filePath) {
  if (filePath.startsWith('shared/')) {
    return 'shared fragment; covered when imported by a mapped source page';
  }

  if (filePath.includes('/rest-api/') || filePath.includes('/api/')) {
    return 'source REST/API lane may map to generated OpenAPI routes';
  }

  return 'no deterministic target path rule matched';
}

function countBy(items, getKey) {
  const counts = {};

  for (const item of items) {
    const key = getKey(item);
    counts[key] = (counts[key] ?? 0) + 1;
  }

  return counts;
}

function readGitRef(root) {
  try {
    return runGit(root, ['rev-parse', 'HEAD']);
  } catch {
    return null;
  }
}

function runGit(cwd, args) {
  const result = spawnSync('git', args, {
    cwd,
    encoding: 'utf8',
  });

  if (result.status !== 0) {
    throw new Error(result.stderr.trim() || `git ${args.join(' ')} failed`);
  }

  return result.stdout.trim();
}

function mergeVariables(...sources) {
  const merged = {};

  for (const source of sources) {
    if (!source) {
      continue;
    }

    for (const [component, values] of Object.entries(source)) {
      merged[component] = {
        ...(merged[component] ?? {}),
        ...values,
      };
    }
  }

  return merged;
}

export function expandLegacyFiles({
  projection,
  sourceFiles,
  sourceRoot,
  variables = DEFAULT_VARIABLES,
}) {
  const resolvedFiles = [];
  const chunks = sourceFiles.map((sourceFile) =>
    expandLegacyFile({
      currentFile: path.resolve(sourceRoot, sourceFile),
      projection,
      resolvedFiles,
      seen: new Set(),
      sourceRoot,
      variables,
    }),
  );

  return {
    content: chunks.join('\n\n'),
    resolvedFiles: [
      ...new Set(
        resolvedFiles.map((filePath) =>
          toPosixPath(path.relative(sourceRoot, filePath)),
        ),
      ),
    ],
  };
}

function expandLegacyFile({
  currentFile,
  projection,
  resolvedFiles,
  seen,
  sourceRoot,
  variables,
}) {
  const resolvedCurrentFile = resolveMarkdownFile(currentFile);

  if (!resolvedCurrentFile) {
    throw new Error(`Unable to resolve legacy source file: ${currentFile}`);
  }

  if (seen.has(resolvedCurrentFile)) {
    return '';
  }

  seen.add(resolvedCurrentFile);
  resolvedFiles.push(resolvedCurrentFile);

  const raw = fs.readFileSync(resolvedCurrentFile, 'utf8');
  const { content, imports } = removeImports(stripFrontmatter(raw));
  let expanded = content;

  for (const importEntry of imports) {
    if (!importEntry.localName || !/^[A-Z]/.test(importEntry.localName)) {
      continue;
    }

    const importedPath = resolveImportSource({
      currentFile: resolvedCurrentFile,
      source: importEntry.source,
      sourceRoot,
    });

    if (!importedPath) {
      continue;
    }

    const importedContent = expandLegacyFile({
      currentFile: importedPath,
      projection,
      resolvedFiles,
      seen,
      sourceRoot,
      variables,
    });

    expanded = replaceComponentUsage(
      expanded,
      importEntry.localName,
      importedContent,
    );
  }

  expanded = filterProjectionWrappers(expanded, 'PlatformWrapper', {
    attrName: 'platform',
    projectionValue: projection.platform,
  });
  expanded = filterProjectionWrappers(expanded, 'ProductWrapper', {
    attrName: 'product',
    projectionValue: projection.product,
  });

  return expandVariables(expanded, variables);
}

function removeImports(content) {
  const imports = [];
  const withoutImports = content.replace(
    /^import\s+(.+?)\s+from\s+['"]([^'"]+)['"];?\s*$/gm,
    (_match, importClause, source) => {
      imports.push({
        localName: getDefaultImportName(importClause.trim()),
        source,
      });
      return '';
    },
  );

  return {
    content: withoutImports,
    imports,
  };
}

function getDefaultImportName(importClause) {
  if (importClause.startsWith('*')) {
    return null;
  }

  if (importClause.startsWith('{')) {
    return null;
  }

  return importClause.split(',')[0]?.trim() || null;
}

function resolveImportSource({ currentFile, source, sourceRoot }) {
  if (source.startsWith('@docs/shared/')) {
    return resolveMarkdownFile(
      path.join(sourceRoot, 'shared', source.slice('@docs/shared/'.length)),
    );
  }

  if (source.startsWith('@shared/')) {
    return resolveMarkdownFile(
      path.join(sourceRoot, 'shared', source.slice('@shared/'.length)),
    );
  }

  if (source.startsWith('.')) {
    return resolveMarkdownFile(path.resolve(path.dirname(currentFile), source));
  }

  return null;
}

function resolveMarkdownFile(candidatePath) {
  const candidates = [
    candidatePath,
    `${candidatePath}.mdx`,
    `${candidatePath}.md`,
    path.join(candidatePath, 'index.mdx'),
    path.join(candidatePath, 'index.md'),
  ];

  return candidates.find(
    (filePath) =>
      MARKDOWN_FILE_PATTERN.test(filePath) &&
      fs.existsSync(filePath) &&
      fs.statSync(filePath).isFile(),
  );
}

function replaceComponentUsage(content, componentName, replacement) {
  const escaped = escapeRegExp(componentName);
  const selfClosing = new RegExp(`<${escaped}\\s*\\/?>`, 'g');
  const paired = new RegExp(`<${escaped}\\b[^>]*>\\s*<\\/${escaped}>`, 'g');

  return content.replace(paired, replacement).replace(selfClosing, replacement);
}

export function projectTargetContent(content, { projection, variables }) {
  let projected = stripFrontmatter(content);

  projected = filterProjectionWrappers(projected, 'PlatformStructured', {
    attrName: 'platform',
    projectionValue: projection.platform,
  });
  projected = filterProjectionWrappers(projected, 'PlatformInline', {
    attrName: 'platform',
    projectionValue: projection.platform,
  });
  projected = expandVariables(projected, variables);

  return projected;
}

function filterProjectionWrappers(content, componentName, options) {
  const tagPattern = new RegExp(
    `<\\/?${escapeRegExp(componentName)}\\b[^>]*\\/?>`,
    'g',
  );
  const stack = [];
  let result = '';
  let offset = 0;

  for (const match of content.matchAll(tagPattern)) {
    const tag = match[0];
    const index = match.index ?? 0;

    if (isProjectionActive(stack)) {
      result += content.slice(offset, index);
    }

    if (tag.startsWith(`</${componentName}`)) {
      stack.pop();
    } else if (!tag.endsWith('/>')) {
      stack.push(shouldKeepProjectionTag(tag, options));
    }

    offset = index + tag.length;
  }

  if (isProjectionActive(stack)) {
    result += content.slice(offset);
  }

  return result;
}

function isProjectionActive(stack) {
  return stack.every(Boolean);
}

function shouldKeepProjectionTag(tag, { attrName, projectionValue }) {
  const allowedValue = readAttribute(tag, attrName);
  const notAllowedValue = readAttribute(tag, 'notAllowed');

  if (allowedValue) {
    return parseListAttribute(allowedValue).includes(projectionValue);
  }

  if (notAllowedValue) {
    return !parseListAttribute(notAllowedValue).includes(projectionValue);
  }

  return true;
}

function readAttribute(tag, attrName) {
  const quoted = new RegExp(
    `${escapeRegExp(attrName)}\\s*=\\s*(['"])([\\s\\S]*?)\\1`,
  ).exec(tag);

  if (quoted) {
    return quoted[2];
  }

  const expression = new RegExp(
    `${escapeRegExp(attrName)}\\s*=\\s*\\{([\\s\\S]*?)\\}`,
  ).exec(tag);

  return expression?.[1] ?? null;
}

function parseListAttribute(raw) {
  return raw
    .replace(/[[\]{}'"]/g, '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function expandVariables(content, variables) {
  return content.replace(
    /<(?<component>Vg|Vpd|Vpl)\b(?<attrs>[^>]*)\/>/g,
    (match, _component, _attrs, _offset, _source, groups) => {
      const key = readAttribute(match, 'k');
      const value = key ? variables[groups.component]?.[key] : null;

      return value ?? `[unsupported:${groups.component}.${key ?? 'unknown'}]`;
    },
  );
}

export function createIntermediateRecords({
  content,
  linkVariables = DEFAULT_LINK_VARIABLES,
  location,
  side,
}) {
  const normalizedContent = normalizeMdxSyntax(stripFrontmatter(content));
  const records = [];
  const paragraphLines = [];
  let paragraphStartLine = 1;
  let inCode = false;
  let codeFence = '';
  let codeLanguage = '';
  let codeLines = [];
  let codeStartLine = 1;
  const lines = normalizedContent.split('\n');

  function flushParagraph(currentLine) {
    if (paragraphLines.length === 0) {
      return;
    }

    const raw = paragraphLines.join(' ');
    const value = normalizeText(raw);

    if (value) {
      records.push(
        createRecord({
          kind: 'paragraph',
          line: paragraphStartLine,
          location,
          raw,
          records,
          side,
          value,
        }),
      );
    }

    paragraphLines.length = 0;
    paragraphStartLine = currentLine;
  }

  for (let index = 0; index < lines.length; index += 1) {
    const lineNumber = index + 1;
    const line = lines[index];
    const trimmed = line.trim();

    if (inCode) {
      if (trimmed.startsWith(codeFence)) {
        records.push(
          createRecord({
            kind: `code:${codeLanguage || 'text'}`,
            line: codeStartLine,
            location,
            raw: codeLines.join('\n'),
            records,
            side,
            value: normalizeCode(codeLines.join('\n')),
          }),
        );
        inCode = false;
        codeFence = '';
        codeLanguage = '';
        codeLines = [];
        continue;
      }

      codeLines.push(line);
      continue;
    }

    const fenceMatch = line.match(/^ {0,3}(`{3,}|~{3,})([A-Za-z0-9_-]*)/);

    if (fenceMatch) {
      flushParagraph(lineNumber);
      inCode = true;
      codeFence = fenceMatch[1];
      codeLanguage = fenceMatch[2] || 'text';
      codeStartLine = lineNumber;
      codeLines = [];
      continue;
    }

    if (!trimmed) {
      flushParagraph(lineNumber);
      continue;
    }

    const tabMatch = trimmed.match(/^@@TAB:(.+)$/);

    if (tabMatch) {
      flushParagraph(lineNumber);
      records.push(
        createRecord({
          kind: 'tab',
          line: lineNumber,
          location,
          raw: trimmed,
          records,
          side,
          value: normalizeText(tabMatch[1]),
        }),
      );
      continue;
    }

    const calloutMatch = trimmed.match(
      /^:{3,}\s*([A-Za-z0-9_-]+)?(?:\[(.*?)\])?/,
    );

    if (calloutMatch) {
      flushParagraph(lineNumber);
      records.push(
        createRecord({
          kind: 'callout',
          line: lineNumber,
          location,
          raw: trimmed,
          records,
          side,
          value: normalizeCalloutValue(calloutMatch[1], calloutMatch[2]),
        }),
      );
      continue;
    }

    if (/^:{3,}\s*$/.test(trimmed)) {
      flushParagraph(lineNumber);
      continue;
    }

    const headingMatch = trimmed.match(/^(#{1,6})\s+(.+)$/);

    if (headingMatch) {
      flushParagraph(lineNumber);
      records.push(
        createRecord({
          kind: `heading:${headingMatch[1].length}`,
          line: lineNumber,
          location,
          raw: trimmed,
          records,
          side,
          value: normalizeText(headingMatch[2]),
        }),
      );
      continue;
    }

    if (isJsxOnlyLine(trimmed)) {
      flushParagraph(lineNumber);
      const unsupported = collectUnsupportedComponents(trimmed);

      for (const component of unsupported) {
        records.push(
          createRecord({
            kind: 'unsupported',
            line: lineNumber,
            location,
            raw: trimmed,
            records,
            side,
            value: component,
          }),
        );
      }
      continue;
    }

    for (const image of collectImages(line)) {
      records.push(
        createRecord({
          kind: 'image',
          line: lineNumber,
          location,
          raw: image.raw,
          records,
          side,
          value: `${normalizeText(image.alt)} -> ${normalizeHref(
            image.src,
            linkVariables,
          )}`,
        }),
      );
    }

    for (const link of collectLinks(line)) {
      records.push(
        createRecord({
          kind: 'link',
          line: lineNumber,
          location,
          raw: link.raw,
          records,
          side,
          value: `${normalizeVisibleText(link.label)} -> ${normalizeHref(
            link.href,
            linkVariables,
          )}`,
        }),
      );
    }

    if (/^\|.+\|$/.test(trimmed)) {
      flushParagraph(lineNumber);
      records.push(
        createRecord({
          kind: 'table-row',
          line: lineNumber,
          location,
          raw: trimmed,
          records,
          side,
          value: normalizeTableRow(trimmed),
        }),
      );
      continue;
    }

    const listMatch = trimmed.match(/^([-*+]|\d+\.)\s+(.+)$/);

    if (listMatch) {
      flushParagraph(lineNumber);
      records.push(
        createRecord({
          kind: 'list-item',
          line: lineNumber,
          location,
          raw: trimmed,
          records,
          side,
          value: normalizeVisibleText(listMatch[2], linkVariables),
        }),
      );
      continue;
    }

    if (paragraphLines.length === 0) {
      paragraphStartLine = lineNumber;
    }

    paragraphLines.push(line);
  }

  flushParagraph(lines.length + 1);

  return records;
}

function normalizeMdxSyntax(content) {
  let normalized = content.replace(/\r\n?/g, '\n');

  normalized = normalized.replace(
    /<Link\b([^>]*)>([\s\S]*?)<\/Link>/g,
    (_match, attrs, body) => {
      const href =
        readAttribute(`<Link ${attrs}>`, 'to') ??
        readAttribute(`<Link ${attrs}>`, 'href');
      return href ? `[${normalizePlainText(body).trim()}](${href})` : body;
    },
  );
  normalized = normalized.replace(/<Image\b([^>]*)\/>/g, (_match, attrs) => {
    const src = readAttribute(`<Image ${attrs}>`, 'src') ?? '';
    const alt = readAttribute(`<Image ${attrs}>`, 'alt') ?? '';
    return src ? `![${alt}](${src})` : '';
  });
  normalized = normalized.replace(/<Admonition\b([^>]*)>/g, (_match, attrs) => {
    const type = readAttribute(`<Admonition ${attrs}>`, 'type') ?? 'note';
    const title = readAttribute(`<Admonition ${attrs}>`, 'title');
    return title
      ? `:::${mapAdmonitionType(type)}[${title}]`
      : `:::${mapAdmonitionType(type)}`;
  });
  normalized = normalized.replace(/<\/Admonition>/g, ':::');
  normalized = normalized.replace(
    /<CodeBlock\b([^>]*)>\s*\{`([\s\S]*?)`}\s*<\/CodeBlock>/g,
    (_match, attrs, code) => {
      const language = readAttribute(`<CodeBlock ${attrs}>`, 'language') ?? '';
      return [`\`\`\`${language}`, decodeTemplateCode(code), '```'].join('\n');
    },
  );
  normalized = normalized.replace(
    /<TabItem\b([^>]*)>/g,
    (_match, attrs) =>
      `@@TAB:${readAttribute(`<TabItem ${attrs}>`, 'value') ?? readAttribute(`<TabItem ${attrs}>`, 'label') ?? 'tab'}`,
  );
  normalized = normalized.replace(/<\/TabItem>/g, '');
  normalized = normalized.replace(
    /<CodeBlockTabsTrigger\b[^>]*>[\s\S]*?<\/CodeBlockTabsTrigger>/g,
    '',
  );
  normalized = normalized.replace(/<\/?CodeBlockTabsList\b[^>]*>/g, '');
  normalized = normalized.replace(
    /<CodeBlockTab\b([^>]*)>/g,
    (_match, attrs) =>
      `@@TAB:${readAttribute(`<CodeBlockTab ${attrs}>`, 'value') ?? 'tab'}`,
  );
  normalized = normalized.replace(/<\/CodeBlockTab>/g, '');
  normalized = normalized.replace(/<\/?(Tabs|CodeBlockTabs)\b[^>]*>/g, '');
  normalized = normalized.replace(
    /<summary>([\s\S]*?)<\/summary>/g,
    (_match, summary) => `**${summary.trim()}**`,
  );
  normalized = normalized.replace(/<\/?details>/g, '');
  normalized = normalized.replace(/^export\s+const\s+.+$/gm, '');

  return normalized;
}

function mapAdmonitionType(type) {
  if (type === 'caution') {
    return 'warning';
  }

  if (type === 'danger') {
    return 'error';
  }

  return type || 'note';
}

function decodeTemplateCode(code) {
  return code.replace(/\\`/g, '`').replace(/\\\$/g, '$');
}

function createRecord({ kind, value, raw, side, location, line, records }) {
  const record = {
    hash: hashString(`${kind}\0${value}`),
    kind,
    line,
    location,
    order: records.length,
    raw,
    side,
    value,
  };

  return record;
}

function collectImages(line) {
  return [...line.matchAll(/!\[([^\]]*)]\(([^)]+)\)/g)].map((match) => ({
    alt: match[1],
    raw: match[0],
    src: match[2],
  }));
}

function collectLinks(line) {
  const links = [];

  replaceMarkdownLinks(line, ({ href, label, raw }) => {
    links.push({
      href,
      label,
      raw,
    });
    return raw;
  });

  return links;
}

function collectUnsupportedComponents(line) {
  return [...line.matchAll(/<\/?([A-Z][A-Za-z0-9_.]*)\b/g)]
    .map((match) => match[1].split('.')[0])
    .filter((component) => !KNOWN_STRUCTURAL_COMPONENTS.has(component));
}

function isJsxOnlyLine(trimmed) {
  return /^<\/?[A-Z][^>]*>$/.test(trimmed);
}

function normalizeTableRow(row) {
  return row
    .split('|')
    .map((cell) => normalizeText(cell))
    .filter(Boolean)
    .join(' | ');
}

function normalizeText(value) {
  return normalizePlainText(value).replace(/\s+/g, ' ').trim();
}

function normalizeVisibleText(value, linkVariables = DEFAULT_LINK_VARIABLES) {
  const linkTokens = [];
  const withLinkTokens = replaceMarkdownLinks(value, ({ href, label }) => {
    const token = `ZZLINKTOKEN${linkTokens.length}ZZ`;
    linkTokens.push(
      `${normalizeVisibleText(label, linkVariables)} (${normalizeHref(
        href,
        linkVariables,
      )})`,
    );
    return token;
  });

  let normalized = normalizePlainText(withLinkTokens);

  for (const [index, replacement] of linkTokens.entries()) {
    normalized = normalized.replace(`ZZLINKTOKEN${index}ZZ`, replacement);
  }

  return normalized.replace(/\s+/g, ' ').trim();
}

function replaceMarkdownLinks(value, replacer) {
  let result = '';
  let offset = 0;

  while (offset < value.length) {
    const open = value.indexOf('[', offset);

    if (open === -1) {
      result += value.slice(offset);
      break;
    }

    if (open > 0 && value[open - 1] === '!') {
      result += value.slice(offset, open + 1);
      offset = open + 1;
      continue;
    }

    const close = findMatchingBracket(value, open);

    if (close === -1 || value[close + 1] !== '(') {
      result += value.slice(offset, open + 1);
      offset = open + 1;
      continue;
    }

    const hrefEnd = value.indexOf(')', close + 2);

    if (hrefEnd === -1) {
      result += value.slice(offset, open + 1);
      offset = open + 1;
      continue;
    }

    const raw = value.slice(open, hrefEnd + 1);
    const label = value.slice(open + 1, close);
    const href = value.slice(close + 2, hrefEnd);

    result += value.slice(offset, open);
    result += replacer({
      href,
      label,
      raw,
    });
    offset = hrefEnd + 1;
  }

  return result;
}

function findMatchingBracket(value, open) {
  let depth = 0;

  for (let index = open; index < value.length; index += 1) {
    if (value[index] === '[') {
      depth += 1;
      continue;
    }

    if (value[index] !== ']') {
      continue;
    }

    depth -= 1;

    if (depth === 0) {
      return index;
    }
  }

  return -1;
}

function normalizePlainText(value) {
  return value
    .replace(/<[^>]+>/g, ' ')
    .replace(/!\[([^\]]*)]\([^)]+\)/g, '$1')
    .replace(/\[([^\]]+)]\([^)]+\)/g, '$1')
    .replace(/[`*_{}[\]]/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/\bGlobal\.([A-Z0-9_]+)\b/g, 'Global.$1')
    .replace(/\bglobal\.([A-Z0-9_]+)\b/g, 'global.$1');
}

function normalizeCalloutValue(type, title) {
  const normalizedType = type === 'info' ? 'note' : (type ?? 'note');
  const normalizedTitle = normalizeText(title ?? '');

  if (
    !normalizedTitle ||
    normalizedTitle.toLowerCase() === 'information' ||
    normalizedTitle.toLowerCase() === normalizedType.toLowerCase()
  ) {
    return normalizedType;
  }

  return `${normalizedType} ${normalizedTitle}`;
}

function normalizeCode(value) {
  const lines = value.replace(/\r\n?/g, '\n').split('\n');
  const trimmedLines = trimBlankEdges(lines).map((line) => line.trimEnd());
  const commonIndent = getCommonIndent(trimmedLines);

  return trimmedLines
    .map((line) => line.slice(Math.min(commonIndent, leadingSpaces(line))))
    .map((line) => line.trim())
    .join('\n')
    .trim();
}

function trimBlankEdges(lines) {
  let start = 0;
  let end = lines.length;

  while (start < end && !lines[start].trim()) {
    start += 1;
  }

  while (end > start && !lines[end - 1].trim()) {
    end -= 1;
  }

  return lines.slice(start, end);
}

function getCommonIndent(lines) {
  const indents = lines
    .filter((line) => line.trim())
    .map((line) => leadingSpaces(line));

  return indents.length > 0 ? Math.min(...indents) : 0;
}

function leadingSpaces(line) {
  return line.match(/^ */)?.[0].length ?? 0;
}

function normalizeHref(href, linkVariables) {
  let normalized = href
    .trim()
    .replace(/{{\s*([^}]+)\s*}}/g, (_match, variable) => `{{${variable}}}`);

  for (const [variable, replacement] of Object.entries(linkVariables)) {
    normalized = normalized.replaceAll(variable, replacement);
  }

  normalized = normalized.replace(/\.mdx?(#|$)/, '$1');
  normalized = normalized.replace(/\/index(#|$)/, '$1');
  normalized = normalized.replace(/([^:])\/{2,}/g, '$1/');

  return normalized;
}

function applyIgnoreRules({ ignoreRules, records }) {
  const ignored = [];

  for (const rule of ignoreRules) {
    for (const record of records) {
      if (!matchesIgnoreRule(record, rule)) {
        continue;
      }

      ignored.push({
        record: summarizeRecord(record),
        recordId: recordId(record),
        ruleId: rule.id ?? 'unnamed-ignore',
        reason: rule.reason,
      });
    }
  }

  return uniqueBy(ignored, (entry) => entry.recordId);
}

function matchesIgnoreRule(record, rule) {
  if (rule.side && rule.side !== 'both' && record.side !== rule.side) {
    return false;
  }

  if (rule.kind && record.kind !== rule.kind) {
    return false;
  }

  if (rule.equals && record.value !== rule.equals) {
    return false;
  }

  if (rule.contains && !record.value.includes(rule.contains)) {
    return false;
  }

  if (rule.regex && !new RegExp(rule.regex).test(record.value)) {
    return false;
  }

  return Boolean(rule.equals || rule.contains || rule.regex || rule.kind);
}

export function compareRecords({ sourceRecords, targetRecords }) {
  const targetBuckets = new Map();

  for (const record of targetRecords) {
    const key = recordKey(record);
    targetBuckets.set(key, [...(targetBuckets.get(key) ?? []), record]);
  }

  const exactMatches = [];
  const unmatchedSource = [];
  const matchedTargetIds = new Set();

  for (const sourceRecord of sourceRecords) {
    const bucket = targetBuckets.get(recordKey(sourceRecord)) ?? [];
    const targetRecord = bucket.shift();

    if (targetRecord) {
      exactMatches.push({
        source: sourceRecord,
        target: targetRecord,
      });
      matchedTargetIds.add(recordId(targetRecord));
      continue;
    }

    unmatchedSource.push(sourceRecord);
  }

  const unmatchedTarget = targetRecords.filter(
    (record) => !matchedTargetIds.has(recordId(record)),
  );
  const changed = [];
  const changedSourceIds = new Set();
  const changedTargetIds = new Set();

  for (const sourceRecord of unmatchedSource) {
    const candidate = findBestChangedCandidate({
      sourceRecord,
      targetRecords: unmatchedTarget.filter(
        (record) => !changedTargetIds.has(recordId(record)),
      ),
    });

    if (!candidate) {
      continue;
    }

    changed.push({
      similarity: candidate.similarity,
      source: summarizeRecord(sourceRecord),
      target: summarizeRecord(candidate.record),
    });
    changedSourceIds.add(recordId(sourceRecord));
    changedTargetIds.add(recordId(candidate.record));
  }

  const missing = unmatchedSource
    .filter((record) => !changedSourceIds.has(recordId(record)))
    .map(summarizeRecord);
  const extra = unmatchedTarget
    .filter((record) => !changedTargetIds.has(recordId(record)))
    .map(summarizeRecord);
  const moved = detectMovedRecords(exactMatches).map((match) => ({
    source: summarizeRecord(match.source),
    target: summarizeRecord(match.target),
  }));
  const unsupported = [...sourceRecords, ...targetRecords]
    .filter((record) => record.kind === 'unsupported')
    .map(summarizeRecord);

  return {
    findings: {
      changed,
      extra,
      missing,
      moved,
      unsupported,
    },
    matches: {
      exact: exactMatches.length,
    },
  };
}

function findBestChangedCandidate({ sourceRecord, targetRecords }) {
  let best = null;

  for (const targetRecord of targetRecords) {
    if (targetRecord.kind !== sourceRecord.kind) {
      continue;
    }

    const similarity = recordSimilarity(sourceRecord, targetRecord);

    if (similarity < 0.55) {
      continue;
    }

    if (!best || similarity > best.similarity) {
      best = {
        record: targetRecord,
        similarity,
      };
    }
  }

  return best;
}

function recordSimilarity(left, right) {
  if (left.value === right.value) {
    return 1;
  }

  if (left.kind === 'link' && right.kind === 'link') {
    const leftLabel = left.value.split(' -> ')[0];
    const rightLabel = right.value.split(' -> ')[0];

    if (leftLabel && leftLabel === rightLabel) {
      return 0.8;
    }
  }

  const leftTokens = new Set(tokenizeForSimilarity(left.value));
  const rightTokens = new Set(tokenizeForSimilarity(right.value));
  const intersection = [...leftTokens].filter((token) =>
    rightTokens.has(token),
  );
  const union = new Set([...leftTokens, ...rightTokens]);

  if (union.size === 0) {
    return 0;
  }

  return intersection.length / union.size;
}

function tokenizeForSimilarity(value) {
  return value
    .toLowerCase()
    .split(/[^a-z0-9_]+/)
    .filter((token) => token.length > 1);
}

function detectMovedRecords(matches) {
  const targetOrders = matches.map((match) => match.target.order);
  const keepIndexes = new Set(
    longestIncreasingSubsequenceIndexes(targetOrders),
  );

  return matches.filter((_match, index) => !keepIndexes.has(index));
}

function longestIncreasingSubsequenceIndexes(values) {
  const piles = [];
  const predecessors = new Array(values.length).fill(-1);
  const pileTops = [];

  for (let index = 0; index < values.length; index += 1) {
    const value = values[index];
    let low = 0;
    let high = piles.length;

    while (low < high) {
      const mid = Math.floor((low + high) / 2);

      if (values[piles[mid]] < value) {
        low = mid + 1;
      } else {
        high = mid;
      }
    }

    if (low > 0) {
      predecessors[index] = piles[low - 1];
    }

    piles[low] = index;
    pileTops[low] = value;
  }

  const result = [];
  let current = piles[piles.length - 1];

  while (current !== undefined && current !== -1) {
    result.push(current);
    current = predecessors[current];
  }

  return result.reverse();
}

function createReport({
  fullAudit,
  manifest,
  manifestPath,
  pageReports,
  repoRoot,
  sourceRef,
  sourceRoot,
}) {
  const summary = {
    changed: sumFindings(pageReports, 'changed'),
    exactMatches: pageReports.reduce(
      (count, page) => count + page.matches.exact,
      0,
    ),
    extra: sumFindings(pageReports, 'extra'),
    ignored: pageReports.reduce(
      (count, page) => count + page.ignored.length,
      0,
    ),
    missing: sumFindings(pageReports, 'missing'),
    moved: sumFindings(pageReports, 'moved'),
    pagesAudited: pageReports.length,
    sourceRecords: pageReports.reduce(
      (count, page) => count + page.totals.sourceRecords,
      0,
    ),
    targetRecords: pageReports.reduce(
      (count, page) => count + page.totals.targetRecords,
      0,
    ),
    unsupported: sumFindings(pageReports, 'unsupported'),
  };

  summary.unresolvedDifferences =
    summary.changed +
    summary.extra +
    summary.missing +
    summary.moved +
    summary.unsupported;

  return {
    generatedAt: new Date().toISOString(),
    manifestPath: toRepoPath(path.resolve(manifestPath), repoRoot),
    pages: pageReports,
    source: {
      ref: sourceRef,
      repository: manifest.source?.repository,
      root: sourceRoot,
    },
    summary,
    ...(fullAudit ? { fullAudit } : {}),
  };
}

function sumFindings(pageReports, key) {
  return pageReports.reduce(
    (count, page) => count + page.findings[key].length,
    0,
  );
}

function renderMarkdownReport(report) {
  const lines = [
    '# Migration Parity Audit',
    '',
    `Generated: ${report.generatedAt}`,
    `Source repository: \`${report.source.repository ?? 'unknown'}\``,
    `Source ref: \`${report.source.ref ?? 'unknown'}\``,
    `Source root: \`${report.source.root}\``,
    `Manifest: \`${report.manifestPath}\``,
    '',
    '## Summary',
    '',
    `- Pages audited: ${report.summary.pagesAudited}`,
    `- Source records: ${report.summary.sourceRecords}`,
    `- Target records: ${report.summary.targetRecords}`,
    `- Exact matches: ${report.summary.exactMatches}`,
    `- Missing: ${report.summary.missing}`,
    `- Extra: ${report.summary.extra}`,
    `- Changed: ${report.summary.changed}`,
    `- Moved: ${report.summary.moved}`,
    `- Unsupported: ${report.summary.unsupported}`,
    `- Ignored: ${report.summary.ignored}`,
    '',
  ];

  if (report.fullAudit) {
    renderFullAuditSection(lines, report.fullAudit);
  }

  for (const page of report.pages) {
    lines.push(
      `## ${page.id}`,
      '',
      `- Target: \`${page.targetPath}\``,
      `- Source files: ${page.source.files.map((file) => `\`${file}\``).join(', ')}`,
      `- Projection: product \`${page.projection.product}\`, platform \`${page.projection.platform}\``,
      `- Migration mode: \`${page.migrationMode ?? 'unspecified'}\``,
      `- Records: source ${page.totals.sourceRecords}, target ${page.totals.targetRecords}, exact ${page.matches.exact}`,
      '',
    );

    if (page.ignored.length > 0) {
      lines.push('### Ignored', '');
      for (const ignored of page.ignored) {
        lines.push(
          `- ${ignored.ruleId}: ${ignored.reason}`,
          `  - ${formatRecordSummary(ignored.record)}`,
        );
      }
      lines.push('');
    }

    for (const key of ['missing', 'extra', 'changed', 'moved', 'unsupported']) {
      renderFindingSection(lines, key, page.findings[key]);
    }
  }

  while (lines.at(-1) === '') {
    lines.pop();
  }

  return `${lines.join('\n')}\n`;
}

function renderFullAuditSection(lines, fullAudit) {
  lines.push(
    '## Full Target Coverage',
    '',
    `- Target root: \`${fullAudit.targetRoot}\``,
    `- Target files total: ${fullAudit.summary.targetFilesTotal}`,
    `- Source files total: ${fullAudit.summary.sourceFilesTotal}`,
    `- Compared clean: ${fullAudit.summary.comparedClean}`,
    `- Compared with differences: ${fullAudit.summary.comparedDifferences}`,
    `- Compare errors: ${fullAudit.summary.compareErrors}`,
    `- Ambiguous source mappings: ${fullAudit.summary.ambiguousSource}`,
    `- Unmapped targets: ${fullAudit.summary.unmappedTarget}`,
    `- Source-only files: ${fullAudit.summary.sourceOnly}`,
    `- Compared unresolved differences: ${fullAudit.summary.parityTotals.unresolvedDifferences}`,
    `  - missing=${fullAudit.summary.parityTotals.missing}, extra=${fullAudit.summary.parityTotals.extra}, changed=${fullAudit.summary.parityTotals.changed}, moved=${fullAudit.summary.parityTotals.moved}, unsupported=${fullAudit.summary.parityTotals.unsupported}`,
    '',
  );

  renderStatusSamples(lines, 'Compared With Differences', fullAudit.pages, [
    'compared-differences',
  ]);
  renderStatusSamples(lines, 'Compare Errors', fullAudit.pages, [
    'compare-error',
  ]);
  renderStatusSamples(lines, 'Ambiguous Source Mappings', fullAudit.pages, [
    'ambiguous-source',
  ]);
  renderStatusSamples(lines, 'Unmapped Targets', fullAudit.pages, [
    'unmapped-target',
  ]);
  renderSourceOnlySamples(lines, fullAudit.sourceOnly);
}

function renderStatusSamples(lines, title, pages, statuses) {
  const matches = pages.filter((page) => statuses.includes(page.status));

  lines.push(`### ${title} (${matches.length})`, '');

  if (matches.length === 0) {
    lines.push('- None', '');
    return;
  }

  for (const page of matches.slice(0, 50)) {
    const source =
      page.source?.files?.length > 0
        ? ` source: ${page.source.files.map((file) => `\`${file}\``).join(', ')}`
        : '';
    const parity = page.parity
      ? ` missing=${page.parity.missing} extra=${page.parity.extra} changed=${page.parity.changed} moved=${page.parity.moved} unsupported=${page.parity.unsupported}`
      : '';
    const error = page.error ? ` error=${JSON.stringify(page.error)}` : '';
    lines.push(
      `- \`${page.targetPath}\` status=${page.status}${source}${parity}${error}`,
    );
  }

  if (matches.length > 50) {
    lines.push(`- ... ${matches.length - 50} more`);
  }

  lines.push('');
}

function renderSourceOnlySamples(lines, sourceOnly) {
  lines.push(`### Source-Only Files (${sourceOnly.length})`, '');

  if (sourceOnly.length === 0) {
    lines.push('- None', '');
    return;
  }

  for (const entry of sourceOnly.slice(0, 50)) {
    lines.push(`- \`${entry.sourcePath}\`: ${entry.reason}`);
  }

  if (sourceOnly.length > 50) {
    lines.push(`- ... ${sourceOnly.length - 50} more`);
  }

  lines.push('');
}

function renderFindingSection(lines, key, findings) {
  lines.push(`### ${titleCase(key)} (${findings.length})`, '');

  if (findings.length === 0) {
    lines.push('- None', '');
    return;
  }

  for (const finding of findings.slice(0, 25)) {
    if (finding.source && finding.target) {
      lines.push(
        `- ${formatRecordSummary(finding.source)}`,
        `  - target: ${formatRecordSummary(finding.target)}`,
        finding.similarity
          ? `  - similarity: ${finding.similarity.toFixed(2)}`
          : null,
      );
      continue;
    }

    lines.push(`- ${formatRecordSummary(finding)}`);
  }

  if (findings.length > 25) {
    lines.push(`- ... ${findings.length - 25} more`);
  }

  lines.push('');
}

function formatRecordSummary(record) {
  return `\`${record.side}:${record.kind}\` ${record.location}:${record.line} ${JSON.stringify(record.excerpt)}`;
}

function summarizeRecord(record) {
  return {
    excerpt: record.value.slice(0, 180),
    hash: record.hash,
    kind: record.kind,
    line: record.line,
    location: record.location,
    order: record.order,
    side: record.side,
  };
}

function recordKey(record) {
  return `${record.kind}\0${record.value}`;
}

function recordId(record) {
  return `${record.side}\0${record.location}\0${record.order}\0${record.kind}\0${record.hash}`;
}

function stripFrontmatter(content) {
  return content.replace(/^---\n[\s\S]*?\n---\n?/, '');
}

function hashString(value) {
  let hash = 5381;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 33) ^ value.charCodeAt(index);
  }

  return (hash >>> 0).toString(16).padStart(8, '0');
}

function uniqueBy(items, getKey) {
  const seen = new Set();
  const result = [];

  for (const item of items) {
    const key = getKey(item);

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    result.push(item);
  }

  return result;
}

function titleCase(value) {
  return value.slice(0, 1).toUpperCase() + value.slice(1);
}

function toRepoPath(filePath, repoRoot = process.cwd()) {
  return toPosixPath(path.relative(repoRoot, filePath));
}

function toPosixPath(filePath) {
  return filePath.split(path.sep).join('/');
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function writeReport(report, outPath) {
  const resolvedOutPath = path.resolve(outPath);
  const jsonPath = `${resolvedOutPath}.json`;
  const markdownPath = `${resolvedOutPath}.md`;

  fs.mkdirSync(path.dirname(resolvedOutPath), { recursive: true });
  fs.writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`);
  fs.writeFileSync(markdownPath, renderMarkdownReport(report));

  return {
    jsonPath,
    markdownPath,
  };
}

function parseArgs(args) {
  const options = {
    allTargets: false,
    failOnDifferences: false,
    manifestPath: path.resolve(DEFAULT_MANIFEST_PATH),
    out: path.resolve(DEFAULT_OUT_PATH),
    sourceRoot: undefined,
    targetRoot: path.resolve(DEFAULT_TARGET_ROOT),
  };

  for (const arg of args) {
    if (arg === '--all-targets') {
      options.allTargets = true;
      continue;
    }

    if (arg === '--fail-on-differences') {
      options.failOnDifferences = true;
      continue;
    }

    if (arg.startsWith('--manifest=')) {
      options.manifestPath = path.resolve(arg.slice('--manifest='.length));
      continue;
    }

    if (arg.startsWith('--out=')) {
      options.out = path.resolve(arg.slice('--out='.length));
      continue;
    }

    if (arg.startsWith('--source-root=')) {
      options.sourceRoot = path.resolve(arg.slice('--source-root='.length));
      continue;
    }

    if (arg.startsWith('--target-root=')) {
      options.targetRoot = path.resolve(arg.slice('--target-root='.length));
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  return options;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const report = auditMigrationParity({
    allTargets: options.allTargets,
    manifestPath: options.manifestPath,
    sourceRoot: options.sourceRoot,
    targetRoot: options.targetRoot,
  });
  const paths = writeReport(report, options.out);

  console.log(`Wrote ${toRepoPath(paths.jsonPath)}`);
  console.log(`Wrote ${toRepoPath(paths.markdownPath)}`);

  if (options.failOnDifferences && report.summary.unresolvedDifferences > 0) {
    process.exitCode = 1;
  }
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  await main();
}
