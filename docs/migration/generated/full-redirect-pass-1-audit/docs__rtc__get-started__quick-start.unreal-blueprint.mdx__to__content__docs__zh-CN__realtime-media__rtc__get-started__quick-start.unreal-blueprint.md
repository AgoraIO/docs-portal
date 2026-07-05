# Single Document Content Fidelity Audit

Generated: 2026-07-05T10:50:34.072Z
Old source: `/Users/yangyixuan/Documents/GitHub/shengwang-doc-source/docs/rtc/get-started/quick-start.unreal-blueprint.mdx`
New source: `/private/tmp/docs-portal-migration-control-spec/content/docs/zh-CN/realtime-media/rtc/get-started/quick-start.unreal-blueprint.mdx`
Old URL: (not provided)
New URL: (not provided)
Projection: product=`rtc`, platform=`unreal-blueprint`

## Summary

- Source records: 196
- Target records: 203
- Exact matches: 195
- Missing: 1
- Extra: 2
- Changed: 0
- Moved: 1
- Unsupported: 0
- Legacy residue: none
- Unresolved differences: 4

## Missing (1)

- `old:paragraph`  > 实现步骤 > 实现基础流程 @ 147 "原生节点为蓝图自带的节点，可以直接添加调用。自定义节点非蓝图自带，需要在创建自定义函数后才能添加对应节点。"

## Extra (2)

- `new:paragraph`  > 实现步骤 > 实现基础流程 @ 144 "原生节点为蓝图自带的节点，可以直接添加调用。"
- `new:paragraph`  > 实现步骤 > 实现基础流程 @ 146 "自定义节点非蓝图自带，需要在创建自定义函数后才能添加对应节点。"

## Changed (0)

- None

## Moved (1)

- `old:paragraph` (root) @ 19 "所有用户调用 joinChannel 方法加入频道，并根据需要设置用户角色：互动直播：如果用户需要在频道中发流，则设为主播；如果用户只需要收流，则设为观众。视频通话：将所有用户的角色都设为主播。加入频道后，不同角色的用户具备不同的行为：所有用户默认都可以接收频道中的音视频流。主播可以在频道内发布音视频流。观众如果需要发流，可在频道内调用 setClientR"
  - target: `new:list-item` (root) @ 16 "所有用户调用 joinChannel 方法加入频道，并根据需要设置用户角色："


## Unsupported (0)

- None
