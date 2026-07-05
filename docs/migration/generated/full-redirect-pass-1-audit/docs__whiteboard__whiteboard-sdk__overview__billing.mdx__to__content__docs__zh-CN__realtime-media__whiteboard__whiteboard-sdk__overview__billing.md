# Single Document Content Fidelity Audit

Generated: 2026-07-05T10:50:35.089Z
Old source: `/Users/yangyixuan/Documents/GitHub/shengwang-doc-source/docs/whiteboard/whiteboard-sdk/overview/billing.mdx`
New source: `/private/tmp/docs-portal-migration-control-spec/content/docs/zh-CN/realtime-media/whiteboard/whiteboard-sdk/overview/billing.mdx`
Old URL: (not provided)
New URL: (not provided)
Projection: product=`whiteboard`, platform=`all`

## Summary

- Source records: 71
- Target records: 79
- Exact matches: 71
- Missing: 0
- Extra: 0
- Changed: 0
- Moved: 3
- Unsupported: 0
- Legacy residue: none
- Unresolved differences: 3

## Missing (0)

- None

## Extra (0)

- None

## Changed (0)

- None

## Moved (3)

- `old:paragraph`  > 费用组成 @ 41 "文档转换服务分为文档转网页和文档转图片两种方式，文档转网页的实际费用是文档转图片的 5 倍。在计费时，声网会将文档转网页的用量转换成文档转图片的用量，即文档转网页总页数 × 5。文档转换服务可以单独配置 QPS 并按 QPS 计费。详见文档转换服务按 QPS 计费。QPS 计费和标准计费是互斥的，一个项目只能选择一种计费方式。声网会将每月的总费用四舍五入，精"
  - target: `new:list-item`  > 费用组成 @ 44 "文档转换服务分为文档转网页和文档转图片两种方式，文档转网页的实际费用是文档转图片的 5 倍。在计费时，声网会将文档转网页的用量转换成文档转图片的用量，即文档转网页总页数 × 5。"

- `old:paragraph`  > 费用组成 > 用量查看 @ 87 "时间段范围不能超过 12 个月。角色为管理员或财务的声网开发者账户拥有查看用量统计页面的权限。声网控制台展示的用量仅供参考，实际用量以账单为准。"
  - target: `new:list-item`  > 费用组成 > 用量查看 @ 84 "时间段范围不能超过 12 个月。"

- `old:paragraph`  > 常见问题 @ 140 "会计费，因为白板底层只根据是否有活跃长连接来计算用量。因此，为避免产生额外费用，声网建议：在用户离开房间时，调用 disconnect() 断开与当前房间的连接，并确保收到 onPhaseChanged(disconnected) 回调。直播结束时在 App 服务端调用封禁房间强制所有人退出房间。"
  - target: `new:paragraph`  > 常见问题 @ 142 "会计费，因为白板底层只根据是否有活跃长连接来计算用量。因此，为避免产生额外费用，声网建议："


## Unsupported (0)

- None
