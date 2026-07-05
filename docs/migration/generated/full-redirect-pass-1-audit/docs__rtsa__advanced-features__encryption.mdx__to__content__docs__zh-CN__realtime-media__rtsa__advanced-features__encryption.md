# Single Document Content Fidelity Audit

Generated: 2026-07-05T10:50:34.732Z
Old source: `/Users/yangyixuan/Documents/GitHub/shengwang-doc-source/docs/rtsa/advanced-features/encryption.mdx`
New source: `/private/tmp/docs-portal-migration-control-spec/content/docs/zh-CN/realtime-media/rtsa/advanced-features/encryption.mdx`
Old URL: (not provided)
New URL: (not provided)
Projection: product=`rtsa`, platform=`all`

## Summary

- Source records: 35
- Target records: 36
- Exact matches: 34
- Missing: 1
- Extra: 1
- Changed: 0
- Moved: 1
- Unsupported: 0
- Legacy residue: none
- Unresolved differences: 3

## Missing (1)

- `old:list-item`  > 实现方法 @ 55 "调用 agorartcjoinchannel joinChannel 时在 cryptooptiont CryptoOption 中开启加密，设置加密模式为 AES128GCM2 或 AES256GCM2，并将密钥和盐传入 SDK。"

## Extra (1)

- `new:list-item`  > 实现方法 @ 54 "调用 agorartcjoinchanneljoinChannel 时在 cryptooptiontCryptoOption 中开启加密，设置加密模式为 AES128GCM2 或 AES256GCM2，并将密钥和盐传入 SDK。"

## Changed (0)

- None

## Moved (1)

- `old:paragraph`  > 实现方法 @ 58 "同一频道内所有用户必须使用相同的加密模式、密钥和盐。否则，可能会出现黑屏或音频丢失等未定义行为。为确保安全性，声网建议在每次启用媒体流加密前使用新的密钥和盐。"
  - target: `new:list-item`  > 实现方法 @ 57 "同一频道内所有用户必须使用相同的加密模式、密钥和盐。否则，可能会出现黑屏或音频丢失等未定义行为。"


## Unsupported (0)

- None
