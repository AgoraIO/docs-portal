# Single Document Content Fidelity Audit

Generated: 2026-07-05T10:50:33.869Z
Old source: `/Users/yangyixuan/Documents/GitHub/shengwang-doc-source/docs/rtc/best-practice/multi-user-video.javascript.mdx`
New source: `/private/tmp/docs-portal-migration-control-spec/content/docs/zh-CN/realtime-media/rtc/best-practice/multi-user-video.javascript.mdx`
Old URL: (not provided)
New URL: (not provided)
Projection: product=`rtc`, platform=`javascript`

## Summary

- Source records: 24
- Target records: 26
- Exact matches: 24
- Missing: 0
- Extra: 0
- Changed: 0
- Moved: 2
- Unsupported: 0
- Legacy residue: none
- Unresolved differences: 2

## Missing (0)

- None

## Extra (0)

- None

## Changed (0)

- None

## Moved (2)

- `old:paragraph`  > 实现步骤 > 1. 发流端开启双流模式 @ 26 "小流的分辨率（宽 x 高）比例需要和大流的分辨率（宽 x 高）比例相同。由于不同的浏览器对于视频参数设置有不同的限制，setLowStreamParameter 设置的视频参数不一定都会生效。目前发现的未能充分适配的浏览器有 Firefox 浏览器，对其设置帧率不生效，浏览器本身会把帧率固定在 30 fps。"
  - target: `new:list-item`  > 实现步骤 > 1. 发流端开启双流模式 @ 24 "小流的分辨率（宽 x 高）比例需要和大流的分辨率（宽 x 高）比例相同。"

- `old:paragraph`  > 实现步骤 > 2. 接收端设置订阅流类型 @ 35 "桌面端最多订阅 4 路大流和 13 路小流。移动端最多订阅 1 路大流和 4 路小流。"
  - target: `new:list-item`  > 实现步骤 > 2. 接收端设置订阅流类型 @ 33 "桌面端最多订阅 4 路大流和 13 路小流。"


## Unsupported (0)

- None
