# CNQA-008 React CDN 复核

基线：`ae8fe94cb`，目标 `codex/cn-newdoc-html-api-migration`。

历史问题中的 React／ReactDOM 引入缺失已恢复，快速开始和下载页均有三个有序 script。仍需修复的是“通过 npm 集成后只需要添加 SDK”这句说明：UMD 包依赖浏览器中的 React／ReactDOM 全局变量，安装 npm 包不能自动提供这些变量。

本 PR 将示例固定为 React 18.3.1、ReactDOM 18.3.1、Agora React SDK 2.5.1，并说明依赖顺序、不可使用 async、允许省略依赖的全局变量条件及模块打包项目使用 npm 的方式。两处正文保持一致。

验证：

- 使用下载页原样抽取的 HTML，在全新浏览器会话、空白页面运行；未预先安装或注入 React。
- `React.version` / `ReactDOM.version` 均为 `18.3.1`；`AgoraRTC.AgoraRTCProvider`、`AgoraRTC.default.createClient` 均成功导出为函数；无页面脚本错误。没有加入频道或调用真实业务接口。
- 本地真实下载页显示三份脚本、固定版本和全局变量条件。
- 使用仓库实际平台 Markdown 转换器检查 React 快速开始出口保留全部脚本和 `window.ReactDOM` 说明。
- 三个相关测试文件、34 项通过；`bun run types:check` 通过。

浏览器截图、最小 HTML 和 Markdown 检查产物保存在 ignored `.agent/artifacts/cnqa/`。上述结论是本分支的源码与本地页面验证，不代表线上已经部署。
