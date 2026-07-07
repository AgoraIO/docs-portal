# 中文产品平台后缀收敛计划

## Goal

确保 `content/docs/zh-CN` 的产品文档目录中不再出现同一标题的多平台后缀页面，统一合并到不带平台后缀的单篇文档。API reference 目录单独处理，不纳入本轮产品文档合并。

## Phases

1. [completed] 全量审计中文产品目录中的平台后缀文件。
2. [completed] 扩展平台 registry 和合并脚本，覆盖 `swift`、`cpp`、`c`、`java`、`python`。
3. [completed] 对中文产品目录执行合并并重写旧链接。
4. [completed] 验证无残留后缀文件/导航项，并跑类型检查和相关测试。

## Decisions

- `swift`、`java`、`c` 作为正式平台 key 加入 registry。
- `api-reference` 下的语言/API 文件不是本轮产品文档侧边栏重复问题的目标。
