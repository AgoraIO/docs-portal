# 源 #2083 修复前准备：边界与风险

本文件是只读实施准备，不是修复记录，不将 #2083 状态改为已修复。由独立调查对照固定 Git 对象整理，实际实施时仍需逐项复核和回归验证。

- 目标基线：`7c6c60ead44406e69906c5c3808cd489784aa89e`。
- 源：`0aeb5cfc24cdc522731efd7ee8b741a5e986da3c`；范围终点 `5d03551cf64cd057ccfe8d5b256d9c4778e8fbb1`。
- 源实际 84 文件：13 个 RTSA 页面、1 版本元数据、1 共享片段、6 内部计划/spec、40 HTML、23 Doxygen 静态资源。内部计划和生成运行资源不照搬门户。

## 超出原审计样本的完整写集提示

产品根 `content/docs/zh-CN/realtime-media/rtsa`：

- `build/data-communication/data-stream.mdx`：回调锚点。
- `build/data-communication/send-message-through-rdt-channel.mdx`：5 个方法/回调锚点及多余右括号。
- `build/media-transmission/multi-channel.mdx`：两组离会示例都改 Connection ID，单频道补三次 leave；6 处链接。
- `build/media-transmission/audio-codec.mdx`、`key-frame.mdx`、`stream-state.mdx`：枚举/回调链接。
- `build/media-transmission/bitrate-adaption.mdx`：Connection 参数、回调签名、变量拼写、所有 C 边界比较、L2/L3 分支、回调链接。
- `build/network-and-region-access/cloud-proxy.mdx`：TLS(4)；特殊源码页链接边界见下。
- `build/media-and-signaling-transmission/implement-transmission.mdx`：RTM 更名、参数、事件和消息类型、成功登录检查、二进制缓冲区、消息 ID、日志参数顺序。
- `index.mdx`、`reference/supported-platforms.mdx`：版本入口、完整三平台性能表及测量口径、C99+AOSL/RTOS/裸机/MIPS/RISCV 支持信息，不误删 Java 说明。
- `reference/release-notes.mdx`：1.10.1 主节已在，但历史条目的 API 链接也在源 diff 中，须全查。

共享 `shared/smart-camera/advanced-feature.mdx` 已展开为两个目标，**都要修**：

- `content/docs/zh-CN/solutions/smart-camera/reference/advanced-feature.mdx`
- `content/docs/zh-CN/solutions/smart-doorbell/reference/advanced-feature.mdx`

两份均需 RTM 方法更名、接收消息类型/长度、event/state 枚举、成功登录 caution/guard、二进制消息和递增 ID。不能只改 RTSA 主指南。

当前 C API 根 `content/docs/zh-CN/api-reference/rtsa/c/(current)` 中需要核对补齐的 12 页：

1. `agora-rtc-api-8h.mdx`
2. `overview.mdx`
3. `structagora-rtc-event-handler-t.mdx`
4. `structagora-rtm-handler-t.mdx`
5. `structlog-config-t.mdx`
6. `classes.mdx`
7. `globals-a.mdx`
8. `globals-e.mdx`
9. `globals-enum.mdx`
10. `globals-eval.mdx`
11. `globals-func.mdx`
12. `globals-r.mdx`

API 核心包括六个新 RTM 方法（login/logout/send_data/subscribe/unsubscribe/publish）、消息枚举、1007–1011 错误值、三类 Channel 回调、速率和大小限制。源 send_data 的 custom_type 是 32 字节、publish 是 31 字节，固定源存在这一区别，不自行统一。

RTC handler 25 个新成员 hash、RTM handler 6 个新 hash、log_printf 新 hash 均需承接，同时保留旧 ID 为同名成员别名，避免旧入链退化。已有 SEI 两页及 current meta 已完整，不重复新建。下载已由 #2096 更新为 18 个安全 URL，禁止回退。

## 工具安全与决策边界

- 可复用纯转换 `scripts/lib/api-center/html-to-mdx.mjs` 的 `convertHtmlToMdx`、Doxygen options（`.contents` / `.headertitle .title`），从 `git show` 读取固定对象进入内存，再定向 patch，保留现有 frontmatter 和旧锚点。
- **不要直接对源脏工作区运行** `scripts/migrate-api-html-doxygen.mjs` 写模式。即使只选一个 URL，runner 仍可能读取完整 manifest 并改三个共享 ownership/report 文件；classes/globals 未必在 pageEvidence，selected=0 不能当成功。
- 不运行 `--reconcile`，不整页复制 Doxygen JS/CSS 或头文件源码来解决单条链接，不改通用渲染器。
- 源 C 版本元数据新增 v1.9.7 → archive 0.0.492，目标缺少入口。现有 navScope 支持 href；但外链归档可用性和是否采用外链/本地历史版本需要与 #2113 的归档方案一致确认，不在这里盲目选择。
- cloud-proxy 的源链接指向头文件 `_source.html#l01930`；主 API 页没有可等价编造的 `agora_rtc_set_cloud_proxy` 文档 hash。保留现有方法文字并补 TLS 正文，或确认是否需要固定源码页外链/有限参考页；不得伪造主 API 锚点。

## 验收要求

不能仅补原审计少数样本即称 #2083 完整：逐项核对上述 authored/共享内容、40 个源 HTML 的用户契约和实际索引；验证新旧 fragment、源修改的历史发版链接、C 条件边界、三套 RTM 示例及 #2096 下载保护。页面表格、caution、API 参数及版本入口还需定向渲染检查；类型检查与全量测试通过不替代内容等价验收。
