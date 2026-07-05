# Single Document Content Fidelity Audit

Generated: 2026-07-05T10:50:33.294Z
Old source: `/Users/yangyixuan/Documents/GitHub/shengwang-doc-source/docs/rtc-server-sdk/error-code.mdx`
New source: `/private/tmp/docs-portal-migration-control-spec/content/docs/zh-CN/realtime-media/rtc-server-sdk/error-code.mdx`
Old URL: (not provided)
New URL: (not provided)
Projection: product=`rtc-server-sdk`, platform=`all`

## Summary

- Source records: 37
- Target records: 37
- Exact matches: 35
- Missing: 0
- Extra: 0
- Changed: 2
- Moved: 0
- Unsupported: 0
- Legacy residue: none
- Unresolved differences: 2

## Missing (0)

- None

## Extra (0)

- None

## Changed (2)

- `old:table-row` (root) @ 40 "109 | 当前使用的 Token 过期，不再有效。请在服务端申请生成新的 Token，并调用 renewToken 更新 Token。:::note废弃该错误码已废弃。请改用 onConnectionStateChanged 回调中的 CONNECTIONCHANGEDTOKENEXPIRED(9)。:::"
  - target: `new:table-row` (root) @ 36 "109 | 当前使用的 Token 过期，不再有效。请在服务端申请生成新的 Token，并调用 renewToken 更新 Token。:::info废弃该错误码已废弃。请改用 onConnectionStateChanged 回调中的 CONNECTIONCHANGEDTOKENEXPIRED(9)。:::"
  - similarity: 0.71
- `old:table-row` (root) @ 41 "110 | Token 无效。一般有以下原因：在声网控制台中启用了 App 证书，但未使用 App ID Token 鉴权。当项目启用了 App 证书，就必须使用 Token 鉴权。生成 Token 时填入的 uid 字段，和用户加入频道时填入的 uid 不一致。:::note废弃该错误码已废弃。请改用 onConnectionStateChanged 回调"
  - target: `new:table-row` (root) @ 37 "110 | Token 无效。一般有以下原因：在声网控制台中启用了 App 证书，但未使用 App ID Token 鉴权。当项目启用了 App 证书，就必须使用 Token 鉴权。生成 Token 时填入的 uid 字段，和用户加入频道时填入的 uid 不一致。:::info废弃该错误码已废弃。请改用 onConnectionStateChanged 回调"
  - similarity: 0.78

## Moved (0)

- None

## Unsupported (0)

- None
