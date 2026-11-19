# 源 #2084 Flutter/RN 当前内容实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development. 独立工作树、TDD、spec后quality；full/build/preview只由主控授权串行。

**Goal:** 完整承接冻结源#2084的当前API/下载遗漏，历史6.6.2/4.6.2入口由#2113独立修复负责。

**Architecture:** 四篇既有API局部补齐，两个video下载对象更新；使用现有卡片versionSuffix展示Flutter对应Native版本，不新组件、不改CSS/路由。

**Tech Stack:** MDX、TypeScript纯数据/helper、Vitest、CSV迁移控制记录。

源`2cc6b1b882d37829c45496f9ef3605fed5748285`，终点`5d03551cf64cd057ccfe8d5b256d9c4778e8fbb1`；目标`7c6c60ead44406e69906c5c3808cd489784aa89e`。独立树`fix-hotfix-pr2084`/分支`codex/fix-hotfix-pr2084`。源只读Git，禁止源env/脏工作区。

## Task 1：先明确控制行和既有基线

- [ ] 冻结安装；先跑`RtcSdkDownloads.test.tsx`、`SdksCatalog.test.tsx`既有定向，不自行full。
- [ ] 完整11源hunk记录：平台元数据归档归#2113；首页ignore不复活旧UI；Android、Flutter、RN三个发版已在；两resources通过组件承接；四HTML实缺。保留终点Native4.7及Flutter已删除macOS15 Beta。
- [ ] 只修本批9内容源的filemap/path-map/ledger行：3个发版→统一`reference/release-notes.mdx`；两下载→`reference/downloads/{flutter,react-native}.mdx`；4HTML→下列现有current目标。保留metadata no-redirect/homepage ignore；不变更无关行。HTML旧defer按本次用户明确分配/D002转为redirect，补真实旧URL/clean新URL及执行行。阶段先in_progress/pending，内容存在后completed/audit ready；独立审查前不写audit pass。旧CSV未反映现有API中心manifest不代表目标未存在。所有更改必须能还原出仅9个源key变化；不要全表重排/改引号。

## Task 2：四API页TDD

生产目标前缀`content/docs/zh-CN/api-reference/rtc/`：

1. `flutter/(current)/enum-localvideoeventtype.mdx`
2. `react-native/(current)/enum-localvideoeventtype.mdx`
3. `flutter/(current)/video/video-basic.mdx`
4. `react-native/(current)/video/video-basic.mdx`

- [ ] 新增`src/lib/rtc-pr2084-sync.test.ts`，按真实枚举/回调参数章节和平台断言，先RED缺失5/6及回调六项，不全页关键词匹配。作用域起止必须存在、按顺序且唯一。
- [ ] 枚举新增值5/6，Flutter标识小写首字母`localVideoEventTypeCameraFocalLengthApplied/FallbackToDefault`，RN大写首字母`LocalVideoEventType...`；说明请求的广角/超广角已应用、失败则回退默认摄像头，两条均保留“仅适用于Android”。
- [ ] 两回调event参数补完整六项列表，保留既有枚举链接：四个ScreenCapture WindowHidden/WindowRecoverFromHidden/StoppedByUser/SystemInternalError，加上述FocalLength两项，按源平台大小写。
- [ ] 保留所有旧锚点、参数source-1/event、枚举前四项、Since（Flutter6.6.2/RN4.6.1）。新成员ID沿现规则为`localvideoeventtypecamerafocallengthapplied`和`localvideoeventtypecamerafocallengthfallbacktodefault`。不整页重生成、不改其它API。

## Task 3：两条真实下载消费链TDD

其余三个生产文件：

5. `src/components/docs-overview/sdk-downloads-data.zh-cn.ts`
6. `src/components/docs-overview/sdk-downloads-data.ts`
7. `src/components/docs-overview/rtc-download-card-entries.ts`

- [ ] 先在`RtcSdkDownloads.test.tsx`和`SdksCatalog.test.tsx`写失败用例，分别真实渲染中文video Flutter/RN，断言新version/URL/date与Flutter Native关联；不能只检查数据对象。
- [ ] 只在两个video产品前插新对象并降旧最新标签，保留所有旧版本/ID/链接。无ZIP/MD5的字段不编造：

```ts
{
  id: '6.6.4-video-sdk-flutter', label: '版本 6.6.4（最新）',
  packageManager: 'https://pub.dev/packages/shengwang_rtc_engine/versions/6.6.4',
  releaseDate: '2026 年 8 月 31 日', nativeVersion: '4.6.4',
},
{
  id: '4.6.4-video-sdk-react-native', label: '版本 4.6.4（最新）',
  packageManager: 'https://www.npmjs.com/package/react-native-shengwang/v/4.6.4',
  releaseDate: '2026 年 8 月 31 日',
},
```

- [ ] `SdkDownloadVersion`仅加可选`nativeVersion?: string`；同样先用真实helper测试确保有值/缺省/UnionTech优先都得到预期，再最小修改已有suffix：

```ts
versionSuffix: isUnionTech
  ? '统信 OS 专版'
  : version.nativeVersion
    ? `对应 Native v${version.nativeVersion}`
    : undefined,
```

- [ ] 不改`SdkDownloadCard`/`RtcSdkDownloads`/`SdksCatalog`实现或安装命令解析。Flutter独立voice仍6.6.2/agora_rtc_engine/3月18日；RN/Flutter RTM、英文、Native4.7和#1230八包完全不动。不要用语义错误的packageName/packageSize字段塞Native说明。

## Task 4：轻量验收及审查

- [ ] 所有新旧定向GREEN、types、四完整MDX实际编译/语法、旧新fragment/入站链接、仅本批测试及TS数据/helper的Biome、diffcheck。
- [ ] 固定4HTML的nav.toc原始及归一化树（Flutter61/RN61 links），证明目录层级未动；使用固定Git+纯convertHtmlToMdx提取必要片段，不跑全局generator。记录source哈希/两时点后续覆盖。
- [ ] 只允许7生产文件、3控制CSV、所列新旧测试和本批报告/小型证据。需要额外文件先说明。报告`docs/agents/reports/2026-10-20-hotfix-pr2084-fix.md`完整11源映射和source→两消费者闭包；控制行audit状态保持ready/pending等待独立复核。
- [ ] 轻量本地提交READY_WITHOUT_FULL；不push/PR，不自行full/build/preview。主控独占full、spec→quality、浏览器和组合检查后再提交独立PR。历史hunk依赖#2113，未合入不称线上已生效。
