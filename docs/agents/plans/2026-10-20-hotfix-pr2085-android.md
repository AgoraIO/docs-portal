# 源 #2085 Android 回调补齐计划

源 `3a1614158a96e90e5a8345c95513b18b8eb407e9`，终点 `5d03551cf64cd057ccfe8d5b256d9c4778e8fbb1`；目标 base `7c6c60ead44406e69906c5c3808cd489784aa89e`。独立树 `fix-hotfix-pr2085`，分支 `codex/fix-hotfix-pr2085`。

- 历史 Android/iOS 4.6.2 外链交 #2113；已有两个4.6.4发版保留后续精炼，当前Native下载已由 #1230 的4.7八包承接；旧首页不恢复。完整7源分类落报告。
- 唯一生产修改为 `content/docs/zh-CN/api-reference/rtc/android/(current)/video/video-basic.mdx` 的 `onLocalVideoEvent` event 参数列表。保 source 参数、现有签名、ParameterList、全部稳定ID与其他章节。
- 新 `src/lib/rtc-pr2085-sync.test.ts` 先RED：唯一 callback起止anchor、唯一event Parameter 作用域，缺失/重复/顺序即报错；六项名称/数值/说明/顺序和旧hash/签名保护。按 #2094 后的冻结终点承接同段数字与措辞，不重复交Native PR修改：
  1. SCREEN_CAPTURE_WINDOW_HIDDEN (1)：屏幕共享窗口被隐藏。
  2. SCREEN_CAPTURE_WINDOW_RECOVER_FROM_HIDDEN (2)：屏幕共享窗口从隐藏中恢复。
  3. SCREEN_CAPTURE_STOPPED_BY_USER (3)：用户停止了屏幕共享。
  4. SCREEN_CAPTURE_SYSTEM_INTERNAL_ERROR (4)：屏幕共享期间发生内部错误。
  5. CAMERA_FOCAL_LENGTH_APPLIED (5)：请求的广角或超广角摄像头已应用。
  6. CAMERA_FOCAL_LENGTH_FALLBACK_TO_DEFAULT (6)：请求的广角或超广角摄像头无法打开，SDK 退回到默认摄像头。
- 三CSV只修4源key：Android API HTML、iOS发版、Android/iOS resources，Android发版行归 #2084 避免冲突。真实映射用既有MDX provenance及统一 `reference/release-notes` / `reference/downloads/{android,ios}`；metadata no-redirect/homepage ignore保持，completed/ready/pending；machine `audit_scope=source-pr-delta`。
- frozen install；既有定向基线、RED→最小参数列表GREEN、types、完整MDX实际preset编译/语法、范围/链接/hash保护、Biome/diff。源码仅固定git读取，禁止env/脏正文，不改全局generator/组件/AGENTS。
- 本地提交、规格→质量独立审查；full/build/preview主控串行；最终独立PR入指定目标，不自动合并/部署。
