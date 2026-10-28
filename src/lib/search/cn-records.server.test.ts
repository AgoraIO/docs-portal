import { describe, expect, it, vi } from 'vitest';
import {
  exportPublishedCnRecords,
  extractPublishedCnSections,
} from './cn-records.server';

const url = '/zh-CN/api-reference/rtc/web/4.6.0/api';
const route = { url, canonicalPath: url, markdownPath: `${url}.md` };
const page = { url, title: 'RTC API', objectType: 'docs' as const };
describe('published CN index export', () => {
  it('leaves table-fence syntax inside a longer fenced example unchanged', () => {
    const example =
      '| ```json\n{"new": true}\n``` | ```json\n{"old": true}\n``` |';
    const records = extractPublishedCnSections(
      route,
      page,
      `# RTC API\n\n\`\`\`\`md\n${example}\n\`\`\`\`\n\n<CalloutContainer type="info">\n  <CalloutDescription>\n    说明。\n  </CalloutDescription>\n</CalloutContainer>`,
    );
    expect(records[0].content).toContain(example);
    expect(records[0].content).toContain('说明。');
  });

  it('preserves all text after an incomplete serialized container', () => {
    const [record] = extractPublishedCnSections(
      route,
      page,
      '# RTC API\n\n<CalloutContainer type="info">\n  <CalloutDescription>\n    必须保留这段配置说明。',
    );
    expect(record.content).toContain('必须保留这段配置说明。');
  });
  it('preserves table-cell examples and clears later callouts after serialized table fences', () => {
    const markdown =
      '# RTC API\n\n## 配置 [#config]\n\n| 新 | 旧 |\n| --- | --- |\n| ```json\n{"new": true}\n``` | ```json\n{"old": true}\n``` |\n\n<CalloutContainer type="warning">\n  <CalloutDescription>\n    保持配置一致。\n  </CalloutDescription>\n</CalloutContainer>\n\n## 后续步骤 [#next]\n\n重新连接。';
    const records = extractPublishedCnSections(route, page, markdown);
    expect(records.map((record) => record.url)).toEqual([
      `${url}#config`,
      `${url}#next`,
    ]);
    expect(records[0].content).toContain('{"new": true}');
    expect(records[0].content).toContain('{"old": true}');
    expect(records[0].content).toContain('保持配置一致。');
    expect(records[0].content).not.toContain('Callout');
    expect(records[1].content).toContain('重新连接。');
  });

  it('keeps a renderer-looking example inside a platform-indented fence literal', () => {
    const markdown =
      '# RTC API\n\n    ## 示例 [#sample]\n\n    ```text\n    <CalloutContainer type="info">\n      <CalloutDescription>literal</CalloutDescription>\n    </CalloutContainer>\n    ```';
    const [record] = extractPublishedCnSections(
      { ...route, platform: 'android' },
      page,
      markdown,
    );
    expect(record.content).toContain('<CalloutContainer type="info">');
    expect(record.content).toContain(
      '<CalloutDescription>literal</CalloutDescription>',
    );
  });
  it('normalizes a code-tab container even when an earlier table is not valid MDX', () => {
    const markdown =
      '# RTC API\n\n| 参数 | 说明 |\n| --- | --- |\n| channel | 频道说明。<CalloutContainer type="info">\n  <CalloutDescription>\n    长度限制。\n  </CalloutDescription>\n</CalloutContainer> |\n\n## 用法 [#usage]\n\n<CodeBlockTabs defaultValue="cURL">\n  <CodeBlockTab value="cURL">\n    ```shell tabGroup="language"\n    run();\n    ```\n  </CodeBlockTab>\n</CodeBlockTabs>';
    const records = extractPublishedCnSections(route, page, markdown);
    expect(records.map((record) => record.url)).toEqual([url, `${url}#usage`]);
    const content = records.map((record) => record.content).join('\n');
    expect(content).toContain('长度限制。');
    expect(content).toContain('run();');
    expect(content).not.toContain('CodeBlockTab');
    expect(content).not.toContain('tabGroup=');
    expect(content).not.toContain('CalloutDescription');
  });

  it('preserves literal renderer tags in a fenced example without a language', () => {
    const markdown =
      '# RTC API\n\n示例：\n\n```\n<CalloutContainer type="info">\n  <CalloutDescription>literal</CalloutDescription>\n</CalloutContainer>\n```\n\n正文中的 `<CalloutContainer>` 是名称。';
    const [record] = extractPublishedCnSections(route, page, markdown);
    expect(record.content).toContain('<CalloutContainer type="info">');
    expect(record.content).toContain(
      '<CalloutDescription>literal</CalloutDescription>',
    );
    expect(record.content).toContain('正文中的 <CalloutContainer> 是名称。');
  });

  it('normalizes code tabs nested in a list without losing surrounding instructions', () => {
    const markdown =
      '# RTC API\n\n- 安装依赖\n\n  <CodeBlockTabs defaultValue="npm">\n    <CodeBlockTabsList>\n      <CodeBlockTabsTrigger value="npm">\n        npm\n      </CodeBlockTabsTrigger>\n    </CodeBlockTabsList>\n\n    <CodeBlockTab value="npm">\n      ```bash tabGroup="install"\n      npm install agora-rtc-sdk-ng\n      ```\n    </CodeBlockTab>\n  </CodeBlockTabs>\n\n  配置后运行。\n\n- 再次构建';
    const records = extractPublishedCnSections(route, page, markdown);
    expect(records).toHaveLength(1);
    expect(records[0].content).toContain('安装依赖');
    expect(records[0].content).toContain('npm install agora-rtc-sdk-ng');
    expect(records[0].content).toContain('配置后运行。');
    expect(records[0].content).toContain('再次构建');
    expect(records[0].content).not.toContain('CodeBlockTab');
    expect(records[0].content).not.toContain('tabGroup=');
  });
  it('extracts serialized code tabs and callouts without indexing renderer metadata', () => {
    const markdown = [
      '# RTC API',
      '',
      '    ## 示例标题 [#not-a-section]',
      '    keepIndentedExample();',
      '',
      '<CodeBlockTabs defaultValue="C++">',
      '  <CodeBlockTabsList>',
      '    <CodeBlockTabsTrigger value="C++">',
      '      C++',
      '    </CodeBlockTabsTrigger>',
      '',
      '    <CodeBlockTabsTrigger value="Python3">',
      '      Python3',
      '    </CodeBlockTabsTrigger>',
      '  </CodeBlockTabsList>',
      '',
      '  <CodeBlockTab value="C++">',
      '    ```cpp tabGroup="token-sample-code"',
      '    #include <cstdlib>',
      '    const char* tabGroup = "app";',
      '    const char* example = "<CalloutTitle>value</CalloutTitle>";',
      '    ```',
      '  </CodeBlockTab>',
      '',
      '  <CodeBlockTab value="Python3">',
      '    ```python tabGroup="token-sample-code"',
      '    print("Token")',
      '    ```',
      '  </CodeBlockTab>',
      '</CodeBlockTabs>',
      '',
      '<CalloutContainer type="warning">',
      '  <CalloutTitle>',
      '    注意',
      '  </CalloutTitle>',
      '',
      '  <CalloutDescription>',
      '    在服务端生成 Token。',
      '  </CalloutDescription>',
      '</CalloutContainer>',
    ].join('\n');
    const records = extractPublishedCnSections(route, page, markdown);
    expect(records).toHaveLength(1);
    const [record] = records;
    expect(record.content).toContain('keepIndentedExample();');
    expect(record.content).toContain('#include <cstdlib>');
    expect(record.content).toContain('const char* tabGroup = "app";');
    expect(record.content).toContain('"<CalloutTitle>value</CalloutTitle>"');
    expect(record.content).toContain('print("Token")');
    expect(record.content).toContain('在服务端生成 Token。');
    expect(record.content).not.toContain('CodeBlockTabs');
    expect(record.content).not.toContain('CalloutContainer');
    expect(record.content).not.toContain('tabGroup=');
  });
  it('indexes rendered subheadings inside a non-platform release-note accordion', async () => {
    const url = '/zh-CN/ai/release-notes';
    const records = await exportPublishedCnRecords({
      routes: [{ url, canonicalPath: url, markdownPath: `${url}.md` }],
      pages: [{ url, title: '发版说明', objectType: 'docs' }],
      readMarkdown: async () =>
        '# 发版说明\n\n<Accordions type="multiple">\n\n### v2.13 [#v213]\n\n<Accordion title="v2.13" id="v213" headingLevel="2" value="v213">\n    该版本于 2026 年 9 月 18 日发布。\n\n    ### 改进 [#改进]\n\n    支持多轮对话上下文。\n\n    ### API 变更 [#api-变更]\n\n    新增接口参数。\n  </Accordion>\n</Accordions>',
      readRenderedHtml: async () =>
        '<article><h2 id="v213">v2.13</h2><h3 id="改进">改进</h3><p>支持多轮对话上下文。</p><h3 id="api-变更">API 变更</h3><p>新增接口参数。</p></article>',
    });
    expect(records.map((record) => record.url)).toEqual([
      '/ai/release-notes#v213',
      '/ai/release-notes#改进',
      '/ai/release-notes#api-变更',
    ]);
    expect(records[0].content).toContain('2026 年 9 月 18 日');
    expect(records[1].content).toContain('支持多轮对话上下文。');
    expect(records[2].content).toContain('新增接口参数。');
  });

  it('keeps fenced examples inside a verified accordion body out of the section index', async () => {
    const records = await exportPublishedCnRecords({
      routes: [route],
      pages: [page],
      readMarkdown: async () =>
        '# RTC API\n\n## 版本 [#version]\n\n    ### 改进 [#improved]\n\n    优化连接。\n\n    ```md\n    ## 示例标题 [#not-a-section]\n    ```\n\n    ### 修复 [#fixed]\n\n    修复音频。',
      readRenderedHtml: async () =>
        '<h2 id="version">版本</h2><h3 id="improved">改进</h3><pre><code>## 示例标题 [#not-a-section]</code></pre><h3 id="fixed">修复</h3>',
    });
    expect(records.map((record) => record.url)).toEqual([
      `${url.replace('/zh-CN', '')}#version`,
      `${url.replace('/zh-CN', '')}#improved`,
      `${url.replace('/zh-CN', '')}#fixed`,
    ]);
    expect(records[1].content).toContain('示例标题 [#not-a-section]');
  });

  it('indexes the first heading immediately after an Accordion opening tag', async () => {
    const records = await exportPublishedCnRecords({
      routes: [route],
      pages: [page],
      readMarkdown: async () =>
        '# RTC API\n\n### v4.6 [#v46]\n\n<Accordion title="v4.6" id="v46" headingLevel="2">\n    ### 升级必看 [#upgrade]\n\n    更新调用方式。\n  </Accordion>',
      readRenderedHtml: async () =>
        '<h2 id="v46">v4.6</h2><h3 id="upgrade">升级必看</h3><p>更新调用方式。</p>',
    });
    expect(records.map((record) => record.url)).toEqual([
      `${url.replace('/zh-CN', '')}#v46`,
      `${url.replace('/zh-CN', '')}#upgrade`,
    ]);
    expect(records[1].content).toContain('更新调用方式。');
  });

  it('does not promote indented examples just because a non-heading element has the same ID', async () => {
    const records = await exportPublishedCnRecords({
      routes: [route],
      pages: [page],
      readMarkdown: async () =>
        '# RTC API\n\n    ## 示例 [#sample]\n    code();',
      readRenderedHtml: async () =>
        '<span id="sample"></span><pre><code>## 示例 [#sample]\ncode();</code></pre>',
    });
    expect(records.map((record) => record.url)).toEqual([
      url.replace('/zh-CN', ''),
    ]);
    expect(records[0].content).toContain('code();');
  });

  it('keeps recording and transcoding FAQ memberships under the navigation product IDs', () => {
    const url = '/zh-CN/reference/faq/integration/ncs_vs_query';
    const records = extractPublishedCnSections(
      { url, canonicalPath: url, markdownPath: `${url}.md` },
      { url, title: '状态监视', objectType: 'docs' },
      '# 状态监视\n\n使用 query 或消息通知。',
    );
    expect(records[0].products).toEqual(['cloud-recording', 'transcoding']);
  });
  it.each([
    ['/zh-CN/ai/device-kit/build/run-r1-demo', 'docs', 'device-kit'],
    ['/zh-CN/ai/get-started/quick-start', 'docs', 'conversational-ai'],
    ['/zh-CN/realtime-media/transcoding', 'docs', 'transcoding'],
    [
      '/zh-CN/api-reference/api-ref/cloud-transcoding/acquire',
      'openapi',
      'transcoding',
    ],
    ['/zh-CN/api-reference/api-ref/signaling/receive', 'docs', 'rtm'],
    ['/zh-CN/realtime-media/cloud-recording', 'docs', 'cloud-recording'],
  ] as const)(
    'exports a consistent product for %s',
    (url, objectType, product) => {
      const records = extractPublishedCnSections(
        { url, canonicalPath: url, markdownPath: `${url}.md` },
        { url, title: '产品说明', objectType },
        '# 产品说明\n\n正文内容。',
      );
      expect(records[0]).toMatchObject({ product, products: [product] });
    },
  );
  it.each(['c++', 'objective-c', ''])(
    'keeps following headings after table-cell fences with language %s',
    (language) => {
      const markdown = `# RTC API\n\n    ## 版本 [#version]\n\n    | 新 | 旧 |\n    | --- | --- |\n    | \`\`\`${language}\n    newDependency();\n    \`\`\` | \`\`\`${language}\n    oldDependency();\n    \`\`\` |\n\n    ### 改进 [#improved]\n\n    优化连接。`;
      const records = extractPublishedCnSections(
        { ...route, platform: 'android' },
        page,
        markdown,
      );
      expect(records.map((record) => record.url)).toEqual([
        `${url}#version`,
        `${url}#improved`,
      ]);
      expect(records[0].content).toContain('newDependency();');
      expect(records[0].content).toContain('oldDependency();');
    },
  );
  it('merges records whose corrected anchors resolve to the same rendered chapter', async () => {
    const records = await exportPublishedCnRecords({
      routes: [route],
      pages: [page],
      readMarkdown: async () =>
        '# RTC API\n\n## 同一章节 [#outdated]\n\n前半内容。\n\n## 同一章节 [#current]\n\n后半内容。',
      readRenderedHtml: async () =>
        '<article><h2 id="current">同一章节</h2></article>',
    });
    expect(records).toHaveLength(1);
    expect(records[0].id).toBe(`${url}::heading:current`);
    expect(records[0].content).toContain('前半内容。');
    expect(records[0].content).toContain('后半内容。');
  });
  it('splits renderer-annotated headings inside an indented platform block without splitting fenced examples', () => {
    const markdown =
      '# RTC API\n\n简介。\n\n    平台说明。\n\n    ## 技术原理 [#技术原理]\n\n    加密原理。\n\n    ```java\n    // ## 示例标题 [#not-a-section]\n    enableEncryption();\n    ```\n\n    ## 实现方法 [#实现方法]\n\n    调用 enableEncryption。';
    const records = extractPublishedCnSections(
      { ...route, platform: 'android' },
      page,
      markdown,
    );
    expect(records.map((record) => record.url)).toEqual([
      url,
      `${url}#技术原理`,
      `${url}#实现方法`,
    ]);
    expect(records[1].content).toContain('enableEncryption();');
    expect(records[1].platform).toEqual(['android']);
  });

  it('keeps an ordinary indented code example intact without platform renderer metadata', () => {
    const records = extractPublishedCnSections(
      route,
      page,
      '# RTC API\n\n    ## 示例 [#sample]\n    code();',
    );
    expect(records.map((record) => record.url)).toEqual([url]);
  });
  it('preserves both table-cell code examples without swallowing later release-note headings', () => {
    const markdown =
      '# RTC API\n\n    ## 版本 [#version]\n\n    | 新 | 旧 |\n    | --- | --- |\n    | ```groovy\n    newDependency();\n    ``` | ```groovy\n    oldDependency();\n    ``` |\n\n    ### 改进 [#improved]\n\n    优化连接。';
    const records = extractPublishedCnSections(
      { ...route, platform: 'android' },
      page,
      markdown,
    );
    expect(records.map((record) => record.url)).toEqual([
      `${url}#version`,
      `${url}#improved`,
    ]);
    expect(records[0].content).toContain('newDependency();');
    expect(records[0].content).toContain('oldDependency();');
    expect(records[1].content).toContain('优化连接。');
  });
  it('uses the rendered heading ID when processed Markdown carries an outdated anchor', async () => {
    const records = await exportPublishedCnRecords({
      routes: [route],
      pages: [page],
      readMarkdown: async () =>
        '# RTC API\n\n## Heartbeat Interval 与 Presence Timeout [#outdated]\n\n连接说明。',
      readRenderedHtml: async () =>
        '<article><h2 id="heartbeatinterval-and-presencetimeout">Heartbeat Interval 与 Presence Timeout</h2></article>',
    });
    expect(records[0].url).toBe(
      '/api-reference/rtc/web/4.6.0/api#heartbeatinterval-and-presencetimeout',
    );
  });
  it('preserves all explicit FAQ products and normalizes its platform labels', () => {
    const url = '/zh-CN/reference/faq/account/billing_basis';
    const [record] = extractPublishedCnSections(
      { url, canonicalPath: url, markdownPath: `${url}.md` },
      { url, title: '计时方式' },
      '# 计时方式\n\nFAQ 正文。',
    );
    expect(record).toMatchObject({
      products: ['local-server-recording', 'rtc', 'analytics'],
    });
    expect(record.platform).toBeUndefined();
  });

  it('keeps FAQs scoped to all products under the reference product', () => {
    const url = '/zh-CN/reference/faq/account/billing_account';
    const [record] = extractPublishedCnSections(
      { url, canonicalPath: url, markdownPath: `${url}.md` },
      { url, title: '什么是账单、结算与账户冻结？' },
      '# 什么是账单、结算与账户冻结？\n\nFAQ 正文。',
    );
    expect(record).toMatchObject({
      product: 'reference',
      products: ['reference'],
    });
  });

  it('tags cloud recording FAQ with RESTful instead of the reference folder', () => {
    const url = '/zh-CN/reference/faq/integration/return_404';
    const [record] = extractPublishedCnSections(
      { url, canonicalPath: url, markdownPath: `${url}.md` },
      { url, title: 'query 返回 404' },
      '# query 返回 404\n\nFAQ 正文。',
    );
    expect(record).toMatchObject({
      product: 'cloud-recording',
      products: ['cloud-recording'],
      platform: ['restful'],
    });
  });
  it('preserves IDs containing brackets and merges headings sharing a renderer anchor', () => {
    const records = extractPublishedCnSections(
      route,
      page,
      '# API\n\n## 类型定义 [#config]\n\n### Config [#config]\n\n配置。\n\n## loadAudioSettings\\[1/2] [#loadaudiosettings[1/2]]\n\n加载音频。\n\n### [#empty-parameters]\n\n参数。',
    );
    expect(records).toHaveLength(2);
    expect(records[0]).toMatchObject({
      sectionTitle: 'Config',
      url: `${url}#config`,
    });
    expect(records[1]).toMatchObject({
      sectionTitle: 'loadAudioSettings[1/2]',
      url: `${url}#loadaudiosettings[1/2]`,
    });
    expect(records[1].content).toContain('参数。');
  });
  it('uses Fumadocs published heading IDs instead of slugging the anchor annotation', () => {
    const records = extractPublishedCnSections(
      route,
      page,
      '# RTC API\n\n## 加入频道 [#joinChannel]\n\n调用 joinChannel。',
    );
    expect(records[0]).toMatchObject({
      url: `${url}#joinChannel`,
      sectionTitle: '加入频道',
      content: '加入频道\n调用 joinChannel。',
    });
  });
  it('keeps section anchors, duplicate heading slugs, code identifiers and platform/version metadata', () => {
    const records = extractPublishedCnSections(
      route,
      page,
      '# RTC API\n\n> For AI agents: see index.\n\n<a id="renewToken"></a>\n\n## Token\n\n调用 `renewToken`。\n\n### 参数\n\n```ts\nfiller_words.enable = true\n```\n\n## Token\n\n续期。',
    );
    expect(records.map((record) => record.url)).toEqual([
      `${url}#renewToken`,
      `${url}#参数`,
      `${url}#token-1`,
    ]);
    expect(records[0]).toMatchObject({
      product: 'rtc',
      tab: 'api-reference',
      platform: ['web'],
      version: '4.6.0',
    });
    expect(records[1].content).toContain('filler_words.enable');
    expect(records[1].headingPath).toEqual(['RTC API', 'Token', '参数']);
  });
  it('includes published OpenAPI and platform variants while excluding pages outside site navigation', async () => {
    const canonical = '/zh-CN/api-reference/api-ref/conversational-ai/join';
    const readMarkdown = vi
      .fn()
      .mockResolvedValue(
        '# Join\n\n## 请求\n\n<table><tr><td>Token</td></tr></table>',
      );
    const records = await exportPublishedCnRecords({
      pages: [{ url: canonical, title: 'Join', objectType: 'openapi' }],
      routes: [
        {
          url: canonical,
          canonicalPath: canonical,
          markdownPath: `${canonical}.md`,
        },
        {
          url: `${canonical}/web`,
          canonicalPath: canonical,
          markdownPath: `${canonical}/web.md`,
          platform: 'web',
          defaultPlatform: 'web',
        },
        {
          url: '/zh-CN/hidden',
          canonicalPath: '/zh-CN/hidden',
          markdownPath: '/zh-CN/hidden.md',
        },
      ],
      readMarkdown,
    });
    expect(readMarkdown).toHaveBeenCalledTimes(2);
    expect(records[0]).toMatchObject({
      docType: 'openapi',
      product: 'conversational-ai',
      content: '请求\nToken',
      url: '/api-reference/api-ref/conversational-ai/join',
      headingPath: ['Join'],
    });
    expect(records[1].platform).toEqual(['web']);
  });
  it('fails before publishing if a published artifact is missing or the export is empty', async () => {
    await expect(
      exportPublishedCnRecords({
        routes: [route],
        pages: [],
        readMarkdown: vi.fn(),
      }),
    ).rejects.toThrow('No published CN');
    await expect(
      exportPublishedCnRecords({
        routes: [route],
        pages: [page],
        readMarkdown: async () => {
          throw new Error('missing artifact');
        },
      }),
    ).rejects.toThrow('missing artifact');
  });
  it('indexes rendered platform variants instead of headings hidden in canonical tabs', async () => {
    const readMarkdown = vi
      .fn()
      .mockResolvedValue('# RTC API\n\n## Token [#token]\n\nWeb 内容。');
    const records = await exportPublishedCnRecords({
      pages: [page],
      routes: [
        route,
        {
          ...route,
          url: `${url}/web`,
          markdownPath: `${url}/web.md`,
          platform: 'web',
          defaultPlatform: 'web',
        },
      ],
      readMarkdown,
    });
    expect(readMarkdown).toHaveBeenCalledOnce();
    expect(records[0]).toMatchObject({
      url: '/api-reference/rtc/web/4.6.0/api/web#token',
      platform: ['web'],
    });
  });

  it('annotates platform variants with a canonical URL and complete platform list', async () => {
    const canonical = '/zh-CN/realtime-media/rtc/build/token-authentication';
    const records = await exportPublishedCnRecords({
      pages: [{ url: canonical, title: '使用 Token 鉴权' }],
      routes: [
        {
          url: `${canonical}/android`,
          canonicalPath: canonical,
          markdownPath: `${canonical}/android.md`,
          platform: 'android',
          defaultPlatform: 'ios',
        },
        {
          url: `${canonical}/ios`,
          canonicalPath: canonical,
          markdownPath: `${canonical}/ios.md`,
          platform: 'ios',
          defaultPlatform: 'ios',
        },
      ],
      readMarkdown: async () => '# 使用 Token 鉴权\n\n## Token\n\n说明。',
    });

    expect(records).toHaveLength(2);
    expect(records[0]).toMatchObject({
      canonicalUrl: '/realtime-media/rtc/build/token-authentication',
      availablePlatforms: ['android', 'ios'],
      defaultPlatform: 'ios',
      isDefaultPlatform: false,
    });
    expect(records[1]).toMatchObject({
      canonicalUrl: '/realtime-media/rtc/build/token-authentication',
      availablePlatforms: ['android', 'ios'],
      defaultPlatform: 'ios',
      isDefaultPlatform: true,
    });
  });

  it('does not export records whose only product is Danmaku', async () => {
    const url = '/zh-CN/realtime-media/danmaku/reference/response-code';
    const records = await exportPublishedCnRecords({
      pages: [{ url, title: '响应状态码' }],
      routes: [{ url, canonicalPath: url, markdownPath: `${url}.md` }],
      readMarkdown: async () => '# 响应状态码\n\n## 错误码\n\n弹幕接口错误码。',
    });

    expect(records).toEqual([]);
  });

  it.each([
    [
      '/zh-CN/solutions/showroom/get-started/run-example',
      { product: 'showroom' },
    ],
    [
      '/zh-CN/api-reference/rtc/csharp-windows/rtc-api-overview',
      { product: 'rtc', platform: ['csharp'] },
    ],
    [
      '/zh-CN/api-reference/rtc/react-sdk/overview',
      { product: 'rtc', platform: ['web'] },
    ],
    [
      '/zh-CN/api-reference/rtc/csharp-windows/audio/audio-basic',
      { product: 'rtc', platform: ['csharp'] },
    ],
    [
      '/zh-CN/api-reference/rtc/react-sdk/hooks',
      { product: 'rtc', platform: ['web'] },
    ],
    [
      '/zh-CN/api-reference/rtc/cpp-all-platforms/audio/audio-basic',
      { product: 'rtc', platform: ['cpp'] },
    ],
    [
      '/zh-CN/api-reference/rtc/android/channel',
      { product: 'rtc', platform: ['android'], version: '4.6.2' },
    ],
  ])('derives metadata for %s', (url, expected) => {
    const records = extractPublishedCnSections(
      {
        url,
        canonicalPath: url,
        markdownPath: `${url}.md`,
        ...(url.endsWith('/channel') ? { version: '4.6.2' } : {}),
      },
      { url, title: 'Example', objectType: 'docs' },
      '# Example\n\n## Section\n\nContent.',
    );

    expect(records[0]).toMatchObject(expected);
  });
});
