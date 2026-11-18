# 中文旧站增量同步（2026-11-17）

已在新工作树 `codex/cn-master-hotfix-20261117` 完成本批内容同步、审查修复和验证。目标草稿 PR：[#1443](https://github.com/AgoraIO/docs-portal/pull/1443)，等待目标分支 review 与合并；未上线。

## 固定基线与范围

上批 [#1434](https://github.com/AgoraIO/docs-portal/pull/1434) 已于 `2026-11-16T07:45:02Z` 合并为 `9e6f1a68baf96b8517e43d4e9ab4aad7aaa69001`，且存在于目标基线。因此源起点为 `8fd46d74070a18dcb46ef943f6d6768590be9bca`（0.0.544），固定终点为 `b9aa4166a265ad2693ced2ce36ea4a7d5e21e826`（0.0.546）。

遵循用户基于当前本地分支的要求，目标固定为 `codex/cn-newdoc-html-api-migration@472e0250ff2c4a61bf7a0f10a472628192b33f31`。创建时远端领先的 #1436、#1440、#1435、#1441 未隐式合入。原工作区未被本任务写入。

按 first-parent 祖先关系与实际 GitHub merged PR 交叉核对，共 **8 个提交、6 个内容 PR、153 个净变化源文件**。两个直接提交 `542c9f9f1` / `b9aa4166a` 仅更新旧站发布计数，不复制为新站版本。

| 源 PR | 合并时间（北京时间） | 本批结果 |
| --- | --- | --- |
| [#2147](https://github.com/AgoraIO/shengwang-doc-source/pull/2147) | 11 月 16 日 16:28 | 同步 iOS/macOS 集成、下载、CocoaPods FAQ 和发版提示；专页与总 SDK 目录共同保留模块名及参考包体积增量语义。 |
| [#2157](https://github.com/AgoraIO/shengwang-doc-source/pull/2157) | 11 月 16 日 16:29 | 已由新站 #1432 覆盖，精确复核后不重复迁移。 |
| [#2152](https://github.com/AgoraIO/shengwang-doc-source/pull/2152) | 11 月 16 日 17:41 | 同步 RTC Web 4.24.10 指南、下载、发版和 17 个实质变化 API 页，新增公开 IAgoraRTCServicePlugin。 |
| [#2153](https://github.com/AgoraIO/shengwang-doc-source/pull/2153) | 11 月 17 日 14:34 | 完整迁移五平台十篇场景、四 SVG/四 Mermaid 图源；短标题/H1/路由保留，侧栏补平台标签。 |
| [#2148](https://github.com/AgoraIO/shengwang-doc-source/pull/2148) | 11 月 17 日 15:18 | 补 Native RTM 2.3.1 查询、五平台 API、指南、功能/限制、集成、下载和 FAQ。 |
| [#2159](https://github.com/AgoraIO/shengwang-doc-source/pull/2159) | 11 月 17 日 16:03 | 以最终源统一为 11 月 17 日发版，补同版 RtmKit/RtmBasic。 |

[批次 JSON](./cn-master-sync-20261117.json) 保存固定范围、合并记录与验证；[逐文件台账](./cn-master-sync-20261117-ledger.json) 覆盖全部153源：**89补同步、1已覆盖、63排除**。每行记录源前/后与 diff SHA-256、hunk、真实消费者、目标前/后 SHA-256。排除项包括51份无实质正文差异/源构建项、11份英文镜像和旧站版本计数。

## 保真与审查修复

- 68份RTC HTML中17页实质变化，44个新增成员、54条签名无缺失；425个历史API锚点保持原成员归属。新serviceplugin登记权威manifest、ownership和导航；不整库再导入。
- RTC发版新增6个小节使用唯一ID，实际remarkHeading核对2375个旧标题ID及版本归属不变。两个视频轨道的旧 `#deprecated` 仍指向 `getStats`。
- RTM五份独立Presence全部更新；兼容合并页仅更新原有Android/iOS/HarmonyOS段。669个历史heading的ID/平台/成员/版本关联无漂移，旧历史正文保持。
- 十场景共120代码块与固定源逐字相同，4 SVG/4 mmd逐字节相同；不猜改SDK代码。完整保留MESSAGE前提、20次/秒独立限流、5秒不重试、离线成功语义、C++借用生命周期、HarmonyOS timestamp=0等源约束。
- API限制页保留源产品九个平台：Web/Unity/Flutter/小程序不显示Native新方法，原共享限制保留。安装真实消费者包括quick-start、application-setup、Java和Objective-C下载正文；不能仅更新Android/iOS薄组件或版本卡片。
- 新在线状态FAQ登记真实五平台与Swift/C++搜索ID。旧FAQ账本中的deferred标记已过时，以实际页面和路径映射为准。
- 30条错误路径及5条大小写错误Storage锚点已修复；实际导航模型和浏览器均核对。12侧栏标签区分平台，短页面标题不改。
- iOS RTC包体积说明由专页/目录共用helper；Full/Lite/Audio均保留源参考增量及构建限定，其他产品/地区默认行为不改。

## 验证结果

最终源码指纹：`174ae6098470330e492fbe7dc2e44481b037d3941acd3f14fd813e23a8ecca26`。完整测试、最终34状态读验、构建前后身份一致。

| 检查 | 实际结果 |
| --- | --- |
| `bun run test --maxWorkers=2` | 369文件通过、1跳过；6110项通过、23跳过；exit0。 |
| `bun run types:check` | 最终exit0。 |
| `bun run docs:tables` | 7049文档，0结构错误。 |
| `bun run qa:api source --region cn` | 0新增重复、2已知重复、0过期豁免。 |
| 全库Lint基线比较 | 9错误/22警告/3提示；34条诊断逐项与基线一致，新增/删除均0；不称Lint clean。 |
| 变更链接对比 | 55篇/8773链接；11基线告警及49新增静态告警。47条显式ID告警按完整目标URL+fragment在两视口实证，2条CPP lambda经MDX AST证明不是链接；新增真实未解决断链0。静态strict命令并非clean PASS。 |
| 浏览器检查 | 初始95路径/190状态为前一指纹检查点，发现5个Storage目标共10失败；最终17路径/34状态在当前指纹全部通过，关闭全部失败。 |
| 独立阅读 | Chrome150.0.7871.24，1440×1000/390×844，多主题；实际表格/代码末端、换行、菜单、旧版本hash、五平台API、场景图及SDK目录展开均已复核，限定开发预览PASS。 |
| 中文生产构建 | `VITE_DOCS_REGION=cn bun run build` exit0；6182 payload、7463机器可读文档、7227路由HTML。 |
| 生产产物定向核对 | 70目标页面的HTML/payload/Markdown与28锚点核对通过。 |

三份保留在Git的合并Presence平台源码可在开发预览中检查，但其旧canonical在既有生产规则中已重定向到独立API入口，不发布这些合并平台HTML；生产核对保留该决定，验证了五份真正发布的独立Presence，而没有为通过检查重新暴露旧入口。

所有本地日志、转换/比对脚本、独立审查和截图只保存在ignored `.agent/artifacts/hotfix-20261117/`；没有提交QA图片或托管截图链接。构建临时更新的生成日期清单恢复原值；源码指纹不变。保留大chunk、CSS `::highlight`、Vite原生配置兼容和本地Git日期可用性等实际告警，未改阈值或隐藏告警。

## 资产与接受边界

四新RTM SVG的中文CDN对象仍404；延续此前RTM本地资源决定，使用源一致的 `public/img/rtm2` 资产，XML解析及本地GET200/字节相等均通过。保留既有图床上传待办，不宣称上传完成。

沿用上批 `P2-openapi-long-example-toolbar` 的另批修复决定，以及HarmonyOS日期、历史FastLogger链接和源语义疑义。六新归档入口已GET200，但RTC旧归档标题仍写4.24.1，不能据200证明其4.24.9语义正确。旧manual-API ownership快照在目标基线已陈旧，本批真实目标/哈希由新台账记录，未盲目全库reconcile。

本批没有修改共享MDX/API渲染器、导入器、依赖或QA规则，没有新增质量豁免。代理独立审查不代替API/SDK owner语义签收、独立人工阅读、真实触屏/Safari或release owner生产决定。浏览器使用精确字体fixture，不验证生产CDN/CORS；没有声称官方API全矩阵all门禁通过。

旧站有效断点仍为**0.0.544**；只有本批实际合入目标分支后，下一轮才从固定0.0.546继续。统一入口见[热更新断点](./cn-hotfix-checkpoint.md)。

## 2026-11-18 Presence 通用前提补齐

按 #2148 逐平台复核，将通用 Presence 服务开关说明补入 Web、Unity、Flutter、小程序各自的首个平台块。五个 Native 平台的既有说明及 `getUserOnlineStatus` 例外保持原文；本次不改 #2157 的 SDKs 下载链接决定。

定向源码核对确认仅这四个平台块增加相同的 `info` 提示，其他平台块逐字不变；逐文件台账中该页面的三处目标哈希随本次更新。上文构建、浏览器及源码指纹记录仍对应原始候选快照，不自动视为本次修改后的重新验收。

本次定向 MDX 编译（提示块与平台分组插件）、九平台源码对照、`bun run types:check` 和 `git diff --check` 均通过；未重新执行整站构建与浏览器验收。
