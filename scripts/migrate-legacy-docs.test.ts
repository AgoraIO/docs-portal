import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

import {
  expandPlatformTargetPath,
  findLegacyResidue,
  getOutputPlatformsForSourcePath,
  inferContextFromSourcePath,
  loadComponentMap,
  migrateLegacyBatch,
  stripImportExport,
  transformAdmonitions,
  transformLegacyMdx,
} from './migrate-legacy-docs.mjs';

function createState(
  sourcePath = 'docs/rtc/basic-features/audio-quick-start.macos.mdx',
) {
  return {
    context: inferContextFromSourcePath(sourcePath),
    currentSourcePath: sourcePath,
    issues: [] as string[],
    linkLists: new Map<string, { href: string; title: string }[]>(),
    pathMap: new Map(),
    sharedDependencies: new Set<string>(),
    sourceRoot: '/legacy',
    tableHeaders: new Map(),
  };
}

describe('migrate-legacy-docs helpers', () => {
  it('infers product and platform from legacy RTC filenames', () => {
    expect(
      inferContextFromSourcePath(
        'docs/rtc/basic-features/audio-quick-start.macos.mdx',
      ),
    ).toMatchObject({
      platform: 'macos',
      platforms: ['macos'],
      product: 'rtc',
    });
  });

  it('keeps matching PlatformFilter content and drops nonmatching content', () => {
    const state = createState();
    const migrated = transformLegacyMdx(
      `
<PlatformFilter platformList={['ios','macos']}>
<li>Xcode 12.0 或以上版本。</li>
</PlatformFilter>
<PlatformFilter platformList={['android']}>
<li>Android Studio 4.1 以上版本。</li>
</PlatformFilter>
`,
      state,
    );

    expect(migrated).toContain('- Xcode 12.0 或以上版本。');
    expect(migrated).not.toContain('Android Studio');
    expect(findLegacyResidue(migrated)).toEqual([]);
  });

  it('rewrites legacy admonitions to directive fences', () => {
    expect(
      transformAdmonitions(`
    <Admonition type="danger" title="警告">
    调用后需要重新创建引擎。
    </Admonition>
`),
    ).toContain('    :::error[警告]\n    调用后需要重新创建引擎。\n    :::');
  });

  it('rewrites Docusaurus tabs to approved MDX tabs', () => {
    const state = createState();
    const migrated = transformLegacyMdx(
      `
<Tabs groupId="integrate-sdk">
  <TabItem value="cocoapods" label="通过 CocoaPods 集成">
    Use CocoaPods.
  </TabItem>
  <TabItem value="manual" label="手动集成">
    Download SDK.
  </TabItem>
</Tabs>
`,
      state,
    );

    expect(migrated).toContain(
      '<Tabs defaultValue="cocoapods" groupId="integrate-sdk" persist>',
    );
    expect(migrated).toContain(
      '<TabsTrigger value="manual">手动集成</TabsTrigger>',
    );
    expect(findLegacyResidue(migrated)).toEqual([]);
  });

  it('outdents legacy Tabs that were nested under list items', () => {
    const state = createState('docs/rtm2/get-started/quick-start.ios.mdx');
    const migrated = transformLegacyMdx(
      `
1. 创建项目。
2. 通过以下任意一种方式获取 SDK。

   <Tabs defaultValue="cdn">
     <TabItem value="cdn" label="使用 CDN">
     下载 SDK。
     </TabItem>
     <TabItem value="spm" label="通过 SPM 集成 SDK">
     使用 SPM。
     </TabItem>
   </Tabs>
`,
      state,
    );

    expect(migrated).toContain('\n<Tabs defaultValue="cdn">');
    expect(migrated).toContain('\n</Tabs>');
    expect(migrated).not.toContain('\n   <Tabs');
    expect(migrated).not.toContain('\n   </Tabs>');
    expect(findLegacyResidue(migrated)).toEqual([]);
  });

  it('keeps legacy described code tabs as MDX tabs with prose and code blocks', () => {
    const state = createState(
      'docs/rtc/best-practice/reduce-app-size.android.mdx',
    );
    const migrated = transformLegacyMdx(
      `
<Tabs groupId="operating-systems">
  <TabItem value="sample1" label="使用所有插件">

集成 4.0.1 版 Android 视频 SDK，且使用所有插件时，\`dependencies\` 如下：

\`\`\`java
dependencies {
 implementation 'io.agora.rtc:full-sdk:4.0.1'
}
\`\`\`
  </TabItem>
  <TabItem value="sample2" label="不使用任何插件">

集成 4.0.1 版 Android 视频 SDK，且不使用所有插件时，\`dependencies\` 如下：

\`\`\`java
dependencies {
 implementation 'io.agora.rtc:full-rtc-basic:4.0.1'
}
\`\`\`
  </TabItem>
</Tabs>
`,
      state,
    );

    expect(migrated).toContain(
      '<Tabs defaultValue="sample1" groupId="operating-systems" persist>',
    );
    expect(migrated).toContain(
      '<TabsTrigger value="sample1">使用所有插件</TabsTrigger>',
    );
    expect(migrated).toContain('<TabsContent value="sample1">');
    expect(migrated).toContain(
      '集成 4.0.1 版 Android 视频 SDK，且使用所有插件时，`dependencies` 如下：\n\n```java\ndependencies {',
    );
    expect(migrated).toContain('<TabsContent value="sample2">');
    expect(migrated).toContain(
      '集成 4.0.1 版 Android 视频 SDK，且不使用所有插件时，`dependencies` 如下：\n\n```java\ndependencies {',
    );
    expect(migrated).toContain(
      "implementation 'io.agora.rtc:full-rtc-basic:4.0.1'",
    );
    expect(migrated).not.toContain('```java tab=');
    expect(findLegacyResidue(migrated)).toEqual([]);
  });

  it('rewrites legacy pure code tabs to Fumadocs code fence tabs', () => {
    const state = createState();
    const migrated = transformLegacyMdx(
      `
<Tabs groupId="language">
  <TabItem value="java" label="Java">

\`\`\`java
engine.joinChannel(token);
\`\`\`
  </TabItem>
  <TabItem value="kotlin" label="Kotlin">

\`\`\`kotlin
engine.joinChannel(token)
\`\`\`
  </TabItem>
</Tabs>
`,
      state,
    );

    expect(migrated).toContain(
      '```java tab="Java" tabGroup="language"\nengine.joinChannel(token);',
    );
    expect(migrated).toContain(
      '```kotlin tab="Kotlin" tabGroup="language"\nengine.joinChannel(token)',
    );
    expect(migrated).not.toContain('<Tabs');
    expect(findLegacyResidue(migrated)).toEqual([]);
  });

  it('keeps Markdown blocks inside converted Detail accordions out of code blocks', () => {
    const state = createState('docs/rtc/best-practice/reduce-app-size.ios.mdx');
    const migrated = transformLegacyMdx(
      `
<Detail title="AI 降噪插件">

实时互动 SDK 支持新版 AI 降噪功能。

各平台插件名及集成后 App 增加的体积见下表：

| 平台 | 库名 |
| :--- | :--- |
| iOS | \`AgoraAiNoiseSuppressionExtension.xcframework\` |

<Admonition type="info" title="信息">
低延迟版与普通版 AI 降噪插件相互独立。
</Admonition>

</Detail>
`,
      state,
    );

    expect(migrated).toContain('<Accordion title="AI 降噪插件">');
    expect(migrated).toContain('\n实时互动 SDK 支持新版 AI 降噪功能。\n');
    expect(migrated).toContain('\n| 平台 | 库名 |\n| :--- | :--- |');
    expect(migrated).toContain(
      '\n:::info[信息]\n低延迟版与普通版 AI 降噪插件相互独立。\n:::\n',
    );
    expect(migrated).not.toContain('\n    实时互动 SDK');
    expect(migrated).not.toContain('\n    | 平台 | 库名 |');
    expect(migrated).not.toContain('\n    :::info[信息]');
    expect(findLegacyResidue(migrated)).toEqual([]);
  });

  it('groups consecutive legacy Detail blocks as sibling accordions', () => {
    const state = createState('docs/rtc/billing/billing-faq.mdx');
    const migrated = transformLegacyMdx(
      `
<Detail title="Q：为什么所有用户订阅的都是 360 × 640 的视频流？">

**A**：视频档位基于集合分辨率而定。
</Detail>

<Detail title="Q：双流模式下的视频流分辨率怎么计算？">

双流模式下，用户的分辨率计算方式如下：

- 如果订阅的是大流，则按大流分辨率计算。
</Detail>
`,
      state,
    );

    expect(migrated.match(/<Accordions>/g)).toHaveLength(1);
    expect(migrated).toContain(
      '<Accordion title="Q：为什么所有用户订阅的都是 360 × 640 的视频流？">',
    );
    expect(migrated).toContain(
      '<Accordion title="Q：双流模式下的视频流分辨率怎么计算？">',
    );
    expect(migrated).toContain('**A**：视频档位基于集合分辨率而定。');
    expect(migrated).toContain(
      '双流模式下，用户的分辨率计算方式如下：\n\n- 如果订阅的是大流，则按大流分辨率计算。',
    );
    expect(migrated).not.toContain('\nQ：为什么所有用户订阅的都是');
    expect(findLegacyResidue(migrated)).toEqual([]);
  });

  it('rewrites adjacent comment-labeled code fences to code tabs', () => {
    const state = createState(
      'docs/rtc/advanced-features/optimization-mode.javascript.mdx',
    );
    const migrated = transformLegacyMdx(
      `
例如你可以按场景设置优化模式。

\`\`\`js
// 使用默认策略
const videoTrack2 = await AgoraRTC.createScreenVideoTrack();
\`\`\`

\`\`\`js
const videoTrack = await AgoraRTC.createCameraVideoTrack({
  // 使用清晰优先
  optimizationMode: "detail",
});
\`\`\`

\`\`\`js
const videoTrack2 = await AgoraRTC.createCameraVideoTrack({
  // 使用流畅优先
  optimizationMode: "motion",
});
\`\`\`
`,
      state,
    );

    expect(migrated).toContain('```javascript tab="默认策略"\n// 使用默认策略');
    expect(migrated).toContain(
      '```javascript tab="清晰优先"\nconst videoTrack = await AgoraRTC.createCameraVideoTrack',
    );
    expect(migrated).toContain(
      '```javascript tab="流畅优先"\nconst videoTrack2 = await AgoraRTC.createCameraVideoTrack',
    );
    expect(state.issues).toContain('normalized-adjacent-code-fence-tabs');
    expect(findLegacyResidue(migrated)).toEqual([]);
  });

  it('does not use long explanatory code comments as generated tab labels', () => {
    const state = createState(
      'docs/online-ktv/auikaraoke/advanced-features/lyrics-scoring.android.mdx',
    );
    const migrated = transformLegacyMdx(
      `
你可以根据自己的需求自定义粒子动画的样式。

\`\`\`java
// 自定义粒子动画效果
mScoringView.setParticles(Drawable[] ...);
\`\`\`

\`\`\`java
public class MyScoringView extends ScoringView {
    @Override
    public void initParticleSystem(Drawable[] particles) {
        // 导入 Leonids 库，该库提供了丰富的配置选项，你可以轻松创建各种粒子效果，包括粒子的形状、颜色、运动轨迹等。
        mParticlesPerSecond = 16;
    }
}
\`\`\`
`,
      state,
    );

    expect(migrated).toContain('```java\n// 自定义粒子动画效果');
    expect(migrated).toContain('```java\npublic class MyScoringView');
    expect(migrated).not.toContain('tab="导入 Leonids 库');
    expect(state.issues).not.toContain('normalized-adjacent-code-fence-tabs');
  });

  it('keeps converted Detail accordion tags at top level after lists', () => {
    const state = createState(
      'docs/rtc/overview/browser-compatibility.react.javascript.mdx',
    );
    const migrated = transformLegacyMdx(
      `
<Detail title="Chrome 浏览器已知问题和限制">

- 在 Windows 设备上使用 \`deviceId\` 为 \`"default"\` 的麦克风时，原麦克风的采集可能中断。

  解决方案：建议避免使用 \`deviceId\` 为 \`"default"\` 的麦克风。

</Detail>

<Detail title="Safari 浏览器已知问题和限制">

- Safari 16.1 上调用 \`createScreenVideoTrack\` 方法时可能失败。

</Detail>
`,
      state,
    );

    expect(migrated).toContain(
      [
        '- 在 Windows 设备上使用 `deviceId` 为 `"default"` 的麦克风时，原麦克风的采集可能中断。',
        '',
        '  解决方案：建议避免使用 `deviceId` 为 `"default"` 的麦克风。',
        '',
        '</Accordion>',
        '',
        '<Accordion title="Safari 浏览器已知问题和限制">',
      ].join('\n'),
    );
    expect(migrated).not.toContain('\n  </Accordion>');
    expect(migrated).not.toContain('\n  <Accordion title=');
    expect(findLegacyResidue(migrated)).toEqual([]);
  });

  it('keeps indented ordered lists inside TabItem as sibling list items', () => {
    const state = createState();
    const migrated = transformLegacyMdx(
      `
<Tabs groupId="integrate-sdk">
  <TabItem value="cocoapods" label="通过 CocoaPods 集成">
    1. 在终端里进入项目根目录，并运行 \`pod init\` 命令。
    2. 打开 \`Podfile\` 文件，修改文件为如下内容。

        \`\`\`ruby
        target 'Your App' do
        end
        \`\`\`

    3. 在终端内运行 \`pod install\` 命令。
  </TabItem>
</Tabs>
`,
      state,
    );

    expect(migrated).toContain(
      [
        '<TabsContent value="cocoapods">',
        '',
        '1. 在终端里进入项目根目录，并运行 `pod init` 命令。',
        '2. 打开 `Podfile` 文件，修改文件为如下内容。',
      ].join('\n'),
    );
    expect(migrated).toContain('\n3. 在终端内运行 `pod install` 命令。');
    expect(migrated).not.toContain('\n    2. 打开');
  });

  it('unwraps legacy font and script-position tags in Markdown tables', () => {
    const state = createState('docs/rtc/overview/release-notes.ios.mdx');
    const migrated = transformLegacyMdx(
      `
| 设备型号 | 分屏显示 | 备注 |
| --- | --- | --- |
| iPad Air 2 | <font color="green">✔</font> | 企业微信<sup>①</sup> |
| Chrome | <font color="red">✘</font> | H<sub>2</sub>O |
`,
      state,
    );

    expect(migrated).toContain('| iPad Air 2 | ✔ | 企业微信① |');
    expect(migrated).toContain('| Chrome | ✘ | H2O |');
    expect(migrated).not.toContain('<font');
    expect(migrated).not.toContain('<sup');
    expect(migrated).not.toContain('<sub');
  });

  it('escapes text angle operators that MDX would parse as JSX', () => {
    const state = createState('docs/rtc/overview/release-notes.ios.mdx');
    const migrated = transformLegacyMdx(
      `
该枚举值为 (1<<15)，另一个示例为 8>>2。

代码示例：\`1<<15\`
`,
      state,
    );

    expect(migrated).toContain('该枚举值为 (1&lt;&lt;15)');
    expect(migrated).toContain('另一个示例为 8&gt;&gt;2。');
    expect(migrated).toContain('代码示例：`1<<15`');
  });

  it('marks legacy image sizing for review while keeping a Markdown image', () => {
    const state = createState();
    const migrated = transformLegacyMdx(
      '<Image src="/img/rtc/audio-quick-start-sequence.svg" alt="实现流程" width="70%"/>',
      state,
    );

    expect(migrated).toContain(
      '![实现流程](/img/rtc/audio-quick-start-sequence.svg)',
    );
    expect(state.issues).toContain(
      'needs-image-width-review:/img/rtc/audio-quick-start-sequence.svg:70%',
    );
  });

  it('rewrites non-self-closing legacy Image components', () => {
    const state = createState();
    const migrated = transformLegacyMdx(
      '<Image src="https://web-cdn.example/proxy" width="80%" alt="云代理"></Image>',
      state,
    );

    expect(migrated).toContain('![云代理](https://web-cdn.example/proxy)');
    expect(migrated).not.toContain('<Image');
    expect(state.issues).toContain(
      'needs-image-width-review:https://web-cdn.example/proxy:80%',
    );
  });

  it('does not strip import lines inside code fences', () => {
    expect(
      stripImportExport(`
import Tabs from '@theme/Tabs';

\`\`\`swift
import AgoraRtcKit
import Cocoa
\`\`\`
`),
    ).toContain('import AgoraRtcKit');
  });

  it('maps old dynamic platform links through the path map', () => {
    const state = createState();
    state.pathMap.set('docs/rtc/basic-features/firewall.android.mdx', {
      sourcePath: 'docs/rtc/basic-features/firewall.android.mdx',
      targetPath:
        'content/docs/zh-CN/realtime-media/rtc/basic-features/firewall.android.mdx',
    });
    state.pathMap.set('docs/rtc/basic-features/firewall.ios.macos.mdx', {
      sourcePath: 'docs/rtc/basic-features/firewall.ios.macos.mdx',
      targetPath:
        'content/docs/zh-CN/realtime-media/rtc/basic-features/firewall.ios.macos.mdx',
    });

    const migrated = transformLegacyMdx(
      '<a href={`/doc/rtc/${' +
        'props.ag_platform' +
        '}/basic-features/firewall`}>防火墙</a>',
      state,
    );

    expect(migrated).toContain(
      '[防火墙](/zh-CN/realtime-media/rtc/basic-features/firewall.macos)',
    );
  });

  it('keeps nested HTML lists readable', () => {
    const state = createState();
    const migrated = transformLegacyMdx(
      `<ol>
<li>加入频道后：<ul>
<li>主播可以发布音视频。</li>
<li>观众可以订阅音视频。</li>
</ul></li>
</ol>`,
      state,
    );

    expect(migrated).toContain(
      '1. 加入频道后：\n\n   - 主播可以发布音视频。\n   - 观众可以订阅音视频。',
    );
  });

  it('aligns nested unordered lists to double-digit ordered list content', () => {
    const state = createState();
    const migrated = transformLegacyMdx(
      `<ol>
<li>步骤 1</li>
<li>步骤 2</li>
<li>步骤 3</li>
<li>步骤 4</li>
<li>步骤 5</li>
<li>步骤 6</li>
<li>步骤 7</li>
<li>步骤 8</li>
<li>步骤 9</li>
<li>步骤 10：<ul><li>结果 A</li><li>结果 B</li></ul></li>
</ol>`,
      state,
    );

    expect(migrated).toContain('10. 步骤 10：\n\n    - 结果 A\n    - 结果 B');
  });

  it('strips legacy indentation before nested HTML list tags', () => {
    const state = createState();
    const migrated = transformLegacyMdx(
      `<ol>
<li>观察测试结果：
    <ul><li>主播可以看到对方。</li>
    <li>观众可以看到主播。</li></ul></li>
</ol>`,
      state,
    );

    expect(migrated).toContain(
      '1. 观察测试结果：\n\n   - 主播可以看到对方。\n   - 观众可以看到主播。',
    );
    expect(migrated).not.toContain('\n       - 主播可以看到对方。');
  });

  it('adds blank lines before lists that follow prose without touching code fences', () => {
    const state = createState(
      'docs/conversion-ppt/get-started/quick-start.mdx',
    );
    const migrated = transformLegacyMdx(
      `
开始前，确保你已完成以下步骤：
- 开通 PPT 转码服务
- 获取 SDK Token

<Admonition type="info" title="信息">
打开 API 参考以获得最佳体验：
- 查看参数说明
- 快捷调用 RESTful API
</Admonition>

\`\`\`text
说明：
- 这里是代码块内容
\`\`\`
`,
      state,
    );

    expect(migrated).toContain(
      '开始前，确保你已完成以下步骤：\n\n- 开通 PPT 转码服务',
    );
    expect(migrated).toContain(
      '打开 API 参考以获得最佳体验：\n\n- 查看参数说明',
    );
    expect(migrated).toContain('说明：\n- 这里是代码块内容');
  });

  it('rewrites HTML lists inside table cells to table slots', () => {
    const state = createState();
    const migrated = transformLegacyMdx(
      '| Capability | Permission |\n| --- | --- |\n| Network | <ul><li>Incoming</li><li>Outgoing</li></ul> |',
      state,
    );

    expect(migrated).toContain(
      '| Network | <Slot name="audio-quick-start-macos-markdown-0-1-1" /> |',
    );
    expect(migrated).toContain(
      '<Slot for="audio-quick-start-macos-markdown-0-1-1">',
    );
    expect(migrated).toContain('- Incoming\n- Outgoing');
    expect(migrated).toContain('</Slot>');
    expect(state.issues).toContain('normalized-table-slot');
    expect(findLegacyResidue(migrated)).toEqual([]);
  });

  it('rewrites API category tables with list cells to Markdown lists', () => {
    const state = createState('docs/rtc/overview/migration-guide.electron.mdx');
    const migrated = transformLegacyMdx(
      [
        '| API | 插件类型 |',
        '| :--- | :--- |',
        '| `enableVirtualBackground` | 虚拟背景插件 |',
        '| <ul><li>`setBeautyEffectOption`</li><li>`setVideoDenoiserOptions`</li></ul> | 视频增强插件 |',
        '| `enableRemoteSuperResolution` | 超分辨率插件 |',
      ].join('\n'),
      state,
    );

    expect(migrated).not.toContain('| API | 插件类型 |');
    expect(migrated).not.toContain('<Slot');
    expect(migrated).toContain('- 虚拟背景插件：`enableVirtualBackground`');
    expect(migrated).toContain(
      '- 视频增强插件：\n  - `setBeautyEffectOption`\n  - `setVideoDenoiserOptions`',
    );
    expect(migrated).toContain('- 超分辨率插件：`enableRemoteSuperResolution`');
    expect(state.issues).toContain('normalized-api-category-table-list');
    expect(findLegacyResidue(migrated)).toEqual([]);
  });

  it('normalizes markdown tables whose header row is missing a trailing pipe', () => {
    const state = createState('docs/rtc/response-code.restful.mdx');
    const migrated = transformLegacyMdx(
      [
        '| 状态码 | 含义 |建议措施',
        '| :--- | :--- | :--- |',
        '| `401 Unauthorized` | 未经授权。 | 检查认证信息。可能的原因包括：<ul><li>App ID 不存在。</li><li>客户 ID 和客户密钥不匹配。</li></ul> |',
        '| `403 Forbidden` | 禁止访问。 | 联系技术支持。 |',
      ].join('\n'),
      state,
    );

    expect(migrated).toContain('| 状态码 | 含义 | 建议措施 |');
    expect(migrated).toContain(
      '| `401 Unauthorized` | 未经授权。 | <Slot name="response-code-restful-markdown-0-1-2" /> |',
    );
    expect(migrated).toContain(
      '检查认证信息。可能的原因包括：\n\n- App ID 不存在。\n- 客户 ID 和客户密钥不匹配。',
    );
    expect(migrated).toContain(
      '| `403 Forbidden` | 禁止访问。 | 联系技术支持。 |',
    );
    expect(migrated).not.toContain('- 客户 ID 和客户密钥不匹配。 |');
    expect(state.issues).toContain('normalized-table-slot');
  });

  it('keeps legacy markdown tables with two-dash separators intact when cells contain HTML lists', () => {
    const state = createState('docs/media-push/best-practices/checklist.mdx');
    const migrated = transformLegacyMdx(
      [
        '| 编号 | 重要程度 | 检查项 | 检查内容 |',
        '| -- | ------ | ------------------ | -------------------------------------------------------- |',
        '| 9 | 可选 | 问题排查 | 请按照如下方案进行问题排查：<ul><li>使用退避策略。</li><li>根据错误码排查。</li><li>如果以上排查方法并未解决问题，请打印出响应 Header 中的 `X-Request-ID` 和 `X-Resource-ID` 字段值，并联系声网技术支持。</li></ul> |',
        '| 10 | 可选 | 消息通知 | 开通旁路推流[消息通知服务](../webhook/enable-ncs)，并监听旁路推流事件。 |',
      ].join('\n'),
      state,
    );

    expect(migrated).toContain('| 编号 | 重要程度 | 检查项 | 检查内容 |');
    expect(migrated).toContain(
      '| 9 | 可选 | 问题排查 | <Slot name="checklist-markdown-0-1-3" /> |',
    );
    expect(migrated).toContain(
      '| 10 | 可选 | 消息通知 | 开通旁路推流[消息通知服务](../webhook/enable-ncs)，并监听旁路推流事件。 |',
    );
    expect(migrated).toContain('- 使用退避策略。');
    expect(migrated).toContain('- 根据错误码排查。');
    expect(migrated).not.toContain('声网技术支持。 |');
    expect(state.issues).toContain('normalized-table-slot');
  });

  it('keeps nested HTML lists inside table slots without raw closing tags', () => {
    const state = createState();
    const migrated = transformLegacyMdx(
      '| State | Reason |\n| --- | --- |\n| FAILED | <ul><li>`REJECTED`：一般有以下原因：<ul><li>重复加入频道。</li><li>回声测试未结束。</li></ul></li></ul> |',
      state,
    );

    expect(migrated).toContain(
      '| FAILED | <Slot name="audio-quick-start-macos-markdown-0-1-1" /> |',
    );
    expect(migrated).toContain(
      '- `REJECTED`：一般有以下原因：\n\n  - 重复加入频道。\n  - 回声测试未结束。',
    );
    expect(migrated).not.toContain('</li>');
  });

  it('rewrites legacy heading components to Markdown headings with stable anchors', () => {
    const state = createState();
    const migrated = transformLegacyMdx(
      '<H3 className="anchor" id="connection_reason">状态说明及排障指导</H3>',
      state,
    );

    expect(migrated).toBe(
      '<a id="connection_reason"></a>\n### 状态说明及排障指导',
    );
  });

  it('expands legacy LinkTooltip references into static Markdown links', () => {
    const state = createState();
    state.linkLists.set('FaceCapture', [
      { href: 'https://gitee.example/project', title: 'Gitee' },
      { href: 'https://github.example/project', title: 'GitHub' },
    ]);

    const migrated = transformLegacyMdx(
      '<LinkTooltip links={FaceCapture}>FaceCapture</LinkTooltip>',
      state,
    );

    expect(migrated).toBe(
      'FaceCapture ([Gitee](https://gitee.example/project), [GitHub](https://github.example/project))',
    );
    expect(state.issues).toContain('normalized-link-tooltip:FaceCapture');
  });

  it('removes exported link-list data from migrated prose', () => {
    expect(
      stripImportExport(`
export const FaceCapture = [
  { title: 'Gitee', href: 'https://gitee.example/project' },
  { title: 'GitHub', href: 'https://github.example/project' }
]

正文
`),
    ).toContain('正文');
    expect(
      stripImportExport(`
export const FaceCapture = [
  { title: 'Gitee', href: 'https://gitee.example/project' },
  { title: 'GitHub', href: 'https://github.example/project' }
]

正文
`),
    ).not.toContain('export const FaceCapture');
  });

  it('normalizes quoted template interpolations in legacy API links', () => {
    const state = createState(
      'docs/rtc/basic-features/channel-connection.harmonyos.mdx',
    );
    const migrated = transformLegacyMdx(
      '<a href={`/api-ref/rtc/${' +
        'frontMatter.ag_platform' +
        '}/API/toc_network#callback`}>`onConnectionStateChanged`</a>',
      state,
    );

    expect(migrated).toBe(
      '[`onConnectionStateChanged`](/api-ref/rtc/harmonyos/API/toc_network#callback)',
    );
  });

  it('keeps code fence spacing without adding blank lines inside code', () => {
    const state = createState();
    const migrated = transformLegacyMdx(
      '复制以下代码。\n```ts\nconst ok = true;\n```\n继续操作。',
      state,
    );

    expect(migrated).toBe(
      '复制以下代码。\n\n```ts\nconst ok = true;\n```\n\n继续操作。',
    );
  });

  it('rewrites simple legacy Table components to GFM tables', () => {
    const state = createState();
    const migrated = transformLegacyMdx(
      `<Table>
  <thead>
    <tr><th>路径</th><th>描述</th></tr>
  </thead>
  <tbody>
    <tr><td>\`/src/example/basic\`</td><td>快速开始示例</td></tr>
    <tr><td>\`/src/example/advanced\`</td><td>进阶示例</td></tr>
  </tbody>
</Table>`,
      state,
    );

    expect(migrated).toContain('| 路径 | 描述 |');
    expect(migrated).toContain('| --- | --- |');
    expect(migrated).toContain('| `/src/example/basic` | 快速开始示例 |');
    expect(state.issues).toContain('normalized-html-table');
    expect(findLegacyResidue(migrated)).toEqual([]);
  });

  it('rewrites complex legacy Table cells to table slots', () => {
    const state = createState(
      'docs/rtc/basic-features/channel-connection.harmonyos.mdx',
    );
    const migrated = transformLegacyMdx(
      `<Table>
  <thead>
    <tr><th>连接状态</th><th>描述</th></tr>
  </thead>
  <tbody>
    <tr><td>DISCONNECTED</td><td>通常发生在：<ul><li>加入频道前。</li><li>离开频道后。</li></ul></td></tr>
  </tbody>
</Table>`,
      state,
    );

    expect(migrated).toContain(
      '| DISCONNECTED | <Slot name="channel-connection-harmonyos-html-0-1-1" /> |',
    );
    expect(migrated).toContain(
      '<Slot for="channel-connection-harmonyos-html-0-1-1">',
    );
    expect(migrated).toContain(
      '通常发生在：\n\n- 加入频道前。\n- 离开频道后。',
    );
    expect(state.issues).toContain('normalized-html-table');
    expect(state.issues).toContain('normalized-table-slot');
    expect(findLegacyResidue(migrated)).toEqual([]);
  });

  it('escapes quoted MDX punctuation inside table slot text', () => {
    const state = createState('docs/meeting/api/create-room.restful.mdx');
    const migrated = transformLegacyMdx(
      `<Table>
  <Tr><Td>参数</Td><Td>描述</Td></Tr>
  <Tr>
    <Td>\`roomUuid\`</Td>
    <Td>支持的字符集范围：<ul><li>"!"、"<"、">"、"{"、"}"</li></ul></Td>
  </Tr>
</Table>`,
      state,
    );

    expect(migrated).toContain('"&lt;"');
    expect(migrated).toContain('"&gt;"');
    expect(migrated).toContain('"&#123;"');
    expect(migrated).toContain('"&#125;"');
    expect(migrated).not.toContain('"<"');
    expect(migrated).not.toContain('">"');
    expect(state.issues).toContain('escaped-mdx-quoted-literal:<');
    expect(state.issues).toContain('escaped-mdx-quoted-literal:{');
    expect(findLegacyResidue(migrated)).toEqual([]);
  });

  it('expands HTML table row and column spans without synthetic headers', () => {
    const state = createState('docs/analytics/overview/billing.mdx');
    const migrated = transformLegacyMdx(
      `<table>
<thead>
  <tr>
    <th colspan="2">子功能</th>
    <th>免费版</th>
    <th>专业版</th>
    <th>旗舰版</th>
  </tr>
</thead>
<tbody>
  <tr>
    <td colspan="2">控制台访问</td>
    <td>✔</td>
    <td>✔</td>
    <td>✔</td>
  </tr>
  <tr>
    <td rowspan="2">Plus 独占功能</td>
    <td>多维度交叉分析</td>
    <td>✘</td>
    <td>✔</td>
    <td>✔</td>
  </tr>
  <tr>
    <td>对比分析</td>
    <td>✘</td>
    <td>✔</td>
    <td>✔</td>
  </tr>
</tbody>
</table>`,
      state,
    );

    expect(migrated).toContain(
      '| 子功能 | 子功能 | 免费版 | 专业版 | 旗舰版 |',
    );
    expect(migrated).toContain('| 控制台访问 |  | ✔ | ✔ | ✔ |');
    expect(migrated).toContain(
      '| Plus 独占功能 | 多维度交叉分析 | ✘ | ✔ | ✔ |',
    );
    expect(migrated).toContain('|  | 对比分析 | ✘ | ✔ | ✔ |');
    expect(migrated).not.toContain('Column 5');
    expect(state.issues).toContain('normalized-html-table');
    expect(state.issues).toContain('normalized-table-span');
  });

  it('uses exported TableHeader labels for legacy Table components', () => {
    const state = createState();
    state.tableHeaders.set('TableHeaderabc', ['参数', '说明']);
    const migrated = transformLegacyMdx(
      `<Table header={TableHeaderabc}>
  <Tr>
    <Td>\`uid\`</Td>
    <Td>用户 ID。</Td>
  </Tr>
</Table>`,
      state,
    );

    expect(migrated).toContain('| 参数 | 说明 |');
    expect(migrated).toContain('| `uid` | 用户 ID。 |');
    expect(state.issues).toContain('normalized-table-header:TableHeaderabc');
    expect(findLegacyResidue(migrated)).toEqual([]);
  });

  it('rewrites legacy LinkCard grids to Cards syntax', () => {
    const state = createState();
    const migrated = transformLegacyMdx(
      `<Row>
  <Col>
    <LinkCardV2 size="small" icon="/img/icons/gitee.svg" href="https://gitee.example/project" title="CustomAudioSource" />
  </Col>
  <Col>
    <LinkCardV2 size="small" icon="/img/icons/github.svg" href="https://github.example/project" title="CustomAudioSource" />
  </Col>
</Row>`,
      state,
    );

    expect(migrated).toContain('<Cards>');
    expect(migrated).toContain(
      '<Card title="CustomAudioSource" href="https://gitee.example/project" />',
    );
    expect(migrated).toContain(
      '<Card title="CustomAudioSource" href="https://github.example/project" />',
    );
    expect(migrated).toContain('</Cards>');
    expect(migrated).not.toContain('LinkCardV2');
    expect(migrated).not.toContain('<Row');
    expect(state.issues).toContain('normalized-link-cards');
    expect(findLegacyResidue(migrated)).toEqual([]);
  });

  it('rewrites standalone legacy LinkBlock cards to Cards syntax', () => {
    const state = createState(
      'docs/conversion-ppt/get-started/quick-start.mdx',
    );
    const migrated = transformLegacyMdx(
      `<LinkBlock icon="/img/icons/quick-start.svg" href={\`./render-ppt\`} title="渲染转码后文档" desc="了解如何使用 @netless/slide 渲染转码后文档。" />

<LinkBlock icon="/img/icons/document.svg" href={\`/doc/conversion-ppt/restful/restful-ppt/operations/post-v5-projector-tasks\`} title="API 参考" desc="查看 PPT 转码服务 RESTful API 参考文档。" />`,
      state,
    );

    expect(migrated).toContain('<Cards>');
    expect(migrated).toContain('title="渲染转码后文档"');
    expect(migrated).toContain('href="./render-ppt"');
    expect(migrated).toContain(
      'description="了解如何使用 @netless/slide 渲染转码后文档。"',
    );
    expect(migrated).toContain('title="API 参考"');
    expect(migrated).toContain(
      'href="/doc/conversion-ppt/restful/restful-ppt/operations/post-v5-projector-tasks"',
    );
    expect(migrated).not.toContain('LinkBlock');
    expect(state.issues).toContain('normalized-link-cards');
    expect(findLegacyResidue(migrated)).toEqual([]);
  });

  it('rewrites static expression hrefs in legacy anchors', () => {
    const state = createState('docs/console/quickstart.mdx');
    const migrated = transformLegacyMdx(
      '详见<a href={"/doc/console/general/user-guides/usage"}>查看用量</a >。',
      state,
    );

    expect(migrated).toContain(
      '详见[查看用量](/doc/console/general/user-guides/usage)。',
    );
    expect(findLegacyResidue(migrated)).toEqual([]);
  });

  it('classifies mapped legacy component residue separately from unknown JSX', async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), 'legacy-docs-map-'));
    const mapPath = path.join(tempRoot, 'component-map.yaml');
    await writeFile(
      mapPath,
      `components:
  Admonition:
    target: directive-callout
    status: automated
families:
  releaseNotes:
    components: [VersionSection, VersionTitle, ListTitle]
    target: markdown-headings
    status: automated
falsePositivePatterns:
  angleBracketLiterals:
    examples:
      - "<YOUR_APP_ID>"
    target: escape-or-code-span
    status: automated-with-review
`,
      'utf8',
    );

    const componentMap = await loadComponentMap(mapPath);

    expect(componentMap.components.get('VersionSection')).toMatchObject({
      family: 'releaseNotes',
      target: 'markdown-headings',
    });
    expect(
      findLegacyResidue(
        '<VersionSection version="v1">x</VersionSection>',
        componentMap,
      ),
    ).toContain('component-map:VersionSection->markdown-headings');
    expect(findLegacyResidue('<MysteryWidget />', componentMap)).toContain(
      'unknown-legacy-component:MysteryWidget',
    );
    expect(findLegacyResidue('`<YOUR_APP_ID>`', componentMap)).toEqual([]);
  });

  it('wraps configured angle-bracket literals in inline code', async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), 'legacy-docs-map-'));
    const mapPath = path.join(tempRoot, 'component-map.yaml');
    await writeFile(
      mapPath,
      `falsePositivePatterns:
  angleBracketLiterals:
    examples:
      - "<YOUR_APP_ID>"
    target: escape-or-code-span
    status: automated-with-review
`,
      'utf8',
    );
    const componentMap = await loadComponentMap(mapPath);
    const state = {
      ...createState(),
      componentMap,
      falsePositiveUsage: new Map(),
    };
    const migrated = transformLegacyMdx('填入 <YOUR_APP_ID> 后继续。', state);

    expect(migrated).toBe('填入 `<YOUR_APP_ID>` 后继续。');
    expect(findLegacyResidue(migrated, componentMap)).toEqual([]);
    expect(state.issues).toContain(
      'escaped-angle-bracket-literal:<YOUR_APP_ID>',
    );
  });

  it('expands needs-platform-expansion targets into MDX files', () => {
    const pathMap = new Map([
      [
        'docs/rtc/advanced-features/custom-audio-source.ios.macos.mdx',
        {
          decisionRefs: 'needs-platform-expansion',
          sourcePath:
            'docs/rtc/advanced-features/custom-audio-source.ios.macos.mdx',
          targetPath:
            'content/docs/zh-CN/realtime-media/rtc/advanced-features/custom-audio-source.ios.macos.mdx',
        },
      ],
    ]);

    expect(
      getOutputPlatformsForSourcePath({
        pathMap,
        sourcePath:
          'docs/rtc/advanced-features/custom-audio-source.ios.macos.mdx',
      }),
    ).toEqual(['ios', 'macos']);
    expect(
      expandPlatformTargetPath({
        platform: 'ios',
        sourcePath:
          'docs/rtc/advanced-features/custom-audio-source.ios.macos.mdx',
        targetPath:
          'content/docs/zh-CN/realtime-media/rtc/advanced-features/custom-audio-source.ios.macos.mdx',
      }),
    ).toBe(
      'content/docs/zh-CN/realtime-media/rtc/advanced-features/custom-audio-source.ios.mdx',
    );
    expect(
      expandPlatformTargetPath({
        platform: 'ios',
        sourcePath:
          'docs/rtc/advanced-features/custom-audio-source.ios.macos.mdx',
        targetPath:
          'content/docs/zh-CN/realtime-media/rtc/advanced-features/custom-audio-source.ios.macos.md',
      }),
    ).toBe(
      'content/docs/zh-CN/realtime-media/rtc/advanced-features/custom-audio-source.ios.mdx',
    );
  });

  it('writes split platform outputs with only the matching PlatformFilter content', async () => {
    const tempRoot = await mkdtemp(
      path.join(os.tmpdir(), 'legacy-docs-migration-'),
    );
    const repoRoot = path.join(tempRoot, 'repo');
    const sourceRoot = path.join(tempRoot, 'source');
    const sourcePath =
      'docs/rtc/advanced-features/custom-audio-source.ios.macos.mdx';

    await mkdir(path.join(sourceRoot, 'docs/rtc/advanced-features'), {
      recursive: true,
    });
    await mkdir(path.join(repoRoot, 'docs/migration'), {
      recursive: true,
    });
    await writeFile(
      path.join(sourceRoot, sourcePath),
      `---
title: 自定义音频采集和渲染
---

公共内容。

<PlatformFilter platformList={['ios']}>

3. 实现自采集模块

    声网提供了 [CustomPcmAudioSource.swift](https://example.com/ios) 示例项目。

</PlatformFilter>

<PlatformFilter platformList={['macos']}>

3. 实现自采集模块

    声网提供了 [CustomAudioSource.swift](https://example.com/macos) 示例项目。

</PlatformFilter>

- <a href={\`/api-ref/rtc/\${frontMatter.ag_platform}/API/example\`}>API</a>
`,
      'utf8',
    );
    await writeFile(
      path.join(repoRoot, 'docs/migration/path-map.csv'),
      [
        'source_path,target_path,migration_action,status,risk,batchable,blocked_reason,next_step,decision_refs',
        `${sourcePath},content/docs/zh-CN/realtime-media/rtc/advanced-features/custom-audio-source.ios.macos.mdx,migrate_page_after_syntax_and_ia_review,needs_review,high,no,,,needs-platform-expansion`,
      ].join('\n'),
      'utf8',
    );
    await writeFile(
      path.join(repoRoot, 'docs/migration/component-map.yaml'),
      `components:
  PlatformFilter:
    target: split-file-or-PlatformStructured
    status: automated-with-review
syntaxPatterns:
  runtimeVariables:
    target: static-evaluate-before-write
    status: automated-with-review
`,
      'utf8',
    );

    const report = await migrateLegacyBatch({
      outDir: 'out',
      pages: [sourcePath],
      pathMap: 'docs/migration/path-map.csv',
      repoRoot,
      sampleCount: 0,
      sourceRoot,
    });
    const ios = await readFile(
      path.join(
        repoRoot,
        'out/content/docs/zh-CN/realtime-media/rtc/advanced-features/custom-audio-source.ios.mdx',
      ),
      'utf8',
    );
    const macos = await readFile(
      path.join(
        repoRoot,
        'out/content/docs/zh-CN/realtime-media/rtc/advanced-features/custom-audio-source.macos.mdx',
      ),
      'utf8',
    );

    expect(
      report.results
        .map((result: { targetPath: string }) => result.targetPath)
        .sort(),
    ).toEqual([
      'content/docs/zh-CN/realtime-media/rtc/advanced-features/custom-audio-source.ios.mdx',
      'content/docs/zh-CN/realtime-media/rtc/advanced-features/custom-audio-source.macos.mdx',
    ]);
    expect(report.componentUsage).toEqual([
      expect.objectContaining({
        name: 'PlatformFilter',
        target: 'split-file-or-PlatformStructured',
      }),
    ]);
    expect(report.syntaxPatternUsage).toEqual([
      expect.objectContaining({
        name: 'runtimeVariables',
        target: 'static-evaluate-before-write',
      }),
    ]);
    expect(ios).toContain('CustomPcmAudioSource.swift');
    expect(ios).not.toContain('CustomAudioSource.swift');
    expect(ios).toContain('/api-ref/rtc/ios/API/example');
    expect(macos).toContain('CustomAudioSource.swift');
    expect(macos).not.toContain('CustomPcmAudioSource.swift');
    expect(macos).toContain('/api-ref/rtc/macos/API/example');
  });

  it('outdents block syntax expanded from indented shared component calls', async () => {
    const tempRoot = await mkdtemp(
      path.join(os.tmpdir(), 'legacy-docs-shared-tabs-'),
    );
    const repoRoot = path.join(tempRoot, 'repo');
    const sourceRoot = path.join(tempRoot, 'source');
    const sourcePath = 'docs/rtm2/get-started/quick-start.ios.mdx';

    await mkdir(path.join(sourceRoot, 'docs/rtm2/get-started'), {
      recursive: true,
    });
    await mkdir(path.join(sourceRoot, 'shared/rtm2'), { recursive: true });
    await mkdir(path.join(repoRoot, 'docs/migration'), { recursive: true });
    await writeFile(
      path.join(sourceRoot, 'shared/rtm2/_sdkdownload.mdx'),
      `<Tabs defaultValue="cdn">
<TabsList>
  <TabsTrigger value="cdn">使用 CDN</TabsTrigger>
  <TabsTrigger value="spm">通过 SPM 集成 SDK</TabsTrigger>
</TabsList>

<TabsContent value="cdn">
下载 SDK。
</TabsContent>

<TabsContent value="spm">
使用 SPM。
</TabsContent>
</Tabs>`,
      'utf8',
    );
    await writeFile(
      path.join(sourceRoot, sourcePath),
      `---
title: 实现收发消息
---

import SDKDownload from '@shared/rtm2/_sdkdownload.mdx'

1. 创建项目。
2. 通过以下任意一种方式获取 SDK。

   <SDKDownload />
`,
      'utf8',
    );
    await writeFile(
      path.join(repoRoot, 'docs/migration/path-map.csv'),
      [
        'source_path,target_path,migration_action,status,risk,batchable,blocked_reason,next_step,decision_refs',
        `${sourcePath},content/docs/zh-CN/realtime-media/rtm/get-started/quick-start.ios.mdx,migrate_page_after_syntax_and_ia_review,needs_review,medium,partial,,,`,
      ].join('\n'),
      'utf8',
    );
    await writeFile(
      path.join(repoRoot, 'docs/migration/component-map.yaml'),
      `components:
  Tabs:
    target: fumadocs-tabs-or-code-tabs
    status: automated
  TabItem:
    target: fumadocs-tabs-or-code-tabs
    status: automated
`,
      'utf8',
    );

    await migrateLegacyBatch({
      outDir: 'out',
      pages: [sourcePath],
      pathMap: 'docs/migration/path-map.csv',
      repoRoot,
      sampleCount: 0,
      sourceRoot,
    });
    const migrated = await readFile(
      path.join(
        repoRoot,
        'out/content/docs/zh-CN/realtime-media/rtm/get-started/quick-start.ios.mdx',
      ),
      'utf8',
    );

    expect(migrated).toContain('\n<Tabs defaultValue="cdn">');
    expect(migrated).toContain('\n</Tabs>');
    expect(migrated).not.toContain('\n   <Tabs');
    expect(migrated).not.toContain('\n   </Tabs>');
  });

  it('expands shared component props and legacy HTML helpers statically', async () => {
    const tempRoot = await mkdtemp(
      path.join(os.tmpdir(), 'legacy-docs-shared-props-'),
    );
    const repoRoot = path.join(tempRoot, 'repo');
    const sourceRoot = path.join(tempRoot, 'source');
    const sourcePath = 'docs/marketplace/get-started/enable-service.mdx';

    await mkdir(path.join(sourceRoot, 'docs/marketplace/get-started'), {
      recursive: true,
    });
    await mkdir(path.join(sourceRoot, 'docs/shared/common'), {
      recursive: true,
    });
    await mkdir(path.join(repoRoot, 'docs/migration'), { recursive: true });
    await writeFile(
      path.join(sourceRoot, 'docs/shared/common/get-temp-token.mdx'),
      `1. 在控制台中点击**添加产品**。
2. <HTML html={props.input} />然后保存好输入的内容。
<HTML html={props.moresteps} />
`,
      'utf8',
    );
    await writeFile(
      path.join(sourceRoot, sourcePath),
      `---
title: 开通服务
---

import Token from '@doc-shared/common/get-temp-token.mdx'

本文介绍如何开通{frontMatter.ag_product_label}服务。

## 获取临时 Token

<Token input="选择 <b>RTC</b> 产品，输入频道名，例如 <code>testChannel</code>。" moresteps="额外保存用户 ID。" />
`,
      'utf8',
    );
    await writeFile(
      path.join(repoRoot, 'docs/migration/path-map.csv'),
      [
        'source_path,target_path,migration_action,status,risk,batchable,blocked_reason,next_step,decision_refs',
        `${sourcePath},content/docs/zh-CN/realtime-media/marketplace/get-started/enable-service.mdx,migrate_page_after_syntax_and_ia_review,needs_review,medium,partial,,,`,
      ].join('\n'),
      'utf8',
    );
    await writeFile(
      path.join(repoRoot, 'docs/migration/component-map.yaml'),
      `families:
  sharedInvocation:
    components: [Token]
    target: static-expand-or-include
    status: automated-with-review
  proseSnippets:
    components: [HTML]
    target: markdown-prose-list-callout-code-or-include
    status: automated-with-review
syntaxPatterns:
  runtimeVariables:
    target: static-evaluate-before-write
    status: automated-with-review
`,
      'utf8',
    );

    const report = await migrateLegacyBatch({
      outDir: 'out',
      pages: [sourcePath],
      pathMap: 'docs/migration/path-map.csv',
      repoRoot,
      sampleCount: 0,
      sourceRoot,
    });
    const migrated = await readFile(
      path.join(
        repoRoot,
        'out/content/docs/zh-CN/realtime-media/marketplace/get-started/enable-service.mdx',
      ),
      'utf8',
    );

    expect(migrated).toContain('本文介绍如何开通云市场服务。');
    expect(migrated).toContain(
      '选择 **RTC** 产品，输入频道名，例如 `testChannel`。然后保存好输入的内容。',
    );
    expect(migrated).toContain('额外保存用户 ID。');
    expect(migrated).not.toContain('<Token');
    expect(migrated).not.toContain('<HTML');
    expect(migrated).not.toContain('props.');
    expect(report.results[0].issues).not.toContain(
      'legacy-residue:legacy-props-var',
    );
  });

  it('reports unresolved legacy links and image references without rewriting them', async () => {
    const tempRoot = await mkdtemp(
      path.join(os.tmpdir(), 'legacy-docs-reference-review-'),
    );
    const repoRoot = path.join(tempRoot, 'repo');
    const sourceRoot = path.join(tempRoot, 'source');
    const sourcePath = 'docs/conversion-ppt/get-started/quick-start.mdx';

    await mkdir(path.join(sourceRoot, 'docs/conversion-ppt/get-started'), {
      recursive: true,
    });
    await mkdir(path.join(repoRoot, 'docs/migration'), {
      recursive: true,
    });
    await writeFile(
      path.join(sourceRoot, sourcePath),
      `---
title: 实现 PPT 转码
---

![PPT 转码流程](/img/conversion-ppt/quick-start.svg)

详见[API 参考](/doc/conversion-ppt/restful/restful-ppt/operations/post-v5-projector-tasks)。

参考[服务端 SDK](https://doc.shengwang.cn/api-ref/rtc-server-sdk/cpp/overview)。

<Cards>
  <Card title="用量" href="/api-ref/console/restful/quota" />
</Cards>

\`\`\`text
[代码里的旧链接](/doc/conversion-ppt/restful/example)
![](/img/conversion-ppt/code.svg)
\`\`\`
`,
      'utf8',
    );
    await writeFile(
      path.join(repoRoot, 'docs/migration/path-map.csv'),
      [
        'source_path,target_path,migration_action,status,risk,batchable,blocked_reason,next_step,decision_refs',
        `${sourcePath},content/docs/zh-CN/api-reference/ppt-conversion-service/get-started/quick-start.mdx,migrate_page_after_syntax_and_ia_review,needs_review,medium,partial,,,needs-image-standard`,
      ].join('\n'),
      'utf8',
    );
    await writeFile(
      path.join(repoRoot, 'docs/migration/component-map.yaml'),
      '',
      'utf8',
    );

    const report = await migrateLegacyBatch({
      outDir: 'out',
      pages: [sourcePath],
      pathMap: 'docs/migration/path-map.csv',
      repoRoot,
      sampleCount: 0,
      sourceRoot,
    });
    const migrated = await readFile(
      path.join(
        repoRoot,
        'out/content/docs/zh-CN/api-reference/ppt-conversion-service/get-started/quick-start.mdx',
      ),
      'utf8',
    );
    const reportMarkdown = await readFile(
      path.join(repoRoot, 'out/report.md'),
      'utf8',
    );

    expect(migrated).toContain(
      '![PPT 转码流程](/img/conversion-ppt/quick-start.svg)',
    );
    expect(report.results[0].issues).toContain('断链:3');
    expect(report.results[0].issues).toContain('图片:1');
    expect(report.results[0].referenceReview).toEqual({
      brokenLinks: [
        '/api-ref/console/restful/quota',
        '/doc/conversion-ppt/restful/restful-ppt/operations/post-v5-projector-tasks',
        'https://doc.shengwang.cn/api-ref/rtc-server-sdk/cpp/overview',
      ],
      images: ['/img/conversion-ppt/quick-start.svg'],
    });
    expect(reportMarkdown).toContain('## 引用检查');
    expect(reportMarkdown).toContain(
      '断链 3: `/api-ref/console/restful/quota`, `/doc/conversion-ppt/restful/restful-ppt/operations/post-v5-projector-tasks`, `https://doc.shengwang.cn/api-ref/rtc-server-sdk/cpp/overview`',
    );
    expect(reportMarkdown).toContain(
      '图片 1: `/img/conversion-ppt/quick-start.svg`',
    );
    expect(reportMarkdown).not.toContain('/img/conversion-ppt/code.svg');
  });

  it('uses an MDX extension even when transformed content is Markdown-only', async () => {
    const tempRoot = await mkdtemp(
      path.join(os.tmpdir(), 'legacy-docs-mdx-output-'),
    );
    const repoRoot = path.join(tempRoot, 'repo');
    const sourceRoot = path.join(tempRoot, 'source');
    const sourcePath = 'docs/rtc/basic-features/plain-guide.md';

    await mkdir(path.join(sourceRoot, 'docs/rtc/basic-features'), {
      recursive: true,
    });
    await mkdir(path.join(repoRoot, 'docs/migration'), {
      recursive: true,
    });
    await writeFile(
      path.join(sourceRoot, sourcePath),
      `---
title: 普通指南
---

这是一段普通 Markdown。
`,
      'utf8',
    );
    await writeFile(
      path.join(repoRoot, 'docs/migration/path-map.csv'),
      [
        'source_path,target_path,migration_action,status,risk,batchable,blocked_reason,next_step,decision_refs',
        `${sourcePath},content/docs/zh-CN/realtime-media/rtc/basic-features/plain-guide.md,migrate_page_after_syntax_and_ia_review,needs_review,high,no,,,`,
      ].join('\n'),
      'utf8',
    );
    await writeFile(
      path.join(repoRoot, 'docs/migration/component-map.yaml'),
      '',
      'utf8',
    );

    const report = await migrateLegacyBatch({
      outDir: 'out',
      pages: [sourcePath],
      pathMap: 'docs/migration/path-map.csv',
      repoRoot,
      sampleCount: 0,
      sourceRoot,
    });
    const [result] = report.results;
    const migrated = await readFile(
      path.join(
        repoRoot,
        'out/content/docs/zh-CN/realtime-media/rtc/basic-features/plain-guide.mdx',
      ),
      'utf8',
    );

    expect(result.targetPath).toBe(
      'content/docs/zh-CN/realtime-media/rtc/basic-features/plain-guide.mdx',
    );
    expect(migrated).toContain('这是一段普通 Markdown。');
  });

  it('writes unmapped legacy Markdown documents as MDX files', async () => {
    const tempRoot = await mkdtemp(
      path.join(os.tmpdir(), 'legacy-docs-unmapped-mdx-'),
    );
    const repoRoot = path.join(tempRoot, 'repo');
    const sourceRoot = path.join(tempRoot, 'source');
    const sourcePath = 'docs/rtc/basic-features/unmapped.md';

    await mkdir(path.join(sourceRoot, 'docs/rtc/basic-features'), {
      recursive: true,
    });
    await mkdir(path.join(repoRoot, 'docs/migration'), {
      recursive: true,
    });
    await writeFile(
      path.join(sourceRoot, sourcePath),
      `---
title: 未映射指南
---

普通内容。
`,
      'utf8',
    );
    await writeFile(
      path.join(repoRoot, 'docs/migration/path-map.csv'),
      'source_path,target_path,migration_action,status,risk,batchable,blocked_reason,next_step,decision_refs\n',
      'utf8',
    );
    await writeFile(
      path.join(repoRoot, 'docs/migration/component-map.yaml'),
      '',
      'utf8',
    );

    const report = await migrateLegacyBatch({
      outDir: 'out',
      pages: [sourcePath],
      pathMap: 'docs/migration/path-map.csv',
      repoRoot,
      sampleCount: 0,
      sourceRoot,
    });
    const migrated = await readFile(
      path.join(repoRoot, 'out/unmapped/docs/rtc/basic-features/unmapped.mdx'),
      'utf8',
    );

    expect(report.results[0].targetPath).toBe('');
    expect(migrated).toContain('普通内容。');
  });
});
