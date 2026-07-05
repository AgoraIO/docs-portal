import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
  auditCompletedMigrationRows,
  auditSingleDocContentFidelity,
  compareRecords,
  createContentFidelityRecords,
  detectLegacyResidue,
  renderMarkdownReport,
} from './audit-single-doc-fidelity.mjs';
import { parseCsv } from './migration-control-table.mjs';

const tempDirs: string[] = [];

describe('auditSingleDocContentFidelity', () => {
  afterEach(async () => {
    await Promise.all(
      tempDirs
        .splice(0)
        .map((dir) => rm(dir, { force: true, recursive: true })),
    );
  });

  it('compares visible content without treating href changes as content drift', async () => {
    const docsRoot = await mkdtemp(path.join(os.tmpdir(), 'doc-fidelity-'));
    tempDirs.push(docsRoot);

    const oldPath = path.join(docsRoot, 'old.mdx');
    const newPath = path.join(docsRoot, 'new.mdx');

    await writeDoc(
      oldPath,
      [
        '---',
        'title: Example',
        '---',
        '',
        '# Intro',
        '',
        '- [SDK quickstart](../../video-calling/get-started/get-started-sdk)',
      ].join('\n'),
    );
    await writeDoc(
      newPath,
      [
        '---',
        'title: Example',
        '---',
        '',
        '# Intro',
        '',
        '- [SDK quickstart](../index.mdx)',
      ].join('\n'),
    );

    const report = auditSingleDocContentFidelity({
      oldPath,
      newPath,
    });

    expect(report.summary.unresolvedDifferences).toBe(0);
    expect(report.summary.exactMatches).toBeGreaterThan(0);
  });

  it('compares nested overload suffix links by visible text', () => {
    const sourceRecords = createContentFidelityRecords({
      content:
        '- <a href={`/api-ref/rtc/${frontMatter.ag_platform}/API/toc_video_enhance_option#api_irtcengine_setfaceshapebeautyoptions`}>`setFaceShapeBeautyOptions`[1/2]</a>',
      location: 'source.mdx',
      side: 'old',
    });
    const targetRecords = createContentFidelityRecords({
      content:
        '- [`setFaceShapeBeautyOptions`[1/2]](/api-ref/rtc/android/API/toc_video_enhance_option#api_irtcengine_setfaceshapebeautyoptions)',
      location: 'target.mdx',
      side: 'new',
    });

    const comparison = compareRecords({ sourceRecords, targetRecords });

    expect(comparison.findings.changed).toEqual([]);
    expect(comparison.findings.extra).toEqual([]);
    expect(comparison.findings.missing).toEqual([]);
  });

  it('treats http code fences migrated to text as equivalent', () => {
    const sourceRecords = createContentFidelityRecords({
      content: ['```http', 'https://example.com/sdk.git', '```'].join('\n'),
      location: 'source.mdx',
      side: 'old',
    });
    const targetRecords = createContentFidelityRecords({
      content: ['```text', 'https://example.com/sdk.git', '```'].join('\n'),
      location: 'target.mdx',
      side: 'new',
    });

    const comparison = compareRecords({ sourceRecords, targetRecords });

    expect(comparison.findings.changed).toEqual([]);
    expect(comparison.findings.extra).toEqual([]);
    expect(comparison.findings.missing).toEqual([]);
  });

  it('matches legacy HTML list paragraphs to markdown paragraph and list items', () => {
    const sourceRecords = createContentFidelityRecords({
      content: [
        '## 调试 App',
        '',
        '参考以下步骤来测试你的 App：',
        '<ol>',
        '<li>将 iOS 设备连接至计算机。</li>',
        '<li>点击 **Build** 来运行你的项目。</li>',
        '</ol>',
      ].join('\n'),
      location: 'source.mdx',
      side: 'old',
    });
    const targetRecords = createContentFidelityRecords({
      content: [
        '## 调试 App',
        '',
        '参考以下步骤来测试你的 App：',
        '',
        '1. 将 iOS 设备连接至计算机。',
        '2. 点击 **Build** 来运行你的项目。',
      ].join('\n'),
      location: 'target.mdx',
      side: 'new',
    });

    const comparison = compareRecords({ sourceRecords, targetRecords });

    expect(comparison.findings.changed).toEqual([]);
    expect(comparison.findings.extra).toEqual([]);
    expect(comparison.findings.missing).toEqual([]);
  });

  it('prefers same-section text-equivalent matches over repeated exact text elsewhere', () => {
    const sourceRecords = createContentFidelityRecords({
      content: [
        '## subscribe',
        '',
        '### 返回值',
        '',
        '无论该方法是否调用成功，元组的第一项都会返回一个 `RtmStatus` 类型的数据，其中字段定义如下：',
        '',
        '## release',
        '',
        '### 返回值',
        '',
        '无论该方法是否调用成功，元组的第一项都会返回一个 `RtmStatus` 类型的数据，其中字段定义如下：',
      ].join('\n'),
      location: 'source.mdx',
      side: 'old',
    });
    const targetRecords = createContentFidelityRecords({
      content: [
        '## subscribe',
        '',
        '### 返回值',
        '',
        '- 无论该方法是否调用成功，元组的第一项都会返回一个 `RtmStatus` 类型的数据，其中字段定义如下：',
        '',
        '## release',
        '',
        '### 返回值',
        '',
        '无论该方法是否调用成功，元组的第一项都会返回一个 `RtmStatus` 类型的数据，其中字段定义如下：',
      ].join('\n'),
      location: 'target.mdx',
      side: 'new',
    });

    const comparison = compareRecords({ sourceRecords, targetRecords });

    expect(comparison.findings.changed).toEqual([]);
    expect(comparison.findings.extra).toEqual([]);
    expect(comparison.findings.missing).toEqual([]);
    expect(comparison.findings.moved).toEqual([]);
  });

  it('ignores standalone dash paragraphs left by expanded legacy snippets', () => {
    const records = createContentFidelityRecords({
      content: ['### 返回值', '', '- ', '', '字段定义如下：'].join('\n'),
      location: 'source.mdx',
      side: 'old',
    });

    expect(records.map((record) => record.value)).not.toContain('-');
    expect(records.map((record) => record.value)).toContain('字段定义如下：');
  });

  it('expands legacy frontMatter product labels before comparing content', async () => {
    const docsRoot = await mkdtemp(path.join(os.tmpdir(), 'doc-fidelity-'));
    tempDirs.push(docsRoot);

    const oldPath = path.join(docsRoot, 'old.mdx');
    const newPath = path.join(docsRoot, 'new.mdx');

    await writeDoc(
      oldPath,
      [
        '---',
        'title: Example',
        '---',
        '',
        '本文介绍如何开通{frontMatter.ag_product_label}服务。',
      ].join('\n'),
    );
    await writeDoc(
      newPath,
      [
        '---',
        'title: Example',
        '---',
        '',
        '本文介绍如何开通media-pull服务。',
      ].join('\n'),
    );

    const report = auditSingleDocContentFidelity({
      oldPath,
      newPath,
      product: 'media-pull',
    });

    expect(report.summary.unresolvedDifferences).toBe(0);
  });

  it('expands expression props and conditionals in legacy shared components', async () => {
    const docsRoot = await mkdtemp(path.join(os.tmpdir(), 'doc-fidelity-'));
    tempDirs.push(docsRoot);

    await mkdir(path.join(docsRoot, 'source/docs/smart-camera/get-started'), {
      recursive: true,
    });
    await mkdir(path.join(docsRoot, 'source/shared/smart-camera'), {
      recursive: true,
    });
    await mkdir(path.join(docsRoot, 'target'), { recursive: true });

    const oldPath = path.join(
      docsRoot,
      'source/docs/smart-camera/get-started/quick-start.mdx',
    );
    const sharedPath = path.join(
      docsRoot,
      'source/shared/smart-camera/quick-start.mdx',
    );
    const newPath = path.join(docsRoot, 'target/quick-start.mdx');

    await writeDoc(
      sharedPath,
      [
        '{props.ag_product_label}场景。',
        '',
        '{props.type === "show" && 显示秀场。 }',
        '',
        '{props.type === "chat" && 显示通话。 }',
      ].join('\n'),
    );
    await writeDoc(
      oldPath,
      [
        '---',
        'title: Example',
        '---',
        '',
        "import Quickstart from '@shared/smart-camera/quick-start.mdx';",
        '',
        '<Quickstart ag_product_label={frontMatter.ag_product_label} type="chat" />',
      ].join('\n'),
    );
    await writeDoc(
      newPath,
      [
        '---',
        'title: Example',
        '---',
        '',
        'smart-camera场景。',
        '',
        '显示通话。',
      ].join('\n'),
    );

    const report = auditSingleDocContentFidelity({
      oldPath,
      newPath,
      product: 'smart-camera',
      sourceRoot: path.join(docsRoot, 'source'),
    });

    expect(report.summary.unresolvedDifferences).toBe(0);
  });

  it('normalizes legacy landing components to equivalent Markdown records', () => {
    const sourceRecords = createContentFidelityRecords({
      content: [
        '<ListPanelAV2 img="/img/art.png" title="PaaS 方案" desc="集成不同功能的 SDK" links={[{ title: "方案介绍", href: "./overview/product-overview" }]}>',
        '<ListItem type="check">分别集成 RTC、RTM、白板和云端录制</ListItem>',
        '</ListPanelAV2>',
        '',
        '<Text color="green">通话音量</Text>',
        '',
        '<H3 className="anchor" id="login">login</H3>',
      ].join('\n'),
      location: 'source.mdx',
      side: 'old',
    });
    const targetRecords = createContentFidelityRecords({
      content: [
        '![PaaS 方案](/img/art.png)',
        '',
        '- **PaaS 方案**：集成不同功能的 SDK',
        '  - 分别集成 RTC、RTM、白板和云端录制',
        '  - [方案介绍](./overview/product-overview)',
        '',
        '通话音量',
        '',
        '### login',
      ].join('\n'),
      location: 'target.mdx',
      side: 'new',
    });

    const comparison = compareRecords({ sourceRecords, targetRecords });

    expect(comparison.findings.changed).toEqual([]);
    expect(comparison.findings.extra).toEqual([]);
    expect(comparison.findings.missing).toEqual([]);
  });

  it('normalizes legacy card and release-note wrappers to visible records', () => {
    const sourceRecords = createContentFidelityRecords({
      content: [
        '<ProductOverview>',
        '产品介绍。',
        '</ProductOverview>',
        '',
        '<Row>',
        '<Col>',
        '<QuickStartCard title="实现 AI 语音助手" text="集成 SDK" link="./quick-start" />',
        '</Col>',
        '</Row>',
        '',
        '<LinkBlock href="/api-ref/aigc/android/aigcservice" title="API 参考" />',
        '',
        '<VersionSection version="v1.0.0">',
        '<VersionTitle>新增功能</VersionTitle>',
        '</VersionSection>',
      ].join('\n'),
      location: 'source.mdx',
      side: 'old',
    });
    const targetRecords = createContentFidelityRecords({
      content: [
        '产品介绍。',
        '',
        '- 实现 AI 语音助手',
        '',
        '<Cards>',
        '  <Card title="API 参考" href="/zh-CN/api-reference/aigc/aigcservice.android" />',
        '</Cards>',
        '',
        '## v1.0.0',
        '',
        '### 新增功能',
      ].join('\n'),
      location: 'target.mdx',
      side: 'new',
    });

    const comparison = compareRecords({ sourceRecords, targetRecords });

    expect(comparison.findings.changed).toEqual([]);
    expect(comparison.findings.extra).toEqual([]);
    expect(comparison.findings.missing).toEqual([]);
    expect(comparison.findings.unsupported).toEqual([]);
  });

  it('treats table-cell list markers and punctuation spacing as equivalent', () => {
    const sourceRecords = createContentFidelityRecords({
      content: [
        '| 参数 | 描述 |',
        '| --- | --- |',
        '| videoState | 是否有发视频流的权限：0 : （默认）不发视频流。 1 : 发视频流。 |',
        '| note | 创建项目后， Android Studio 会自动同步。 |',
      ].join('\n'),
      location: 'source.mdx',
      side: 'old',
    });
    const targetRecords = createContentFidelityRecords({
      content: [
        '| 参数 | 描述 |',
        '| --- | --- |',
        '| videoState | 是否有发视频流的权限：- 0:（默认）不发视频流。 - 1:发视频流。 |',
        '| note | 创建项目后，Android Studio 会自动同步。 |',
      ].join('\n'),
      location: 'target.mdx',
      side: 'new',
    });

    const comparison = compareRecords({ sourceRecords, targetRecords });

    expect(comparison.findings.changed).toEqual([]);
    expect(comparison.findings.extra).toEqual([]);
    expect(comparison.findings.missing).toEqual([]);
  });

  it('treats code identifier spacing inside parentheses as equivalent', () => {
    const sourceRecords = createContentFidelityRecords({
      content: '- 1 次登录 ( config.login ) 请求计作 1 条消息。',
      location: 'source.mdx',
      side: 'old',
    });
    const targetRecords = createContentFidelityRecords({
      content: '- 1 次登录 (`config.login`) 请求计作 1 条消息。',
      location: 'target.mdx',
      side: 'new',
    });

    const comparison = compareRecords({ sourceRecords, targetRecords });

    expect(comparison.findings.changed).toEqual([]);
  });

  it('treats method overload fraction spacing as equivalent', () => {
    const sourceRecords = createContentFidelityRecords({
      content:
        '你可以通过以下方式调用 publishTopicMessage 1/2 和 publishTopicMessage 2/2 方法：',
      location: 'source.mdx',
      side: 'old',
    });
    const targetRecords = createContentFidelityRecords({
      content:
        '你可以通过以下方式调用 `publishTopicMessage`[1/2] 和 `publishTopicMessage`[2/2] 方法：',
      location: 'target.mdx',
      side: 'new',
    });

    const comparison = compareRecords({ sourceRecords, targetRecords });

    expect(comparison.findings.changed).toEqual([]);
    expect(comparison.findings.extra).toEqual([]);
    expect(comparison.findings.missing).toEqual([]);
  });

  it('normalizes legacy HTML tables with row spans to markdown table rows', () => {
    const sourceRecords = createContentFidelityRecords({
      content: [
        '<table>',
        '<thead>',
        '<tr><th>模块</th><th>功能</th></tr>',
        '</thead>',
        '<tbody>',
        '<tr>',
        '<td rowspan="2">房间</td>',
        '<td>配置课堂开始时间，详见 <a href="/api-ref/classroom#launchoption">LaunchOption</a> 中的 <code>startTime</code> 字段说明。</td>',
        '</tr>',
        '<tr>',
        '<td>配置课堂持续时间，详见 <a href="/api-ref/classroom#launchoption">LaunchOption</a> 中的 <code>duration</code> 字段说明。</td>',
        '</tr>',
        '</tbody>',
        '</table>',
      ].join('\n'),
      location: 'source.mdx',
      side: 'old',
    });
    const targetRecords = createContentFidelityRecords({
      content: [
        '| 模块 | 功能 |',
        '| --- | --- |',
        '| 房间 | 配置课堂开始时间，详见 [LaunchOption](/api-ref/classroom#launchoption) 中的 `startTime` 字段说明。 |',
        '|  | 配置课堂持续时间，详见 [LaunchOption](/api-ref/classroom#launchoption) 中的 `duration` 字段说明。 |',
      ].join('\n'),
      location: 'target.mdx',
      side: 'new',
    });

    const comparison = compareRecords({ sourceRecords, targetRecords });

    expect(comparison.findings.changed).toEqual([]);
    expect(comparison.findings.extra).toEqual([]);
    expect(comparison.findings.missing).toEqual([]);
  });

  it('matches API category tables migrated to categorized lists', () => {
    const sourceRecords = createContentFidelityRecords({
      content: [
        '| API | 插件类型 |',
        '| :--- | :--- |',
        '| `enableVirtualBackground` | 虚拟背景插件 |',
        '| <ul><li>`setBeautyEffectOptions`</li><li>`setVideoDenoiserOptions`</li></ul> | 视频增强插件 |',
      ].join('\n'),
      location: 'source.mdx',
      side: 'old',
    });
    const targetRecords = createContentFidelityRecords({
      content: [
        '- 虚拟背景插件：`enableVirtualBackground`',
        '- 视频增强插件：',
        '  - `setBeautyEffectOptions`',
        '  - `setVideoDenoiserOptions`',
      ].join('\n'),
      location: 'target.mdx',
      side: 'new',
    });

    const comparison = compareRecords({ sourceRecords, targetRecords });

    expect(comparison.findings.changed).toEqual([]);
    expect(comparison.findings.extra).toEqual([]);
    expect(comparison.findings.missing).toEqual([]);
  });

  it('does not count code fence tab labels duplicated by the first code comment', () => {
    const sourceRecords = createContentFidelityRecords({
      content: ['```swift', '// async-await', 'joinTopic()', '```'].join('\n'),
      location: 'source.mdx',
      side: 'old',
    });
    const targetRecords = createContentFidelityRecords({
      content: [
        '```swift tab="async-await"',
        '// async-await',
        'joinTopic()',
        '```',
      ].join('\n'),
      location: 'target.mdx',
      side: 'new',
    });

    const comparison = compareRecords({ sourceRecords, targetRecords });

    expect(comparison.findings.changed).toEqual([]);
    expect(comparison.findings.extra).toEqual([]);
    expect(comparison.findings.missing).toEqual([]);
  });

  it('normalizes equivalent code blank-line density', () => {
    const sourceRecords = createContentFidelityRecords({
      content: [
        '```cpp',
        'struct Point {',
        '  float x;',
        '};',
        '',
        '',
        'Point point;',
        '```',
      ].join('\n'),
      location: 'source.mdx',
      side: 'old',
    });
    const targetRecords = createContentFidelityRecords({
      content: [
        '```cpp',
        'struct Point {',
        '  float x;',
        '};',
        '',
        'Point point;',
        '```',
      ].join('\n'),
      location: 'target.mdx',
      side: 'new',
    });

    const comparison = compareRecords({ sourceRecords, targetRecords });

    expect(comparison.findings.changed).toEqual([]);
  });

  it('expands legacy shared imports and applies platform projection', async () => {
    const docsRoot = await mkdtemp(path.join(os.tmpdir(), 'doc-fidelity-'));
    tempDirs.push(docsRoot);

    const sharedPath = path.join(docsRoot, 'shared', 'snippet.mdx');
    const docSharedPath = path.join(docsRoot, 'docs/shared/common/snippet.mdx');
    const oldPath = path.join(docsRoot, 'legacy', 'page.mdx');
    const newPath = path.join(docsRoot, 'portal', 'page.mdx');

    await writeDoc(sharedPath, 'Shared body');
    await writeDoc(docSharedPath, 'Doc shared body');
    await writeDoc(
      oldPath,
      [
        "import SharedBlock from '@shared/snippet';",
        "import DocSharedBlock from '@doc-shared/common/snippet';",
        '',
        '# Title',
        '',
        '<PlatformWrapper platform="android">',
        'Android only line',
        '</PlatformWrapper>',
        '',
        '<SharedBlock />',
        '',
        '<DocSharedBlock />',
      ].join('\n'),
    );
    await writeDoc(
      newPath,
      [
        '# Title',
        '',
        '<PlatformStructured platform="android">',
        'Android only line',
        '</PlatformStructured>',
        '',
        '<include>./snippet.mdx</include>',
        '',
        'Doc shared body',
      ].join('\n'),
    );
    await writeDoc(path.join(docsRoot, 'portal', 'snippet.mdx'), 'Shared body');

    const report = auditSingleDocContentFidelity({
      oldPath,
      newPath,
      platform: 'android',
      sourceRoot: docsRoot,
    });

    expect(report.summary.unresolvedDifferences).toBe(0);
  });

  it('keeps JavaScript import statements inside legacy code fences', async () => {
    const docsRoot = await mkdtemp(path.join(os.tmpdir(), 'doc-fidelity-'));
    tempDirs.push(docsRoot);

    const oldPath = path.join(docsRoot, 'old.mdx');
    const newPath = path.join(docsRoot, 'new.mdx');
    const content = [
      '# Hook',
      '',
      '```jsx',
      'import { useConnectionState } from "agora-rtc-react";',
      '',
      'function App() {',
      '  return useConnectionState();',
      '}',
      '```',
    ].join('\n');

    await writeDoc(oldPath, content);
    await writeDoc(newPath, content);

    const report = auditSingleDocContentFidelity({
      oldPath,
      newPath,
      sourceRoot: docsRoot,
    });

    expect(report.summary.unresolvedDifferences).toBe(0);
  });

  it('resolves namespace shared platform maps during legacy audit', async () => {
    const docsRoot = await mkdtemp(path.join(os.tmpdir(), 'doc-fidelity-'));
    tempDirs.push(docsRoot);

    const sharedPath = path.join(docsRoot, 'shared/rtm2/_error-codes.mdx');
    const oldPath = path.join(docsRoot, 'docs/rtm2/overview/release-notes.android.mdx');
    const newPath = path.join(
      docsRoot,
      'content/docs/zh-CN/realtime-media/rtm/overview/release-notes.android.mdx',
    );

    await writeDoc(
      sharedPath,
      [
        'export const rtmrenewtokentimeout = {',
        '  android: "RENEW_TOKEN_TIMEOUT",',
        '  ios: "AgoraRtmErrorRenewTokenTimeout",',
        '};',
      ].join('\n'),
    );
    await writeDoc(
      oldPath,
      [
        "import * as code from '@shared/rtm2/_error-codes.mdx'",
        '',
        '为反馈更新 Token 操作的结果，该版本新增错误码 <code>{code.rtmrenewtokentimeout[frontMatter.ag_platform]}</code> (10026)。',
      ].join('\n'),
    );
    await writeDoc(
      newPath,
      '为反馈更新 Token 操作的结果，该版本新增错误码 `RENEW_TOKEN_TIMEOUT` (10026)。\n',
    );

    const report = auditSingleDocContentFidelity({
      oldPath,
      newPath,
      platform: 'android',
      sourceRoot: docsRoot,
    });

    expect(report.summary.unresolvedDifferences).toBe(0);
  });

  it('expands shared component props that contain inline HTML attributes', async () => {
    const docsRoot = await mkdtemp(path.join(os.tmpdir(), 'doc-fidelity-'));
    tempDirs.push(docsRoot);

    const sharedPath = path.join(
      docsRoot,
      'docs/shared/rtcandgame/spatial-audio-unity.mdx',
    );
    const oldPath = path.join(docsRoot, 'docs/game-voice/user-guides/spatial-audio-sdk.unity.mdx');
    const newPath = path.join(
      docsRoot,
      'content/docs/zh-CN/solutions/game-voice/user-guides/spatial-audio-sdk.unity.mdx',
    );

    await writeDoc(
      sharedPath,
      '在进行操作之前，请确保你已经实现基本功能。详见<HTML html={props.req2} />。',
    );
    await writeDoc(
      oldPath,
      [
        "import Spatial from '@doc-shared/rtcandgame/spatial-audio-unity.mdx'",
        '',
        '<Spatial req2="<a href=\'/doc/game-voice/unity/get-started/audio-quick-start\'>实现语音互动</a>" />',
      ].join('\n'),
    );
    await writeDoc(
      newPath,
      '在进行操作之前，请确保你已经实现基本功能。详见[实现语音互动](/zh-CN/solutions/game-voice/get-started/audio-quick-start)。\n',
    );

    const report = auditSingleDocContentFidelity({
      oldPath,
      newPath,
      platform: 'unity',
      sourceRoot: docsRoot,
    });

    expect(report.summary.unresolvedDifferences).toBe(0);
  });

  it('strips nested platform filters when auditing all-platform pages', async () => {
    const docsRoot = await mkdtemp(path.join(os.tmpdir(), 'doc-fidelity-'));
    tempDirs.push(docsRoot);

    const oldPath = path.join(docsRoot, 'legacy', 'page.mdx');
    const newPath = path.join(docsRoot, 'portal', 'page.mdx');

    await writeDoc(
      oldPath,
      [
        "<PlatformFilter platformList={['android', 'ios']}>",
        '',
        '### 实时审核（鉴黄）',
        '',
        "<PlatformFilter platformList={['android']}>",
        'Android 审核实时音视频涉黄内容。详见视频审核。',
        '</PlatformFilter>',
        '',
        "<PlatformFilter platformList={['ios']}>",
        'iOS 审核实时音视频涉黄内容。详见视频审核。',
        '</PlatformFilter>',
        '',
        '</PlatformFilter>',
      ].join('\n'),
    );
    await writeDoc(
      newPath,
      [
        '### 实时审核（鉴黄）',
        '',
        'Android 审核实时音视频涉黄内容。详见视频审核。',
        '',
        'iOS 审核实时音视频涉黄内容。详见视频审核。',
      ].join('\n'),
    );

    const report = auditSingleDocContentFidelity({
      oldPath,
      newPath,
    });

    expect(report.findings.unsupported).toEqual([]);
    expect(report.summary.unresolvedDifferences).toBe(0);
  });

  it('treats api-shared multiline table snippets and target slots as equivalent', async () => {
    const docsRoot = await mkdtemp(path.join(os.tmpdir(), 'doc-fidelity-'));
    tempDirs.push(docsRoot);

    const sharedPath = path.join(
      docsRoot,
      'docs-api-reference/shared/flexible-classroom/_character-set.mdx',
    );
    const oldPath = path.join(
      docsRoot,
      'docs-api-reference/flexible-classroom/classroom-sdk.android.mdx',
    );
    const newPath = path.join(
      docsRoot,
      'content/docs/zh-CN/api-reference/flexible-classroom/classroom-sdk.android.mdx',
    );

    await writeDoc(
      sharedPath,
      [
        '以下为支持的字符集范围（共 89 个字符）:',
        '- 26 个小写英文字母 a-Z',
        '- `$`, `|`',
      ].join('\n'),
    );
    await writeDoc(
      oldPath,
      [
        "import Set from '@api-shared/flexible-classroom/_character-set.mdx'",
        '',
        '| 属性 | 描述 |',
        '| --- | --- |',
        '| `userName` | 用户名，用于课堂内显示，长度在 64 字节以内。<Set ag_platform={frontMatter.ag_platform} /> |',
        '| `roleType` | 用户角色。 |',
      ].join('\n'),
    );
    await writeDoc(
      newPath,
      [
        '| 属性 | 描述 |',
        '| --- | --- |',
        '| `userName` | <Slot name="launch-user-name" /> |',
        '| `roleType` | 用户角色。 |',
        '',
        '<Slot for="launch-user-name">',
        '',
        '用户名，用于课堂内显示，长度在 64 字节以内。以下为支持的字符集范围（共 89 个字符）:',
        '',
        '- 26 个小写英文字母 a-Z',
        '- `$`, `|`',
        '',
        '</Slot>',
      ].join('\n'),
    );

    const report = auditSingleDocContentFidelity({
      oldPath,
      newPath,
      sourceRoot: docsRoot,
    });

    expect(report.summary.unresolvedDifferences).toBe(0);
  });

  it('keeps tab labels and flags removed content blocks', () => {
    const sourceRecords = createContentFidelityRecords({
      content: [
        '<Tabs defaultValue="android">',
        '<TabsList>',
        '<TabsTrigger value="android">Android</TabsTrigger>',
        '</TabsList>',
        '<TabsContent value="android">',
        '```ts',
        'join();',
        '```',
        '</TabsContent>',
        '</Tabs>',
      ].join('\n'),
      location: 'source.mdx',
      side: 'old',
    });
    const targetRecords = createContentFidelityRecords({
      content: ['```ts', 'joinLater();', '```'].join('\n'),
      location: 'target.mdx',
      side: 'new',
    });

    const tabRecord = sourceRecords.find((record) => record.kind === 'tab');
    expect(tabRecord?.value).toBe('Android');

    const comparison = compareRecords({
      sourceRecords,
      targetRecords,
    });

    expect(comparison.findings.changed).toEqual([
      expect.objectContaining({
        source: expect.objectContaining({ kind: 'code:ts' }),
        target: expect.objectContaining({ kind: 'code:ts' }),
      }),
    ]);
    expect(comparison.matches.exact).toBe(0);
  });

  it('normalizes indented Docusaurus tab code fences as code blocks', () => {
    const sourceRecords = createContentFidelityRecords({
      content: [
        '<Tabs>',
        '  <TabItem value="join" label="Join">',
        '    ```csharp showLineNumbers',
        '    {',
        '      "type": "REMOTE_JOIN"',
        '    }',
        '    ```',
        '  </TabItem>',
        '</Tabs>',
      ].join('\n'),
      location: 'source.mdx',
      side: 'old',
    });
    const targetRecords = createContentFidelityRecords({
      content: [
        '```csharp tab="Join"',
        '{',
        '  "type": "REMOTE_JOIN"',
        '}',
        '```',
      ].join('\n'),
      location: 'target.mdx',
      side: 'new',
    });

    const comparison = compareRecords({ sourceRecords, targetRecords });

    expect(comparison.findings.changed).toEqual([]);
    expect(comparison.findings.missing).toEqual([]);
    expect(comparison.findings.extra).toEqual([]);
  });

  it('matches legacy HTML list paragraphs to Markdown list records', () => {
    const sourceRecords = createContentFidelityRecords({
      content: [
        '<ul>',
        '<li>`0`：CN_Hangzhou</li>',
        '<li>`1`：CN_Shanghai</li>',
        '</ul>',
      ].join('\n'),
      location: 'source.mdx',
      side: 'old',
    });
    const targetRecords = createContentFidelityRecords({
      content: ['- `0`：CN_Hangzhou', '- `1`：CN_Shanghai'].join('\n'),
      location: 'target.mdx',
      side: 'new',
    });

    const comparison = compareRecords({ sourceRecords, targetRecords });

    expect(comparison.findings.changed).toEqual([]);
    expect(comparison.findings.missing).toEqual([]);
    expect(comparison.findings.extra).toEqual([]);
  });

  it('treats identical paragraph and list item text as equivalent', () => {
    const sourceRecords = createContentFidelityRecords({
      content: '无论该方法是否调用成功，元组的第一项都会返回一个 `RtmStatus` 类型的数据，其中字段定义如下：',
      location: 'source.mdx',
      side: 'old',
    });
    const targetRecords = createContentFidelityRecords({
      content: '- 无论该方法是否调用成功，元组的第一项都会返回一个 `RtmStatus` 类型的数据，其中字段定义如下：',
      location: 'target.mdx',
      side: 'new',
    });

    const comparison = compareRecords({ sourceRecords, targetRecords });

    expect(comparison.findings.changed).toEqual([]);
    expect(comparison.findings.missing).toEqual([]);
    expect(comparison.findings.extra).toEqual([]);
  });

  it('does not count tab trigger relocation as content drift', () => {
    const sourceRecords = createContentFidelityRecords({
      content: [
        '<Tabs>',
        '<TabItem value="ios" label="iOS">',
        'iOS 内容。',
        '</TabItem>',
        '<TabItem value="android" label="Android">',
        'Android 内容。',
        '</TabItem>',
        '</Tabs>',
      ].join('\n'),
      location: 'source.mdx',
      side: 'old',
    });
    const targetRecords = createContentFidelityRecords({
      content: [
        '<Tabs defaultValue="ios">',
        '<TabsList>',
        '<TabsTrigger value="ios">iOS</TabsTrigger>',
        '<TabsTrigger value="android">Android</TabsTrigger>',
        '</TabsList>',
        '<TabsContent value="ios">',
        'iOS 内容。',
        '</TabsContent>',
        '<TabsContent value="android">',
        'Android 内容。',
        '</TabsContent>',
        '</Tabs>',
      ].join('\n'),
      location: 'target.mdx',
      side: 'new',
    });

    const comparison = compareRecords({ sourceRecords, targetRecords });

    expect(comparison.findings.moved).toEqual([]);
    expect(comparison.findings.missing).toEqual([]);
    expect(comparison.findings.extra).toEqual([]);
  });

  it('detects legacy component residue and keeps the markdown report concise', async () => {
    const docsRoot = await mkdtemp(path.join(os.tmpdir(), 'doc-fidelity-'));
    tempDirs.push(docsRoot);

    const oldPath = path.join(docsRoot, 'old.mdx');
    const newPath = path.join(docsRoot, 'new.mdx');

    await writeDoc(oldPath, ['# Intro', '', 'Important note.'].join('\n'));
    await writeDoc(
      newPath,
      [
        '# Intro',
        '',
        '<Admonition type="info">',
        'Important note.',
        '</Admonition>',
        '',
        "import Shared from '@shared/common/foo.mdx';",
      ].join('\n'),
    );

    const report = auditSingleDocContentFidelity({ oldPath, newPath });
    const markdown = renderMarkdownReport(report);

    expect(report.summary.legacyResidue).toBe(3);
    expect(report.findings.legacyResidue.examples).toEqual([
      'legacy-component:Admonition',
      'legacy-shared-import',
    ]);
    expect(markdown).toContain('Legacy residue: 3 issue(s); examples:');
    expect(markdown).not.toContain('## Legacy residue');
  });

  it('ignores approved target MDX components and code examples in residue checks', () => {
    const residue = detectLegacyResidue(
      [
        '<Tabs defaultValue="js">',
        '<TabsContent value="js">Content</TabsContent>',
        '</Tabs>',
        '',
        '```mdx',
        '<Admonition type="info">Example only</Admonition>',
        '```',
        '',
        '`<PlatformFilter>` is mentioned as text.',
      ].join('\n'),
    );

    expect(residue.total).toBe(0);
  });

  it('audits only completed migration rows and writes audit progress back', async () => {
    const docsRoot = await mkdtemp(
      path.join(os.tmpdir(), 'doc-fidelity-batch-'),
    );
    tempDirs.push(docsRoot);

    const sourceRoot = path.join(docsRoot, 'source');
    const targetRoot = path.join(docsRoot, 'target');
    const pathMapPath = path.join(docsRoot, 'path-map.csv');
    const completedSourcePath = 'docs/rtc/get-started/quick-start.ios.mdx';
    const completedTargetPath =
      'content/docs/zh-CN/realtime-media/rtc/get-started/quick-start.ios.mdx';
    const pendingSourcePath = 'docs/rtc/get-started/run-demo.ios.mdx';
    const pendingTargetPath =
      'content/docs/zh-CN/realtime-media/rtc/get-started/run-demo.ios.mdx';
    const metadataSourcePath = 'docs/rtc/_sidebar_.meta.js';
    const metadataTargetPath =
      'content/docs/zh-CN/realtime-media/rtc/_sidebar_.meta.mdx';

    await writeDoc(
      path.join(sourceRoot, completedSourcePath),
      ['# 快速开始', '', '加入频道。'].join('\n'),
    );
    await writeDoc(
      path.join(targetRoot, completedTargetPath),
      ['# 快速开始', '', '加入频道。'].join('\n'),
    );
    await writeDoc(
      path.join(sourceRoot, pendingSourcePath),
      ['# 跑通示例', '', '运行项目。'].join('\n'),
    );
    await writeDoc(
      path.join(targetRoot, pendingTargetPath),
      ['# 跑通示例', '', '运行项目。'].join('\n'),
    );
    await writeDoc(
      path.join(sourceRoot, metadataSourcePath),
      ['# 旧元数据', '', '不应审计。'].join('\n'),
    );
    await writeDoc(
      path.join(targetRoot, metadataTargetPath),
      ['# 旧元数据', '', '不应审计。'].join('\n'),
    );
    await writeFile(
      pathMapPath,
      [
        'source_path,target_path,migration_action,status,risk,batchable,blocked_reason,next_step,decision_refs,redirect_status,migration_progress,audit_progress,audit_result,last_migration_report,last_audit_report,updated_at',
        `${completedSourcePath},${completedTargetPath},migrate_page_after_syntax_and_ia_review,needs_review,low,yes,,,,redirect,completed,pending,,,,`,
        `${pendingSourcePath},${pendingTargetPath},migrate_page_after_syntax_and_ia_review,needs_review,low,yes,,,,redirect,not_started,not_started,,,,`,
        `${metadataSourcePath},${metadataTargetPath},metadata,needs_review,low,no,,,,no-redirect,completed,pending,,,,`,
      ].join('\n'),
    );

    const report = await auditCompletedMigrationRows({
      outDir: path.join(docsRoot, 'audit'),
      pathMap: pathMapPath,
      repoRoot: docsRoot,
      sourceRoot,
      targetRoot,
    });

    expect(report.summary).toMatchObject({
      auditedRows: 1,
      eligibleRows: 1,
      passed: 1,
    });

    const rows = parseCsv(await readFile(pathMapPath, 'utf8'));
    const headers = rows[0];
    const completedValues = Object.fromEntries(
      headers.map((header: string, index: number) => [header, rows[1][index]]),
    );
    const pendingValues = Object.fromEntries(
      headers.map((header: string, index: number) => [header, rows[2][index]]),
    );

    expect(completedValues.audit_progress).toBe('completed');
    expect(completedValues.audit_result).toBe('pass');
    expect(completedValues.last_audit_report).toContain('audit/');
    expect(pendingValues.audit_progress).toBe('not_started');
    expect(pendingValues.audit_result).toBe('');
  });

  it('writes legacy component residue results back during batch audit', async () => {
    const docsRoot = await mkdtemp(
      path.join(os.tmpdir(), 'doc-fidelity-batch-'),
    );
    tempDirs.push(docsRoot);

    const sourceRoot = path.join(docsRoot, 'source');
    const targetRoot = path.join(docsRoot, 'target');
    const pathMapPath = path.join(docsRoot, 'path-map.csv');
    const sourcePath = 'docs/rtc/get-started/quick-start.ios.mdx';
    const targetPath =
      'content/docs/zh-CN/realtime-media/rtc/get-started/quick-start.ios.mdx';

    await writeDoc(
      path.join(sourceRoot, sourcePath),
      ['# 快速开始', '', '加入频道。'].join('\n'),
    );
    await writeDoc(
      path.join(targetRoot, targetPath),
      [
        '# 快速开始',
        '',
        '<Admonition type="info">',
        '加入频道。',
        '</Admonition>',
      ].join('\n'),
    );
    await writeFile(
      pathMapPath,
      [
        'source_path,target_path,migration_action,status,risk,batchable,blocked_reason,next_step,decision_refs,migration_progress,audit_progress,audit_result,last_migration_report,last_audit_report,updated_at',
        `${sourcePath},${targetPath},migrate_page_after_syntax_and_ia_review,needs_review,low,yes,,,,completed,pending,,,,`,
      ].join('\n'),
    );

    const report = await auditCompletedMigrationRows({
      outDir: path.join(docsRoot, 'audit'),
      pathMap: pathMapPath,
      repoRoot: docsRoot,
      sourceRoot,
      targetRoot,
    });
    const rows = parseCsv(await readFile(pathMapPath, 'utf8'));
    const headers = rows[0];
    const values = Object.fromEntries(
      headers.map((header: string, index: number) => [header, rows[1][index]]),
    );

    expect(report.summary.legacyResidue).toBe(1);
    expect(values.audit_progress).toBe('completed');
    expect(values.audit_result).toBe('legacy-residue:2');
    expect(values.next_step).toBe(
      'Remove legacy component residue and rerun the audit script.',
    );
  });

  it('writes batch audit results by source and target for split targets', async () => {
    const docsRoot = await mkdtemp(
      path.join(os.tmpdir(), 'doc-fidelity-split-targets-'),
    );
    tempDirs.push(docsRoot);

    const sourceRoot = path.join(docsRoot, 'source');
    const targetRoot = path.join(docsRoot, 'target');
    const pathMapPath = path.join(docsRoot, 'path-map.csv');
    const sourcePath =
      'docs/rtc/advanced-features/custom-audio-source.ios.macos.mdx';
    const iosTargetPath =
      'content/docs/zh-CN/realtime-media/rtc/advanced-features/custom-audio-source.ios.mdx';
    const macosTargetPath =
      'content/docs/zh-CN/realtime-media/rtc/advanced-features/custom-audio-source.macos.mdx';

    await writeDoc(
      path.join(sourceRoot, sourcePath),
      [
        "<PlatformFilter platformList={['ios']}>",
        '',
        'iOS 内容。',
        '',
        '</PlatformFilter>',
        '',
        "<PlatformFilter platformList={['macos']}>",
        '',
        'macOS 内容。',
        '',
        '</PlatformFilter>',
      ].join('\n'),
    );
    await writeDoc(path.join(targetRoot, iosTargetPath), 'iOS 内容。\n');
    await writeDoc(path.join(targetRoot, macosTargetPath), '错误内容。\n');
    await writeFile(
      pathMapPath,
      [
        'source_path,target_path,migration_action,status,risk,batchable,blocked_reason,next_step,decision_refs,migration_progress,audit_progress,audit_result,last_migration_report,last_audit_report,updated_at',
        `${sourcePath},${iosTargetPath},migrate_page_after_syntax_and_ia_review,needs_review,low,yes,,,,completed,pending,,,,`,
        `${sourcePath},${macosTargetPath},migrate_page_after_syntax_and_ia_review,needs_review,low,yes,,,,completed,pending,,,,`,
      ].join('\n'),
    );

    const report = await auditCompletedMigrationRows({
      outDir: path.join(docsRoot, 'audit'),
      pathMap: pathMapPath,
      repoRoot: docsRoot,
      sourceRoot,
      targetRoot,
    });
    const rows = parseCsv(await readFile(pathMapPath, 'utf8'));
    const headers = rows[0];
    const iosValues = Object.fromEntries(
      headers.map((header: string, index: number) => [header, rows[1][index]]),
    );
    const macosValues = Object.fromEntries(
      headers.map((header: string, index: number) => [header, rows[2][index]]),
    );

    expect(report.summary).toMatchObject({
      auditedRows: 2,
      differences: 1,
      passed: 1,
    });
    expect(iosValues.audit_result).toBe('pass');
    expect(macosValues.audit_result).toMatch(/^differences:/);
    expect(iosValues.last_audit_report).not.toBe(
      macosValues.last_audit_report,
    );
  });

  it('audits md path-map targets when the migration output is mdx', async () => {
    const docsRoot = await mkdtemp(
      path.join(os.tmpdir(), 'doc-fidelity-md-target-'),
    );
    tempDirs.push(docsRoot);

    const sourceRoot = path.join(docsRoot, 'source');
    const targetRoot = path.join(docsRoot, 'target');
    const pathMapPath = path.join(docsRoot, 'path-map.csv');
    const sourcePath = 'docs/aigc/landing-page.mdx';
    const targetPath = 'content/docs/zh-CN/ai/aigc/index.md';

    await writeDoc(path.join(sourceRoot, sourcePath), '落地页内容。\n');
    await writeDoc(
      path.join(targetRoot, 'content/docs/zh-CN/ai/aigc/index.mdx'),
      '落地页内容。\n',
    );
    await writeFile(
      pathMapPath,
      [
        'source_path,target_path,migration_action,status,risk,batchable,blocked_reason,next_step,decision_refs,migration_progress,audit_progress,audit_result,last_migration_report,last_audit_report,updated_at',
        `${sourcePath},${targetPath},migrate_page_after_syntax_and_ia_review,needs_review,low,yes,,,,completed,pending,,,,`,
      ].join('\n'),
    );

    const report = await auditCompletedMigrationRows({
      outDir: path.join(docsRoot, 'audit'),
      pathMap: pathMapPath,
      repoRoot: docsRoot,
      sourceRoot,
      targetRoot,
    });

    expect(report.summary).toMatchObject({
      auditedRows: 1,
      failed: 0,
      passed: 1,
    });
  });
});

async function writeDoc(filePath: string, content: string) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, content);
}
