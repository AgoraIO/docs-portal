# 真实文档 KB 样本

本样本用于替换本地摘录演示中的合成文档，也作为后续百炼独立 demo 库的候选语料。它不是已创建的云端知识库。

## 固定范围

选择文件：[demo-selection-v1.json](demo-selection-v1.json)，scope 为 `cn-real-demo-v1`。

| 文档 | 验证目的 |
| --- | --- |
| 使用 Token 鉴权：Web | JavaScript 代码、Web 平台信息 |
| 使用 Token 鉴权：Android | 同一主题的平台隔离、Java 代码 |
| 如何升级到 Token 鉴权方案？ | 普通 FAQ 与来源链接 |
| 如何处理 Token 相关错误码？ | 错误处理、跨文档引用 |
| 创建对话式智能体 | OpenAPI 文档类型、参数与代码示例 |

Web 与 Android 是两个来源身份；不能把平台正文合并后仅保留一个平台标签。样本范围变化时使用新 scope 和独立状态，不能拿样本状态操作全量 KB。

## 导出

输入必须是同一次、已核实源码 revision 的完整 CN 静态产物。构建期间不要导出；导出期间不要重建输入目录。以下 `BUILD_REVISION` 应来自该次构建记录，不能把任意旧产物标记为当前 HEAD。

```sh
bun run kb:export:cn \
  --public dist/client \
  --out dist/ai-kb/cn-real-demo-v1/corpus.json \
  --scope cn-real-demo-v1 \
  --revision "$BUILD_REVISION" \
  --select docs/ai-kb/demo-selection-v1.json
```

输出去掉发布产物开头的固定 `llms.txt` 导航提示，保留文档正文和代码；同时保留平台、产品、类型、章节链接和摘要。`complete: true` 表示本次 selection 完整，不表示全站已导出。CLI 仍读取完整发布清单并检查路由与实际锚点；正文覆盖率按显式 selection 检查，选中的空页面或缺失来源仍失败。未选择的零记录页面不会阻断样本，也不会因此被标记为已覆盖。无 `--select` 的全量导出仍检查全部合格来源。

## 本地测试

按 [主指南](../ai-kb-demo.md) 设置本地摘录模式，将 `AI_BOT_CORPUS_PATH` 指向导出的 corpus 绝对路径，重启开发服务。打开 `/zh-CN/search` 并点击“AI 问答”。

| 操作 | 预期 |
| --- | --- |
| 输入 `Token`，平台选 Web | 有原文摘录；返回来源的平台 Metadata 必须包含 Web |
| 输入 `Token`，平台选 Android | 有 Android 来源；不混入仅属于 Web 的教程 |
| 文档类型选 API，输入 `创建对话式智能体` | 命中 API 来源 |
| 输入 `火星香蕉量子咖啡` | 提示依据不足 |
| 点击参考文档 | 打开真实路由，而不是 `/zh-CN/ai/demo-*` 合成路径 |

这是确定性关键词摘录，尚未调用模型；中文长句不保证命中。未接 Meilisearch 的本机普通搜索可能显示不可用，与本地摘录的验证范围不同。

本机普通搜索未配置时，页面的平台选项也可能尚未加载。此时可直接测试独立问答接口的筛选，Web 请求如下；将 `web` 改为 `android` 验证另一平台：

```sh
curl -sS http://127.0.0.1:3008/api/ai/answer \
  -H 'Content-Type: application/json' \
  --data '{"question":"Token","platform":"web"}'
```

## 增量与云端边界

本地可以用模拟成功状态证明：首次新增 5、同内容跳过 5、仅修改一篇则更新 1。模拟 remoteIds 必须放在单独的离线演示目录，不能复制成真实同步状态。真实云端成功状态只能由同步执行器在导入及检索验证后产生。

真实接入仍需业务空间 ID、独立上传类目、服务端凭据和付费决策；这些不写入样本选择文件，也不填虚构可执行目标。创建/上传暂缓。后续真实验证至少包括导入成功、可检索、平台筛选及更新后旧内容不再召回。当前本地结果不能替代这些验收。

## 本地质量与切块

已增加独立 [质量报告与切块预览](chunk-preview.md)，可运行 `bun run kb:preview:cn` 检查真实 corpus；预览不替换百炼同步输入或当前问答实现。
