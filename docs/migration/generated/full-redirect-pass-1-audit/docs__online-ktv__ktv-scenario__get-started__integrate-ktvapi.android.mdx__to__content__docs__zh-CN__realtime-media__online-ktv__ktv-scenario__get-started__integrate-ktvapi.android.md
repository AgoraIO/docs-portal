# Single Document Content Fidelity Audit

Generated: 2026-07-05T10:50:33.154Z
Old source: `/Users/yangyixuan/Documents/GitHub/shengwang-doc-source/docs/online-ktv/ktv-scenario/get-started/integrate-ktvapi.android.mdx`
New source: `/private/tmp/docs-portal-migration-control-spec/content/docs/zh-CN/realtime-media/online-ktv/ktv-scenario/get-started/integrate-ktvapi.android.mdx`
Old URL: (not provided)
New URL: (not provided)
Projection: product=`online-ktv`, platform=`android`

## Summary

- Source records: 87
- Target records: 90
- Exact matches: 87
- Missing: 0
- Extra: 0
- Changed: 0
- Moved: 2
- Unsupported: 0
- Legacy residue: none
- Unresolved differences: 2

## Missing (0)

- None

## Extra (0)

- None

## Changed (0)

- None

## Moved (2)

- `old:paragraph`  > 前提条件 @ 38 "你可以参考开通服务获取临时 RTC Token 用于测试，但在正式生产环境中，你需要自己部署一个 RTC Token 服务器来生成、更新 Token，详见使用 Token 鉴权。如果你使用了声网的版权音乐，你还需要使用 RTM Token，详见部署 RTM Token。如果你的网络环境部署了防火墙，请参考应用企业防火墙限制以正常使用声网服务。"
  - target: `new:list-item`  > 前提条件 @ 34 "你可以参考开通服务获取临时 RTC Token 用于测试，但在正式生产环境中，你需要自己部署一个 RTC Token 服务器来生成、更新 Token，详见使用 Token 鉴权。如果你使用了声网的版权音乐，你还需要使用 RTM Token，详见部署 RTM Token。"

- `old:paragraph`  > 实现在线 K 歌 > 1. 创建并初始化 KTV API 模块 @ 169 "当用于加入主频道的 Token 即将过期前，你会收到 IRtcEngineEventHandler 类下的 onTokenPrivilegeWillExpire 回调，你需要调用 IRtcEngine 下的 renewToken 来更新 Token。如需更新加入合唱子频道的 Token，直接调用 KTVApi 下的 renewToken 来更新 Token。"
  - target: `new:list-item`  > 实现在线 K 歌 > 1. 创建并初始化 KTV API 模块 @ 154 "当用于加入主频道的 Token 即将过期前，你会收到 IRtcEngineEventHandler 类下的 onTokenPrivilegeWillExpire 回调，你需要调用 IRtcEngine 下的 renewToken 来更新 Token。"


## Unsupported (0)

- None
