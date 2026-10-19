# 百炼 KB 第二阶段接口核实

日期：2026-10-15。分支 `codex/cn-ai-bot-kb-demo`，进入本阶段时 HEAD 为 `5dad5ced7`。本轮是设计/实施计划的准备，未执行云写入。

## 已确认的目标

用户本轮明确选择：尚无专用目标，使用新建的独立 demo KB。不得将已有知识库自动接管为本同步器目标。创建库前先准备代表文档；当前 create_v2 接口要求非空 docIds，不能把空数组当成已证实的空库创建方式。

## 本轮实时观察

通过已有 Codex 内置浏览器恢复了百炼会话：北京地域、主账号空间，原文档站仍可查看。Chrome 的认证错误未影响内置浏览器会话，不据此判断云账号退出。

API Key 管理页存在名为 `cn-search-demo` 的条目。控制台说明新 Key 仅在创建时展示一次，此次没有获取明文、重置、新建或复制任何 Key。账户登录/MFA 不能替代后端 Bearer Key。未读取本地私有 env 或捕获浏览器隐藏鉴权。

## 官方 API 核对

本轮重新读取以下阿里云官方文档；文档的请求/响应示例是适配器测试依据，不冒充账号实测响应。

| 动作 | 方法与路径 | 必须遵守的细节 |
| --- | --- | --- |
| 上传租约 | POST `/api/v1/connector/dash/applyFileUploadLease` | `category`、字符串 `sizeBytes`、`contentMd5`；文档文字称 Base64，示例却是 hex，须在隔离样本实测确认，不能失败后盲目重试写请求 |
| PUT 文件 | 租约返回 URL | 仅发送文件二进制及返回的上传 headers；不携带百炼 Bearer Key，不记录预签名 URL |
| 注册文件 | POST `/api/v1/connector/dash/addFile` | `leaseId/category/parser/tags/originalFileUrl`；返回 `fileId`，此 ID 与 KB 文档 ID 分别记录 |
| 新建并首次导入 | POST `/api/v1/indices/rag/index/create_v2` | 文档搜索、非结构化、内置存储；非空 `docIds`，`sourceType=DATA_CENTER_FILE`；返回 pipelineId/ingestionId |
| 后续增量导入 | POST `/api/v1/indices/rag/index/job/create` | 明确 `sourceType=DATA_CENTER_FILE` + 本次 fileId 对应的 `docIds`，绝不省略来源而导入整个数据中心 |
| 任务状态 | GET `/api/v1/indices/rag/index_job/status` | 同时带 `index_id/job_id`；整体 COMPLETED 后仍须逐页核对本次每篇文档 FINISH |
| KB 文档列表 | GET `/api/v1/indices/rag/index/files` | `index_id/page_number/page_size`；概览写 page_num，但具体接口写 page_number，以具体文档并结合实测为准 |
| 数据中心文件列表 | POST `/api/v1/connector/dash/listFile` | `categoryId/fileName/nextToken/maxResult`；fileName 精确匹配且不含扩展名；不等同 KB 文档列表 |
| 文件详情 | POST `/api/v1/connector/dash/describeFile` | 文档摘要提 MD5/标签，实际响应字段表及示例未给出相应字段，不能假定可由详情验证任意 hash/owner |
| 删除 KB 文档 | POST `/api/v1/indices/rag/index/delete_file` | `index_id/doc_ids`，结果含 deleted；还须查列表确认目标消失；不顺手删除数据中心文件或整个库 |

官方链接：

- https://help.aliyun.com/zh/model-studio/rag-api-overview
- https://help.aliyun.com/zh/model-studio/rag-api-upload-lease
- https://help.aliyun.com/zh/model-studio/rag-api-add-file
- https://help.aliyun.com/zh/model-studio/rag-api-create-index
- https://help.aliyun.com/zh/model-studio/rag-api-submit-sync-job
- https://help.aliyun.com/zh/model-studio/rag-api-get-sync-job-status
- https://help.aliyun.com/zh/model-studio/rag-api-list-documents
- https://help.aliyun.com/zh/model-studio/rag-api-list-file
- https://help.aliyun.com/zh/model-studio/rag-api-describe-file
- https://help.aliyun.com/zh/model-studio/rag-api-delete-document

## 设计约束

1. 成功 envelope 按接口组检查：HTTP 状态、code、status/status_code/success 不能相互矛盾。不能仅看 HTTP 200，也不能假定每个接口都有同一组字段。
2. 内部完整 Metadata 保留在本地 corpus/持久化状态；官方 addFile 确认支持 tags 和 originalFileUrl，未确认任意自定义 Metadata 字典。标签存在不代表可作为产品/平台过滤字段。该差异须在真实样本回执中明确。
3. 更新使用“新对象完成并验证 → 清理受管旧对象 → 提交成功状态”；不承诺原子替换，不能只做追加后声称更新完成。
4. 写请求的网络超时/服务端失败可能结果未知；先保存写意图，恢复时对账。没有足够远端证据就停止并标为 needs-reconciliation，不能猜测不存在后重复创建。
5. 本地 demo 先用操作者明确指定、跨进程保存的目录和排他锁；这不是外部 CI 持久化方案。多机/共享文件系统并发及 CI 后端另行落实。
6. 新库初始化同样需要持久化意图；create_v2 超时且未返回库 ID 时不再次自动创建。同名库不能自动认为是自己的。
7. 实测前检查 Markdown、平台变体和 OpenAPI 样本，并明确真实发布产物 revision。没有同 SHA 产物时不能把合成 fixture 验收写成真实语料验收。

## 仍需真实验证

可调用的 API Key/权限；独立类目和 demo 库的最终身份；上传 MD5 编码；原始 URL 在召回中的呈现；Metadata 写入/过滤能力；fileId/doc_id 映射；未知导入能否通过 ingestion_id 对账；直接 retrieve 的可检索性证据。创建 Key 或更改权限之前需单独落实凭据配置，不重置已有 Key。

## 本轮控制台配置补充

- 知识库创建菜单显示标准版 0.03 元/小时、旗舰版 0.2 元/RCU/小时；这只是当前页面价，不是包含全部模型/解析费用的报价。创建前须确认费用。
- 已在未提交的标准版向导填写 `cn-ai-bot-demo`，文档搜索/基础文档问答；停在选择数据步骤，未选已有文件、未上传、未提交创建。此流程明确要求选数据，不能把基础表单填写当成建库成功。
- API Key 未提交表单填写描述 `cn-ai-bot-kb-demo`；自定义选项目前只显示 IP 白名单和模型访问范围，未看到按 KB ID 限权。不能声称专用 Key 天然只能操作 demo 库。默认白名单包含全部 IPv4/IPv6，未提交新 Key。
- 后续优先由用户在本机安全注入已有可用 Key；如需新建持久凭据，在明确权限后按平台确认规则单独确认。不以创建知识库授权代替创建 API Key 授权。
