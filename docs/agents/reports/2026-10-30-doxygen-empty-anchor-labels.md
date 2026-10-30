# Doxygen 空锚点误显示为 URL 修复（2026-10-30）

用户指出白板 Android Player 的“Public 成员函数”表头前出现长 URL。源 HTML 为 `<a href="#pub-methods" id="pub-methods"></a>Public 成员函数`：链接本身没有文字，仅用于锚点定位。转换器把空链接回退成 href，导致锚点 URL 进入表头。现对带 id/name 的空链接保留稳定锚点，不输出可见地址；普通命名链接仍按原流程保留。

## 修复范围

- Player 表头恢复“Public 成员函数”，保留 `pub-methods`；另恢复“额外继承的成员函数”，补回源 `inherited` 锚点。
- Android API 概览中 10 个同类章节标题去掉锚点 URL 前缀，原有 `autotoc_md0` 至 `autotoc_md9` 均保留。
- 共两个正文文档、12 处错误。全部中文 MDX 同模式扫描剩余 0。两个文档原有 192 + 114 = 306 个链接、原锚点和代码块逐项比较均保留；没有图片或英文正文变更。

## 验证

- 真实结构的转换测试先失败，修复后通过；覆盖表格内空锚点和普通章节标题，并检查原成员链接与锚点保留。已有生成物回归检查同时覆盖 Player 与概览。
- 相关两个测试文件 71 项通过；完整 315 文件测试：4979 项通过、2 项跳过、0 失败。
- `bun run types:check`、`git diff --check` 通过；Lint 0 错误、19 既有警告、5 提示。
- 浏览器实际表头为“Public 成员函数”，`pub-methods`/`inherited` 可定位；概览标题显示源名称，不含 URL。
- 本轮未重复本地完整生产构建；最新中文预览 CI 单独跟踪。前序图床、源日期、FastLogger 待办与有效源基线不变。
