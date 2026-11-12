# 源 #2113 历史 API 外链实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development. 执行下列任务，先RED→GREEN，再独立规格及质量审查；完整测试/构建/预览须主控独占授权。

**Goal:** 按D006恢复四个正确的旧站历史API入口，保留所有当前与既有本地版本。

**Architecture:** 仅使用既有`navScope.versions[].href`，external项的path仍必填但不加入pages、不创建目录；不改运行时或当前正文。

**Tech Stack:** JSON meta、Vitest、现有docs meta schema与nav-scope resolver。

来源`ec0ad467057ed56e4c5059bbccf98b5ce301bb9b`，终点`5d03551cf64cd057ccfe8d5b256d9c4778e8fbb1`；目标`7c6c60ead44406e69906c5c3808cd489784aa89e`。源全部仅一个metadata文件四个hunk，0.0.511→0.0.492。元数据源属于no-redirect而非页面迁移，报告记录源一行对四目标，不伪造归档页面执行状态。

## Task 1：隔离及基线

- [ ] 使用独立树`fix-hotfix-pr2113`和分支`codex/fix-hotfix-pr2113`，确认干净、HEAD固定基线。冻结安装`bun install --frozen-lockfile`，锁文件不变。
- [ ] 主控给出独占窗口后先跑固定基线`bun run test --maxWorkers=4`；若失败保存真实证据，不改无关测试或timeout，先报告。

## Task 2：四 meta 的真实回归

仅四个生产目标（均前缀`content/docs/zh-CN/api-reference/rtc/`）：

| platform | id/label | 完整href |
| --- | --- | --- |
| android | 4.6.2 / v4.6.2 | https://doc-archive.shengwang.cn/archive/0.0.492/api-ref/rtc/android/API/rtc_api_overview |
| ios | 4.6.2 / v4.6.2 | https://doc-archive.shengwang.cn/archive/0.0.492/api-ref/rtc/ios/API/rtc_api_overview |
| flutter | 6.6.2 / v6.6.2 | https://doc-archive.shengwang.cn/archive/0.0.492/api-ref/rtc/flutter/API/rtc_api_overview |
| react-native | 4.6.2 / v4.6.2 | https://doc-archive.shengwang.cn/archive/0.0.492/api-ref/rtc/rn/API/rtc_api_overview |

- [ ] 新建`src/lib/rtc-pr2113-archive-sync.test.ts`，从真实meta读取并以表驱动断言；先确认四入口缺失引起RED，而非路径错误。

```ts
expect(meta.navScope.versions.find((item) => item.id === version)).toEqual({
  id: version,
  label: `v${version}`,
  path: version,
  href,
});
expect(meta.navScope.defaultVersion).toBe('current');
expect(meta.pages).not.toContain(version);
```

- [ ] 对每平台当前项明确保护：Android/iOS v4.7.0、Flutter v6.6.4、RN v4.6.4，path仍(current)，defaultVersion仍current；Android本地4.6.0及所有pages逐字保持。
- [ ] 使用真实`docsMetaSchema`及`resolveDocsNavScope`：构造含中文tab、实际current page和(current)folder的最小Root，getNodeMeta只返回所读scope meta；断言activeVersion/currentId仍current，versionSwitcher精确保留external href，无需历史folder。沿用`src/lib/docs-nav-scope.test.ts`已有Root形状，不mockresolver或直接用预期拼链接替代真实解析。
- [ ] 新增四个外链item放current之后、Android4.6.0之前；其余JSON内容不变。四项source格式如下（按表替换version/href）：

```json
{"id":"4.6.2","label":"v4.6.2","path":"4.6.2","href":"https://doc-archive.shengwang.cn/archive/0.0.492/api-ref/rtc/android/API/rtc_api_overview"}
```

- [ ] 同命令运行GREEN；`bun run test src/lib/rtc-pr2113-archive-sync.test.ts src/lib/docs-nav-scope.test.ts src/lib/docs-meta-schema.test.ts --maxWorkers=2`，不得削弱既有断言。

## Task 3：门禁与交付

- [ ] `bun run types:check`、新增测试Biome、git diffcheck；四meta之外current正文、英文、pages和lockfile不变。记录去除四新item后与基线deepEqual。
- [ ] 报告`docs/agents/reports/2026-10-20-hotfix-pr2113-fix.md`包含固定source/base、四hunk映射、HTTP最终目的地/内容身份验证边界、schema/resolver与红绿证据；网络验证由主控提供，不把HTTP200直接当SDK版本证据。
- [ ] 新增项通过真实版本下拉可达性/当前选择与本地4.6.0保护验收，主控安排UI；独占完整回归按主控窗口执行。
- [ ] 独立spec→quality，root独立复跑/组合验收后推送建PR，目标`codex/cn-newdoc-html-api-migration`。未合入不得称线上生效。
