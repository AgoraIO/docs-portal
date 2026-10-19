# ConvoAI #2101 独立补齐计划

按已批准的逐源 PR 工作流执行：独立工作树/分支、TDD、独立规格与质量审查，最终 PR 目标为 `codex/cn-newdoc-html-api-migration`，不自动合并。

来源 `56896c728432e3592701a6de850c94291a552c8e`，范围终点 `5d03551cf64cd057ccfe8d5b256d9c4778e8fbb1`；目标固定基线 `7c6c60ead44406e69906c5c3808cd489784aa89e`。源六个文件均已完整只读检查，不读源环境或未提交改动。

1. 创建 `fix-hotfix-pr2101` 工作树及 `codex/fix-hotfix-pr2101` 分支，基于固定目标基线。
2. 唯一正文写集为 `content/docs/zh-CN/api-reference/conversational-ai/agent-typescript/index.mdx` 的 Type aliases 段。新增真实正文回归，先确认缺失导致 RED。
3. 仅将 `generatedConfig` 改成源 `generated_config`，补 context_message_limit 的 1–6/默认1/含当前用户/2–6启用历史，以及 history_character_limit 的 0–10000/默认1000/仅历史Unicode code points。
4. Go/Python/发版/指南/YAML 均已覆盖，不改。保留必配静态回退、Think append 常量、SDK tools、Fengming 和该段外全文；不要复制由 #2074 单独补的公开类型别名。
5. 定向 GREEN、types、实际 MDX 编译与语法、Biome、最小范围保护通过后交主控；全量测试需主控独占授权，禁止自行并发 build/preview。
6. 独立规格审查后再质量审查，主控复跑定向。与 #2074 相邻段落可能文本冲突，组合树保留“回退段→上下文新段→Think常量→#2074别名”，不得丢任一内容。
7. 每项验证和未完成 gate 记录在独立报告，本地提交交主控推送及建 PR。不新增功能、修 runtime、修改锁文件或归档策略。
