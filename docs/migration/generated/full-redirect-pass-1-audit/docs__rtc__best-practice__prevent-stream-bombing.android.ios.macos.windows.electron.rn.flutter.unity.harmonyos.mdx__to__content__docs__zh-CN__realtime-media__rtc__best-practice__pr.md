# Single Document Content Fidelity Audit

Generated: 2026-07-05T10:50:33.896Z
Old source: `/Users/yangyixuan/Documents/GitHub/shengwang-doc-source/docs/rtc/best-practice/prevent-stream-bombing.android.ios.macos.windows.electron.rn.flutter.unity.harmonyos.mdx`
New source: `/private/tmp/docs-portal-migration-control-spec/content/docs/zh-CN/realtime-media/rtc/best-practice/prevent-stream-bombing.harmonyos.mdx`
Old URL: (not provided)
New URL: (not provided)
Projection: product=`rtc`, platform=`harmonyos`

## Summary

- Source records: 53
- Target records: 53
- Exact matches: 50
- Missing: 0
- Extra: 0
- Changed: 3
- Moved: 0
- Unsupported: 0
- Legacy residue: none
- Unresolved differences: 3

## Missing (0)

- None

## Extra (0)

- None

## Changed (3)

- `old:table-row`  > 预防方案 > 使用连麦鉴权 @ 57 "主播加入频道发流 | 申请具有发流权限的 Token（role 设为 kRolePublisher）。调用 setClientRole 将角色设为主播。调用 joinChannel 传入具有发流权限的 Token 加入频道。"
  - target: `new:table-row`  > 预防方案 > 使用连麦鉴权 @ 53 "主播加入频道发流 | 1. 申请具有发流权限的 Token（role 设为 kRolePublisher）。2. 调用 setClientRole 将角色设为主播。3. 调用 joinChannel 传入具有发流权限的 Token 加入频道。"
  - similarity: 1.00
- `old:table-row`  > 预防方案 > 使用连麦鉴权 @ 58 "观众加入频道 | 申请不具有发流权限的 Token（role 设为 kRoleSubscriber）。由于用户加入频道的角色默认为观众，因此直接调用 joinChannel 并传入 Token 加入频道即可。"
  - target: `new:table-row`  > 预防方案 > 使用连麦鉴权 @ 54 "观众加入频道 | 1. 申请不具有发流权限的 Token（role 设为 kRoleSubscriber）。2. 由于用户加入频道的角色默认为观众，因此直接调用 joinChannel 并传入 Token 加入频道即可。"
  - similarity: 1.00
- `old:table-row`  > 预防方案 > 使用连麦鉴权 @ 59 "观众加入频道后上麦 | 申请不具有发流权限的 Token（role 设为 kRoleSubscriber），调用 joinChannel 并传入 Token 加入频道。上麦前申请具有发流权限的 Token（role 设为 kRolePublisher）。调用 renewToken 将新的 Token 同步给声网服务器。调用 setClientRole 将角色"
  - target: `new:table-row`  > 预防方案 > 使用连麦鉴权 @ 55 "观众加入频道后上麦 | 1. 申请不具有发流权限的 Token（role 设为 kRoleSubscriber），调用 joinChannel 并传入 Token 加入频道。2. 上麦前申请具有发流权限的 Token（role 设为 kRolePublisher）。3. 调用 renewToken 将新的 Token 同步给声网服务器。4. 调用 setCl"
  - similarity: 1.00

## Moved (0)

- None

## Unsupported (0)

- None
