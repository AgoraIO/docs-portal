# 中文热更新第二阶段：组合验收

用户批准D006：历史API使用旧站archive外链；当前版本API及指南遗漏在本站补齐。固定目标 `7c6c60ead44406e69906c5c3808cd489784aa89e`，冻结源终点 `5d03551cf64cd057ccfe8d5b256d9c4778e8fbb1`。每源独立树/分支/修复PR，全部指向 `codex/cn-newdoc-html-api-migration`，不自动合并/部署。

## 六源实施与单分支门禁

| 源 | 生产实施 | 独立全量（仅对应该次代码） | 修复PR |
| --- | --- | --- | --- |
| #2113 | `e604b433addf`，四meta历史外链，12新回归 | 222文件/2877通过/2跳过，97.94秒，exit0 | [#1231](https://github.com/AgoraIO/docs-portal/pull/1231) |
| #2084 | `ac71747f9b`，7生产/四API及Flutter/RN下载 | `47b3f80ca2`：223文件/2876通过/2跳过，104.86秒，exit0 | [#1235](https://github.com/AgoraIO/docs-portal/pull/1235) |
| #2067 | `117792a2ab`，19生产/Web2.3当前API/指南/下载及2.2.4外链 | 同实现：222文件/2886通过/2跳过，175.37秒，exit0 | [#1236](https://github.com/AgoraIO/docs-portal/pull/1236) |
| #2085 | `dc842ad2b6`，1生产/Android回调六项 | 同实现：222文件/2867通过/2跳过，146.31秒，exit0 | [#1237](https://github.com/AgoraIO/docs-portal/pull/1237) |
| #2094 | `ce3c6f93c3`，最终40生产/Native当前API与四历史外链 | 最终222文件/2901通过/2跳过，97.96秒，exit0；36新回归及两meta均覆盖 | [#1234](https://github.com/AgoraIO/docs-portal/pull/1234) |
| #2083 | `8c5fc8666f`，42生产/RTSA API、指南与两共享消费者；最终测试`c7ed0963ee` | 首次16失败后精确修复fixture；最终222文件/2878通过/2跳过，101.11秒，exit0 | [#1233](https://github.com/AgoraIO/docs-portal/pull/1233) |

所有实现均有真实先红后绿、类型与完整MDX preset编译、源hunk分类/导航/hash/内链/范围保护证据，详见各独立PR实施报告；通过定向或编译不等于全量/内容保真通过。

RTSA首次全量失败不是timeout：15项 `docs-link-remediation` 硬编码旧指南href，1项 `api-center-scoped-sidebar` 硬编码只有current的版本数组。只允许按同成员真实新hash和批准归档入口更新对应fixture，保留旧hash兼容验证，不跳测试/放宽断言/调超时。失败日志 `/tmp/docs-portal-pr2083-full-20261020.log` 保留。

## 组合合成

验证树 `hotfix-repair-verification`，不推送、不创建混合PR。第一阶段14修复已在 `460897ce9c`；第二阶段全部生产代码组合至 `8e8f068361`。此后小型测试增强/报告修正不改变生产内容，后续验收须记录最终SHA。

最终代码/回归HEAD `2dcdf75b2bcd3fcf9cd1e4ac527041ab89f20478`：在上述基础上合入RTSA测试fixture和Native参数/返回/集合守卫，并增加下述两条已真实复验的4.6.4外链。元数据冲突保留Android/iOS current→4.6.4（0.0.519）→4.6.2（0.0.492），Android末尾仍有本地4.6.0；default/pages/current均不动。Native+2113两源共同48测试通过。

独立最终组合审查 `integration_review20` 对初始组合及 `8e8→2dc` 增量均PASS：六叶123个非报告文件逐blob比对、三表所有权重放、新增498内部链接/381显式hash、97变更MDX无重复ID；后续唯一生产差异是两meta各6行，无丢失/重复或错版。该审查不替代full/build/UI。

- 三控制CSV冲突均为不同sourcekey在文件尾追加：逐源保留全部行，不择一丢弃。按各叶相对base的真实行数组重放，三表每表9（2084）+4（2085）+15（2067）+45（2094）+42（2083）个sourcekey无所有权重叠，组合中的每个key全部行与对应独立叶逐字相等，非批次原行亦相等。RTSA product-overview同一key两目标是批准split，故42key/43对；没有额外双301。
- 下载共享数据自动合成后，保留第一阶段Native4.7八包和mini Beta；新增Flutter/RN及RTM Web各自对象及全部历史。真实目录/下载消费者共同测试覆盖这条消费链。
- Presence自动合并曾产生两份Web块，已去掉短的重复基础块，只保一份Web基础Announce/Interval、8–128范围与512明细优化；mini只基础。`totalOccupancy` 不受512明细上限约束。#1229两项test-only修正收窄mini负断言，并接受 `[8,128]`/“8 至 128”两种等价范围，仍保两平台基础模式正向断言。
- 无scope types通过；完整第二阶段10定向文件187测试通过，exit0。它不替代最终组合完整回归。

## 归档验真与已解除的实施阻塞

[归档验真明细](./2026-10-20-hotfix-archive-url-verification.md)：初查8个有正确SDK版本的可用外链；最终两条4.6.4亦有真实浏览器身份实证，全部10个已配置。macOS/C++ v4.6.2使用经真实浏览器验证的同版本0.0.492备用。

早期Android/iOS **v4.6.4** 的source0.0.519曾跳 `https://doc.shengwang.cn/404`，HTTP200是软404，记录保留。11:41–11:43再次检查后，独立Chrome154中两原URL均显示真实平台API概览与v4.6.4，Android再次reload亦正确；因此按用户原任务补齐两条官方外链。curl Android同次仍404、iOS已正确，故不能宣称旧站永久稳定恢复；状态为浏览器正确版本已验证、存在间歇HTTP404风险。两项不再是“无有效同版本地址”的实施阻塞，十个历史意图均有可用同版本实证；没有复制历史正文或错版替代。

RTSA CloudProxy原源码页亦404，archive同路径无目标方法/行号；因此只迁移固定header中受CONFIG_RTC_PROXY保护的枚举与声明到本站有限参考，不扩写运行保证或完整API合同。

## 最终重门禁及页面验收

首次生产构建在 `8e8f068361` 因新增两meta主动停止，exit130，不记为通过。最终 `2dcdf75b2b` 无scope `bun run types:check` exit0，独占 `bun run test --maxWorkers=4` **243文件、3150通过、2跳过，exit0，106.05秒**。日志 `/tmp/docs-portal-hotfix20-final-{types,full}-20261020.log`。

同一串行流程在full成功后执行 `VITE_DOCS_REGION=cn bun run build`，**exit0**：6846 payload、8053机器可读、7747路由HTML；client 4分56秒、SSR 4分46秒、全站预渲染和SEO HTML全部完成。日志 `/tmp/docs-portal-hotfix20-final-build-20261020.log`。大chunk、插件耗时及Git历史不完整/保留既有更新时间manifest的告警如实保留，未调阈值；不能据此声称所有更早性能/历史债已修复。

生产预览（本地4308、Chrome154隔离会话）实际验收八组版本菜单、12个关键页面、四组SDK卡及两个跳转：新枚举/六项回调、String完整签名三参数返回值、Apple错误码/旧定义、RTSA索引/RTM回调/有限声明/实测表；Web Presence含基础与512而mini不含512。目录Flutter6.6.4/对应Native4.6.4、RN4.6.4、WebRTM2.3日期/MD5/地址正确，Flutter独立voice6.6.2未污染。实际从本站点击Android4.6.4到旧站正确版本，随后本站4.6.0仍可访问。截图已入各修复PR报告；[静态payload十外链及两新页证据](./2026-10-20-hotfix-static-payload-evidence.json)亦保存。

专用浏览器与4308预览已关闭，关闭后无scope types再次exit0。报告/截图追加后的验证树HEAD `4e3442ed8c3a515933e86f345b94118e3f763b1f`，相对代码HEAD仅`docs/agents/reports/**`差异，树干净且不推送。用户主工作区原三份分析文档和其他未跟踪文件全部保留。

2026-10-20最终读回验证：六个新修复PR均OPEN、非draft，base正确；head与各本地最终提交相等。#1229测试范围修正也已push并通过独立增量质量/最终组合。没有合并/部署，不能称当前站点已经生效。
