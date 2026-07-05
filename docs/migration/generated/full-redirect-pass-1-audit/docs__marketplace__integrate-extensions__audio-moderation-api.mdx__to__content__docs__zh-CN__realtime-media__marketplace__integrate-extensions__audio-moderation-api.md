# Single Document Content Fidelity Audit

Generated: 2026-07-05T10:50:32.750Z
Old source: `/Users/yangyixuan/Documents/GitHub/shengwang-doc-source/docs/marketplace/integrate-extensions/audio-moderation-api.mdx`
New source: `/private/tmp/docs-portal-migration-control-spec/content/docs/zh-CN/realtime-media/marketplace/integrate-extensions/audio-moderation-api.mdx`
Old URL: (not provided)
New URL: (not provided)
Projection: product=`marketplace`, platform=`all`

## Summary

- Source records: 343
- Target records: 343
- Exact matches: 341
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

- `old:table-row`  > API 参考 > 调用说明 > 公共参数 > 公共请求参数 @ 238 "uid | String | 标识语音审核服务（相当于频道内一个不发流的客户端）的用户 ID，例如\"527841\"。需满足以下条件：取值范围 1 到 (2 32 -1)，不可设置为 0。不能与当前频道内的任何用户 ID 重复。字段引号内为整型用户 ID，且频道内所有用户均使用整型用户 ID。 | Body 参数"
  - target: `new:table-row`  > API 参考 > 调用说明 > 公共参数 > 公共请求参数 @ 239 "uid | String | 标识语音审核服务（相当于频道内一个不发流的客户端）的用户 ID，例如\"527841\"。需满足以下条件：取值范围 1 到 (232-1)，不可设置为 0。不能与当前频道内的任何用户 ID 重复。字段引号内为整型用户 ID，且频道内所有用户均使用整型用户 ID。 | Body 参数"
  - similarity: 0.71
- `old:list-item`  > API 参考 > 开启审核任务 > 请求参数 > Body 参数 @ 367 "maxIdleTime：（选填）Number 类型，最长空闲频道时间。默认值为 30 秒，该值需大于等于 5，且小于等于 (2 32 -1)。如果频道内无用户的状态持续超过该时间，审核服务会自动退出。"
  - target: `new:list-item`  > API 参考 > 开启审核任务 > 请求参数 > Body 参数 @ 366 "maxIdleTime：（选填）Number 类型，最长空闲频道时间。默认值为 30 秒，该值需大于等于 5，且小于等于 (232-1)。如果频道内无用户的状态持续超过该时间，审核服务会自动退出。"
  - similarity: 0.60

## Moved (0)

- None

## Unsupported (0)

- None
