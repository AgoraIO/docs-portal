# Single Document Content Fidelity Audit

Generated: 2026-07-05T10:50:31.662Z
Old source: `/Users/yangyixuan/Documents/GitHub/shengwang-doc-source/docs-api-reference/rtc/error-code.mdx`
New source: `/private/tmp/docs-portal-migration-control-spec/content/docs/zh-CN/api-reference/rtc/error-code.mdx`
Old URL: (not provided)
New URL: (not provided)
Projection: product=`docs-api-reference`, platform=`all`

## Summary

- Source records: 62
- Target records: 62
- Exact matches: 60
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

- `old:table-row`  > 通用错误码 @ 46 "109 | 当前使用的 Token 过期，不再有效。请在服务端申请生成新的 Token，并调用 renewToken 更新 Token。:::note废弃该错误码已废弃。请改用 onConnectionStateChanged 回调中的 CONNECTIONCHANGEDTOKENEXPIRED(9)。:::"
  - target: `new:table-row`  > 通用错误码 @ 43 "109 | 当前使用的 Token 过期，不再有效。请在服务端申请生成新的 Token，并调用 renewToken 更新 Token。:::info废弃该错误码已废弃。请改用 onConnectionStateChanged 回调中的 CONNECTIONCHANGEDTOKENEXPIRED(9)。:::"
  - similarity: 0.71
- `old:table-row`  > 通用错误码 @ 47 "110 | Token 无效。一般有以下原因：在声网控制台中启用了 App 证书，但未使用 App ID Token 鉴权。当项目启用了 App 证书，就必须使用 Token 鉴权。生成 Token 时填入的 uid 字段，和用户加入频道时填入的 uid 不一致。:::note废弃该错误码已废弃。请改用 onConnectionStateChanged 回调"
  - target: `new:table-row`  > 通用错误码 @ 44 "110 | Token 无效。一般有以下原因：在声网控制台中启用了 App 证书，但未使用 App ID Token 鉴权。当项目启用了 App 证书，就必须使用 Token 鉴权。生成 Token 时填入的 uid 字段，和用户加入频道时填入的 uid 不一致。:::info废弃该错误码已废弃。请改用 onConnectionStateChanged 回调"
  - similarity: 0.78

## Moved (0)

- None

## Unsupported (0)

- None
