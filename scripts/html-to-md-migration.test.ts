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
  <body>
    <main>
      <h1>TypeDoc API</h1>
      <p>Generated by TypeDoc.</p>
      <nav>
        <a href="modules.html">Modules</a>
        <a href="classes/Client.html#connect">Client</a>
      </nav>
    </main>
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
    </div>
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
      <a href="docs/headers/AgoraRtcEngineKit-Overview.html">Overview guide</a>
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
    <main role="main">
      <h1 class="title">AgoraRtcEngineKit Class Reference</h1>
      <div class="section section-overview">
        <a title="Overview" name="overview"></a>
        <h2 class="subtitle subtitle-overview">Overview</h2>
        <p>Engine class with <a href="../Protocols/AgoraRtcEngineDelegate.html#events">delegate callbacks</a>.</p>
        <p>Back to the <a href="index.html">classes overview</a>.</p>
      </div>
      <div class="section section-tasks">
        <h2 class="task-title">Engine Methods</h2>
        <div class="task-list">
          <div class="section-method">
            <a name="//api/name/sharedEngineWithAppId:delegate:" title="sharedEngineWithAppId:delegate:"></a>
            <h3 class="method-title"><code><a href="#//api/name/sharedEngineWithAppId:delegate:">+&nbsp;sharedEngineWithAppId:delegate:</a></code></h3>
            <div class="method-info">
              <div class="method-info-container">
                <div class="method-subsection brief-description">
                  <p>Creates an engine instance.</p>
                </div>
                <div class="method-subsection method-declaration"><code>+ (instancetype)sharedEngineWithAppId:(NSString *)<em>appId</em> delegate:(id&lt;AgoraRtcEngineDelegate&gt;)<em>delegate</em></code></div>
                <div class="method-subsection parameters">
                  <table class="argument-def parameter-def">
                    <tr><th><code>appId</code></th><td><p>Agora application ID.</p></td></tr>
                    <tr><th><code>delegate</code></th><td><p>Receives callbacks.</p></td></tr>
                  </table>
                </div>
                <div class="method-subsection return">
                  <h4 class="method-subtitle">Return Value</h4>
                  <p>An engine instance.</p>
                </div>
                <div class="method-subsection discussion-section">
                  <h4 class="method-subtitle">Discussion</h4>
                  <p>Call this before joining a channel.</p>
                </div>
                <div class="method-subsection availability">
                  <h4 class="method-subtitle">Availability</h4>
                  <p>Available in v1.0.0 and later.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </body>
</html>`,
  );
  await writeFixture(
    path.join(sourceDir, 'Protocols', 'AgoraRtcEngineDelegate.html'),
    `<!doctype html>
<html>
  <body>
    <main role="main">
      <h1 class="title">AgoraRtcEngineDelegate Protocol Reference</h1>
      <div class="section section-overview">
        <a title="Overview" name="events"></a>
        <h2 class="subtitle subtitle-overview">Overview</h2>
        <p>Receives event callbacks.</p>
      </div>
      <div class="section section-tasks">
        <h2 class="task-title">Delegate Methods</h2>
        <div class="task-list">
          <div class="section-method">
            <a name="//api/name/rtcEngine:didJoinChannel:" title="rtcEngine:didJoinChannel:"></a>
            <h3 class="method-title"><code><a href="#//api/name/rtcEngine:didJoinChannel:">&ndash;&nbsp;rtcEngine:didJoinChannel:</a></code></h3>
            <div class="method-info">
              <div class="method-info-container">
                <div class="method-subsection brief-description">
                  <p>Occurs when joining succeeds.</p>
                </div>
                <div class="method-subsection method-declaration"><code>- (void)rtcEngine:(AgoraRtcEngineKit *)<em>engine</em> didJoinChannel:(NSString *)<em>channel</em></code></div>
                <div class="method-subsection parameters">
                  <table class="argument-def parameter-def">
                    <tr><th><code>engine</code></th><td><p>The engine instance.</p></td></tr>
                    <tr><th><code>channel</code></th><td><p>The channel name.</p></td></tr>
                  </table>
                </div>
                <div class="method-subsection discussion-section">
                  <h4 class="method-subtitle">Discussion</h4>
                  <p>Use this callback to update UI state.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </body>
</html>`,
  );
  await writeFixture(
    path.join(sourceDir, 'Constants', 'AgoraConnectionState.html'),
    `<!doctype html>
<html>
  <body>
    <main role="main">
      <h1 class="title">AgoraConnectionState Constants Reference</h1>
      <h3 class="subsubtitle method-title">AgoraConnectionState</h3>
      <div class="section section-overview"><p>Connection state.</p></div>
      <div class="section">
        <h4 class="method-subtitle">Definition</h4>
        <code>typedef NS_ENUM(NSInteger, AgoraConnectionState) { AgoraConnectionStateConnected };</code>
      </div>
      <div class="section section-methods">
        <h4 class="method-subtitle">Constants</h4>
        <dl class="termdef">
          <dt><code>AgoraConnectionStateConnected</code></dt>
          <dd><p>Connected.</p></dd>
        </dl>
      </div>
    </main>
  </body>
</html>`,
  );
  await writeFixture(
    path.join(sourceDir, 'Blocks', 'AgoraResultBlock.html'),
    `<!doctype html>
<html>
  <body>
    <main role="main">
      <h1 class="title">AgoraResultBlock Block Reference</h1>
      <h4 class="method-subtitle parameter-title">Block Definition</h4>
      <h3 class="subsubtitle method-title">AgoraResultBlock</h3>
      <div class="method-subsection brief-description"><p>Receives an async result.</p></div>
      <code>typedef void (^AgoraResultBlock) (NSError *error)</code>
    </main>
  </body>
</html>`,
  );
  await writeFixture(
    path.join(sourceDir, 'docs', 'headers', 'AgoraRtcEngineKit-Overview.html'),
    `<!doctype html>
<html>
  <body>
    <main role="main">
      <h1 class="title">AgoraRtcEngineKit Overview Document</h1>
      <p>Use <a href="../../Classes/AgoraRtcEngineKit.html">AgoraRtcEngineKit</a> to manage RTC features.</p>
      <h3>Core APIs</h3>
      <table>
        <thead><tr><th>API</th><th>Description</th></tr></thead>
        <tbody>
          <tr><td><a href="../../Classes/AgoraRtcEngineKit.html#//api/name/sharedEngineWithAppId:delegate:">sharedEngineWithAppId</a></td><td>Create an engine.</td></tr>
        </tbody>
      </table>
    </main>
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
      expectedMetaPages: ['index', 'modules', 'classes'],
      expectedPageContents: {
        'classes/client.mdx': [
          'title: "Client"',
          '<a id="connect"></a>',
          '## Methods',
          '### connect',
          '```ts\nconnect(appId: string): Promise<void>\n```',
          'Call `connect` before publishing.',
          '#### Parameters',
          '| appId: string | Agora application ID. |',
          '#### Returns',
          'Returns Promise &lt;void&gt;',
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
          '#### Type declaration',
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
    expect(clientOutput).not.toMatch(/^#{7,}\s/m);
  });

  it('migrates Doxygen/Javadoc output with dry-run planning and rewritten links', async () => {
    const rootDir = await makeTempDir();
    const sourceDir = path.join(rootDir, 'doxygen-source');
    const outputDir = path.join(rootDir, 'output');
    await writeDoxygenFixture(sourceDir);

    await expectLaneDryRunAndMigration({
      detected: 'Doxygen/Javadoc HTML reference',
      expectedMetaPages: [
        'index',
        'annotated',
        'class-agora-1-1rtc-1-1-client',
        'files',
      ],
      expectedPageContents: {
        'annotated.mdx': [
          'title: "Class Index"',
          '[Client](/api-reference/rtc/cpp/class-agora-1-1rtc-1-1-client#join)',
        ],
        'class-agora-1-1rtc-1-1-client.mdx': [
          'title: "Client Class Reference"',
          '[all classes](/api-reference/rtc/cpp/annotated)',
          '<a id="join"></a>',
          '## Member Function Documentation',
          '### join()',
          '```cpp\nint agora::rtc::Client::join(const char* channel)\n```',
          'Joins a channel.',
          '#### Parameters',
          '| channel | Channel name |',
          '#### Returns',
          'Zero on success.',
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
        'class-agora-1-1rtc-1-1-client.mdx': [
          'All members',
          'Source view',
          'Function index',
          'class_agora_1_1rtc_1_1_client-members.html',
          'class_agora_1_1rtc_1_1_client_source.html',
          'functions.html',
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

  it('does not classify a Doxygen hierarchy page as iOS doc-generator output', async () => {
    const rootDir = await makeTempDir();
    const sourceDir = path.join(rootDir, 'doxygen-source');
    const outputDir = path.join(rootDir, 'dry-output');
    await writeDoxygenFixture(sourceDir);
    await writeFixture(
      path.join(sourceDir, 'hierarchy.html'),
      '<!doctype html><html><body><div class="contents"><h1>Doxygen Hierarchy</h1></div></body></html>',
    );

    const output = runMigration([
      '--source',
      sourceDir,
      '--output',
      outputDir,
      '--product',
      'rtc',
      '--platform',
      'cpp',
      '--dry-run',
    ]);

    expect(output).toContain(
      'Detected source type: Doxygen/Javadoc HTML reference',
    );
    expect(output).not.toContain('Detected source type: iOS-doc-generator');
  });

  it('migrates iOS doc-generator output with dry-run planning and rewritten links', async () => {
    const rootDir = await makeTempDir();
    const sourceDir = path.join(rootDir, 'ios-source');
    const outputDir = path.join(rootDir, 'output');
    await writeIosFixture(sourceDir);

    await expectLaneDryRunAndMigration({
      detected: 'iOS-doc-generator HTML reference',
      expectedMetaPages: [
        'index',
        'classes',
        'protocols',
        'docs',
        'blocks',
        'constants',
        'hierarchy',
      ],
      expectedPageContents: {
        'classes/index.mdx': [
          'title: "Classes"',
          'iOS classes index.',
          '[Engine class](/api-reference/rtc/ios/classes/agora-rtc-engine-kit)',
        ],
        'classes/agora-rtc-engine-kit.mdx': [
          'title: "AgoraRtcEngineKit Class Reference"',
          '<a id="overview"></a>',
          '[delegate callbacks](/api-reference/rtc/ios/protocols/agora-rtc-engine-delegate#events)',
          '[classes overview](/api-reference/rtc/ios/classes)',
          '<a id="//api/name/sharedEngineWithAppId:delegate:"></a>',
          '## Engine Methods',
          '### sharedEngineWithAppId:delegate:',
          '```objc\n+ (instancetype)sharedEngineWithAppId:(NSString *)appId delegate:(id<AgoraRtcEngineDelegate>)delegate\n```',
          'Creates an engine instance.',
          '#### Parameters',
          '| `appId` | Agora application ID. |',
          '| `delegate` | Receives callbacks. |',
          '#### Returns',
          'An engine instance.',
          '#### Discussion',
          'Call this before joining a channel.',
          '#### Availability',
          'Available in v1.0.0 and later.',
        ],
        'protocols/agora-rtc-engine-delegate.mdx': [
          'title: "AgoraRtcEngineDelegate Protocol Reference"',
          '<a id="events"></a>',
          'Receives event callbacks.',
          '<a id="//api/name/rtcEngine:didJoinChannel:"></a>',
          '## Delegate Methods',
          '### rtcEngine:didJoinChannel:',
          '```objc\n- (void)rtcEngine:(AgoraRtcEngineKit *)engine didJoinChannel:(NSString *)channel\n```',
          'Occurs when joining succeeds.',
          '| `engine` | The engine instance. |',
          '| `channel` | The channel name. |',
          'Use this callback to update UI state.',
        ],
        'constants/agora-connection-state.mdx': [
          'title: "AgoraConnectionState Constants Reference"',
          '## AgoraConnectionState',
          '```objc\ntypedef NS_ENUM(NSInteger, AgoraConnectionState) { AgoraConnectionStateConnected };\n```',
          '| `AgoraConnectionStateConnected` | Connected. |',
        ],
        'blocks/agora-result-block.mdx': [
          'title: "AgoraResultBlock Block Reference"',
          '## AgoraResultBlock',
          'Receives an async result.',
          '```objc\ntypedef void (^AgoraResultBlock) (NSError *error)\n```',
        ],
        'docs/headers/agora-rtc-engine-kit-overview.mdx': [
          'title: "AgoraRtcEngineKit Overview Document"',
          '[AgoraRtcEngineKit](/api-reference/rtc/ios/classes/agora-rtc-engine-kit)',
          '### Core APIs',
          '| API | Description |',
          '[sharedEngineWithAppId](/api-reference/rtc/ios/classes/agora-rtc-engine-kit#//api/name/sharedEngineWithAppId:delegate:)',
        ],
      },
      outputDir,
      platform: 'ios',
      product: 'rtc',
      sourceDir,
    });

    const meta = await readJson(path.join(outputDir, 'meta.json'));
    expect(meta.title).toBe('Jazzy API');
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
