# 源 #2094 Native 当前 API 实施计划

> 独立工作树、TDD、规格后质量双审。full/build/preview 由主控串行；不自动合并或部署。

目标：补齐冻结源 `80b1000446bacab3f4937f5f1a6d177c5be6bee1` 的有效差异。终点 `5d03551cf64cd057ccfe8d5b256d9c4778e8fbb1`，目标 base `7c6c60ead44406e69906c5c3808cd489784aa89e`。46源文件须全分类，不等于46目标文件全改。源仓库只读固定Git对象，不读env或脏工作区。

## 设计与边界

- D006：历史外链，当前本站。0.0.519 四个入口最终跳 /404，不能发布。macOS/C++ 的官方 0.0.492 已确认同为 v4.6.2，可明确记录备用；Android/iOS v4.6.4 暂无有效同版本归档，不写坏链或拿4.6.2冒充，记录外部阻塞。
- 不复制历史正文，不新 runtime/组件，不动下载、英文、独立 voice、已存在的 SEI、安全链接。
- #2060 已被回退且目标一致，禁止恢复。Android video-basic 六项回调由独立 #2085 承接，不重复修改。
- 冻结源契约优先，不凭经验纠正SDK事实。Apple error 描述有可疑变化（1015录音/播放、111/112仅Web、109删除renew建议等），按源有效内容迁移并在报告列 source 疑义，不能混入旧诊断却称当前契约。

## 写集（预期38生产文件，额外先报主控）

API前缀 `content/docs/zh-CN/api-reference/rtc/{android,cpp-all-platforms,ios,macos}/(current)/`。

1. 四平台各6：`class-ivideoeffectobject.mdx`、`enum-videoeffectnodeid.mdx`、`rtc-api-data-type.mdx`、`rtc-api-overview.mdx`、`rtc-interface-class.mdx`、`video/video-prenpro/video-enhance-option.mdx`（24）。
2. Android `class-faceshapeareaoptions.mdx`；C++/iOS/macOS `enum-faceshapearea.mdx`（4）。
3. iOS/macOS `enum-errorcodetype.mdx`（2）；C++ `class-externalvideoframe.mdx`（1）；C++/iOS/macOS `rtc-api-sunset.mdx`（3）。
4. Android `network.mdx` 和 `(current)/meta.json`（2）；macOS/C++ 外层 `meta.json`（2）。

## TDD与实现

1. 独立树 `fix-hotfix-pr2094`、分支 `codex/fix-hotfix-pr2094` 从base建立并冻结安装。先既有相关定向基线；全源46差异/终点逐字节、导航树与hash清单落机器证据。先修本源相关三CSV的真实映射，保原顺序/无关行/引用格式；新映射先in_progress/pending。
2. 新 `src/lib/rtc-pr2094-sync.test.ts`，作用域起止存在/唯一/顺序必须失败即报错；针对真实成员段写RED，不能全页关键词；保旧hash兼容及无关页深保护。
3. Android FaceShapeAreaOptions 增109/207并补11项参数range/default/方向；不实现无source证据的0.6/min/eyeareaangle。C++/Apple增109/207、7默认值归0；MOUTHSMILE源仍[0,1]，不跨平台统一Android[0,100]。
4. 四平台 STICKER=8；Apple Agora前缀。完整新增 String setter，保3参数、Since v4.6.0、返回0/负值及真实平台签名。类页相关String转真实链接、移除已解决warning，overview/class/enum索引补关联（C++再WARN）。视频增强旧类引用全部转独立类页；旧rtc-interface-class所有有效详细hash保兼容，不级联重排Slot/ARIA。纯片段转换可用，不改全局generator。
5. C++ ExternalVideoFrame 不再列metadataBuffer/metadataSize，旧hash作为兼容引用保留，不继续宣传当前字段。
6. Apple error 两页全部有效hunk：27新增、3从当前列表删除、37描述变化。无1703；删5/9/20保独立旧定义引用锚点，不断言SDK一定移除。新增包括120、124–129、1017/18、1020–23、1359/60、1501、1600–03、1700–02、1704–07。实际固定源逐成员核验，不凭报告数字跳过。
7. Sunset 已有8CDN下架保留，仅补真实DIRECT_CDN_*及Apple完整签名/Agora前缀和audioQualityBlock语义。Android network 按冻结源回退为FAILED5短说明，删除旧恢复流程，三项连接检查改独立列表；这是文档源契约对齐，不自行猜SDK修复。Android current title 与外层当前 v4.7.0 对齐。
8. macOS/C++ 外层各补 v4.6.2 archive href `https://doc-archive.shengwang.cn/archive/0.0.492/api-ref/rtc/{macos,windows}/API/rtc_api_overview`，保current/default和已有历史；报告source519失效及同版本492备用证据。Android/iOS4.6.4只记阻塞，不加失效href。

## 轻门禁与交付

- 定向GREEN、types、所有变更完整MDX真实preset编译/语法、旧新hash/入站与出站内部链接闭包、只改测试的Biome、diffcheck。不要以compile成功冒充内容完整。
- 三控制CSV只改实际本源sourcekeys；HTML40原defer修真实现有目标，新增5源缺行补唯一映射。保metadata no-redirect。完成标completed/ready/pending，machine `audit_scope=source-pr-delta`，不伪装全页初次保真pass；video-basic交#2085并明确依赖。
- 报告 `docs/agents/reports/2026-10-20-hotfix-pr2094-fix.md` 与机器证据记录46源分类/hunk trace、旧nav原文及树、所有hash兼容、source疑义、归档两有效/两阻塞，勘误审计0.6等无证据推断。
- 本地提交 READY_WITHOUT_FULL，不push/PR，不自行full/build/preview。主控双审、full、真实浏览器和组合检查后创建独立PR。

## 2026-10-20 11:42 归档复验增量（覆盖先前两入口阻塞处置）

主控隔离Chrome154直接导航与Android再次reload，Android/iOS的原0.0.519地址均保持原URL且真实API概览选择器显示v4.6.4。curl仍可见Android跳404，iOS同次curl已为真实概览，说明请求结果存在不一致；不推断旧站何时恢复，也不抹掉早期失败记录。当前已有有效同版本浏览器证据，可以完成用户原先要求的两条外链。

- 批准生产写集38→40，仅增加Android/iOS外层meta，各current后加v4.6.4/path4.6.4/对应原0.0.519官方href；保current/default/pages/Android本地4.6.0，不加历史正文目录。
- 源#2113的4.6.2仍由独立目标#1231承接；最终组合顺序current→4.6.4→4.6.2→4.6.0（若该平台已有）。macOS/C++已验证同SDK4.6.2的0.0.492备用保持。
- 新2meta回归先RED→GREEN，完整schema/href/不造folder/去新增后base深等价及真实resolver保留外链；此前两个Minor的精确参数/返回/完整成员集合守卫也保留。报告元数据fanout与归档状态据实际更新并附主控截图，不冒称永久可用。
- 此增量须重新独立规格→质量、独占full与最终组合build/UI。组合build在旧production `8e8f068361` 已主动停止exit130，不能宣称构建通过。
