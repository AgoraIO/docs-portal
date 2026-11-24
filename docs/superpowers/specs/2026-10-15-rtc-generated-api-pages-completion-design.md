# RTC 生成 API 独立页面补齐设计

## 背景

旧站 `shengwang-doc-source/html-docs/**` 中的独立生成 API 页面与 API 列表页是不同的页面。当前候选映射中有 7 条旧 URL 因缺少一对一目标而处于 `manual-review`。本次工作补齐独立页面或现有页面的来源证据，再重新生成重定向候选。

## 目标

- 保留 7 个旧 URL 的独立页面语义和来源证据。
- 将旧生成 HTML 转为符合当前 Fumadocs 规范的 MDX。
- 保留稳定的 DITA/Doxygen 锚点，确保旧页面内部链接和搜索结果仍可落到有效位置。
- 只把内容证据完整、目标路由可验证的记录改为候选重定向。

## 目标路径与处理方式

### 新增 6 个独立页面

| 旧页面 | 目标页面 |
| --- | --- |
| `rtc/Cpp/API/class_ivideoeffectobject.html` | `content/docs/zh-CN/api-reference/rtc/cpp-all-platforms/(current)/class-ivideoeffectobject.mdx` |
| `rtc/Android/API/class_ivideoeffectobject.html` | `content/docs/zh-CN/api-reference/rtc/android/(current)/class-ivideoeffectobject.mdx` |
| `rtc/iOS/API/class_ivideoeffectobject.html` | `content/docs/zh-CN/api-reference/rtc/ios/(current)/class-ivideoeffectobject.mdx` |
| `rtc/macOS/API/class_ivideoeffectobject.html` | `content/docs/zh-CN/api-reference/rtc/macos/(current)/class-ivideoeffectobject.mdx` |
| `rtc/Cpp/API/enum_warncodetype.html` | `content/docs/zh-CN/api-reference/rtc/cpp-all-platforms/(current)/enum-warncodetype.mdx` |
| `rtsa/c/structvideo__sei__t.html` | `content/docs/zh-CN/api-reference/rtsa/c/(current)/structvideo-sei-t.mdx` |

### 补充 1 个已有页面

`content/docs/zh-CN/api-reference/rtc/cpp-all-platforms/(current)/class-localaccesspointconfiguration.mdx` 已有主体内容。本次只补充 `_migration` 来源元数据，核对源内容，并修复 `rtc-api-data-type.mdx` 中该条目的链接。

## 内容规则

- 四个平台的 `IVideoEffectObject` 独立页面分别保留源文件中的接口/协议声明、简介、版本信息和平台属性；iOS 与 macOS 保留 `AgoraVideoEffectNodeSticker` 属性。
- C++ `WARN_CODE_TYPE` 页面迁移全部 33 个警告码，使用当前生成枚举页面的 `ParameterList` 结构。
- RTSA `video_sei_t` 页面迁移结构体描述、`sei_data`、`sei_data_len` 两个成员和 Doxygen 锚点。
- 在 `structvideo-frame-info-t.mdx` 中补回 `sei_data` 成员，并链接到新页面。
- 不把独立页面重定向到 `rtc-interface-class` 的同名章节；列表页与独立页保留各自来源和 URL 语义。

## 元数据与导航

- 新增页面使用 `_migration.type: generated-html`，记录准确的 `sourceUrl`、`sourcePath`、生成器和迁移警告。
- 独立 API 详情页继续按现有约定保持侧边栏隐藏；只有 RTSA 结构体需要加入当前 API 详情组的 `meta.json`，以便生成的结构体集合完整。
- C++ `rtc-api-data-type.mdx` 增加 `WARN_CODE_TYPE` 链接，并把 `LocalAccessPointConfiguration` 的纯文本条目改为链接。

## 映射与验证流程

1. 从 7 个旧 HTML 页面提取正文、代码声明、参数/成员描述和稳定锚点。
2. 写入或更新目标 MDX 与必要的 `meta.json`、索引页面。
3. 运行生成器重新生成候选映射，不直接手改汇总 JSON。
4. 验证 7 个旧 URL 均有唯一目标，目标文件存在，来源元数据匹配，锚点存在且没有重定向环。
5. 运行 `bun run types:check`；由于涉及生成 API 内容和内部链接，再运行相关链接检查及 API 迁移测试。

## 验收标准

- 7 条记录从 `manual-review` 变为高置信度候选，目标路由分别对应上表页面。
- 旧页面中的类声明、协议属性、警告码、结构体成员和稳定锚点均可在目标页面找到。
- `video_frame_info_t.sei_data` 指向 `video_sei_t`，`LocalAccessPointConfiguration` 不再产生未解析链接警告。
- MDX、类型检查和链接检查通过。

## 不在本次范围内

- 不处理其余 5 条 `no-redirect` 记录。
- 不为 API 列表页重新建树，不改变已有平台导航结构。
- 不把缺失的其他 RTC 旧 SDK 分类页批量兜底到产品首页。
