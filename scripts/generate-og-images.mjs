import { execFile } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

const repoRoot = process.cwd();
const outputRoot = path.join(repoRoot, 'output', 'og');
const cacheRoot = path.join(repoRoot, '.cache', 'og-images');
const backgroundUrl =
  'https://assets-docs.agora.io/og/Agora-Docs-Featured-image-no-text.jpg';
const chromePath =
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const viewport = {
  height: 630,
  width: 1200,
};

const images = [
  {
    filename: 'agora-docs-og-overview.png',
    title: 'Agora Docs',
  },
  {
    filename: 'agora-docs-og-introduction.png',
    title: 'Introduction',
  },
  {
    filename: 'agora-docs-og-voice-agent.png',
    title: 'Voice Agent',
  },
  {
    filename: 'agora-docs-og-realtime-media.png',
    title: 'Realtime Media',
  },
  {
    filename: 'agora-docs-og-solutions.png',
    title: 'Solutions',
  },
  {
    filename: 'agora-docs-og-reference.png',
    title: 'Reference',
  },
  {
    filename: 'agora-docs-og-best-practices.png',
    title: 'Best Practices',
  },
];

await generateOgImages();

async function generateOgImages() {
  await assertChromeAvailable();
  await fs.mkdir(outputRoot, { recursive: true });
  await fs.mkdir(cacheRoot, { recursive: true });

  const backgroundDataUrl = await loadBackgroundDataUrl();

  for (const image of images) {
    const htmlPath = path.join(cacheRoot, `${image.filename}.html`);
    const outputPath = path.join(outputRoot, image.filename);

    await fs.writeFile(htmlPath, createOgHtml(image, backgroundDataUrl));
    await execFileAsync(chromePath, [
      '--headless=new',
      '--hide-scrollbars',
      '--disable-gpu',
      '--no-first-run',
      '--no-default-browser-check',
      `--window-size=${viewport.width},${viewport.height}`,
      `--screenshot=${outputPath}`,
      '--virtual-time-budget=1000',
      pathToFileUrl(htmlPath),
    ]);
    console.log(`Generated ${path.relative(repoRoot, outputPath)}`);
  }
}

async function assertChromeAvailable() {
  try {
    await fs.access(chromePath);
  } catch {
    throw new Error(`Google Chrome is required at ${chromePath}`);
  }
}

async function loadBackgroundDataUrl() {
  const response = await fetch(backgroundUrl);

  if (!response.ok) {
    throw new Error(
      `Failed to download OG background: ${response.status} ${response.statusText}`,
    );
  }

  const contentType = response.headers.get('content-type') ?? 'image/jpeg';
  const buffer = Buffer.from(await response.arrayBuffer());

  return `data:${contentType};base64,${buffer.toString('base64')}`;
}

function createOgHtml(image, backgroundDataUrl) {
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <style>
      * {
        box-sizing: border-box;
      }

      html,
      body {
        width: ${viewport.width}px;
        height: ${viewport.height}px;
        margin: 0;
        overflow: hidden;
        font-family: Arial, "Helvetica Neue", sans-serif;
        background: #05070d;
      }

      body {
        position: relative;
      }

      .background {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .shade {
        display: none;
      }

      .content {
        position: absolute;
        left: 60px;
        top: 278px;
        width: 650px;
        color: white;
      }

      h1 {
        margin: 0;
        font-size: ${image.title.length > 14 ? '68px' : '76px'};
        line-height: 0.98;
        letter-spacing: 0;
        font-weight: 740;
        text-shadow: 0 4px 24px rgba(0, 0, 0, 0.72);
      }

      .description {
        max-width: 540px;
        margin: 54px 0 0;
        color: rgba(255, 255, 255, 0.74);
        font-size: 30px;
        line-height: 1.32;
        letter-spacing: 0;
        font-weight: 400;
        text-shadow: 0 3px 18px rgba(0, 0, 0, 0.5);
      }

      .url {
        margin: 32px 0 0;
        color: #00b9ff;
        font-size: 28px;
        line-height: 1;
        letter-spacing: 0;
        font-weight: 740;
        text-shadow: 0 3px 18px rgba(0, 0, 0, 0.4);
      }
    </style>
  </head>
  <body>
    <img class="background" src="${backgroundDataUrl}" alt="">
    <div class="shade"></div>
    <main class="content">
      <h1>${escapeHtml(image.title)}</h1>
      <p class="description">Developer documentation for real-time engagement products, SDKs, and APIs.</p>
      <p class="url">docs.agora.io</p>
    </main>
  </body>
</html>
`;
}

function pathToFileUrl(filePath) {
  return `file://${filePath.split(path.sep).map(encodeURIComponent).join('/')}`;
}

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}
