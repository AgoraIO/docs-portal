import { describe, expect, it } from 'vitest';
import { convertHtmlToMdx } from './lib/api-center/html-to-mdx.mjs';
import { buildLegacyRouteMap } from './lib/api-center/migration-framework.mjs';

describe('API Center shared HTML to MDX converter', () => {
  it('converts headings, stable anchors, links, lists, callouts, code, definitions, tables, and images', async () => {
    const html = `<!doctype html><html><head><title>Fallback</title></head><body>
      <main><article>
        <h1 id="Client">Client</h1>
        <p class="shortdesc">Client summary.</p>
        <section id="join"><h2>Join</h2><p>Call <code>join</code> and read <a href="/api-ref/rtc/web/classes/result#ok">Result</a>.</p></section>
        <div class="admonition warning"><strong>注意</strong><p>Check the token.</p></div>
        <ol><li>First<ul><li>Nested</li></ul></li><li>Second</li></ol>
        <pre><code class="language-typescript">const x = 1;</code></pre>
        <dl><dt>uid</dt><dd>User ID.</dd></dl>
        <table><thead><tr><th>Name</th><th>Type</th></tr></thead><tbody><tr><td>uid</td><td>&lt;string&gt;</td></tr></tbody></table>
        <figure><img src="assets/client.png" alt="Client diagram"><figcaption>Flow</figcaption></figure>
      </article></main>
    </body></html>`;
    const result = await convertHtmlToMdx({
      html,
      sourceUrl: 'https://doc.shengwang.cn/api-ref/rtc/web/classes/client',
      sourcePath: 'html-docs/rtc/Web/classes/Client.html',
      routeMap: new Map([
        [
          '/api-ref/rtc/web/classes/result',
          '/zh-CN/api-reference/rtc/web/classes/result',
        ],
      ]),
      onAsset: async ({ source }) =>
        `/img/api-center-generated/${source.split('/').at(-1)}`,
    });

    expect(result).toMatchObject({
      title: 'Client',
      description: 'Client summary.',
      fragments: ['Client', 'join'],
      assets: [
        {
          source: 'assets/client.png',
          target: '/img/api-center-generated/client.png',
        },
      ],
      warnings: [],
    });
    expect(result.body).toContain('<a id="join"></a>\n\n## Join');
    expect(result.body).toContain(
      '[Result](/zh-CN/api-reference/rtc/web/classes/result#ok)',
    );
    expect(result.body).toContain(':::warning[注意]');
    expect(result.body).toContain('1. First\n\n   - Nested');
    expect(result.body).toContain('```ts\nconst x = 1;\n```');
    expect(result.body).toContain('### uid\n\nUser ID.');
    expect(result.body).toContain('| Name | Type |');
    expect(result.body).toContain(
      '![Client diagram](/img/api-center-generated/client.png)',
    );
    expect(result.body).not.toContain('Client summary.');
    expect(result.body).not.toContain('<table');
    expect(result.body).not.toContain('<img');
  });

  it('records unsupported embeds and unresolved internal links as warnings', async () => {
    const result = await convertHtmlToMdx({
      html: '<article><h1>Page</h1><p><a href="/api-ref/missing">Missing</a></p><iframe src="old"></iframe></article>',
      sourceUrl: 'https://doc.shengwang.cn/api-ref/rtc/web/page',
      sourcePath: 'page.html',
    });

    expect(
      result.warnings.map((warning: { code: string }) => warning.code),
    ).toEqual(['unresolved-link', 'unsupported-html-structure']);
    expect(result.body).toContain('Missing');
    expect(result.body).not.toContain('/api-ref/missing');
    expect(result.body).not.toContain('<iframe');
  });

  it('rewrites Markdown links embedded as text in legacy HTML', async () => {
    const result = await convertHtmlToMdx({
      html: `<article><h1>Audio</h1><p>详见[错误码](https://doc.shengwang.cn/api-ref/rtc/android/error-code)了解详情。</p></article>`,
      sourceUrl:
        'https://doc.shengwang.cn/api-ref/rtc/android/API/toc_audio_basic',
      sourcePath: 'html-docs/rtc/Android/API/toc_audio_basic.html',
      routeMap: new Map([
        [
          'https://doc.shengwang.cn/api-ref/rtc/android/error-code',
          '/zh-CN/api-reference/rtc/error-code',
        ],
      ]),
    });

    expect(result.body).toContain(
      '[错误码](/zh-CN/api-reference/rtc/error-code)',
    );
    expect(result.body).not.toContain('https://doc.shengwang.cn');
  });

  it('does not mistake a nested Oxygen API summary for the page description', async () => {
    const result = await convertHtmlToMdx({
      html: `<main><article role="article">
        <article class="nested0"><h1>音频基础功能</h1><div class="body refbody"></div>
          <article class="topic reference nested1">
            <h2>adjustPlaybackSignalVolume</h2>
            <div class="body refbody"><p class="shortdesc">调节所有远端用户的本地播放音量。</p></div>
          </article>
        </article>
      </article></main>`,
      sourceUrl:
        'https://doc.shengwang.cn/api-ref/rtc/android/API/toc_audio_basic',
      sourcePath: 'html-docs/rtc/Android/API/toc_audio_basic.html',
      rootSelector: 'main > article',
      titleSelector: 'main > article > h1.title, main > article > h1',
    });

    expect(result.description).toBe('');
    expect(result.body).toContain('调节所有远端用户的本地播放音量。');
    expect(result.body).not.toContain('# 音频基础功能');
  });

  it('preserves links in definition terms without nesting them in headings', async () => {
    const result = await convertHtmlToMdx({
      html: `<article><h1>Types</h1><dl><dt><a href="class-video.html">VideoParameters</a></dt><dd>Video settings.</dd></dl></article>`,
      sourceUrl: 'https://doc.shengwang.cn/api-ref/rtc/web/types',
      sourcePath: 'html-docs/rtc/Web/types.html',
      routeMap: new Map([
        [
          'https://doc.shengwang.cn/api-ref/rtc/web/class-video.html',
          '/zh-CN/api-reference/rtc/web/class-video',
        ],
      ]),
    });

    expect(result.body).toContain(
      '**[VideoParameters](/zh-CN/api-reference/rtc/web/class-video)**',
    );
    expect(result.body).not.toContain('### [VideoParameters]');
  });

  it('removes self links from headings with bracketed overload labels', async () => {
    const result = await convertHtmlToMdx({
      html: `<article><h1>Music</h1><h2><a href="#api_searchmusic2">searchMusic [2/2]</a></h2></article>`,
      sourceUrl: 'https://doc.shengwang.cn/api-ref/rtc/android/play/drm',
      sourcePath: 'html-docs/rtc/Android/API/toc_drm.html',
    });

    expect(result.body).toContain('## searchMusic [2/2]');
    expect(result.body).not.toContain('## [searchMusic');
  });

  it('omits source-empty code fences without inventing an API signature', async () => {
    const result = await convertHtmlToMdx({
      html: `<article><h1>Audio capture</h1>
        <section id="api_irtcengine_enableinearmonitoring">
          <pre><code class="language-arkts"></code></pre>
        </section>
        <section id="api_irtcengine_enableinearmonitoring2">
          <h2>enableInEarMonitoring</h2>
          <pre><code class="language-arkts">public abstract enableInEarMonitoring(enabled: boolean, includeAudioFilters?: Constants.EarMontoringFilterType): number;</code></pre>
        </section>
      </article>`,
      sourceUrl:
        'https://doc.shengwang.cn/api-ref/rtc/harmonyos/API/class_irtcengine',
      sourcePath: 'html-docs/rtc/HarmonyOS/API/class_irtcengine.html',
    });

    expect(result.body).toContain(
      '<a id="api_irtcengine_enableinearmonitoring"></a>',
    );
    expect(result.body).toContain('## enableInEarMonitoring');
    expect(result.body).toContain(
      'public abstract enableInEarMonitoring(enabled: boolean, includeAudioFilters?: Constants.EarMontoringFilterType): number;',
    );
    expect(result.body).not.toMatch(/```arkts\n\s*```/);
    expect(result.warnings).toContainEqual(
      expect.objectContaining({ code: 'empty-source-code' }),
    );
  });

  it('uses contextual alt text when the source image has none and reports the source gap', async () => {
    const result = await convertHtmlToMdx({
      html: '<article><h1>Page</h1><img src="diagram.png"></article>',
      sourceUrl: 'https://doc.shengwang.cn/api-ref/example/page',
      sourcePath: 'page.html',
      onAsset: async () => '/img/api-center-generated/diagram.png',
    });

    expect(result.body).toContain(
      '![Page 图示](/img/api-center-generated/diagram.png)',
    );
    expect(result.warnings).toContainEqual(
      expect.objectContaining({
        alt: 'Page 图示',
        code: 'missing-source-text',
      }),
    );
  });

  it('renders images as nested blocks in lists and Slot blocks in tables', async () => {
    const result = await convertHtmlToMdx({
      html: `<article><h1>Layout guide</h1>
        <ol><li>Open settings <img src="settings.png"> and continue.</li></ol>
        <table><tr><th>Users</th><th>Layout</th></tr>
          <tr><td>2-5</td><td><img src="layout.png"></td></tr>
        </table>
      </article>`,
      sourceUrl: 'https://doc.shengwang.cn/api-ref/example/layout',
      sourcePath: 'layout.html',
      onAsset: async ({ source }) => `/img/api-center-generated/${source}`,
    });

    expect(result.body).toContain(
      '1. Open settings\n\n   ![Layout guide 图示](/img/api-center-generated/settings.png)\n\n   and continue.',
    );
    expect(result.body).toContain(
      '| 2-5 | <Slot name="api-center-table-0" /> |',
    );
    expect(result.body).toContain('<Slot for="api-center-table-0">');
    expect(result.body).toContain(
      '![2-5 人布局示意](/img/api-center-generated/layout.png)',
    );
    expect(result.body).not.toMatch(/\|[^\n]*!\[/);
  });

  it('reuses the approved Slot component for block-rich table cells', async () => {
    const result = await convertHtmlToMdx({
      html: `<article><h1>Page</h1><table>
        <tr><th>Field</th><th>Description</th></tr>
        <tr><td>mode</td><td><div><p>First paragraph.</p><ul><li>One</li><li>Two</li></ul></div></td></tr>
      </table></article>`,
      sourceUrl: 'https://doc.shengwang.cn/api-ref/example/page',
      sourcePath: 'page.html',
    });

    expect(result.body).toContain('<Slot name="api-center-table-0" />');
    expect(result.body).toContain('<Slot for="api-center-table-0">');
    expect(result.body).toContain('First paragraph.');
    expect(result.body).toContain('- One\n- Two');
    expect(result.warnings).toEqual([]);
  });

  it('keeps Slot placeholders when a legacy table header spans ragged data columns', async () => {
    const result = await convertHtmlToMdx({
      html: `<article><h1>Page</h1><table>
        <tr><th colspan="2">Enum value</th></tr>
        <tr><td>READY</td><td><p>Ready description.</p></td></tr>
      </table></article>`,
      sourceUrl: 'https://doc.shengwang.cn/api-ref/example/page',
      sourcePath: 'page.html',
    });

    expect(result.body).toContain('| Enum value |  |');
    expect(result.body).toContain(
      '| READY | <Slot name="api-center-table-0" /> |',
    );
    expect(result.body).toContain('<Slot for="api-center-table-0">');
  });

  it('preserves explicit fragment anchors inside table cells', async () => {
    const result = await convertHtmlToMdx({
      html: `<article><h1>Page</h1><p><a href="#user-offline-quit">Quit</a></p><table>
        <tr><th>Enum value</th><th>Description</th></tr>
        <tr><td><a id="user-offline-quit"></a>USER_OFFLINE_QUIT</td><td>User quits.</td></tr>
      </table></article>`,
      sourceUrl: 'https://doc.shengwang.cn/api-ref/example/page',
      sourcePath: 'page.html',
      routeMap: new Map([
        [
          'https://doc.shengwang.cn/api-ref/example/page',
          '/zh-CN/api-reference/example/page',
        ],
      ]),
    });

    expect(result.body).toContain('<Slot name="api-center-table-0" />');
    expect(result.body).toContain('<Slot for="api-center-table-0">');
    expect(result.body).toContain(
      '<a id="user-offline-quit"></a>USER_OFFLINE_QUIT',
    );
    expect(result.body).not.toContain('&lt;a id=');
    expect(result.warnings).toEqual([]);
  });

  it('keeps empty legacy anchors functional and invisible in table headers', async () => {
    const result = await convertHtmlToMdx({
      html: `<article><h1>Page</h1><table>
        <tr><th><a id="pub-methods"></a>Public methods</th><th></th></tr>
        <tr><td>join</td><td>Joins a channel.</td></tr>
      </table></article>`,
      sourceUrl: 'https://doc.shengwang.cn/api-ref/example/page',
      sourcePath: 'page.html',
    });

    expect(result.body).toContain(
      '| <a id="pub-methods"></a>Public methods |  |',
    );
    expect(result.body).not.toContain('&lt;a id=');
    expect(result.warnings).toEqual([]);
  });

  it('preserves headings wrapped in self-link anchors as headings', async () => {
    const result = await convertHtmlToMdx({
      html: `<article><h1>Page</h1>
        <a href="#global-module" id="global-module"><h2>Global module</h2></a>
        <p>Module details.</p>
      </article>`,
      sourceUrl: 'https://doc.shengwang.cn/api-ref/example/page',
      sourcePath: 'page.html',
      routeMap: new Map([
        [
          'https://doc.shengwang.cn/api-ref/example/page',
          '/zh-CN/api-reference/example/page',
        ],
      ]),
    });

    expect(result.body).toContain('<a id="global-module"></a>');
    expect(result.body).toContain('## Global module');
    expect(result.body).not.toContain('[Global module]');
    expect(result.warnings).toEqual([]);
  });

  it('rewrites legacy http links using the same local route map as https links', async () => {
    const result = await convertHtmlToMdx({
      html: '<article><h1>Page</h1><p><a href="http://doc.shengwang.cn/doc/rtc/javascript/enable">Enable</a></p></article>',
      sourceUrl: 'https://doc.shengwang.cn/api-ref/rtc/javascript/page',
      sourcePath: 'page.html',
      routeMap: new Map([
        [
          'https://doc.shengwang.cn/doc/rtc/javascript/enable',
          '/zh-CN/rtc/enable',
        ],
      ]),
    });

    expect(result.body).toContain('[Enable](/zh-CN/rtc/enable)');
    expect(result.body).not.toContain('doc.shengwang.cn');
  });

  it('uses an explicit generator title outside the content root and preserves named anchors', async () => {
    const result = await convertHtmlToMdx({
      html: `<body>
        <div class="headertitle"><div class="title">RTSA C API 参考</div></div>
        <div class="contents"><h1><a id="methods"></a>方法</h1><p>正文。</p></div>
      </body>`,
      sourceUrl: 'https://doc.shengwang.cn/api-ref/rtsa/c/overview',
      sourcePath: 'html-docs/rtsa/c/index.html',
      rootSelector: '.contents',
      titleSelector: '.headertitle .title',
    });

    expect(result.title).toBe('RTSA C API 参考');
    expect(result.body).toContain('<a id="methods"></a>\n\n# 方法');
  });

  it('captures a TypeDoc title before removing the legacy header shell', async () => {
    const result = await convertHtmlToMdx({
      html: `<header><div class="tsd-page-title"><h1>Interface AgoraRTCStats</h1></div></header>
        <div class="col-content"><p>统计信息正文。</p></div>`,
      sourceUrl:
        'https://doc.shengwang.cn/api-ref/rtc/javascript/interfaces/agorartcstats',
      sourcePath: 'html-docs/rtc/Web/interfaces/agorartcstats.html',
      rootSelector: '.col-content',
      titleSelector: '.tsd-page-title h1',
    });

    expect(result.title).toBe('Interface AgoraRTCStats');
    expect(result.body).toBe('统计信息正文。');
  });

  it('removes an explicit title inside the content root without dropping the body', async () => {
    const result = await convertHtmlToMdx({
      html: `<main role="main"><h1 class="title">WhiteAppParam</h1>
        <div><a name="//api/name/kind"></a><h3>kind</h3><p>属性正文。</p></div>
      </main>`,
      sourceUrl:
        'https://doc.shengwang.cn/api-ref/whiteboard/ios/Classes/WhiteAppParam',
      sourcePath: 'html-docs/whiteboard/iOS/Classes/WhiteAppParam.html',
      rootSelector: 'main[role="main"]',
      titleSelector: 'main[role="main"] > h1.title',
    });

    expect(result.title).toBe('WhiteAppParam');
    expect(result.body).not.toContain('# WhiteAppParam');
    expect(result.body).toContain('<a id="//api/name/kind"></a>');
    expect(result.body).toContain('### kind');
    expect(result.body).toContain('属性正文。');
    expect(result.body).not.toContain(':::info');
  });

  it('renders Appledoc code-styled method headings without nested links', async () => {
    const result = await convertHtmlToMdx({
      html: `<main role="main"><h1 class="title">Protocol</h1>
        <a name="//api/name/phaseChanged:"></a>
        <h3><code><a href="#//api/name/phaseChanged:">– phaseChanged:</a></code></h3>
        <p>Callback details.</p>
      </main>`,
      sourceUrl:
        'https://doc.shengwang.cn/api-ref/whiteboard/ios/Protocols/Protocol',
      sourcePath: 'html-docs/whiteboard/iOS/Protocols/Protocol.html',
      rootSelector: 'main[role="main"]',
      titleSelector: 'main[role="main"] > h1.title',
      routeMap: new Map([
        [
          'https://doc.shengwang.cn/api-ref/whiteboard/ios/Protocols/Protocol',
          '/zh-CN/api-reference/whiteboard/whiteboard-sdk/ios/protocols/protocol',
        ],
      ]),
    });

    expect(result.body).toContain('<a id="//api/name/phaseChanged:"></a>');
    expect(result.body).toContain('### `– phaseChanged:`');
    expect(result.body).not.toContain('`[– phaseChanged:]');
    expect(result.body).not.toMatch(/^### .*\]\(/m);
  });

  it('removes Doxygen self-links from headings while keeping their text', async () => {
    const result = await convertHtmlToMdx({
      html: `<article><h1>Page</h1>
        <h2><a href="#member">◆</a>member</h2><p>Member details.</p>
      </article>`,
      sourceUrl: 'https://doc.shengwang.cn/api-ref/example/page',
      sourcePath: 'page.html',
      routeMap: new Map([
        [
          'https://doc.shengwang.cn/api-ref/example/page',
          '/zh-CN/api-reference/example/page',
        ],
      ]),
    });

    expect(result.body).toContain('## ◆member');
    expect(result.body).not.toMatch(/^## .*\]\(/m);
  });

  it('builds route aliases for extension and extensionless legacy URLs', () => {
    const routeMap = buildLegacyRouteMap({
      pageEvidence: [
        {
          requestedUrl:
            'https://doc.shengwang.cn/api-ref/rtc/web/classes/client',
          sourceResolution: {
            targetRoute: '/zh-CN/api-reference/rtc/web/classes/client',
          },
        },
      ],
    });

    expect(routeMap.get('/api-ref/rtc/web/classes/client.html')).toBe(
      '/zh-CN/api-reference/rtc/web/classes/client',
    );
  });

  it('uses audited path-map redirects for cross-scope legacy links', () => {
    const routeMap = buildLegacyRouteMap({ pageEvidence: [] }, [
      {
        old_url: '/doc/rtc/javascript/error-code.html',
        new_url: '/zh-CN/realtime-media/rtc/reference/error-code',
      },
    ]);

    expect(routeMap.get('/doc/rtc/javascript/error-code')).toBe(
      '/zh-CN/realtime-media/rtc/reference/error-code',
    );
  });
});
