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

async function readJson(filePath: string) {
  return JSON.parse(await fs.readFile(filePath, 'utf8')) as {
    navScope?: Record<string, unknown>;
    pages?: string[];
    title?: string;
  };
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

async function expectLaneDryRunAndMigration({
  detected,
  expectedMetaPages,
  expectedPageContents,
  outputDir,
  platform,
  product,
  sourceDir,
  unexpectedPageContents = {},
  unexpectedDryRunPaths = [],
}: {
  detected: string;
  expectedMetaPages: string[];
  expectedPageContents: Record<string, string[]>;
  outputDir: string;
  platform: string;
  product: string;
  sourceDir: string;
  unexpectedPageContents?: Record<string, string[]>;
  unexpectedDryRunPaths?: string[];
}) {
  const dryOutputDir = `${outputDir}-dry`;
  const dryOutput = runMigration([
    '--source',
    sourceDir,
    '--output',
    dryOutputDir,
    '--product',
    product,
    '--platform',
    platform,
    '--dry-run',
  ]);

  expect(dryOutput).toContain(`Detected source type: ${detected}`);
  expect(dryOutput).toContain('Planned output paths');
  expect(dryOutput).toContain(path.join(dryOutputDir, 'index.mdx'));
  expect(dryOutput).toContain(path.join(dryOutputDir, 'meta.json'));
  for (const relativePath of Object.keys(expectedPageContents)) {
    expect(dryOutput).toContain(path.join(dryOutputDir, relativePath));
  }
  for (const relativePath of unexpectedDryRunPaths) {
    expect(dryOutput).not.toContain(path.join(dryOutputDir, relativePath));
  }
  await expect(pathExists(dryOutputDir)).resolves.toBe(false);

  const output = runMigration([
    '--source',
    sourceDir,
    '--output',
    outputDir,
    '--product',
    product,
    '--platform',
    platform,
  ]);

  expect(output).toContain(`Detected:  ${detected}`);
  await expect(pathExists(path.join(outputDir, 'index.mdx'))).resolves.toBe(
    true,
  );
  const meta = await readJson(path.join(outputDir, 'meta.json'));
  expect(meta.pages).toEqual(expectedMetaPages);

  for (const [relativePath, snippets] of Object.entries(expectedPageContents)) {
    const contents = await fs.readFile(
      path.join(outputDir, relativePath),
      'utf8',
    );
    for (const snippet of snippets) expect(contents).toContain(snippet);
  }
  for (const [relativePath, snippets] of Object.entries(
    unexpectedPageContents,
  )) {
    const contents = await fs.readFile(
      path.join(outputDir, relativePath),
      'utf8',
    );
    for (const snippet of snippets) expect(contents).not.toContain(snippet);
  }
}

async function writeTypeDocFixture(sourceDir: string) {
  await writeFixture(
    path.join(sourceDir, 'index.html'),
    `<!doctype html>
<html>
  <head><meta name="description" content="Documentation for TypeDoc API"></head>
  <body>
    <main class="col-content">
      <h1>TypeDoc API</h1>
      <p>Generated by TypeDoc.</p>
      <p>Use {@link Client Client API} or {@link MissingSymbol readable fallback}.</p>
      <a href="#core-methods" id="core-methods"><h2>核心方法</h2></a>
      <p><a href="classes/Client.html#connect">Client.connect</a></p>
    </main>
    <aside>
      <nav>
        <a href="modules.html">Modules</a>
        <a href="classes/Client.html#connect">Client</a>
      </nav>
    </aside>
  </body>
</html>`,
  );
  await writeFixture(
    path.join(sourceDir, 'modules.html'),
    `<!doctype html>
<html>
  <head><meta name="description" content="TypeScript module list."></head>
  <body>
    <main>
      <h1>Modules</h1>
      <p>Open the <a href="classes/Client.html#connect">Client class</a>.</p>
      <p id="createclient">Use <a href="modules.html#createclient">createClient</a> here.</p>
      <ul><li><code>createClient</code></li></ul>
    </main>
  </body>
</html>`,
  );
  await writeFixture(
    path.join(sourceDir, 'classes', 'Client.html'),
    `<!doctype html>
<html>
  <body>
    <header>
      <div class="tsd-page-title"><h1>Class Client</h1></div>
    </header>
    <div class="col-content">
      <section class="tsd-panel tsd-comment">
        <div class="tsd-comment tsd-typography">
          <p>Controls a realtime session.</p>
        </div>
      </section>
      <section class="tsd-panel-group tsd-member-group">
        <h2>Methods</h2>
        <section class="tsd-panel tsd-member tsd-kind-method">
          <a id="connect" class="tsd-anchor"></a>
          <h3>connect</h3>
          <ul class="tsd-signatures">
            <li class="tsd-signature tsd-kind-icon">connect(appId: <span class="tsd-signature-type">string</span>): <span class="tsd-signature-type">Promise</span>&lt;void&gt;</li>
          </ul>
          <ul class="tsd-descriptions">
            <li class="tsd-description">
              <div class="tsd-comment tsd-typography">
                <p>Call <code>connect</code> before publishing.</p>
              </div>
              <h4 class="tsd-parameters-title">Parameters</h4>
              <ul class="tsd-parameters">
                <li>
                  <h5>appId: <span class="tsd-signature-type">string</span></h5>
                  <div class="tsd-comment tsd-typography"><p>Agora application ID.</p></div>
                </li>
              </ul>
              <h4 class="tsd-returns-title">Returns <span class="tsd-signature-type">Promise</span>&lt;void&gt;</h4>
            </li>
          </ul>
        </section>
        <section class="tsd-panel tsd-member tsd-kind-type-alias">
          <a name="joinroomparams" class="tsd-anchor"></a>
          <h3>Join<wbr>Room<wbr>Params</h3>
          <div class="tsd-signature tsd-kind-icon">JoinRoomParams: { hotKeys?: Partial&lt;HotKeys&gt;; roomToken: string }</div>
          <div class="tsd-comment tsd-typography">
            <p>Options used to join a room.</p>
            <ul>
              <li>
                <p><strong>hotKeys?</strong>: <em>Partial&lt;HotKeys&gt;</em></p>
                <p>Custom shortcuts. Defaults to:</p>
                <table>
                  <thead><tr><th>Key</th><th>Effect</th></tr></thead>
                  <tbody>
                    <tr><td>Backspace</td><td>Delete selected objects</td></tr>
                    <tr><td>Ctrl + Z</td><td>Undo</td></tr>
                  </tbody>
                </table>
                <p>Pass an empty object to disable shortcuts.</p>
              </li>
            </ul>
            <ol>
              <li>
                <p>Configure shortcuts in order.</p>
                <table>
                  <thead><tr><th>Step</th><th>Action</th></tr></thead>
                  <tbody><tr><td>1</td><td>Choose a key</td></tr></tbody>
                </table>
              </li>
            </ol>
          </div>
          <div class="tsd-type-declaration">
            <h4>Type declaration</h4>
            <ul class="tsd-parameters">
              <li class="tsd-parameter">
                <h5><span class="tsd-flag ts-flagOptional">Optional</span> hot<wbr>Keys<span class="tsd-signature-symbol">?: </span><span class="tsd-signature-type">Partial&lt;HotKeys&gt;</span></h5>
                <div class="tsd-comment tsd-typography">
                  <p>Overrides the default shortcut map.</p>
                  <table>
                    <thead><tr><th>Key</th><th>Default action</th></tr></thead>
                    <tbody><tr><td>Backspace</td><td>Delete selection</td></tr></tbody>
                  </table>
                  <ul>
                    <li><p>Use platform-native key names.</p></li>
                  </ul>
                  <dl><dt>since</dt><dd><p>2.0.0</p></dd></dl>
                </div>
              </li>
              <li class="tsd-parameter">
                <h5>room<wbr>Token<span class="tsd-signature-symbol">: </span><span class="tsd-signature-type">string</span></h5>
                <div class="tsd-comment tsd-typography"><p>Token used to join the room.</p></div>
              </li>
            </ul>
          </div>
        </section>
      </section>
    </div>
  </body>
</html>`,
  );
  await writeFixture(
    path.join(sourceDir, 'modules', 'empty-namespace.html'),
    `<!doctype html><html><body>
      <header><div class="tsd-page-title"><h1>Namespace EmptyNamespace</h1></div></header>
      <div class="col-content"></div>
    </body></html>`,
  );
}

async function writeDoxygenFixture(sourceDir: string) {
  await writeFixture(path.join(sourceDir, 'doxygen.css'), '/* marker */');
  await writeFixture(
    path.join(sourceDir, 'index.html'),
    `<!doctype html>
<html>
  <body>
    <div class="contents">
      <h1>Doxygen API</h1>
      <p>Generated by Doxygen.</p>
      <a href="annotated.html">Class Index</a>
      <a href="class_agora_1_1rtc_1_1_client.html#join">Client</a>
    </div>
  </body>
</html>`,
  );
  await writeFixture(
    path.join(sourceDir, 'annotated.html'),
    `<!doctype html>
<html>
  <body>
    <div class="contents">
      <div class="title">Class Index</div>
      <p>See <a href="class_agora_1_1rtc_1_1_client.html#join">Client</a>.</p>
    </div>
    <hr class="footer"><address class="footer">制作者 <a href="https://www.doxygen.org/">Doxygen</a> 1.9.1</address>
  </body>
</html>`,
  );
  await writeFixture(
    path.join(sourceDir, 'class_agora_1_1rtc_1_1_client.html'),
    `<!doctype html>
<html>
  <body>
    <div class="header">
      <div class="headertitle"><div class="title">Client Class Reference</div></div>
    </div>
    <div class="contents">
      <a name="details" id="details"></a>
      <h2 class="groupheader">Detailed Description</h2>
      <div class="textblock">
        <p>Back to <a href="annotated.html">all classes</a>.</p>
        <p>See <a href="class_agora_1_1rtc_1_1_client-members.html">All members</a>.</p>
        <p>Open <a href="class_agora_1_1rtc_1_1_client_source.html">Source view</a>.</p>
        <p>Browse the <a href="functions.html">Function index</a>.</p>
        <p>Contact <a href="#" onclick="location.href='mai'+'lto:'+'sal'+'es'+'@sh'+'en'+'gwa'+'ng'+'.cn'; return false;">sales<span class="obfuscator">.nosp@m.</span>@she<span class="obfuscator">.nosp@m.</span>ngwan<span class="obfuscator">.nosp@m.</span>g.cn</a>.</p>
      </div>
      <h2 class="groupheader">Member Function Documentation</h2>
      <a id="join"></a>
      <h2 class="memtitle"><span class="permalink"><a href="#join">◆</a></span>join()</h2>
      <div class="memitem">
        <div class="memproto">
          <table class="memname">
            <tr>
              <td class="memname">int agora::rtc::Client::join </td>
              <td>(</td>
              <td class="paramtype">const char * </td>
              <td class="paramname"><em>channel</em></td>
              <td>)</td>
            </tr>
          </table>
        </div>
        <div class="memdoc">
          <p>Joins a channel.</p>
          <dl class="params"><dt>Parameters</dt><dd>
            <table class="params">
              <tr><td class="paramname">channel</td><td>Channel name</td></tr>
            </table>
          </dd></dl>
          <dl class="section return"><dt>Returns</dt><dd>Zero on success.</dd></dl>
        </div>
      </div>
      <a id="join"></a>
      <h2 class="memtitle">join(int)</h2>
      <div class="memitem"><div class="memproto"><table class="memname"><tr>
        <td class="memname">int agora::rtc::Client::join </td><td>(</td>
        <td class="paramtype">int </td><td class="paramname"><em>uid</em></td><td>)</td>
      </tr></table></div><div class="memdoc"><p>See <a href="#join">second overload</a>.</p></div></div>
      <a id="join"></a>
      <h2 class="memtitle">join(bool)</h2>
      <div class="memitem"><div class="memdoc"><p>Third overload.</p></div></div>
      <a id="join-2"></a>
      <h2 class="memtitle">joinLegacy()</h2>
      <div class="memitem"><div class="memdoc">
        <p><a id="inline"></a><a id="inline"></a>Source suffix collision.</p>
        <pre class="language-html">&lt;a id="join"&gt;&lt;/a&gt;
[example](#join)</pre>
        <p>Inline example: <code>&lt;a id="join"&gt;&lt;/a&gt;</code>.</p>
      </div></div>
    </div>
    <hr class="footer"><address class="footer">制作者 <a href="https://www.doxygen.org/">Doxygen</a> 1.9.1</address>
  </body>
</html>`,
  );
  await writeFixture(
    path.join(sourceDir, 'class_agora_1_1rtc_1_1_client-members.html'),
    '<!doctype html><html><body><h1>All members</h1></body></html>',
  );
  await writeFixture(
    path.join(sourceDir, 'class_agora_1_1rtc_1_1_client_source.html'),
    '<!doctype html><html><body><h1>Source</h1></body></html>',
  );
  await writeFixture(
    path.join(sourceDir, 'functions.html'),
    '<!doctype html><html><body><h1>Functions</h1></body></html>',
  );
  await writeFixture(
    path.join(sourceDir, 'files.html'),
    `<!doctype html>
<html>
  <body>
    <div class="contents">
      <div class="title">File List</div>
      <table>
        <tr>
          <td>
            <a href="class_agora_1_1rtc_1_1_client_source.html">class_agora_1_1rtc_1_1_client_source.html</a>
            <a href="class_agora_1_1rtc_1_1_client.html">Client.h</a>
          </td>
        </tr>
      </table>
    </div>
  </body>
</html>`,
  );
  for (const helperName of [
    'deprecated.html',
    'doxygen_crawl.html',
    'examples.html',
    'hierarchy.html',
    'pages.html',
    'dir_8f3a.html',
  ]) {
    await writeFixture(
      path.join(sourceDir, helperName),
      `<!doctype html><html><body><h1>${helperName}</h1></body></html>`,
    );
  }
  await writeFixture(
    path.join(sourceDir, 'classes.html'),
    `<!doctype html><html><body><div class="contents">
      <div class="title">Class Index</div>
      <dl class="classindex"><dt class="alphachar"><a id="letter_A" name="letter_A">A</a></dt>
      <dd><a href="class_agora_1_1rtc_1_1_client.html">Client</a></dd></dl>
    </div></body></html>`,
  );
}

async function writeIosFixture(sourceDir: string) {
  await writeFixture(
    path.join(sourceDir, 'index.html'),
    `<!doctype html>
<html>
  <body>
    <main>
      <h1>Jazzy API</h1>
      <p>Generated by jazzy.</p>
      <a href="Classes/index.html">Classes</a>
      <a href="Classes/AgoraRtcEngineKit.html">AgoraRtcEngineKit</a>
      <a href="Protocols/AgoraRtcEngineDelegate.html#events">Delegate</a>
    </main>
  </body>
</html>`,
  );
  await writeFixture(
    path.join(sourceDir, 'hierarchy.html'),
    '<!doctype html><html><body><main><h1>Hierarchy</h1><p>iOS hierarchy.</p></main></body></html>',
  );
  await writeFixture(
    path.join(sourceDir, 'Classes', 'index.html'),
    `<!doctype html>
<html>
  <body>
    <article class="main-content">
      <h1>Classes</h1>
      <p>iOS classes index.</p>
      <a href="AgoraRtcEngineKit.html">Engine class</a>
    </article>
  </body>
</html>`,
  );
  await writeFixture(
    path.join(sourceDir, 'Classes', 'AgoraRtcEngineKit.html'),
    `<!doctype html>
<html>
  <body>
    <article class="main-content">
      <h1>AgoraRtcEngineKit</h1>
      <p>Engine class with <a href="../Protocols/AgoraRtcEngineDelegate.html#events">delegate callbacks</a>.</p>
      <p>Back to the <a href="index.html">classes overview</a>.</p>
      <h2><a name="sharedengine"></a>sharedEngine</h2>
      <p>Creates an engine instance.</p>
    </article>
  </body>
</html>`,
  );
  await writeFixture(
    path.join(sourceDir, 'Protocols', 'AgoraRtcEngineDelegate.html'),
    `<!doctype html>
<html>
  <body>
    <article class="main-content">
      <h1>AgoraRtcEngineDelegate</h1>
      <a id="events"></a>
      <p>Receives event callbacks.</p>
    </article>
  </body>
</html>`,
  );
}

async function writeDartdocFixture(sourceDir: string) {
  await writeFixture(path.join(sourceDir, 'index.json'), '{"marker":true}');
  await writeFixture(
    path.join(sourceDir, 'index.html'),
    `<!doctype html>
<html>
  <body>
    <main>
      <h1>Dartdoc API</h1>
      <p>Generated by dartdoc.</p>
      <a href="library-index.html">Libraries</a>
      <a href="agora_rtc/agora_rtc-library.html#RtcEngine">agora_rtc</a>
    </main>
  </body>
</html>`,
  );
  await writeFixture(
    path.join(sourceDir, 'library-index.html'),
    `<!doctype html>
<html>
  <body>
    <main>
      <h1>Libraries</h1>
      <p>See <a href="agora_rtc/agora_rtc-library.html#RtcEngine">RtcEngine</a>.</p>
    </main>
  </body>
</html>`,
  );
  await writeFixture(
    path.join(sourceDir, 'agora_rtc', 'agora_rtc-library.html'),
    `<!doctype html>
<html>
  <body>
    <main>
      <h1>agora_rtc library</h1>
      <section id="RtcEngine">
        <h2>RtcEngine</h2>
        <p>Primary Dart RTC engine.</p>
        <ol><li>Initialize the engine.</li></ol>
      </section>
      <section id="guides">
        <h2>Guides</h2>
        <ul>
          <li>
            <a href="#setup">Setup</a>
            <ul><li><a href="#advanced">Advanced</a></li></ul>
          </li>
        </ul>
      </section>
    </main>
  </body>
</html>`,
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

  it('keeps DITA links to the current source page fragment-only', async () => {
    const rootDir = await makeTempDir();
    const sourceDir = path.join(rootDir, 'source');
    const outputDir = path.join(rootDir, 'output');
    await writeDitaFixture(sourceDir);
    await writeFixture(
      path.join(sourceDir, 'API', 'overview.html'),
      `<!doctype html>
<html>
  <body>
    <main>
      <article>
        <h1>Overview</h1>
        <div class="body">
          <section id="details">
            <h2>Details</h2>
            <p><a href="overview.html#details">Same-page details</a></p>
            <p><a href="class_video_canvas.html#details">VideoCanvas details</a></p>
          </section>
        </div>
      </article>
    </main>
  </body>
</html>`,
    );

    runMigration([
      '--source',
      sourceDir,
      '--output',
      outputDir,
      '--product',
      'rtc',
      '--platform',
      'android',
    ]);

    const output = await fs.readFile(
      path.join(outputDir, 'overview.mdx'),
      'utf8',
    );
    expect(output).toContain('[Same-page details](#details)');
    expect(output).toContain(
      '[VideoCanvas details](/api-reference/rtc/android/class-video-canvas#details)',
    );
  });

  it('derives generated link routes from a nested content/docs output path', async () => {
    const rootDir = await makeTempDir();
    const sourceDir = path.join(rootDir, 'source');
    const outputDir = path.join(
      rootDir,
      'content',
      'docs',
      'zh-CN',
      'api-reference',
      'flexible-classroom',
      'android',
      'api-reference',
    );
    await writeDitaFixture(sourceDir);
    await writeFixture(
      path.join(sourceDir, 'API', 'overview.html'),
      `<!doctype html>
<html>
  <body>
    <main>
      <article>
        <h1>Overview</h1>
        <div class="body">
          <p><a href="class_video_canvas.html#details">VideoCanvas details</a></p>
        </div>
      </article>
    </main>
  </body>
</html>`,
    );

    runMigration([
      '--source',
      sourceDir,
      '--output',
      outputDir,
      '--product',
      'flexible-classroom',
      '--platform',
      'android',
    ]);

    await expect(
      fs.readFile(path.join(outputDir, 'overview.mdx'), 'utf8'),
    ).resolves.toContain(
      '[VideoCanvas details](/zh-CN/api-reference/flexible-classroom/android/api-reference/class-video-canvas#details)',
    );
  });

  it('omits title-only DITA sections while retaining non-empty sections', async () => {
    const rootDir = await makeTempDir();
    const sourceDir = path.join(rootDir, 'source');
    const outputDir = path.join(rootDir, 'output');
    await writeDitaFixture(sourceDir);
    await writeFixture(
      path.join(sourceDir, 'API', 'overview.html'),
      `<!doctype html>
<html>
  <body>
    <main>
      <article>
        <h1>Overview</h1>
        <div class="body">
          <section id="empty-parameters"><h2>参数</h2></section>
          <section id="documented-parameters"><h2>参数</h2><p>appId: App ID.</p></section>
          <section id="nested-details">
            <h2>Details</h2>
            <section id="child-details"><h3>Child</h3><p>Nested content.</p></section>
          </section>
        </div>
      </article>
    </main>
  </body>
</html>`,
    );

    runMigration([
      '--source',
      sourceDir,
      '--output',
      outputDir,
      '--product',
      'rtc',
      '--platform',
      'android',
    ]);

    const output = await fs.readFile(
      path.join(outputDir, 'overview.mdx'),
      'utf8',
    );
    expect(output).not.toContain('empty-parameters');
    expect(output).toContain('<a id="documented-parameters"></a>');
    expect(output).toContain('appId: App ID.');
    expect(output).toContain('<a id="nested-details"></a>');
    expect(output).toContain('<a id="child-details"></a>');
    expect(output).toContain('Nested content.');
  });

  it('preserves the active version directory in migrated internal links', async () => {
    const rootDir = await makeTempDir();
    const sourceDir = path.join(rootDir, 'source');
    const outputDir = path.join(rootDir, 'output');
    await writeDitaFixture(sourceDir);
    await writeFixture(
      path.join(sourceDir, 'API', 'overview.html'),
      ditaPage('Overview').replace(
        'Call <code>join</code> from this page.',
        'See <a href="class_video_canvas.html">VideoCanvas</a>.',
      ),
    );

    runMigration([
      '--source',
      sourceDir,
      '--output',
      outputDir,
      '--product',
      'rtc',
      '--platform',
      'android',
      '--version-dir',
      '4.6.0',
    ]);

    await expect(
      fs.readFile(path.join(outputDir, 'overview.mdx'), 'utf8'),
    ).resolves.toContain(
      '[VideoCanvas](/api-reference/rtc/android/4.6.0/class-video-canvas)',
    );
  });

  it('retains DITA descriptions and related links while omitting title-only pages', async () => {
    const rootDir = await makeTempDir();
    const sourceDir = path.join(rootDir, 'source');
    const outputDir = path.join(rootDir, 'output');
    await writeDitaFixture(sourceDir);
    await writeFixture(
      path.join(sourceDir, 'index.html'),
      `<!doctype html><html><body><nav class="toc"><ul><li><span>API Reference</span><ul>
        <li><a href="API/overview.html">Overview</a></li>
        <li><a href="API/class_empty.html">EmptyClass</a></li>
        <li><a href="API/class_title_only.html">TitleOnlyClass</a></li>
        <li><a href="API/class_video_canvas.html">VideoCanvas</a></li>
      </ul></li></ul></nav></body></html>`,
    );
    await writeFixture(
      path.join(sourceDir, 'API', 'overview.html'),
      `<!doctype html><html><body><main><article>
        <h1>Overview</h1><p class="shortdesc">Overview summary.</p>
        <nav class="related-links"><ul><li><strong><a href="class_video_canvas.html">VideoCanvas</a></strong><br>Canvas details.</li></ul></nav>
      </article></main></body></html>`,
    );
    await writeFixture(
      path.join(sourceDir, 'API', 'class_empty.html'),
      '<!doctype html><html><body><main><article><h1>EmptyClass</h1><p class="shortdesc">No source body.</p></article></main></body></html>',
    );
    await writeFixture(
      path.join(sourceDir, 'API', 'class_title_only.html'),
      '<!doctype html><html><body><main><article><h1>TitleOnlyClass</h1></article></main></body></html>',
    );

    runMigration([
      '--source',
      sourceDir,
      '--output',
      outputDir,
      '--product',
      'rtc',
      '--platform',
      'android',
    ]);

    await expect(
      fs.readFile(path.join(outputDir, 'overview.mdx'), 'utf8'),
    ).resolves.toContain(
      '[VideoCanvas](/api-reference/rtc/android/class-video-canvas)',
    );
    await expect(
      fs.readFile(path.join(outputDir, 'class-empty.mdx'), 'utf8'),
    ).resolves.toContain('No source body.');
    await expect(
      pathExists(path.join(outputDir, 'class-title-only.mdx')),
    ).resolves.toBe(false);
    await expect(
      readJson(path.join(outputDir, 'meta.json')),
    ).resolves.toMatchObject({
      pages: ['index', 'overview', 'class-empty', 'class-video-canvas'],
    });
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

  it('migrates TypeDoc output with dry-run planning and rewritten links', async () => {
    const rootDir = await makeTempDir();
    const sourceDir = path.join(rootDir, 'typedoc-source');
    const outputDir = path.join(rootDir, 'output');
    await writeTypeDocFixture(sourceDir);

    await expectLaneDryRunAndMigration({
      detected: 'TypeDoc HTML reference',
      expectedMetaPages: ['index', 'classes', 'modules'],
      expectedPageContents: {
        'classes/client.mdx': [
          'title: "Client"',
          '<a id="connect"></a>',
          '## 方法',
          '### connect',
          '```ts\nconnect(appId: string): Promise<void>\n```',
          'Call `connect` before publishing.',
          '#### 参数',
          '| 名称 | 描述 |',
          '| appId: string | Agora application ID. |',
          '#### 返回值',
          'Promise &lt;void&gt;',
          '<a id="joinroomparams"></a>',
          '### JoinRoomParams',
          '- **hotKeys?**: *Partial&lt;HotKeys&gt;*',
          '  Custom shortcuts. Defaults to:',
          '  | Key | Effect |',
          '  | Backspace | Delete selected objects |',
          '  | Ctrl + Z | Undo |',
          '  Pass an empty object to disable shortcuts.',
          '1. Configure shortcuts in order.',
          '   | Step | Action |',
          '   | 1 | Choose a key |',
          '#### 类型声明',
          '##### `hotKeys?: Partial<HotKeys>`',
          'Overrides the default shortcut map.',
          '| Key | Default action |',
          '| Backspace | Delete selection |',
          '- Use platform-native key names.',
          '###### `since`',
          '2.0.0',
          '##### `roomToken: string`',
          'Token used to join the room.',
        ],
        'modules.mdx': [
          '[Client class](/api-reference/web/typescript/classes/client#connect)',
          '[createClient](/api-reference/web/typescript/modules#createclient)',
        ],
      },
      outputDir,
      platform: 'typescript',
      product: 'web',
      sourceDir,
    });

    const clientOutput = await fs.readFile(
      path.join(outputDir, 'classes/client.mdx'),
      'utf8',
    );
    expect(clientOutput).not.toContain('##### `Optional hotKeys');
    expect(clientOutput).not.toContain('Returns Promise');
    expect(clientOutput).not.toMatch(/^#{7,}\s/m);

    const indexOutput = await fs.readFile(
      path.join(outputDir, 'index.mdx'),
      'utf8',
    );
    expect(indexOutput).toContain('description: "TypeDoc API API 参考。"');
    expect(indexOutput).toContain('## 核心方法');
    expect(indexOutput).toContain(
      '[Client API](/api-reference/web/typescript/classes/client#connect)',
    );
    expect(indexOutput).toContain('readable fallback');
    expect(indexOutput).not.toContain('{@link');
    expect(indexOutput).not.toContain('[核心方法](#core-methods)');
    await expect(
      pathExists(path.join(outputDir, 'modules', 'empty-namespace.mdx')),
    ).resolves.toBe(false);
  });

  it('supports an exact target route and public-index TypeDoc navigation', async () => {
    const rootDir = await makeTempDir();
    const sourceDir = path.join(rootDir, 'typedoc-source');
    const outputDir = path.join(rootDir, 'output');
    await writeTypeDocFixture(sourceDir);

    runMigration([
      '--source',
      sourceDir,
      '--output',
      outputDir,
      '--product',
      'flexible-classroom',
      '--platform',
      'web',
      '--target-base-path',
      '/zh-CN/api-reference/flexible-classroom/web/api-reference',
      '--navigation',
      'public-index',
    ]);

    const indexOutput = await fs.readFile(
      path.join(outputDir, 'index.mdx'),
      'utf8',
    );
    expect(indexOutput).toContain(
      '](/zh-CN/api-reference/flexible-classroom/web/api-reference/classes/client#connect)',
    );
    await expect(
      readJson(path.join(outputDir, 'meta.json')),
    ).resolves.toMatchObject({
      pages: [
        'index',
        '[Client](/zh-CN/api-reference/flexible-classroom/web/api-reference/classes/client)',
        '!classes',
        '!modules',
      ],
    });
  });

  it('creates a scoped sidebar for Whiteboard Web API output', async () => {
    const rootDir = await makeTempDir();
    const sourceDir = path.join(rootDir, 'typedoc-source');
    const outputDir = path.join(rootDir, 'output');
    await writeTypeDocFixture(sourceDir);

    runMigration([
      '--source',
      sourceDir,
      '--output',
      outputDir,
      '--product',
      'whiteboard',
      '--platform',
      'web',
    ]);

    await expect(
      readJson(path.join(outputDir, 'meta.json')),
    ).resolves.toMatchObject({ navScope: {} });
  });

  it('rejects Web SDK sources mapped to the React SDK platform route', async () => {
    const rootDir = await makeTempDir();
    const sourceDir = path.join(rootDir, 'typedoc-source');
    const outputDir = path.join(rootDir, 'output');
    await writeTypeDocFixture(sourceDir);
    await writeFixture(
      path.join(sourceDir, 'index.html'),
      '<!doctype html><html><body><main><h1>Agora Web SDK API Reference v4.22.0</h1><p>Web SDK 4.x.</p></main></body></html>',
    );

    const output = runMigrationFailure([
      '--source',
      sourceDir,
      '--output',
      outputDir,
      '--product',
      'rtc',
      '--platform',
      'react-sdk',
    ]);

    expect(output).toContain(
      'Source identity mismatch: react-sdk cannot publish Web SDK API reference content.',
    );
    await expect(pathExists(outputDir)).resolves.toBe(false);
  });

  it('creates a scoped TypeDoc sidebar with one labelled Globals entry for RTC Web', async () => {
    const rootDir = await makeTempDir();
    const sourceDir = path.join(rootDir, 'typedoc-source');
    const outputDir = path.join(rootDir, 'output');
    await writeTypeDocFixture(sourceDir);
    await writeFixture(
      path.join(sourceDir, 'globals.html'),
      `<!doctype html>
<html>
  <body>
    <header>
      <div class="tsd-page-title">
        <ul class="tsd-breadcrumb"><li><a href="globals.html">Globals</a></li></ul>
        <h1>TypeDoc API</h1>
      </div>
    </header>
    <main class="col-content"><h2>Type aliases</h2></main>
    <nav class="tsd-navigation primary"><a href="globals.html">Globals</a></nav>
  </body>
</html>`,
    );

    runMigration([
      '--source',
      sourceDir,
      '--output',
      outputDir,
      '--product',
      'rtc',
      '--platform',
      'web',
      '--target-base-path',
      '/zh-CN/api-reference/rtc/web',
    ]);

    await expect(
      readJson(path.join(outputDir, 'meta.json')),
    ).resolves.toMatchObject({
      title: 'TypeDoc API',
      navScope: {},
      pages: expect.arrayContaining([
        'index',
        '[Globals](/zh-CN/api-reference/rtc/web/globals)',
        '!globals',
      ]),
    });
  });

  it('does not rewrite Doxygen email markup outside the Doxygen lane', async () => {
    const rootDir = await makeTempDir();
    const sourceDir = path.join(rootDir, 'typedoc-source');
    const outputDir = path.join(rootDir, 'output');
    await writeTypeDocFixture(sourceDir);
    await writeFixture(
      path.join(sourceDir, 'modules.html'),
      `<!doctype html><html><body><main><h1>Modules</h1>
        <p>Generated by TypeDoc.</p>
        <p>Contact <a href="#" onclick="location.href='mai'+'lto:'+'sal'+'es'+'@sh'+'en'+'gwa'+'ng'+'.cn'; return false;">obfuscated</a>.</p>
      </main></body></html>`,
    );

    runMigration([
      '--source',
      sourceDir,
      '--output',
      outputDir,
      '--product',
      'web',
      '--platform',
      'typescript',
    ]);

    await expect(
      fs.readFile(path.join(outputDir, 'modules.mdx'), 'utf8'),
    ).resolves.not.toContain('[sales@shengwang.cn](mailto:sales@shengwang.cn)');
  });

  it('migrates Doxygen/Javadoc output with dry-run planning and rewritten links', async () => {
    const rootDir = await makeTempDir();
    const sourceDir = path.join(rootDir, 'doxygen-source');
    const outputDir = path.join(rootDir, 'output');
    await writeDoxygenFixture(sourceDir);

    await expectLaneDryRunAndMigration({
      detected: 'Doxygen/Javadoc HTML reference',
      expectedMetaPages: ['index', 'class-agora-1-1rtc-1-1-client'],
      expectedPageContents: {
        'annotated.mdx': [
          'title: "Class Index"',
          '[Client](/api-reference/rtc/cpp/class-agora-1-1rtc-1-1-client#join)',
        ],
        'class-agora-1-1rtc-1-1-client.mdx': [
          'title: "Client Class Reference"',
          '[all classes](/api-reference/rtc/cpp/annotated)',
          '<a id="join"></a>',
          '<a id="join-2"></a>',
          '<a id="join-3"></a>',
          '<a id="join-2-2"></a>',
          '<a id="inline"></a>',
          '## Member Function Documentation',
          '### join()',
          '```cpp\nint agora::rtc::Client::join(const char* channel)\n```',
          'Joins a channel.',
          '#### Parameters',
          '| channel | Channel name |',
          '#### Returns',
          'Zero on success.',
          '[sales@shengwang.cn](mailto:sales@shengwang.cn)',
          '[second overload](#join-2)',
          'Third overload.',
          'Source suffix collision.',
          '```html\n<a id="join"></a>\n[example](#join)\n```',
          'Inline example: `<a id="join"></a>`.',
        ],
        'classes.mdx': [
          'title: "Class Index"',
          '<a id="letter_A"></a>',
          '### A',
          '[Client](/api-reference/rtc/cpp/class-agora-1-1rtc-1-1-client)',
        ],
        'files.mdx': [
          'title: "File List"',
          '[Client.h](/api-reference/rtc/cpp/class-agora-1-1rtc-1-1-client)',
        ],
      },
      outputDir,
      platform: 'cpp',
      product: 'rtc',
      sourceDir,
      unexpectedPageContents: {
        'annotated.mdx': ['制作者', 'doxygen.org'],
        'class-agora-1-1rtc-1-1-client.mdx': [
          '<a id="inline-2"></a>',
          '制作者',
          'doxygen.org',
          'All members',
          'Source view',
          'Function index',
          'class_agora_1_1rtc_1_1_client-members.html',
          'class_agora_1_1rtc_1_1_client_source.html',
          'functions.html',
          'nosp@m',
          '](#)',
        ],
        'files.mdx': ['class_agora_1_1rtc_1_1_client_source.html'],
      },
      unexpectedDryRunPaths: [
        'class-agora-1-1rtc-1-1-client-members.mdx',
        'class-agora-1-1rtc-1-1-client-source.mdx',
        'functions.mdx',
      ],
    });
  });

  it('creates a scoped sidebar for Whiteboard Android API output', async () => {
    const rootDir = await makeTempDir();
    const sourceDir = path.join(rootDir, 'doxygen-source');
    const outputDir = path.join(rootDir, 'output');
    await writeDoxygenFixture(sourceDir);

    runMigration([
      '--source',
      sourceDir,
      '--output',
      outputDir,
      '--product',
      'whiteboard',
      '--platform',
      'android',
    ]);

    await expect(
      readJson(path.join(outputDir, 'meta.json')),
    ).resolves.toMatchObject({ navScope: {} });
  });

  it('creates a scoped sidebar for Doxygen/Javadoc API output', async () => {
    const rootDir = await makeTempDir();
    const sourceDir = path.join(rootDir, 'doxygen-source');
    const outputDir = path.join(rootDir, 'output');
    await writeDoxygenFixture(sourceDir);

    runMigration([
      '--source',
      sourceDir,
      '--output',
      outputDir,
      '--product',
      'rtsa',
      '--platform',
      'c',
    ]);

    const meta = await readJson(path.join(outputDir, 'meta.json'));
    expect(meta).toMatchObject({ navScope: {} });
    expect(meta.pages).not.toContain('doxygen-crawl');
    await expect(
      pathExists(path.join(outputDir, 'doxygen-crawl.mdx')),
    ).resolves.toBe(true);
  });

  it('migrates iOS doc-generator output with dry-run planning and rewritten links', async () => {
    const rootDir = await makeTempDir();
    const sourceDir = path.join(rootDir, 'ios-source');
    const outputDir = path.join(rootDir, 'output');
    await writeIosFixture(sourceDir);

    await expectLaneDryRunAndMigration({
      detected: 'iOS-doc-generator HTML reference',
      expectedMetaPages: ['index', 'classes', 'protocols', 'hierarchy'],
      expectedPageContents: {
        'classes/index.mdx': [
          'title: "Classes"',
          'iOS classes index.',
          '[Engine class](/api-reference/rtc/ios/classes/agora-rtc-engine-kit)',
        ],
        'classes/agora-rtc-engine-kit.mdx': [
          'title: "AgoraRtcEngineKit"',
          '[delegate callbacks](/api-reference/rtc/ios/protocols/agora-rtc-engine-delegate#events)',
          '[classes overview](/api-reference/rtc/ios/classes)',
          '<a id="sharedengine"></a>',
          'Creates an engine instance.',
        ],
        'protocols/agora-rtc-engine-delegate.mdx': [
          'title: "AgoraRtcEngineDelegate"',
          '<a id="events"></a>',
          'Receives event callbacks.',
        ],
      },
      outputDir,
      platform: 'ios',
      product: 'rtc',
      sourceDir,
    });
  });

  it('migrates Dartdoc output with dry-run planning and rewritten links', async () => {
    const rootDir = await makeTempDir();
    const sourceDir = path.join(rootDir, 'dartdoc-source');
    const outputDir = path.join(rootDir, 'output');
    await writeDartdocFixture(sourceDir);

    await expectLaneDryRunAndMigration({
      detected: 'Dartdoc HTML reference',
      expectedMetaPages: ['index', 'library-index', 'agora-rtc'],
      expectedPageContents: {
        'agora-rtc/agora-rtc-library.mdx': [
          'title: "agora_rtc library"',
          '<a id="RtcEngine"></a>',
          'Primary Dart RTC engine.',
          '1. Initialize the engine.',
          '- [Setup](#setup)\n\n  - [Advanced](#advanced)',
        ],
        'library-index.mdx': [
          '[RtcEngine](/api-reference/rtc/dart/agora-rtc/agora-rtc-library#RtcEngine)',
        ],
      },
      outputDir,
      platform: 'dart',
      product: 'rtc',
      sourceDir,
    });
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
      'Supported lanes: DITA-OT/Oxygen, TypeDoc, Doxygen/Javadoc, iOS doc-generator/Jazzy/appledoc, and Dartdoc generated HTML API references.',
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

  it('refuses broad temporary and home-child output paths before cleanup', async () => {
    const rootDir = await makeTempDir();
    const sourceDir = path.join(rootDir, 'source');
    await writeDitaFixture(sourceDir);

    const tmpOutput = runMigrationFailure([
      '--source',
      sourceDir,
      '--output',
      '/tmp',
      '--product',
      'rtc',
      '--platform',
      'android',
    ]);
    expect(tmpOutput).toContain('Refusing to delete protected output path');

    const homeChildOutput = runMigrationFailure([
      '--source',
      sourceDir,
      '--output',
      path.join(os.homedir(), 'Downloads'),
      '--product',
      'rtc',
      '--platform',
      'android',
    ]);
    expect(homeChildOutput).toContain(
      'Refusing to delete broad home-directory child path',
    );
  });
});
