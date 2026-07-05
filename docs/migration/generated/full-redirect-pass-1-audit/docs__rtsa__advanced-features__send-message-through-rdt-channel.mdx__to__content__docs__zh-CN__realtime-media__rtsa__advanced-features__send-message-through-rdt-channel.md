# Single Document Content Fidelity Audit

Generated: 2026-07-05T10:50:34.735Z
Old source: `/Users/yangyixuan/Documents/GitHub/shengwang-doc-source/docs/rtsa/advanced-features/send-message-through-rdt-channel.mdx`
New source: `/private/tmp/docs-portal-migration-control-spec/content/docs/zh-CN/realtime-media/rtsa/advanced-features/send-message-through-rdt-channel.mdx`
Old URL: (not provided)
New URL: (not provided)
Projection: product=`rtsa`, platform=`all`

## Summary

- Source records: 77
- Target records: 77
- Exact matches: 76
- Missing: 0
- Extra: 0
- Changed: 1
- Moved: 0
- Unsupported: 0
- Legacy residue: none
- Unresolved differences: 1

## Missing (0)

- None

## Extra (0)

- None

## Changed (1)

- `old:paragraph`  > 实现发送和接收 RDT 消息 > 5. 断开 RDT 连接 @ 231 "离开 RTC 频道后，用户在该频道内创建的 RDT 连接都会自动断开。为避免正在传输中的数据丢失，声网推荐你先调用 vars.getrdtstatusinfo 方法查询发送缓冲区长度 (vars.sendqueuesize)，确保远端用户已接收完 RDT 消息 ( vars.sendqueuesize = 0 ) 后再离开 RTC 频道。"
  - target: `new:paragraph`  > 实现发送和接收 RDT 消息 > 5. 断开 RDT 连接 @ 197 "离开 RTC 频道后，用户在该频道内创建的 RDT 连接都会自动断开。为避免正在传输中的数据丢失，声网推荐你先调用 vars.getrdtstatusinfo 方法查询发送缓冲区长度 (vars.sendqueuesize)，确保远端用户已接收完 RDT 消息 (vars.sendqueuesize = 0) 后再离开 RTC 频道。"
  - similarity: 1.00

## Moved (0)

- None

## Unsupported (0)

- None
