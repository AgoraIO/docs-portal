import { compile } from '@mdx-js/mdx';
import { remarkDirectiveAdmonition } from 'fumadocs-core/mdx-plugins';
import remarkDirective from 'remark-directive';
import { describe, expect, it } from 'vitest';
import { directiveCalloutTypes } from '../src/lib/mdx/directive-callouts';
import {
  convertHtmlToMdx,
  EDU_STORE_TYPEDOC_CONVERSION_PROFILE,
} from './lib/api-center/html-to-mdx.mjs';
import { buildLegacyRouteMap } from './lib/api-center/migration-framework.mjs';

async function compileGeneratedMdx(source: string) {
  return String(
    await compile(source, {
      format: 'mdx',
      jsx: true,
      remarkPlugins: [
        remarkDirective,
        [
          remarkDirectiveAdmonition,
          {
            types: directiveCalloutTypes,
          },
        ],
      ],
    }),
  );
}

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

  it('maps source callout classes without collapsing caution into warning', async () => {
    const cases = [
      ['alert alert-warning', 'caution'],
      ['alert warning', 'caution'],
      ['note attention note_attention', 'caution'],
      ['note caution note_caution', 'caution'],
      ['admonition warning', 'warning'],
      ['warning', 'warning'],
      ['note danger note_danger', 'error'],
      ['alert alert-danger', 'error'],
      ['note tip note_tip', 'tip'],
      ['alert alert-success', 'tip'],
      ['alert info', 'info'],
      ['alert alert-info', 'info'],
      ['note note note_note', 'note'],
      ['note', 'note'],
      ['alert alert-note', 'note'],
    ] as const;

    for (const [classes, expectedType] of cases) {
      const result = await convertHtmlToMdx({
        html: `<article><h1>Callout</h1><div class="${classes}">Body for ${classes}.</div></article>`,
        sourceUrl: 'https://doc.shengwang.cn/api-ref/rtc/web/callout',
        sourcePath: 'html-docs/rtc/Web/callout.html',
      });

      expect(result.body).toContain(
        `:::${expectedType}\nBody for ${classes}.\n:::`,
      );
    }
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

  it('restores Oxygen detail headings unless the source explicitly suppresses the title', async () => {
    const result = await convertHtmlToMdx({
      html: `<main><article role="article">
        <article id="api_update">
          <h2>updateRoomProperties</h2>
          <div class="body refbody">
            <section class="section" id="api_update__detailed_desc">
              <p>Detailed guidance.</p>
            </section>
            <section class="section" data-deliveryTarget="details" data-otherprops="no-title" id="api_update__internal_details">
              <p>Untitled implementation note.</p>
            </section>
          </div>
        </article>
      </article></main>`,
      sourceUrl:
        'https://doc.shengwang.cn/api-ref/flexible-classroom/android/API/class_roomcontext',
      sourcePath:
        'html-docs/flexible-classroom/Android/API/class_roomcontext.html',
      rootSelector: 'main > article',
      titleSelector: 'main > article > h1.title, main > article > h1',
    });

    expect(result.body).toContain(
      '<a id="api_update__detailed_desc"></a>\n\n### 详情\n\nDetailed guidance.',
    );
    expect(result.body).toContain(
      '<a id="api_update__internal_details"></a>\n\nUntitled implementation note.',
    );
    expect(result.body).not.toContain(
      '### 详情\n\nUntitled implementation note.',
    );
    await expect(compileGeneratedMdx(result.body)).resolves.toContain(
      'Detailed guidance.',
    );
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

  it('renders TypeDoc parameters as structured MDX fields', async () => {
    const result = await convertHtmlToMdx({
      html: `<article><h1>HandUpStore</h1>
        <ul class="tsd-descriptions"><li class="tsd-description"><p>同意学生上讲台。</p>
          <h4 class="tsd-parameters-title">Parameters</h4>
          <ul class="tsd-parameters">
            <li><h5>state: <span class="tsd-signature-type">0</span><span class="tsd-signature-symbol"> | </span><span class="tsd-signature-type">1</span></h5><div class="tsd-comment tsd-typography"><p>是否允许举手，0 不允许，1 允许。</p></div></li>
            <li><h5><span class="tsd-flag ts-flagOptional">Optional</span> source: <a href="../enums/podium-source.html" class="tsd-signature-type">PodiumSource</a></h5><div class="tsd-comment tsd-typography"><p>邀请来源：</p><ul><li>老师邀请</li><li>学生举手</li></ul></div></li>
          </ul>
        </li></ul>
        <h4 class="tsd-type-parameters-title">Type parameters</h4>
        <ul class="tsd-type-parameters"><li><h4>T</h4></li></ul>
      </article>`,
      sourceUrl:
        'https://doc.shengwang.cn/api-ref/flexible-classroom/electron/classes/hand-up-store.html',
      sourcePath:
        'html-docs/flexible-classroom/Electron/classes/hand-up-store.html',
      routeMap: new Map([
        [
          'https://doc.shengwang.cn/api-ref/flexible-classroom/electron/enums/podium-source.html',
          '/zh-CN/api-reference/flexible-classroom/electron/api-reference/edu-store/enums/podium-source',
        ],
      ]),
    });

    expect(result.body).toContain('<ParameterList title="Parameters">');
    expect(result.body).toContain(
      '<Parameter name="state" type="0 | 1" required>',
    );
    expect(result.body).toContain('<Parameter name="source" optional>');
    expect(result.body).toContain(
      '[PodiumSource](/zh-CN/api-reference/flexible-classroom/electron/api-reference/edu-store/enums/podium-source)',
    );
    expect(result.body).toContain('- 老师邀请\n- 学生举手');
    expect(result.body).toContain('同意学生上讲台。');
    expect(result.body).not.toContain('- 同意学生上讲台。');
    expect(result.body).toContain(
      '<ParameterList title="Type parameters">\n<Parameter name="T" />\n</ParameterList>',
    );
    expect(result.body).not.toContain('\nParameters\n\n- state:');
    expect(result.structuredParameters.typedoc).toEqual({
      fields: 3,
      lists: 2,
    });
    await expect(compileGeneratedMdx(result.body)).resolves.toContain(
      'ParameterList',
    );
  });

  it('omits TypeDoc hierarchy and index chrome that the old rendered page hides', async () => {
    const result = await convertHtmlToMdx({
      html: `<div class="col-content">
        <section class="tsd-panel tsd-comment"><div class="lead"><p>Store description.</p></div></section>
        <section class="tsd-panel tsd-hierarchy"><h3>Hierarchy</h3><ul><li>BaseStore</li></ul></section>
        <section class="tsd-panel-group tsd-index-group"><h2>Index</h2><section class="tsd-panel tsd-index-panel"><h3>Methods</h3><ul><li><a href="#run">run</a></li></ul></section></section>
        <section class="tsd-panel-group tsd-member-group"><h2>Methods</h2><section class="tsd-panel tsd-member"><a id="run"></a><h3>run</h3><ul class="tsd-signatures"><li class="tsd-signature">run(): void</li></ul><ul class="tsd-descriptions"><li class="tsd-description"><p>Runs the store.</p><h4 class="tsd-returns-title">Returns <span class="tsd-signature-type">void</span></h4></li></ul></section></section>
      </div>`,
      sourceUrl:
        'https://doc.shengwang.cn/api-ref/flexible-classroom/electron/classes/store.html',
      sourcePath: 'html-docs/flexible-classroom/Electron/classes/store.html',
      rootSelector: '.col-content',
      conversionProfile: EDU_STORE_TYPEDOC_CONVERSION_PROFILE,
    });

    expect(result.description).toBe('Store description.');
    expect(result.body).not.toContain('### Hierarchy');
    expect(result.body).not.toContain('## Index');
    expect(result.body).not.toContain('[run](#run)');
    expect(result.body.match(/^## Methods$/gm)).toHaveLength(1);
    expect(result.body).toContain('### run');
    expect(result.body).toContain('Runs the store.');
    expect(result.body).toContain('<ApiReturnType>\n\nvoid');
  });

  it('keeps rich TypeDoc object types out of remark directive syntax', async () => {
    const result = await convertHtmlToMdx({
      html: `<div class="col-content"><section class="tsd-panel-group tsd-member-group"><h2>Methods</h2><section class="tsd-panel tsd-member"><h3>addGroup</h3><ul class="tsd-descriptions"><li class="tsd-description"><h4 class="tsd-parameters-title">Parameters</h4><ul class="tsd-parameters"><li><h5>data: <span class="tsd-signature-symbol">{ </span>groups<span class="tsd-signature-symbol">: </span><a href="../modules/group.html" class="tsd-signature-type">Group</a><span class="tsd-signature-symbol">[]; </span>inProgress<span class="tsd-signature-symbol">: </span><span class="tsd-signature-type">boolean</span><span class="tsd-signature-symbol"> }</span></h5></li></ul></li></ul></section></section></div>`,
      sourceUrl:
        'https://doc.shengwang.cn/api-ref/flexible-classroom/electron/classes/api-service.html',
      sourcePath:
        'html-docs/flexible-classroom/Electron/classes/api-service.html',
      rootSelector: '.col-content',
      conversionProfile: EDU_STORE_TYPEDOC_CONVERSION_PROFILE,
      routeMap: new Map([
        [
          'https://doc.shengwang.cn/api-ref/flexible-classroom/electron/modules/group.html',
          '/zh-CN/api-reference/flexible-classroom/electron/api-reference/edu-store/modules/group',
        ],
      ]),
    });

    expect(result.body).toContain(
      '\\{ groups: [Group](/zh-CN/api-reference/flexible-classroom/electron/api-reference/edu-store/modules/group)[]; inProgress: boolean \\}',
    );
    expect(result.body).not.toContain('inProgress:boolean');
    const compiled = await compileGeneratedMdx(result.body);
    expect(compiled).not.toContain('<_components.div />');
  });

  it('keeps the first TypeDoc member description when no page summary exists', async () => {
    const result = await convertHtmlToMdx({
      html: `<div class="col-content">
        <section class="tsd-panel tsd-hierarchy"><h3>Hierarchy</h3></section>
        <section class="tsd-panel-group tsd-index-group"><h2>Index</h2></section>
        <section class="tsd-panel-group tsd-member-group"><h2>Methods</h2><section class="tsd-panel tsd-member"><a id="acceptGroupInvite"></a><h3>acceptGroupInvite</h3><ul class="tsd-signatures"><li>acceptGroupInvite(): void</li></ul><ul class="tsd-descriptions"><li class="tsd-description"><div class="tsd-comment tsd-typography"><div class="lead"><p>接受分组邀请</p></div></div><h4 class="tsd-returns-title">Returns <span class="tsd-signature-type">void</span></h4></li></ul></section></section>
      </div>`,
      sourceUrl:
        'https://doc.shengwang.cn/api-ref/flexible-classroom/electron/classes/api-service.html',
      sourcePath:
        'html-docs/flexible-classroom/Electron/classes/api-service.html',
      rootSelector: '.col-content',
      conversionProfile: EDU_STORE_TYPEDOC_CONVERSION_PROFILE,
    });

    expect(result.description).toBe('');
    expect(result.body).toContain('接受分组邀请');
    expect(result.body).not.toContain('### Hierarchy');
    expect(result.body).not.toContain('## Index');
  });

  it('does not apply the Edu Store TypeDoc body profile to other TypeDoc pages', async () => {
    const result = await convertHtmlToMdx({
      html: `<div class="col-content">
        <section class="tsd-panel tsd-hierarchy"><h3>Hierarchy</h3><p>Base</p></section>
        <section class="tsd-panel-group tsd-index-group"><h2>Index</h2><p>Member index</p></section>
      </div>`,
      sourceUrl: 'https://doc.shengwang.cn/api-ref/rtc/web/classes/client.html',
      sourcePath: 'html-docs/rtc/Web/classes/client.html',
      rootSelector: '.col-content',
    });

    expect(result.body).toContain('### Hierarchy');
    expect(result.body).toContain('## Index');
  });

  it('renders TypeDoc signatures and returns as structured API member blocks', async () => {
    const result = await convertHtmlToMdx({
      html: `<article><h1>HandUpStore</h1>
        <h3>on<wbr/>Podium</h3>
        <ul class="tsd-signatures tsd-kind-method tsd-parent-kind-class">
          <li class="tsd-signature tsd-kind-icon">on<wbr/>Podium<span class="tsd-signature-symbol">(</span>userUuid<span class="tsd-signature-symbol">: </span><span class="tsd-signature-type">string</span>, source<span class="tsd-signature-symbol">?: </span><a href="../enums/podium-source.html" class="tsd-signature-type">PodiumSource</a><span class="tsd-signature-symbol">)</span><span class="tsd-signature-symbol">: </span><span class="tsd-signature-type">Promise</span><span class="tsd-signature-symbol">&lt;</span><span class="tsd-signature-type">void</span><span class="tsd-signature-symbol">&gt;</span></li>
        </ul>
        <ul class="tsd-descriptions"><li class="tsd-description">
          <p>同意学生上讲台。</p>
          <h4 class="tsd-returns-title">Returns <a href="../interfaces/podium-result.html" class="tsd-signature-type">PodiumResult</a></h4>
          <p>上台操作完成后的结果。</p>
        </li></ul>
      </article>`,
      sourceUrl:
        'https://doc.shengwang.cn/api-ref/flexible-classroom/electron/classes/hand-up-store.html',
      sourcePath:
        'html-docs/flexible-classroom/Electron/classes/hand-up-store.html',
      routeMap: new Map([
        [
          'https://doc.shengwang.cn/api-ref/flexible-classroom/electron/enums/podium-source.html',
          '/zh-CN/api-reference/flexible-classroom/electron/api-reference/edu-store/enums/podium-source',
        ],
        [
          'https://doc.shengwang.cn/api-ref/flexible-classroom/electron/interfaces/podium-result.html',
          '/zh-CN/api-reference/flexible-classroom/electron/api-reference/edu-store/interfaces/podium-result',
        ],
      ]),
    });

    expect(result.body).toContain('<ApiSignature>');
    expect(result.body).toContain(
      'onPodium(userUuid: string, source?: [PodiumSource](/zh-CN/api-reference/flexible-classroom/electron/api-reference/edu-store/enums/podium-source)): Promise&lt;void&gt;',
    );
    expect(result.body).toContain('<ApiReturns>');
    expect(result.body).toContain(
      '[PodiumResult](/zh-CN/api-reference/flexible-classroom/electron/api-reference/edu-store/interfaces/podium-result)',
    );
    expect(result.body).toContain(
      '<ApiReturnType>\n\n[PodiumResult](/zh-CN/api-reference/flexible-classroom/electron/api-reference/edu-store/interfaces/podium-result)\n\n</ApiReturnType>\n\n上台操作完成后的结果。',
    );
    expect(result.body).not.toContain('- onPodium');
    expect(result.body).not.toContain('Returns [PodiumResult]');
    expect(result.structuredApiMembers.typedoc).toEqual({
      returns: 1,
      signatures: 1,
    });
    await expect(compileGeneratedMdx(result.body)).resolves.toContain(
      'ApiSignature',
    );
  });

  it('renders Oxygen parameter definition lists as structured MDX fields', async () => {
    const result = await convertHtmlToMdx({
      html: `<article><h1>Channel relay</h1><section id="set-destination__parameters"><h2>参数</h2>
        <dl class="dl parml"><dt class="dt pt dlterm">channelName</dt><dd class="dd pd">目标频道名称。</dd><dt class="dt pt dlterm">destInfo</dt><dd class="dd pd"><p>目标频道信息，包括：</p><ul><li>频道名称</li><li>用户 ID</li></ul></dd><dd class="dd pd ddexpand">最多配置四个目标频道。</dd><dt class="dt pt dlterm"><span></span></dt><dd class="dd pd">源文档未提供该成员名称。</dd></dl>
      </section></article>`,
      sourceUrl:
        'https://doc.shengwang.cn/api-ref/rtc/android/API/set-destination',
      sourcePath: 'html-docs/rtc/Android/API/set-destination.html',
    });

    expect(result.body).toContain('## 参数');
    expect(result.body).toContain('<ParameterList>');
    expect(result.body).toContain(
      '<a id="channelname"></a>\n<Parameter name="channelName">',
    );
    expect(result.body).toContain(
      '<a id="destinfo"></a>\n<Parameter name="destInfo">',
    );
    expect(result.body).toContain('- 频道名称\n- 用户 ID');
    expect(result.body).toContain('最多配置四个目标频道。');
    expect(result.body).toContain('源文档未提供该成员名称。');
    expect(result.body).not.toContain('### channelName');
    expect(result.structuredParameters.oxygen).toEqual({ fields: 2, lists: 1 });
    await expect(compileGeneratedMdx(result.body)).resolves.toContain(
      'ParameterList',
    );
  });

  it('keeps unique Oxygen parameter anchors from the former heading output', async () => {
    const result = await convertHtmlToMdx({
      html: `<article><h1>DRM</h1>
        <section><dl class="dl parml"><dt>songCode</dt><dd>第一个方法的音乐资源 ID。</dd></dl></section>
        <section><dl class="dl parml"><dt>songCode</dt><dd>第二个方法的音乐资源 ID。</dd></dl></section>
      </article>`,
      sourceUrl: 'https://doc.shengwang.cn/api-ref/rtc/ios/API/toc_drm',
      sourcePath: 'html-docs/rtc/iOS/API/toc_drm.html',
    });

    expect(result.body).toContain(
      '<a id="songcode"></a>\n<Parameter name="songCode">',
    );
    expect(result.body).toContain(
      '<a id="songcode-1"></a>\n<Parameter name="songCode">',
    );
  });

  it('preserves TypeDoc callback signature containers around nested parameters', async () => {
    const result = await convertHtmlToMdx({
      html: `<article><h1>Client</h1><ul class="tsd-parameters"><li class="tsd-parameter-siganture">
        <ul class="tsd-signatures"><li class="tsd-signature">(event: object): void</li></ul>
        <ul class="tsd-descriptions"><li class="tsd-description"><h4 class="tsd-parameters-title">Parameters</h4><ul class="tsd-parameters"><li><h5>event: <span class="tsd-signature-type">object</span></h5><p>事件对象。</p></li></ul><h4 class="tsd-returns-title">Returns <span class="tsd-signature-type">void</span></h4></li></ul>
      </li></ul></article>`,
      sourceUrl:
        'https://doc.shengwang.cn/api-ref/rtc/javascript/interfaces/client',
      sourcePath: 'html-docs/rtc/Web/interfaces/client.html',
    });

    expect(result.body).toContain('(event: object): void');
    expect(result.body).toContain('<ParameterList title="Parameters">');
    expect(result.body).toContain(
      '<Parameter name="event" type="object" required>',
    );
    expect(result.body).toContain('<ApiSignature>');
    expect(result.body).toContain('<ApiReturns>');
    expect(result.body).toContain('<ApiReturnType>\n\nvoid');
    expect(result.body).not.toContain('- <ApiSignature>');
    expect(result.structuredParameters.typedoc).toEqual({
      fields: 1,
      lists: 1,
    });
    await expect(compileGeneratedMdx(result.body)).resolves.toContain(
      'ParameterList',
    );
  });

  it('normalizes source indentation inside TypeDoc list item text', async () => {
    const result = await convertHtmlToMdx({
      html: `<article><h1>Room</h1><ul class="tsd-descriptions"><li class="tsd-description"><p>删除场景。</p><ol><li>切换至
\t\t\t\t<code>dirB</code> 中的第一个场景。</li><li>继续
\t\t\t\t向上递归。</li></ol></li></ul></article>`,
      sourceUrl:
        'https://doc.shengwang.cn/api-ref/whiteboard/web/interfaces/room',
      sourcePath: 'html-docs/whiteboard/Web/interfaces/room.html',
    });

    expect(result.body).toContain(
      '1. 切换至\n   `dirB` 中的第一个场景。\n2. 继续\n   向上递归。',
    );
    expect(result.body).not.toContain('\t');
  });

  it('renders Doxygen parameter tables as structured MDX fields', async () => {
    const result = await convertHtmlToMdx({
      html: `<article><h1>Recording engine</h1><div class="memdoc"><dl class="params"><dt>参数</dt><dd><table class="params"><tr><td class="paramname">appId</td><td>项目的 App ID。</td></tr><tr><td class="paramname">eventHandler</td><td><p>事件回调。</p></td></tr></table></dd></dl></div></article>`,
      sourceUrl:
        'https://doc.shengwang.cn/api-ref/recording/cpp/recording-engine',
      sourcePath: 'html-docs/recording/cpp/recording-engine.html',
    });

    expect(result.body).toContain('<ParameterList title="参数">');
    expect(result.body).toContain('<Parameter name="appId">');
    expect(result.body).toContain('<Parameter name="eventHandler">');
    expect(result.body).not.toContain('| appId |');
    expect(result.structuredParameters.doxygen).toEqual({
      fields: 2,
      lists: 1,
    });
    await expect(compileGeneratedMdx(result.body)).resolves.toContain(
      'ParameterList',
    );
  });

  it('renders Appledoc argument tables as structured MDX fields', async () => {
    const result = await convertHtmlToMdx({
      html: `<article><h1>WhiteSlideDelegate</h1><div class="method-subsection arguments-section parameters"><h4 class="method-subtitle parameter-title">Parameters</h4><table class="argument-def parameter-def"><tr><th scope="row" class="argument-name"><code>url</code></th><td><p>原始 PPT 资源地址。</p></td></tr><tr><th scope="row" class="argument-name"><code>completionHandler</code></th><td><p>替换完成后的回调。</p></td></tr></table></div></article>`,
      sourceUrl:
        'https://doc.shengwang.cn/api-ref/whiteboard/ios/Protocols/WhiteSlideDelegate',
      sourcePath: 'html-docs/whiteboard/iOS/Protocols/WhiteSlideDelegate.html',
    });

    expect(result.body).toContain('<ParameterList title="Parameters">');
    expect(result.body).toContain('<Parameter name="url">');
    expect(result.body).toContain('<Parameter name="completionHandler">');
    expect(result.body).not.toContain('| `url` |');
    expect(result.structuredParameters.appledoc).toEqual({
      fields: 2,
      lists: 1,
    });
    await expect(compileGeneratedMdx(result.body)).resolves.toContain(
      'ParameterList',
    );
  });

  it('renders Doxygen member prototypes as linked API signatures', async () => {
    const result = await convertHtmlToMdx({
      html: `<article><h1>RTSA</h1><div class="memitem"><div class="memproto"><table class="mlabels"><tr><td class="mlabels-left"><table class="memname">
        <tr><td class="memname"><a href="#api">__agora_api__</a> int agora_rtc_request_video_key_frame </td><td>(</td><td class="paramtype"><a href="structconnection.html">connection_id_t</a></td><td class="paramname"><em>conn_id</em>, </td></tr>
        <tr><td class="paramkey"></td><td></td><td class="paramtype">uint32_t</td><td class="paramname"><em>remote_uid</em>, </td></tr>
        <tr><td class="paramkey"></td><td></td><td class="paramtype">int</td><td class="paramname"><em>mode</em> = <code><a href="default-mode.html">DEFAULT_MODE</a></code>&nbsp;)</td></tr>
      </table></td><td class="mlabels-right"><span class="mlabels"><span class="mlabel extern">extern</span></span></td></tr></table></div></div></article>`,
      sourceUrl: 'https://doc.shengwang.cn/api-ref/rtsa/c/agora__rtc__api_8h',
      sourcePath: 'html-docs/rtsa/c/agora__rtc__api_8h.html',
      fragmentMap: new Map([['api', 'api']]),
      routeMap: new Map([
        [
          'https://doc.shengwang.cn/api-ref/rtsa/c/agora__rtc__api_8h',
          '/zh-CN/api-reference/rtsa/c/agora-rtc-api-8h',
        ],
        [
          'https://doc.shengwang.cn/api-ref/rtsa/c/structconnection.html',
          '/zh-CN/api-reference/rtsa/c/structconnection',
        ],
        [
          'https://doc.shengwang.cn/api-ref/rtsa/c/default-mode.html',
          '/zh-CN/api-reference/rtsa/c/default-mode',
        ],
      ]),
    });

    expect(result.body).toContain('<ApiSignature labels="extern">');
    expect(result.body).toContain(
      '[__agora_api__](/zh-CN/api-reference/rtsa/c/agora-rtc-api-8h#api) int agora_rtc_request_video_key_frame([connection_id_t](/zh-CN/api-reference/rtsa/c/structconnection) *conn_id*, uint32_t *remote_uid*, int *mode* = [`DEFAULT_MODE`](/zh-CN/api-reference/rtsa/c/default-mode))',
    );
    expect(result.body).not.toContain('| __agora_api__');
    expect(result.structuredApiMembers.doxygen).toEqual({
      returns: 0,
      signatures: 1,
    });
    await expect(compileGeneratedMdx(result.body)).resolves.toContain(
      'ApiSignature',
    );
  });

  it('renders Appledoc declarations as API signatures', async () => {
    const result = await convertHtmlToMdx({
      html: `<article><h1>WhiteSlideDelegate</h1><div class="method-subsection method-declaration"><code>- (void)onSlideError:(WhiteSlideErrorType)<em>slideError</em> errorMessage:(NSString *)<em>errorMessage</em></code></div></article>`,
      sourceUrl:
        'https://doc.shengwang.cn/api-ref/whiteboard/ios/Protocols/WhiteSlideDelegate',
      sourcePath: 'html-docs/whiteboard/iOS/Protocols/WhiteSlideDelegate.html',
    });

    expect(result.body).toContain('<ApiSignature>');
    expect(result.body).toContain(
      '\\- (void)onSlideError:(WhiteSlideErrorType)*slideError* errorMessage:(NSString *)*errorMessage*',
    );
    expect(result.body).not.toContain(
      '`- (void)onSlideError:(WhiteSlideErrorType)',
    );
    expect(result.structuredApiMembers.appledoc).toEqual({
      returns: 0,
      signatures: 1,
    });
    const compiled = await compileGeneratedMdx(result.body);
    expect(compiled).toContain('ApiSignature');
    expect(compiled).not.toContain('_components.ul');
  });

  it('renders Oxygen, Doxygen, and TypeDoc since definitions as info callouts', async () => {
    const result = await convertHtmlToMdx({
      html: `<article><h1>API</h1>
        <dl class="dl since"><dt class="dt dlterm">自从</dt><dd class="dd">自 v4.6.2 版本新增。</dd></dl>
        <p>Following content.</p>
        <dl class="section since"><dt>自从</dt><dd><ul><li>v1.9.5</li></ul></dd></dl>
        <ul class="tsd-descriptions"><li class="tsd-description">
          <dl class="tsd-comment-tags">
            <dt>自从</dt><dd><p><em>4.17.1</em></p><p>TypeDoc details.</p></dd>
            <dt>deprecated</dt><dd>Use the replacement.</dd>
          </dl>
          <h4 class="tsd-returns-title">Returns <a href="/zh-CN/api-reference/rtc/electron/replacement">Replacement</a></h4>
        </li></ul>
        <ul class="tsd-descriptions"><li class="tsd-description"><p>Plain TypeDoc description.</p></li></ul>
      </article>`,
      sourceUrl:
        'https://doc.shengwang.cn/api-ref/rtc/electron/API/class_multipathstats',
      sourcePath: 'html-docs/rtc/Electron/API/class_multipathstats.html',
    });

    expect(result.body.match(/:::info\[自从\]/g)).toHaveLength(3);
    expect(result.body).toContain(':::info[自从]\n自 v4.6.2 版本新增。\n:::');
    expect(result.body).toContain(':::info[自从]\n- v1.9.5\n:::');
    expect(result.body).toContain(
      ':::info[自从]\n*4.17.1*\n\nTypeDoc details.\n:::',
    );
    expect(result.body).toContain('### deprecated\n\nUse the replacement.');
    expect(result.body).toContain(
      '<ApiReturnType>\n\n[Replacement](/zh-CN/api-reference/rtc/electron/replacement)\n\n</ApiReturnType>',
    );
    expect(result.body).not.toContain('#### Returns');
    expect(result.body).toContain('Following content.');
    expect(result.body).toContain('Plain TypeDoc description.');
    expect(result.body).not.toContain('- Plain TypeDoc description.');
    expect(result.body).not.toContain('### 自从');
    expect(result.body).not.toContain('- :::info[自从]');
  });

  it('does not infer since callouts from arbitrary definition-list text', async () => {
    const result = await convertHtmlToMdx({
      html: '<article><h1>API</h1><dl><dt>自从</dt><dd>Ordinary definition.</dd></dl></article>',
      sourceUrl: 'https://doc.shengwang.cn/doc/example',
      sourcePath: 'html-docs/example.html',
    });

    expect(result.body).toContain('### 自从\n\nOrdinary definition.');
    expect(result.body).not.toContain(':::info[自从]');
  });

  it('escapes inline prose colons that remark-directive would parse as empty directives', async () => {
    const result = await convertHtmlToMdx({
      html: `<article><h1>Release</h1><p>agora::rtc::IConfig</p><ul>
        <li><span class="xref"><span class="keyword">true</span></span>:该方法为同步调用。</li>
        <li><code>false</code>:该方法为异步调用。目前仅支持同步调用。</li>
      </ul><table><tr><th>Source</th></tr><tr><td><a href="https://github.com/example/repo#method:param">index.d.ts:42</a></td></tr></table></article>`,
      sourceUrl:
        'https://doc.shengwang.cn/api-ref/rtc/electron/API/toc_initialize',
      sourcePath: 'html-docs/rtc/Electron/API/toc_initialize.html',
    });
    const compiled = await compileGeneratedMdx(result.body);

    expect(result.body).toContain('- true\\:该方法为同步调用。');
    expect(result.body).toContain(
      '- `false`\\:该方法为异步调用。目前仅支持同步调用。',
    );
    expect(result.body).toContain('agora::rtc::IConfig');
    expect(result.body).not.toContain('agora:\\:rtc');
    expect(compiled).toContain('true:该方法为同步调用。');
    expect(compiled).toContain('该方法为异步调用。目前仅支持同步调用。');
    expect(result.body).toContain(
      '[index.d.ts\\:42](https://github.com/example/repo#method:param)',
    );
    expect(compiled).toContain(
      'href="https://github.com/example/repo#method:param"',
    );
    expect(compiled).not.toContain('<_components.div />');
  });

  it('preserves DITA related-link blocks with standalone strong labels', async () => {
    const result = await convertHtmlToMdx({
      html: `<article><h1>Sound position</h1>
        <p>Method details.</p>
        <nav role="navigation" class="related-links"><div class="linklist relinfo">
          <strong>所属接口类</strong><br>
          <ul class="linklist"><li class="linklist"><a class="link" href="rtc_interface_class.html#class_irtcengine">IRtcEngine</a></li></ul>
        </div></nav>
        <p>Following content.</p>
      </article>`,
      sourceUrl:
        'https://doc.shengwang.cn/api-ref/rtc/electron/API/toc_sound_position',
      sourcePath: 'html-docs/rtc/Electron/API/toc_sound_position.html',
      routeMap: new Map([
        [
          'https://doc.shengwang.cn/api-ref/rtc/electron/API/rtc_interface_class.html',
          '/zh-CN/api-reference/rtc/electron/rtc-interface-class',
        ],
      ]),
    });

    expect(result.body).toContain('### 所属接口类');
    expect(result.body).toContain(
      '- [IRtcEngine](/zh-CN/api-reference/rtc/electron/rtc-interface-class#class_irtcengine)',
    );
    expect(result.body).toContain('Following content.');
  });

  it('promotes other DITA related-link labels to block headings', async () => {
    const result = await convertHtmlToMdx({
      html: `<article><h1>Configuration</h1>
        <nav role="navigation" class="related-links"><div class="linklist relref">
          <strong>相关参考</strong><br>
          <ul class="linklist"><li class="linklist"><a class="link" href="method.html">setConfig</a></li></ul>
        </div></nav>
      </article>`,
      sourceUrl:
        'https://doc.shengwang.cn/api-ref/rtc/android/API/class_config',
      sourcePath: 'html-docs/rtc/Android/API/class_config.html',
      routeMap: new Map([
        [
          'https://doc.shengwang.cn/api-ref/rtc/android/API/method.html',
          '/zh-CN/api-reference/rtc/android/set-config',
        ],
      ]),
    });

    expect(result.body).toContain('### 相关参考');
    expect(result.body).toContain(
      '- [setConfig](/zh-CN/api-reference/rtc/android/set-config)',
    );
    expect(result.body).not.toContain('**相关参考**');
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

  it('keeps paragraph inline code as Markdown code inside table cells', async () => {
    const result = await convertHtmlToMdx({
      html: `<article><h1>Logger</h1>
        <p>Call <code>logger</code>.</p>
        <p>Payload: <code>{"plain": true}</code>.</p>
        <p>Constraint: <code>{ max: 30, min: 5 }</code>.</p>
        <p>Template <code>value&#96;with&#96;tick</code>.</p>
        <table><tr><th>Parameter</th><th>Description</th></tr>
          <tr><td><code>dict</code></td><td><p>例如，<code>{"funName": "joinRoom", "params": {"isWritable": 1}}</code>。</p></td></tr>
        </table>
      </article>`,
      sourceUrl:
        'https://doc.shengwang.cn/api-ref/whiteboard/ios/Protocols/WhiteCommonCallbackDelegate',
      sourcePath:
        'html-docs/whiteboard/iOS/Protocols/WhiteCommonCallbackDelegate.html',
    });

    expect(result.body).toContain('Call `logger`.');
    expect(result.body).toContain('Payload: `{"plain": true}`.');
    expect(result.body).toContain('Constraint: `{ max: 30, min: 5 }`.');
    expect(result.body).toContain('Template ``value`with`tick``.');
    expect(result.body).toContain(
      '例如，`{"funName": "joinRoom", "params": {"isWritable": 1}}`。',
    );
    expect(result.body).not.toContain('`\\\\\\{');
    expect(await compileGeneratedMdx(result.body)).toContain('funName');
  });

  it('repairs legacy paragraph code split by empty code markers', async () => {
    const result = await convertHtmlToMdx({
      html: `<article><h1>Legacy code</h1>
        <p>Use <code></code>WhiteSDK<code>.setSlideDelegate</code> now.</p>
        <p>Formula <code></code>originX<code> = - </code>width<code> / 2.0d</code>。</p>
      </article>`,
      sourceUrl: 'https://doc.shengwang.cn/api-ref/whiteboard/ios/legacy-code',
      sourcePath: 'html-docs/whiteboard/iOS/legacy-code.html',
    });

    expect(result.body).toContain('Use `WhiteSDK.setSlideDelegate` now.');
    expect(result.body).toContain('Formula `originX = - width / 2.0d`。');
    expect(await compileGeneratedMdx(result.body)).toContain(
      'WhiteSDK.setSlideDelegate',
    );
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

  it('renders multiline Appledoc definitions as fenced code blocks', async () => {
    const result = await convertHtmlToMdx({
      html: `<main role="main"><h1 class="title">WhiteAnimationMode</h1>
        <div class="section">
          <h4 class="method-subtitle">Definition</h4>
          <code>typedef NS_ENUM(NSInteger, WhiteAnimationMode ) {<br>
            &nbsp;&nbsp; <a href="">WhiteAnimationModeContinuous</a>,<br>
            &nbsp;&nbsp; WhiteAnimationModeImmediately,<br>
          };</code>
        </div>
      </main>`,
      sourceUrl:
        'https://doc.shengwang.cn/api-ref/whiteboard/ios/Constants/WhiteAnimationMode',
      sourcePath: 'html-docs/whiteboard/iOS/Constants/WhiteAnimationMode.html',
      rootSelector: 'main[role="main"]',
      titleSelector: 'main[role="main"] > h1.title',
    });

    await expect(compileGeneratedMdx(result.body)).resolves.toContain(
      'WhiteAnimationModeContinuous',
    );
    expect(result.body).toContain(
      '```text\ntypedef NS_ENUM(NSInteger, WhiteAnimationMode ) {\n  WhiteAnimationModeContinuous,\n  WhiteAnimationModeImmediately,\n};\n```',
    );
    expect(result.body).not.toMatch(/^`typedef NS_ENUM/m);
  });

  it('removes generic self-links from headings while keeping their text', async () => {
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

  it('keeps Doxygen member titles and definition labels out of the page TOC', async () => {
    const result = await convertHtmlToMdx({
      html: `<div class="contents">
        <div class="textblock"><code>#include &lt;member.h&gt;</code></div>
        <p><a href="member_8h_source.html">浏览该文件的源代码.</a></p>
        <table class="memberdecls"><tr><td>Generated member summary</td></tr></table>
        <a id="details"></a><h2 id="header-details" class="groupheader">详细描述</h2>
        <div class="textblock"><p>Page details.</p></div>
        <h2 class="groupheader">枚举类型说明</h2>
        <h2 class="groupheader">函数说明</h2>
        <a id="member"></a>
        <h2 class="memtitle"><span class="permalink"><a href="#member">◆&nbsp;</a></span>agora_member()</h2>
        <div class="memitem"><div class="memdoc">
          <p>Member details.</p>
          <dl class="params"><dt>参数</dt><dd><p>Parameter details.</p></dd></dl>
          <dl class="section return"><dt>返回</dt><dd><p>Return details.</p></dd></dl>
          <dl class="section note"><dt>注解</dt><dd><p>Note details.</p></dd></dl>
          <dl class="deprecated"><dt><b><a href="deprecated.html">弃用</a></b></dt><dd>Deprecated details.</dd></dl>
        </div></div>
      </div>`,
      sourceUrl: 'https://doc.shengwang.cn/api-ref/rtsa/c/member',
      sourcePath: 'html-docs/rtsa/c/member.html',
      rootSelector: '.contents',
    });

    expect(result.body).not.toContain('#include');
    expect(result.body).not.toContain('Generated member summary');
    expect(result.body).not.toContain('浏览该文件的源代码');
    expect(result.body).not.toContain('## 详细描述');
    expect(result.body).not.toContain('## 枚举类型说明');
    expect(result.body).toContain('Page details.');
    expect(result.body).toContain('## 函数说明');
    expect(result.body).toContain('<a id="member"></a>');
    expect(result.body).toContain('### agora_member()');
    expect(result.body).toContain(
      '<h4 data-toc-hidden="true" id={"参数"}>参数</h4>',
    );
    expect(result.body).toContain(
      '<h4 data-toc-hidden="true" id={"返回值"}>返回值</h4>',
    );
    expect(result.body).toContain(':::info[注解]');
    expect(result.body).toContain('**弃用**');
    expect(result.body).not.toContain('### **弃用**');
    expect(result.body).not.toContain('◆');
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
