# 中文普通搜索公开 URL 迁移

普通搜索的新索引统一输出不带 `/zh-CN` 的公开地址。例如：

```json
{
  "url": "/realtime-media/rtc/build/setup-and-access/token-authentication/ios#token",
  "canonicalUrl": "/realtime-media/rtc/build/setup-and-access/token-authentication",
  "locale": "zh-CN",
  "platform": ["ios"],
  "availablePlatforms": ["android", "ios", "web"]
}
```

此示例只展示相关字段。`url` 用于章节/平台跳转，`canonicalUrl` 用于跨平台文档聚合；两者一起转换，保留 query 和 fragment。`locale`、产品、平台、默认平台和版本信息继续保留。搜索排序中按路径识别 API 和产品入口的逻辑同时适配。

## 内容路径与公开地址

`content/docs/zh-CN` 不移动。导出器继续通过构建清单里的真实路径读取 Markdown、HTML，并使用中文内容路径查找 FAQ 和产品元数据，最后只转换结果地址。支持构建清单仍带前缀或已改为无前缀两种情况。

API 和前端校验在过渡期接受旧、新两种结果地址；这不是跳转规则，也不会自动把旧索引变成新索引。正式切换必须从同次构建全量重新导出并准备新索引，不能直接在正式 Meilisearch 索引中批量替换字符串。

此改动不负责门户本身的无前缀路由、搜索页入口 `/search`、旧站 `/doc/...` 的映射或 `/zh-CN/...` 兼容跳转。发布版本必须另行包含无前缀路由及配套导航，保证普通页、默认平台入口和平台页都可访问。仅合入旧站 redirect PR 不能证明这些目标页面已经存在。

## 配套发布

1. 普通搜索与公开路由代码合入后，固定最终完整应用 SHA。使用这个版本构建前端、后端并导出索引，不能混用 PR 分支 SHA 与 squash 后的 SHA。
2. 完整 CN 静态构建后运行 `bun run search:export:cn`，再运行 `node scripts/search/audit-cn-coverage.mjs --records=dist/search/cn-records.json`。审计核对本地 HTML 和章节锚点，不代表公开路由已经部署。
3. 使用现有 prepare 流程创建临时索引，并验收查询、筛选和排序，暂不激活。先发布兼容旧/新结果的后端；将完整应用 SHA 写入 `DOCS_RELEASE_REVISION`，通过同域 `/api/health` 的 `revision` 核对实际后端版本。健康状态为 `ok` 不能代替版本核对。
4. 发布配套站点，在 promote **之前**执行：

   ```sh
   bun run search:verify:urls:cn \
     --origin=https://docs-portal-staging.sh3.agoralab.co \
     --records=dist/search/cn-records.json \
     --html=dist/client
   ```

   脚本检查整批 `url` 和 `canonicalUrl`，同一页面合并检查；只允许同域、保留 query 的末尾斜杠跳转。目标必须返回 200 HTML，且 HTML 的 SHA-256 与同次构建产物一致。404、跳回旧前缀、登录/错误页、静态兜底页和旧版本页面都会阻止激活。检查不写 Meilisearch。若 CDN 会改写 HTML，需先明确改写策略再调整内容核验，不能直接跳过。
5. 检查通过后才 promote，新 API 必须在新索引激活前就位。最终在浏览器验收无筛选、指定平台、FAQ、API、OpenAPI、章节锚点和加载更多。保留前端、后端、索引的旧版本及发布回执，回滚时一起恢复。

站点与索引逐组件发布期间，旧索引仍会返回带前缀地址；回滚也可能恢复旧索引。因此已有流量环境必须在过渡期继续提供旧路径，或使用维护窗口/蓝绿切流。本次选择重建无前缀索引，并不让发布过程自动变成原子切换。尚未上线的新站应先在新入口完成整套验收，再对外切换。

## 部署仓交接

[web-monorepo 配套补丁](deployment-patches/web-monorepo-cn-search-public-urls.patch) 是基于 **2026-10-16 下载的 hci-master `b6c7554b6f8` 快照**制作的建议修改，尚未提交到 Bitbucket，也未执行 Jenkins/HCI 部署。使用前须与部署仓最新版本比对。

补丁只包含普通搜索发布所需的变更：提取旧/新构建目录、覆盖审计识别无前缀路径、正式 API 验收改为检查无前缀结果，以及在索引 promote 前核验页面与新版后端。后端镜像注入应用 SHA，流水线先发布并核对新版后端，再激活索引。附带脚本测试；不含任何环境文件或凭据。

```sh
# 在 web-monorepo 的独立分支中，先检查再应用此补丁
git apply --check /path/to/web-monorepo-cn-search-public-urls.patch
git apply /path/to/web-monorepo-cn-search-public-urls.patch
node --test helm/docs-portal/scripts/archive-cn-search-static.test.mjs \
  helm/docs-portal/scripts/validate-coverage.test.mjs \
  helm/docs-portal/scripts/verify-staging.test.mjs
```

这份快照中的 legacy redirect 准备脚本仍要求目标带 `/zh-CN/`，排除项验收仍一律要求 404。若同时发布 PR #1211 的无前缀映射及 `/search` 特例，需在对应部署变更中另行处理这两项要求；本补丁不代表该 PR 已能成功发布。生产域名/登录回调和正式环境流水线也需由部署负责人单独验收。

## AI-Bot 边界

此改造覆盖普通搜索索引，不更新 AI 知识库或已生成的引用数据。AI-Bot 对应分支应单独检查文档 URL 生成、引用校验和知识库同步，复用同一公开 URL 规则后再验收。不能把普通搜索测试通过等同于 AI 链路已完成迁移。
