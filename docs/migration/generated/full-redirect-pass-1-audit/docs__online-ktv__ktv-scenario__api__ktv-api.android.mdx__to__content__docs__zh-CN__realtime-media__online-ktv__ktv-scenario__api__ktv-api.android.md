# Single Document Content Fidelity Audit

Generated: 2026-07-05T10:50:33.126Z
Old source: `/Users/yangyixuan/Documents/GitHub/shengwang-doc-source/docs/online-ktv/ktv-scenario/api/ktv-api.android.mdx`
New source: `/private/tmp/docs-portal-migration-control-spec/content/docs/zh-CN/realtime-media/online-ktv/ktv-scenario/api/ktv-api.android.mdx`
Old URL: (not provided)
New URL: (not provided)
Projection: product=`online-ktv`, platform=`android`

## Summary

- Source records: 387
- Target records: 387
- Exact matches: 383
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

- `old:list-item`  > KTVApi > loadMusic1/2 > 参数 @ 260 "songCode:歌曲编号，用于标识一个音乐资源。你可以通过 searchMusicByMusicChartId 或 searchMusicByKeyword 获取需要加载的歌曲编号，也可以通过 RESTful API 来获取曲库所有歌曲列表或 增量歌曲列表。"
  - target: `new:list-item`  > KTVApi > loadMusic1/2 > 参数 @ 271 "songCode:歌曲编号，用于标识一个音乐资源。你可以通过 searchMusicByMusicChartId 或 searchMusicByKeyword 获取需要加载的歌曲编号，也可以通过 RESTful API 来获取曲库所有歌曲列表或增量歌曲列表。"
  - similarity: 1.00
- `old:list-item`  > KTVApi > startSing1/2 > 参数 @ 331 "songCode：歌曲编号，用于标识一个音乐资源。你可以通过 searchMusicByMusicChartId 或 searchMusicByKeyword 获取需要加载的歌曲编号，也可以通过 RESTful API 来获取曲库所有歌曲列表或 增量歌曲列表。"
  - target: `new:list-item`  > KTVApi > startSing1/2 > 参数 @ 345 "songCode：歌曲编号，用于标识一个音乐资源。你可以通过 searchMusicByMusicChartId 或 searchMusicByKeyword 获取需要加载的歌曲编号，也可以通过 RESTful API 来获取曲库所有歌曲列表或增量歌曲列表。"
  - similarity: 1.00
- `old:list-item`  > Data class > KTVApiConfig @ 828 "localUid：本地用户的 ID。频道内的每个用户 ID 都必须是唯一，为 32 位有符号整数，取值范围为 -2 31 -1, 2 31 -1。"
  - target: `new:list-item`  > Data class > KTVApiConfig @ 865 "localUid：本地用户的 ID。频道内的每个用户 ID 都必须是唯一，为 32 位有符号整数，取值范围为 -231-1, 231-1。"
  - similarity: 0.60
- `old:list-item`  > Data class > KTVGiantChorusApiConfig @ 869 "localUid：本地用户的 ID。频道内的每个用户 ID 都必须是唯一，为 32 位有符号整数，取值范围为 -2 31 -1, 2 31 -1。"
  - target: `new:list-item`  > Data class > KTVGiantChorusApiConfig @ 907 "localUid：本地用户的 ID。频道内的每个用户 ID 都必须是唯一，为 32 位有符号整数，取值范围为 -231-1, 231-1。"
  - similarity: 0.60

## Moved (0)

- None

## Unsupported (0)

- None
