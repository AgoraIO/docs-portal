# Single Document Content Fidelity Audit

Generated: 2026-07-05T10:50:34.927Z
Old source: `/Users/yangyixuan/Documents/GitHub/shengwang-doc-source/docs/speech-to-text/webhook/ncs-events.mdx`
New source: `/private/tmp/docs-portal-migration-control-spec/content/docs/zh-CN/realtime-media/speech-to-text/webhook/ncs-events.mdx`
Old URL: (not provided)
New URL: (not provided)
Projection: product=`speech-to-text`, platform=`all`

## Summary

- Source records: 79
- Target records: 79
- Exact matches: 77
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

- `old:table-row`  > 事件类型 > 202 transcript upload failed @ 208 "succeedfilelist | 'Array<Object>' | 上传成功的文件列表。每个对象包含以下字段：filename：文件名称。filecreationts：文件创建时间的 Unix 时间戳（毫秒）。"
  - target: `new:table-row`  > 事件类型 > 202 transcript upload failed @ 199 "succeedfilelist | Array<Object> | 上传成功的文件列表。每个对象包含以下字段：filename：文件名称。filecreationts：文件创建时间的 Unix 时间戳（毫秒）。"
  - similarity: 1.00
- `old:table-row`  > 事件类型 > 202 transcript upload failed @ 209 "failedfilelist | 'Array<Object>' | 上传失败的文件列表。每个对象包含以下字段：filename：文件名称。filecreationts：文件创建时间的 Unix 时间戳（毫秒）。message：具体失败原因。"
  - target: `new:table-row`  > 事件类型 > 202 transcript upload failed @ 200 "failedfilelist | Array<Object> | 上传失败的文件列表。每个对象包含以下字段：filename：文件名称。filecreationts：文件创建时间的 Unix 时间戳（毫秒）。message：具体失败原因。"
  - similarity: 1.00

## Moved (0)

- None

## Unsupported (0)

- None
