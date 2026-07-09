import { execFileSync } from 'node:child_process';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it } from 'vitest';

const SCRIPT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  'html-to-md-migration.mjs',
);

const tempDirs: string[] = [];

async function makeTempDir() {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'html-to-md-migration-'));
  tempDirs.push(dir);
  return dir;
}

async function writeFixture(filePath: string, contents: string) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, contents, 'utf8');
}

async function pathExists(filePath: string) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

function runMigration(args: string[]) {
  return execFileSync(process.execPath, [SCRIPT, ...args], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

function runMigrationFailure(args: string[]) {
  try {
    runMigration(args);
  } catch (error) {
    const execError = error as Error & {
      stderr?: Buffer | string;
      stdout?: Buffer | string;
    };
    return `${execError.stdout ?? ''}${execError.stderr ?? ''}`;
  }

  throw new Error('Expected migration command to fail.');
}

function ditaPage(title: string) {
  return `<!doctype html>
<html>
  <head><meta name="description" content="${title} description."></head>
  <body>
    <main>
      <article>
        <h1>${title}</h1>
        <div class="body">
          <p class="shortdesc">${title} summary.</p>
          <section id="details">
            <h2>Details</h2>
            <p>Call <code>join</code> from this page.</p>
          </section>
        </div>
      </article>
    </main>
  </body>
</html>`;
}

async function writeDitaFixture(sourceDir: string) {
  await writeFixture(
    path.join(sourceDir, 'index.html'),
    `<!doctype html>
<html>
  <body>
    <nav class="toc">
      <ul>
        <li>
          <span>API Reference</span>
          <ul>
            <li><a href="API/overview.html">Overview</a></li>
            <li><a href="API/class_video_canvas.html">VideoCanvas</a></li>
          </ul>
        </li>
      </ul>
    </nav>
  </body>
</html>`,
  );
  await writeFixture(
    path.join(sourceDir, 'API', 'overview.html'),
    ditaPage('Overview'),
  );
  await writeFixture(
    path.join(sourceDir, 'API', 'class_video_canvas.html'),
    ditaPage('VideoCanvas'),
  );
}

describe('html-to-md-migration', () => {
  afterEach(async () => {
    await Promise.all(
      tempDirs
        .splice(0)
        .map((dir) => fs.rm(dir, { force: true, recursive: true })),
    );
  });

  it('migrates a supported DITA-OT API directory', async () => {
    const rootDir = await makeTempDir();
    const sourceDir = path.join(rootDir, 'source');
    const outputDir = path.join(rootDir, 'output');
    await writeDitaFixture(sourceDir);

    const output = runMigration([
      '--source',
      sourceDir,
      '--output',
      outputDir,
      '--product',
      'rtc',
      '--platform',
      'android',
    ]);

    expect(output).toContain(
      'Detected:  DITA-OT/Oxygen API reference (API/ directory)',
    );
    expect(output).toContain('Files:     2');
    await expect(
      fs.readFile(path.join(outputDir, 'index.mdx'), 'utf8'),
    ).resolves.toContain('ANDROID API Reference');
    await expect(
      fs.readFile(path.join(outputDir, 'meta.json'), 'utf8'),
    ).resolves.toContain('"overview"');
    await expect(
      fs.readFile(path.join(outputDir, 'overview.mdx'), 'utf8'),
    ).resolves.toContain('title: "Overview"');
    await expect(
      fs.readFile(path.join(outputDir, 'class-video-canvas.mdx'), 'utf8'),
    ).resolves.toContain('Call `join` from this page.');
  });

  it('prints detected source type, file count, and planned paths in dry-run without writing', async () => {
    const rootDir = await makeTempDir();
    const sourceDir = path.join(rootDir, 'source');
    const outputDir = path.join(rootDir, 'dry-output');
    await writeDitaFixture(sourceDir);

    const output = runMigration([
      '--source',
      sourceDir,
      '--output',
      outputDir,
      '--product',
      'rtc',
      '--platform',
      'android',
      '--dry-run',
    ]);

    expect(output).toContain(
      'Detected source type: DITA-OT/Oxygen API reference (API/ directory)',
    );
    expect(output).toContain('File count: 2');
    expect(output).toContain('Planned output paths');
    expect(output).toContain(path.join(outputDir, 'index.mdx'));
    expect(output).toContain(path.join(outputDir, 'overview.mdx'));
    await expect(pathExists(outputDir)).resolves.toBe(false);
  });

  it('detects TypeDoc output before attempting API directory reads', async () => {
    const rootDir = await makeTempDir();
    const sourceDir = path.join(rootDir, 'typedoc-source');
    const outputDir = path.join(rootDir, 'output');
    await writeFixture(
      path.join(sourceDir, 'modules.html'),
      '<!doctype html><html><body>Generated by TypeDoc</body></html>',
    );
    await writeFixture(
      path.join(sourceDir, 'assets', 'search.js'),
      'window.search = [];',
    );

    const output = runMigrationFailure([
      '--source',
      sourceDir,
      '--output',
      outputDir,
      '--product',
      'web',
      '--platform',
      'typescript',
    ]);

    expect(output).toContain(
      'Unsupported source structure: TypeDoc HTML reference.',
    );
    expect(output).toContain('modules.html');
    expect(output).toContain('Use or add a TypeDoc-specific migration lane');
    expect(output).not.toContain('ENOENT');
  });

  it('detects iOS doc-generator output with hierarchy.html before TypeDoc', async () => {
    const rootDir = await makeTempDir();
    const sourceDir = path.join(rootDir, 'ios-source');
    const outputDir = path.join(rootDir, 'output');
    await writeFixture(
      path.join(sourceDir, 'hierarchy.html'),
      '<!doctype html><html><body>iOS hierarchy</body></html>',
    );
    await writeFixture(
      path.join(sourceDir, 'Classes', 'AgoraRtcEngineKit.html'),
      '<!doctype html><html><body>Class page</body></html>',
    );
    await writeFixture(
      path.join(sourceDir, 'Blocks', 'index.html'),
      '<!doctype html><html><body>Block page</body></html>',
    );

    const output = runMigrationFailure([
      '--source',
      sourceDir,
      '--output',
      outputDir,
      '--product',
      'rtc',
      '--platform',
      'ios',
    ]);

    expect(output).toContain(
      'Unsupported source structure: iOS-doc-generator HTML reference.',
    );
    expect(output).toContain('hierarchy.html');
    expect(output).toContain('Classes/');
    expect(output).toContain(
      'Use or add an iOS-doc-generator-specific migration lane',
    );
    expect(output).not.toContain('TypeDoc HTML reference');
  });

  it('fails unsupported sources without API with a clear actionable error', async () => {
    const rootDir = await makeTempDir();
    const sourceDir = path.join(rootDir, 'unsupported-source');
    const outputDir = path.join(rootDir, 'output');
    await writeFixture(
      path.join(sourceDir, 'index.html'),
      '<!doctype html><html><body><h1>RESTful API</h1></body></html>',
    );

    const output = runMigrationFailure([
      '--source',
      sourceDir,
      '--output',
      outputDir,
      '--product',
      'cloud-recording',
      '--platform',
      'restful',
    ]);

    expect(output).toContain(
      'Unsupported source structure: RESTful/OpenAPI or other unsupported source layout.',
    );
    expect(output).toContain('root-level HTML file(s), but no API/');
    expect(output).toContain(
      'Supported lane: DITA-OT/Oxygen HTML API reference with <source>/API/*.html.',
    );
    expect(output).not.toContain('ENOENT');
  });

  it('refuses dangerous output paths before deleting existing files', async () => {
    const rootDir = await makeTempDir();
    const sourceDir = path.join(rootDir, 'source');
    const sentinelPath = path.join(sourceDir, 'keep.txt');
    await writeDitaFixture(sourceDir);
    await writeFixture(sentinelPath, 'do not delete');

    const output = runMigrationFailure([
      '--source',
      sourceDir,
      '--output',
      sourceDir,
      '--product',
      'rtc',
      '--platform',
      'android',
    ]);

    expect(output).toContain('Refusing to delete protected output path');
    await expect(fs.readFile(sentinelPath, 'utf8')).resolves.toBe(
      'do not delete',
    );
  });

  it('refuses broad in-repo docs output paths before cleanup', async () => {
    const rootDir = await makeTempDir();
    const sourceDir = path.join(rootDir, 'source');
    await writeDitaFixture(sourceDir);

    const output = runMigrationFailure([
      '--source',
      sourceDir,
      '--output',
      path.resolve('content/docs/zh-CN/api-reference/rtc'),
      '--product',
      'rtc',
      '--platform',
      'android',
    ]);

    expect(output).toContain('Refusing to delete broad docs output path');
    expect(output).toContain('content/docs/zh-CN/api-reference/rtc/android');
  });
});
