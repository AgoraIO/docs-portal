# Single Document Content Fidelity Audit

Generated: 2026-07-05T10:50:34.048Z
Old source: `/Users/yangyixuan/Documents/GitHub/shengwang-doc-source/docs/rtc/get-started/quick-start.ios.mdx`
New source: `/private/tmp/docs-portal-migration-control-spec/content/docs/zh-CN/realtime-media/rtc/get-started/quick-start.ios.mdx`
Old URL: (not provided)
New URL: (not provided)
Projection: product=`rtc`, platform=`ios`

## Summary

- Source records: 125
- Target records: 142
- Exact matches: 125
- Missing: 0
- Extra: 0
- Changed: 0
- Moved: 4
- Unsupported: 0
- Legacy residue: none
- Unresolved differences: 4

## Missing (0)

- None

## Extra (0)

- None

## Changed (0)

- None

## Moved (4)

- `old:paragraph` (root) @ 24 "所有用户调用 joinChannel 方法加入频道，并根据需要设置用户角色：互动直播：如果用户需要在频道中发流，则设为主播；如果用户只需要收流，则设为观众。视频通话：将所有用户的角色都设为主播。加入频道后，不同角色的用户具备不同的行为：所有用户默认都可以接收频道中的音视频流。主播可以在频道内发布音视频流。观众如果需要发流，可在频道内调用 setClientR"
  - target: `new:list-item` (root) @ 16 "所有用户调用 joinChannel 方法加入频道，并根据需要设置用户角色："

- `old:paragraph`  > 前提条件 @ 43 "Xcode 12.0 或以上版本。Apple 开发者账号。如需使用 Cocoapods 集成 SDK，则确保已安装 Cocoapods，否则请参考 Getting Started with CocoaPods 进行安装。"
  - target: `new:list-item`  > 前提条件 @ 30 "Xcode 12.0 或以上版本。"

- `old:paragraph`  > 前提条件 @ 52 "可以访问互联网的计算机。如果你的网络环境部署了防火墙，参考应对防火墙限制以正常使用声网服务。一个有效的声网账号以及声网项目。请参考开通服务从声网控制台获得 App ID 和临时 Token。"
  - target: `new:list-item`  > 前提条件 @ 34 "可以访问互联网的计算机。如果你的网络环境部署了防火墙，参考应对防火墙限制以正常使用声网服务。"

- `old:paragraph`  > 调试 App @ 463 "参考以下步骤来测试你的 App：将 iOS 设备连接至计算机。点击 Build 来运行你的项目，需等待几秒至 App 安装完成。允许 App 访问设备的麦克风和摄像头权限。（可选）如果设备上弹出不受信任的开发者提示，则首先点击取消关闭该提示，然后在 iOS 设备上打开设置 > 通用 > VPN 与设备管理，在开发者 APP 中选择信任该开发者。使用第二台 i"
  - target: `new:paragraph`  > 调试 App @ 460 "参考以下步骤来测试你的 App："


## Unsupported (0)

- None
