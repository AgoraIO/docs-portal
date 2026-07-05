# Single Document Content Fidelity Audit

Generated: 2026-07-05T10:50:33.131Z
Old source: `/Users/yangyixuan/Documents/GitHub/shengwang-doc-source/docs/online-ktv/ktv-scenario/api/ktv-api.ios.mdx`
New source: `/private/tmp/docs-portal-migration-control-spec/content/docs/zh-CN/realtime-media/online-ktv/ktv-scenario/api/ktv-api.ios.mdx`
Old URL: (not provided)
New URL: (not provided)
Projection: product=`online-ktv`, platform=`ios`

## Summary

- Source records: 340
- Target records: 340
- Exact matches: 336
- Missing: 0
- Extra: 0
- Changed: 4
- Moved: 0
- Unsupported: 0
- Legacy residue: none
- Unresolved differences: 4

## Missing (0)

- None

## Extra (0)

- None

## Changed (4)

- `old:list-item`  > KTVApiDelegate > loadMusic1/2 > 参数 @ 206 "songCode:歌曲编号，用于标识一个音乐资源。你可以通过 searchMusic1/2 或 searchMusic2/2 获取需要加载的歌曲编号，也可以通过 RESTful API 来获取曲库所有歌曲列表或 增量歌曲列表。"
  - target: `new:list-item`  > KTVApiDelegate > loadMusic1/2 > 参数 @ 219 "songCode:歌曲编号，用于标识一个音乐资源。你可以通过 searchMusic1/2 或 searchMusic2/2 获取需要加载的歌曲编号，也可以通过 RESTful API 来获取曲库所有歌曲列表或增量歌曲列表。"
  - similarity: 1.00
- `old:list-item`  > KTVApiDelegate > startSing1/2 > 参数 @ 273 "songCode：歌曲编号，用于标识一个音乐资源。你可以通过 searchMusic1/2 或 searchMusic2/2 获取需要加载的歌曲编号，也可以通过 RESTful API 来获取曲库所有歌曲列表或 增量歌曲列表。"
  - target: `new:list-item`  > KTVApiDelegate > startSing1/2 > 参数 @ 290 "songCode：歌曲编号，用于标识一个音乐资源。你可以通过 searchMusic1/2 或 searchMusic2/2 获取需要加载的歌曲编号，也可以通过 RESTful API 来获取曲库所有歌曲列表或增量歌曲列表。"
  - similarity: 1.00
- `old:list-item`  > Class > KTVApiConfig @ 728 "localUid：本地用户的 ID。频道内的每个用户 ID 都必须是唯一，需是 32 位无符号整数，建议取值范围为 1,2 32 -1。"
  - target: `new:list-item`  > Class > KTVApiConfig @ 768 "localUid：本地用户的 ID。频道内的每个用户 ID 都必须是唯一，需是 32 位无符号整数，建议取值范围为 1,232-1。"
  - similarity: 0.75
- `old:list-item`  > Class > GiantChorusConfiguration @ 803 "localUid：本地用户的 ID。频道内的每个用户 ID 都必须是唯一，需是 32 位无符号整数，建议取值范围为 1,2 32 -1。"
  - target: `new:list-item`  > Class > GiantChorusConfiguration @ 841 "localUid：本地用户的 ID。频道内的每个用户 ID 都必须是唯一，需是 32 位无符号整数，建议取值范围为 1,232-1。"
  - similarity: 0.75

## Moved (0)

- None

## Unsupported (0)

- None
