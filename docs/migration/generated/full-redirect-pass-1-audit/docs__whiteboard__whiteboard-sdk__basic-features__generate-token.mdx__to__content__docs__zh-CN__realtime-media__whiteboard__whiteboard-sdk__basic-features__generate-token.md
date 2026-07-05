# Single Document Content Fidelity Audit

Generated: 2026-07-05T10:50:35.060Z
Old source: `/Users/yangyixuan/Documents/GitHub/shengwang-doc-source/docs/whiteboard/whiteboard-sdk/basic-features/generate-token.mdx`
New source: `/private/tmp/docs-portal-migration-control-spec/content/docs/zh-CN/realtime-media/whiteboard/whiteboard-sdk/basic-features/generate-token.mdx`
Old URL: (not provided)
New URL: (not provided)
Projection: product=`whiteboard`, platform=`all`

## Summary

- Source records: 296
- Target records: 298
- Exact matches: 295
- Missing: 0
- Extra: 1
- Changed: 1
- Moved: 1
- Unsupported: 0
- Legacy residue: none
- Unresolved differences: 3

## Missing (0)

- None

## Extra (1)

- `new:paragraph`  > 生成 Token > 设置 Token 的有效时长 @ 56 "如果你不设置 Token 的有效时长或将有效时长设为 0，生成的 Token 将永不过期。"

## Changed (1)

- `old:paragraph`  > 生成 Token > 设置 Token 的有效时长 @ 61 "声网支持对 Token 设置有效时长，取值为正整数，单位为毫秒。生成 Token 的 UTC 时间加上你设置的有效时长，即 Token 的过期时间。Token 过期后，用户将无法再使用该 Token 加入房间或访问互动白板服务。为确保业务可用性，你需要及时在 App 服务端生成新的 Token。如果你不设置 Token 的有效时长或将有效时长设为 0，生成的"
  - target: `new:paragraph`  > 生成 Token > 设置 Token 的有效时长 @ 54 "声网支持对 Token 设置有效时长，取值为正整数，单位为毫秒。生成 Token 的 UTC 时间加上你设置的有效时长，即 Token 的过期时间。Token 过期后，用户将无法再使用该 Token 加入房间或访问互动白板服务。为确保业务可用性，你需要及时在 App 服务端生成新的 Token。"
  - similarity: 1.00

## Moved (1)

- `old:paragraph`  > 生成 Token > 获取访问密钥对 @ 43 "绝对不要将访问密钥对发送给客户端，也不要将它们写死在代码里。确保只有业务服务器能从配置文件中读取访问密钥对。如果访问密钥对有泄露的风险，请及时联系技术支持，重新生成访问密钥对。"
  - target: `new:list-item`  > 生成 Token > 获取访问密钥对 @ 37 "绝对不要将访问密钥对发送给客户端，也不要将它们写死在代码里。确保只有业务服务器能从配置文件中读取访问密钥对。"


## Unsupported (0)

- None
