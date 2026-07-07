# 中文产品平台后缀收敛发现

- RTM/Signaling 重复导航来自 `content/docs/zh-CN/realtime-media/rtm/**` 中基础页与 `.cpp/.swift` 变体页同时存在，且 `meta.json` 显式列出后缀页。
- 合并脚本此前只识别部分平台后缀；未识别的后缀文件会继续被 `meta.json` 和 Fumadocs 导航列出。
- 当前中文产品目录仍有残留平台后缀文件集中在：
  - `content/docs/zh-CN/realtime-media/recording/local-server-recording`
  - `content/docs/zh-CN/realtime-media/rtc-server-sdk`
  - `content/docs/zh-CN/realtime-media/rtsa`
- 已将上述三个产品目录中的 `.cpp`、`.java`、`.python`、`.c` 变体收敛为无后缀页面；合并后产品目录 `.md/.mdx` 后缀文件扫描为空，产品 `meta.json` 后缀导航项为 0。
- 根级链接重写修复了 105 个旧平台后缀 URL，包括部分 API reference 与解决方案页面中的交叉链接。
