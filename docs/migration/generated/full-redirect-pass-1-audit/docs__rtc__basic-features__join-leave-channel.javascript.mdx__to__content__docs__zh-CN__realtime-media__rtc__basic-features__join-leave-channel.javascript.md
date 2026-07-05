# Single Document Content Fidelity Audit

Generated: 2026-07-05T10:50:33.651Z
Old source: `/Users/yangyixuan/Documents/GitHub/shengwang-doc-source/docs/rtc/basic-features/join-leave-channel.javascript.mdx`
New source: `/private/tmp/docs-portal-migration-control-spec/content/docs/zh-CN/realtime-media/rtc/basic-features/join-leave-channel.javascript.mdx`
Old URL: (not provided)
New URL: (not provided)
Projection: product=`rtc`, platform=`javascript`

## Summary

- Source records: 43
- Target records: 44
- Exact matches: 41
- Missing: 1
- Extra: 2
- Changed: 1
- Moved: 0
- Unsupported: 0
- Legacy residue: none
- Unresolved differences: 4

## Missing (1)

- `old:paragraph`  > 创建 AgoraRTCClient 对象 > 选择视频编码格式 @ 33 "1 Firefox 对 H.264 的支持依赖 OpenH264 Video Codec provided by Cisco Systems, Inc. 插件。Firefox 安装成功后会自动在后台下载该插件并默认启用，但是如果通话时插件没有下载完成，Firefox 就无法支持 H.264。2 Android 设备上 Chrome 58 及以后版本对 H.2"

## Extra (2)

- `new:list-item`  > 创建 AgoraRTCClient 对象 > 选择视频编码格式 @ 31 "1Firefox 对 H.264 的支持依赖 OpenH264 Video Codec provided by Cisco Systems, Inc. 插件。Firefox 安装成功后会自动在后台下载该插件并默认启用，但是如果通话时插件没有下载完成，Firefox 就无法支持 H.264。"
- `new:list-item`  > 创建 AgoraRTCClient 对象 > 选择视频编码格式 @ 32 "2Android 设备上 Chrome 58 及以后版本对 H.264 的支持取决于设备。因为 Chrome 在 Android 设备上对 H.264 强制使用硬件编解码，即使 Chrome 支持 H.264，如果 Android 设备的芯片不支持 H.264 的硬件编解码，H.264 实际上也是不可用的。"

## Changed (1)

- `old:table-row`  > 创建 AgoraRTCClient 对象 > 选择视频编码格式 @ 29 "Android Chrome 58+ | ✔ | 无明确信息 2 | ✔（需要 Chrome 68+）"
  - target: `new:table-row`  > 创建 AgoraRTCClient 对象 > 选择视频编码格式 @ 28 "Android Chrome 58+ | ✔ | 无明确信息2 | ✔（需要 Chrome 68+）"
  - similarity: 1.00

## Moved (0)

- None

## Unsupported (0)

- None
