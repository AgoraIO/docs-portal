# 中文 SDK 搜索与历史归档发布

关联：[#1281](https://github.com/AgoraIO/docs-portal/issues/1281)。本文说明搜索代码的发布合约，不表示归档服务已经发布了未来版本。

## 收录来源

`content/docs/zh-CN/api-reference/**/meta.json` 的 `navScope.versions` 是各产品、平台的发布配置。搜索使用 `defaultVersion` 指定的版本，未指定时使用 `current`；实际版本取该项的数字 `label`。`versionOverrides` 的子路径独立解析，最深路径优先，例如 React SDK 与其 Web SDK 参考使用不同版本。

`(current)` 是不出现在 URL 中的路由组，`.` 表示当前目录。历史版本即使还保留本地正文，也不进入中文搜索导出。归档外链不作为正文索引。没有声明真实数字版本的“当前版本”标签不会被猜测成某个 SDK 版本；元数据回归检查会阻止维护者将已声明版本重新改回占位名称。

本次补齐原有 11 项占位标签：RTC Electron/Unity 4.6.2、HarmonyOS 4.4.2、C# Windows 4.2.0、Unreal C++/Blueprint 4.5.1；RTC Server C++/Java 4.4.32；Whiteboard Android 2.16.100、iOS 2.16.112、Web 2.16.53。依据是迁移来源固定提交 `697ee0110bb05d4fdc6b3f44dd3979afd7a6c981` 的 [`rtc`](https://github.com/AgoraIO/shengwang-doc-source/blob/697ee0110bb05d4fdc6b3f44dd3979afd7a6c981/docs-api-reference/rtc/_platforms_.meta.js)、[`rtc-server-sdk`](https://github.com/AgoraIO/shengwang-doc-source/blob/697ee0110bb05d4fdc6b3f44dd3979afd7a6c981/docs-api-reference/rtc-server-sdk/_platforms_.meta.js)、[`whiteboard`](https://github.com/AgoraIO/shengwang-doc-source/blob/697ee0110bb05d4fdc6b3f44dd3979afd7a6c981/docs-api-reference/whiteboard/_platforms_.meta.js) 中 `siteVersion: current` 的标签，并与 [已有版本盘点](migration/api-reference-historical-archive-inventory-20261020.md) 交叉核对；不是按其他平台版本或最大版本号推断。

上述版本是修复时核对的迁移来源记录。后续发版以维护中的 `navScope` 配置为准：合入中文分支时，HarmonyOS 当前版本已更新为 4.6.3，4.4.2 保留为历史归档外链，不再作为当前版本收录。

快捷搜索和完整搜索都查询同一个 `/api/search` 与正式 Meilisearch 索引。版本筛选来自索引内记录；应按既有全量快照流程 prepare、验收、promote，不能向正式索引只追加新记录，否则旧记录仍会残留。

## 搜索交互约定

- 快捷与完整搜索共用发布目录中的平台候选；关键词或当前筛选不应移除用户下一步要选择的平台。目录读取失败时保留平台注册表作为可操作的回退，不将失败标为零命中。
- SDK 结果复用 API 入口的维护名称，React 配套 Web SDK 与独立 Web SDK 保持区分。实际版本仅用于后台发布校验，搜索界面不展示版本标签。
- 不自动把正在阅读的产品、平台变成硬过滤。产品菜单按旧站的产品／解决方案清单去重，不包含导航分组或描述；文档与 API 的旧产品 ID 通过兼容别名合并过滤。REST 平台两种写法归为一个“服务端”选项。
- 数字、负错误码与 JSON 字面量形式的关键词在原始 URL 中仍按搜索文本读取，兼容路由生成的带引号字符串链接。公开搜索忽略旧链接的版本条件，不提供版本切换或“当前发布文档”提示；最新 API 收录仍由发布配置控制。
- 中文快捷搜索的输入状态下 Enter 进入完整搜索；主动用方向键选择结果后 Enter 打开对应章节。输入法组词期间的候选按键不触发导航。
- 中文搜索会话按文档路径保存在当前标签页，最多保留八项、三十分钟；离开完整搜索后返回原文档可继续，进入另一文档不会携带来源页的隐藏条件。桌面和手机入口同步会话；存储受限不阻断搜索。
- 手机筛选以“查看结果”确认草稿；关闭抽屉取消草稿。“全部文档”概览独立检索产品文档和 API 各五个章节，按产品文档在前展示，可进入各类型查看全部；单类型仍以二十个章节分页。API 类型涵盖 SDK 与 REST，兼容旧 openapi 类型链接。

开发套件 `/ai/device-kit/**` 使用独立的 `device-kit` 产品归属；发布此分类调整时须一并重新导出和更新索引，不能只部署新菜单。

## 下一次 SDK 发版

以 Android 4.7.0 → 4.7.1 为例；这只是未来验收场景，不表示 4.7.1 已上线：

1. 在修改当前正文前，保存上一版发布 SHA、完整站点构建产物与依赖资源。由归档发布负责人生成不可变站点快照，取得真实可访问的 archive URL。SDK 版本号与整站 archive 快照号不是同一概念。
2. 在 Android 的 `meta.json` 中为上一版增加历史版本选项，`href` 填入经验证的归档正文地址。保留已有历史外链。不要用 `/archive/current`、猜测的快照号或仍指向最新正文的链接代替。
3. 更新当前目录中的真实文档正文及 `current.label`，一起提交。只改标签不能证明正文已升级；发布者必须核对 SDK 对应的来源版本。其他产品、平台的配置不随之修改。
4. 按 [中文搜索部署交接](cn-search-deployment-handoff.md) 对同一个合入 SHA 构建静态站、导出并审计索引、prepare 临时索引、部署前后端、验收并 promote。
5. 查询 `joinChannel` 及另一个 API，通过后台版本元数据核对两种搜索均命中新版正文和锚点；搜索界面不显示版本标签或筛选，旧 API 正文不能混入。检查重载 `[1/2]`、`[2/2]` 和浏览器返回后的关键词、平台过滤。
6. 从版本菜单打开上一版归档，检查正文仍是旧版本，以及样式、侧栏、图片和内部锚点；复查既有历史外链。

## 当前边界

本仓库已有历史版本的外链配置和回归测试，但尚未找到负责生成、上传未来站点 archive 快照的流水线。搜索修复不会创建归档站，也不会改动现有存档地址。首次采用上述发版流程前，需由文档与部署负责人确认快照产物位置、发布任务和真实 URL，再完成实际归档验收；这部分不能仅用搜索单元测试代替。
