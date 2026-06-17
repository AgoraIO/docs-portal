import {
  cpSync,
  existsSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import process from 'node:process';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { buildStaticAssetAudit } from './audit-static-assets.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const tempRoot = mkdtempSync(path.join(tmpdir(), 'docs-portal-static-build-'));
const slimOutput = path.join(tempRoot, 'slim-output');
const fullOutput = path.join(tempRoot, 'full-output');
const outputRoot = path.join(repoRoot, '.vercel/output');
const DOCS_BODY_PATTERN =
  /<div class="docs-body">([\s\S]*?)<\/div><\/div><aside class="flex flex-col gap-4 xl:hidden">/;
const DOCS_SKELETON_PATTERN =
  /<div class="space-y-4 py-2" data-testid="docs-content-skeleton" role="status">[\s\S]*?<\/div><\/div><aside class="flex flex-col gap-4 xl:hidden">/;
const DOCS_SKELETON_MARKER = 'data-testid="docs-content-skeleton"';
const STATIC_HTML_OPTIONAL_SKELETON_PATH_SUFFIXES = [
  path.join('en', 'realtime-media', 'video', 'build', 'ai-noise-suppression', 'index.html'),
  path.join('en', 'realtime-media', 'video', 'build', 'in-call-quality-monitoring', 'index.html'),
  path.join('en', 'realtime-media', 'video', 'build', 'play-media', 'index.html'),
  path.join('en', 'realtime-media', 'video', 'build', 'preload-channels', 'index.html'),
  path.join('en', 'realtime-media', 'video', 'build', 'receive-notifications', 'index.html'),
  path.join('en', 'realtime-media', 'video', 'build', 'screen-sharing', 'index.html'),
  path.join('en', 'realtime-media', 'video', 'build', 'use-an-extension', 'index.html'),
  path.join('en', 'realtime-media', 'video', 'build', 'voice-activity-detection', 'index.html'),
  path.join('en', 'realtime-media', 'cloud-recording', 'reference', 'common-errors', 'index.html'),
  path.join('en', 'realtime-media', 'im', 'agora-console', 'content-moderation-microsoft', 'index.html'),
];
const STATIC_HTML_OPTIONAL_SKELETON_PATHS = new Set(
  STATIC_HTML_OPTIONAL_SKELETON_PATH_SUFFIXES,
);
const JPG_MIN_BYTES = 30 * 1024;
const PNG_MIN_BYTES = 40 * 1024;
const STATIC_HTML_TEST_ID_PATTERN = /\sdata-testid="[^"]*"/g;
const STATIC_HTML_DATA_ICON_PATTERN = /\sdata-icon="[^"]*"/g;
const STATIC_HTML_DATA_CARD_PATTERN = /\sdata-card=""/g;
const STATIC_HTML_MODULE_PRELOAD_PATTERN =
  /<link rel="modulepreload"[^>]*\/>/g;
const STATIC_HTML_DATA_PRECEDENCE_PATTERN = /\sdata-precedence="default"/g;
const STATIC_HTML_DATA_SLOT_PATTERN = /\sdata-slot="[^"]*"/g;
const STATIC_HTML_DATA_SIDEBAR_PATTERN = /\sdata-sidebar="[^"]*"/g;
const PNG_VARIANTS = [
  {
    effort: 10,
    name: 'palette-q60',
    options: {
      compressionLevel: 9,
      effort: 10,
      palette: true,
      quality: 60,
    },
  },
  {
    effort: 10,
    name: 'palette-q40',
    options: {
      compressionLevel: 9,
      effort: 10,
      palette: true,
      quality: 40,
    },
  },
  {
    effort: 10,
    name: 'palette-q20',
    options: {
      compressionLevel: 9,
      effort: 10,
      palette: true,
      quality: 20,
    },
  },
];
const JPG_VARIANTS = [
  {
    mozjpeg: true,
    name: 'mozjpeg-q80',
    options: {
      mozjpeg: true,
      quality: 80,
    },
  },
  {
    mozjpeg: true,
    name: 'mozjpeg-q70',
    options: {
      mozjpeg: true,
      quality: 70,
    },
  },
  {
    mozjpeg: true,
    name: 'mozjpeg-q60',
    options: {
      mozjpeg: true,
      quality: 60,
    },
  },
];
const RTM2_PNG_VARIANTS = [
  ...PNG_VARIANTS,
  {
    effort: 10,
    name: 'palette-q20-dither0',
    options: {
      compressionLevel: 9,
      dither: 0,
      effort: 10,
      palette: true,
      quality: 20,
    },
  },
  {
    effort: 10,
    name: 'palette-q10-dither0',
    options: {
      compressionLevel: 9,
      dither: 0,
      effort: 10,
      palette: true,
      quality: 10,
    },
  },
  {
    effort: 10,
    name: 'palette-q5-dither0',
    options: {
      compressionLevel: 9,
      dither: 0,
      effort: 10,
      palette: true,
      quality: 5,
    },
  },
];
const CONSOLE_SCREENSHOT_PNG_PATHS = new Set([
  path.join('images', 'conversational-ai', 'dify-endpoint.png'),
  path.join('images', 'conversational-ai', 'server-sdk-flow.png'),
]);

if (isMainModule()) {
  try {
    await main();
  } finally {
    rmSync(tempRoot, { force: true, recursive: true });
  }
}

export async function main() {
  await runBuild({
    env: {},
  });
  cpSync(outputRoot, slimOutput, { recursive: true });

  await runBuild({
    env: {
      DOCS_FORCE_PRERENDER_BODIES: 'true',
    },
  });
  cpSync(outputRoot, fullOutput, { recursive: true });

  restoreSlimOutput();
  const patchSummary = injectStaticDocsHtml({
    fullOutput,
    slimOutput: outputRoot,
  });
  verifyPatchedStaticHtml(outputRoot, patchSummary);
  stripStaticHtmlTestIdsInOutput(outputRoot);
  pruneUnusedStaticAssets(outputRoot);
  await optimizeStaticImages(outputRoot);
}

async function runBuild({ env }) {
  clearOutputDir(outputRoot);
  const command = process.platform === 'win32' ? 'bun.exe' : 'bun';
  const code = await new Promise((resolve, reject) => {
    const child = spawn(command, ['run', 'build:raw'], {
      cwd: repoRoot,
      env: {
        ...process.env,
        ...env,
      },
      stdio: 'inherit',
    });

    child.on('error', reject);
    child.on('exit', (exitCode) => resolve(exitCode ?? 1));
  });

  if (code !== 0) {
    throw new Error(`build failed with exit code ${code}`);
  }
}

export function clearOutputDir(root) {
  rmSync(root, { force: true, recursive: true });
}

function restoreSlimOutput() {
  clearOutputDir(outputRoot);
  cpSync(slimOutput, outputRoot, { recursive: true });
}

function injectStaticDocsHtml({ fullOutput, slimOutput }) {
  const fullStaticRoot = path.join(fullOutput, 'static');
  const slimStaticRoot = path.join(slimOutput, 'static');
  let patchedHtmlFiles = 0;
  let skippedWithoutSkeleton = 0;
  let skippedWithoutBody = 0;

  for (const htmlPath of walkFiles(fullStaticRoot)) {
    if (!htmlPath.endsWith('.html')) {
      continue;
    }

    const relativePath = path.relative(fullStaticRoot, htmlPath);
    const slimHtmlPath = path.join(slimStaticRoot, relativePath);

    if (!existsSync(slimHtmlPath)) {
      continue;
    }

    const fullHtml = readFileSync(htmlPath, 'utf8');
    const slimHtml = readFileSync(slimHtmlPath, 'utf8');
    const fullBody = extractDocsBodyInnerHtml(fullHtml);
    const slimHasSkeleton = DOCS_SKELETON_PATTERN.test(slimHtml);

    if (!fullBody) {
      skippedWithoutBody += 1;
      continue;
    }

    if (!slimHasSkeleton) {
      skippedWithoutSkeleton += 1;
      continue;
    }

    const patchedHtml = replaceDocsBodySkeleton(slimHtml, fullBody);

    if (patchedHtml === slimHtml) {
      throw new Error(`failed to replace docs skeleton in ${relativePath}`);
    }

    writeFileSync(slimHtmlPath, patchedHtml);
    patchedHtmlFiles += 1;
  }

  return {
    patchedHtmlFiles,
    skippedWithoutBody,
    skippedWithoutSkeleton,
  };
}

function walkFiles(root) {
  const files = [];

  for (const entry of readdirSync(root, { withFileTypes: true })) {
    const entryPath = path.join(root, entry.name);

    if (entry.isDirectory()) {
      files.push(...walkFiles(entryPath));
      continue;
    }

    if (entry.isFile()) {
      files.push(entryPath);
    }
  }

  return files;
}

function extractDocsBodyInnerHtml(html) {
  const match = html.match(DOCS_BODY_PATTERN);

  return match?.[1] ?? null;
}

export function replaceDocsBodySkeleton(html, docsBodyInnerHtml) {
  const replacement =
    `<div class="docs-body">${docsBodyInnerHtml}</div></div><aside class="flex flex-col gap-4 xl:hidden">`;

  return html.replace(DOCS_SKELETON_PATTERN, replacement);
}

export async function optimizeStaticImages(root) {
  const staticRoot = path.join(root, 'static');
  const pngPaths = walkFiles(staticRoot).filter((filePath) => {
    return filePath.endsWith('.png') && statSync(filePath).size >= PNG_MIN_BYTES;
  });
  const jpgPaths = walkFiles(staticRoot).filter((filePath) => {
    return (
      (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) &&
      statSync(filePath).size >= JPG_MIN_BYTES
    );
  });

  let optimizedFiles = 0;

  for (const pngPath of pngPaths) {
    const original = readFileSync(pngPath);
    const optimized = await getBestOptimizedPngBuffer(
      original,
      getPngVariantsForPath(path.relative(staticRoot, pngPath)),
    );

    if (optimized.length >= original.length) {
      continue;
    }

    writeFileSync(pngPath, optimized);
    optimizedFiles += 1;
  }

  for (const jpgPath of jpgPaths) {
    const original = readFileSync(jpgPath);
    const optimized = await getBestOptimizedJpgBuffer(original);

    if (optimized.length >= original.length) {
      continue;
    }

    writeFileSync(jpgPath, optimized);
    optimizedFiles += 1;
  }

  return {
    candidates: pngPaths.length + jpgPaths.length,
    optimizedFiles,
  };
}

export function pruneUnusedStaticAssets(root) {
  const staticRoot = path.join(root, 'static');
  const docsRoot = path.join(repoRoot, 'content', 'docs');
  const audit = buildStaticAssetAudit({
    docsRoot,
    staticRoot,
  });
  let deletedFiles = 0;
  let deletedBytes = 0;

  for (const entry of audit.entries) {
    if (entry.isReferencedByStaticOutput) {
      continue;
    }

    const hasReachableStaticDocRef = entry.docRefs.some((ref) => ref.isBuilt);

    if (hasReachableStaticDocRef) {
      continue;
    }

    rmSync(path.join(staticRoot, entry.assetPath), { force: true });
    deletedFiles += 1;
    deletedBytes += entry.size;
  }

  return {
    deletedBytes,
    deletedFiles,
  };
}

export function getPngVariantsForPath(relativePath) {
  if (
    relativePath.startsWith(`img${path.sep}rtm2${path.sep}`) ||
    relativePath.startsWith(
      `images${path.sep}conversational-ai${path.sep}twilio${path.sep}`,
    ) ||
    relativePath.startsWith(
      `images${path.sep}conversational-ai${path.sep}studio${path.sep}`,
    ) ||
    CONSOLE_SCREENSHOT_PNG_PATHS.has(relativePath)
  ) {
    return RTM2_PNG_VARIANTS;
  }

  return PNG_VARIANTS;
}

export async function getBestOptimizedPngBuffer(original, variants = PNG_VARIANTS) {
  let best = original;

  for (const variant of variants) {
    const optimized = await sharp(original)
      .png(variant.options)
      .toBuffer();

    if (optimized.length < best.length) {
      best = optimized;
    }
  }

  return best;
}

export async function getBestOptimizedJpgBuffer(original, variants = JPG_VARIANTS) {
  let best = original;

  for (const variant of variants) {
    const optimized = await sharp(original)
      .jpeg(variant.options)
      .toBuffer();

    if (optimized.length < best.length) {
      best = optimized;
    }
  }

  return best;
}

export function stripStaticHtmlTestIds(html) {
  return html.replace(STATIC_HTML_TEST_ID_PATTERN, '');
}

export function stripStaticHtmlDataIcons(html) {
  return html.replace(STATIC_HTML_DATA_ICON_PATTERN, '');
}

export function stripStaticHtmlDataCards(html) {
  return html.replace(STATIC_HTML_DATA_CARD_PATTERN, '');
}

export function stripStaticHtmlModulePreloads(html) {
  return html.replace(STATIC_HTML_MODULE_PRELOAD_PATTERN, '');
}

export function stripStaticHtmlDataPrecedenceAttrs(html) {
  return html.replace(STATIC_HTML_DATA_PRECEDENCE_PATTERN, '');
}

export function stripStaticHtmlDataSlotAttrs(html) {
  return html.replace(STATIC_HTML_DATA_SLOT_PATTERN, '');
}

export function stripStaticHtmlDataSidebarAttrs(html) {
  return html.replace(STATIC_HTML_DATA_SIDEBAR_PATTERN, '');
}

function stripStaticHtmlTestIdsInOutput(root) {
  const staticRoot = path.join(root, 'static');

  for (const filePath of walkFiles(staticRoot)) {
    if (!filePath.endsWith('.html')) {
      continue;
    }

    const html = readFileSync(filePath, 'utf8');
    const stripped = stripStaticHtmlDataCards(
      stripStaticHtmlModulePreloads(
        stripStaticHtmlDataPrecedenceAttrs(
          stripStaticHtmlDataSidebarAttrs(
            stripStaticHtmlDataSlotAttrs(
              stripStaticHtmlDataIcons(stripStaticHtmlTestIds(html)),
            ),
          ),
        ),
      ),
    );

    if (stripped !== html) {
      writeFileSync(filePath, stripped);
    }
  }
}

export function verifyPatchedStaticHtml(outputRoot, patchSummary) {
  const staticRoot = path.join(outputRoot, 'static');
  const htmlFilesWithSkeleton = [];

  for (const filePath of walkFiles(staticRoot)) {
    if (!filePath.endsWith('.html')) {
      continue;
    }

    const html = readFileSync(filePath, 'utf8');

    if (html.includes(DOCS_SKELETON_MARKER)) {
      const relativePath = path.relative(staticRoot, filePath);

      if (STATIC_HTML_OPTIONAL_SKELETON_PATHS.has(relativePath)) {
        continue;
      }

      htmlFilesWithSkeleton.push(relativePath);
    }
  }

  if (patchSummary.patchedHtmlFiles === 0) {
    throw new Error('expected to patch at least one prerendered docs HTML file');
  }

  if (htmlFilesWithSkeleton.length > 0) {
    throw new Error(
      `static HTML still contains docs skeleton markup: ${htmlFilesWithSkeleton
        .slice(0, 10)
        .join(', ')}`,
    );
  }
}

function isMainModule() {
  return process.argv[1] === fileURLToPath(import.meta.url);
}
