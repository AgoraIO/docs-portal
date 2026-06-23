# Agora REST API → OpenAPI 迁移 Prompt(喂给 AI agent)

> 用法:把本文件整段贴给 Claude Code / 同类 agent,并在结尾补一句
> 「按本流程迁移 <产品名>(如 Cloud Transcoding)」。
> agent 先做「第 0 步环境自检」,再按步骤执行。

## 你的任务
把源仓库里某个产品的 RESTful API 文档,迁移进 docs-portal 的 OpenAPI 渲染管道。
**核心原则**:REST 端点内容只存为 OpenAPI YAML(单一真相),**不要**为每个端点建 mdx 影子页;
catalog / reference 处只放跳转链接,不放内容。

## 第 0 步:环境自检(先做,别假设路径)
1. 定位两个仓库的绝对路径,后续用 `$PORTAL` 和 `$SOURCE` 指代:
   - `$PORTAL` = docs-portal 仓库根(含 `content/openapi/`、`src/lib/openapi/lanes.ts`)
   - `$SOURCE` = 源文档仓库根(含各产品的 `rest-api/` mdx,本项目里叫 Doc-Source-Private)
   - 用 `find ~ -name lanes.ts -path '*openapi*' 2>/dev/null` 等方式确认,**不要硬编码任何 `/Users/...` 路径**。
2. 确认包管理器:看 `$PORTAL` 有 `bun.lock` 用 `bun`/`bunx`;有 `package-lock.json` 用 `npm`/`npx`。下文命令以 bun 为例。
3. 读样板,理解管道(勿重建):
   - `content/openapi/conversational-ai/convoai.en.yaml` —— OpenAPI 源样板
   - `src/lib/openapi/lanes.ts` —— lane 注册表(看 `convoai` 和 `signaling-rest` 两条现有记录)
   - `src/lib/openapi/source-text.server.ts` —— YAML 用 `?raw` 打进 bundle
   - `scripts/sync-openapi-assets.mjs` —— build 时 content/openapi → public/openapi
   - `isOpenApiTab(tab)` (lanes.ts 内) —— 支持端点页落在非 api-reference 的 tab

## 先和用户确认的决策(动手前问)
1. **落点**:端点内容放哪?(如 `realtime-media/<product>/rest-api/`,或 `api-reference/<product>/rest-api/`)
2. **跳转入口**:哪里放链接指向真实内容?(通常 `content/docs/en/api-reference/api-ref/index.mdx` 的 catalog 卡片)
3. **语言**:先只做英文?(lane 的 zh-CN 字段必填;只做英文时 zh-CN 复用英文源)

## 迁移步骤

### 1. 读源,分清端点 vs 非端点
源在 `$SOURCE/<product>/rest-api/`(或 `<product>/reference/rest-api/`)。
- 含 `RestAPILayout` + `LeftColumn method=...` 的 mdx 才是真端点。
- `overview.mdx` → authored 父页 index;`restful-authentication.mdx` → authentication 页。

### 2. 写 OpenAPI YAML
`$PORTAL/content/openapi/<product>/<name>.en.yaml`,OpenAPI 3.1,每个端点一个稳定 `operationId`。
- **坑**:某端点用不同域名时,在该 path 上加 path 级 `servers:` 覆盖,别动全局 `servers`。
- 校验:`node -e "require('@apidevtools/swagger-parser').validate('<yaml路径>').then(()=>console.log('VALID')).catch(e=>{console.error(e);process.exit(1)})"`

### 3. 注册 lane(`src/lib/openapi/lanes.ts`)
在 `OPENAPI_LANES` 加一条,字段:`id` / `parentUrl` / `publicSourceUrl` / `routePrefix` / `sourcePath` / `tab` / `operations{operationId:{routeLeaf,title}}`。
- `tab` = 落点 URL 第一段(如 `realtime-media`)。
- `routePrefix` = 落点去掉 `/<locale>/` 后的前缀(如 `realtime-media/<product>/rest-api`)。
- zh-CN 字段必填:只做英文时,zh-CN 的 sourcePath/publicSourceUrl 复用英文,title 暂填英文。

### 4. 注册 bundled source(`src/lib/openapi/source-text.server.ts`)
加 `import xYaml from '../../../content/openapi/<product>/<name>.en.yaml?raw';`
并在 `OPENAPI_SOURCE_TEXT` 加 `'content/openapi/<product>/<name>.en.yaml': xYaml`。
- **最易错的坑**:map 的 key 必须和 lane.sourcePath 的值**逐字符一致**,否则报
  `Missing bundled OpenAPI source for lane "..."`。
- **坑**:相对路径层级是 `../../../content`(从 `src/lib/openapi/` 出发三级)。

### 5. 若落点不在 api-reference tab,确认 tab 门控
`src/lib/docs-page.server.ts` 里端点门控应是 `isOpenApiTab(tab)`,而非硬编码 `tab !== 'api-reference'`。
若发现仍硬编码,改成 `isOpenApiTab`。其余 `OPENAPI_TAB` 用处(recipes/AI 侧栏)保留不动。

### 6. 建 authored 父页(落点目录下)
- `index.mdx` —— overview 内容(用 `:::info` 而非 `<Admonition>`;相对链接指端点 routeLeaf)
- `authentication.md` —— 鉴权说明
- `meta.json` —— pages 列 `index` + `authentication` + **所有端点 routeLeaf**(虚拟叶子,**不建** .md 影子文件)

### 7. 产品根 `meta.json` 加 `rest-api`(若新建了子目录)

### 8. catalog 跳转
`content/docs/en/api-reference/api-ref/index.mdx` 里该产品 RESTful 卡片的 href → 新落点。

### 9. 更新测试断言
- `src/lib/openapi/lanes.test.ts`:第一个测试的 lane 数组加新记录;`getOpenApiPrerenderPaths()` 长度 +(端点数 × 2)。
- `src/lib/openapi/fumadocs-source.server.test.ts`:页面路径长度同样 +(端点数 × 2);可加一条新端点路径断言。

## 验证(必跑)
```bash
node scripts/sync-openapi-assets.mjs        # 确认新 yaml 被 copy
bunx vitest run src/lib/openapi             # 必须全绿(npm 用 npx vitest run ...)
```
三方一致性自查:YAML operationId == lane op keys;lane routeLeaf == meta 端点叶子。

## 避坑清单(实战教训)
- **判断"是不是我引入的回归",别用 `git stash`**:会把未 commit 的新增文件一起 stash,易丢工作。
  正确做法:在干净 worktree 或新建分支上对照,或先 commit 再对照。
- 全量测试(`bun test`)和全量 `tsc --noEmit` 里有一批 **pre-existing 失败**(与本迁移无关):
  判定方法 —— 失败是否落在你改过的文件上;或在干净 HEAD 上跑同一测试看是否同样失败。
  **只认 `src/lib/openapi` 的测试全绿**作为本迁移的通过标准。
- 反复 Edit 同一行容易叠加出错(重复键、串行内容)。改前先读文件真实当前态,必要时整文件重写。

## 候选产品与端点数(按工作量递增,路径相对 $SOURCE)
- Cloud Transcoding — ~9 端点 — `cloud-transcoding/rest-api/`
- Media Gateway —— ~16 —— `media-gateway/reference/rest-api/`
- Real-Time STT —— ~16(可能已部分迁,先查 `$PORTAL/content/openapi/speech-to-text/`)
- Media Pull / Push —— 各 ~2-3 —— `media-pull/reference/`、`media-push/reference/`

## 已迁先例(可直接抄)
- Conversational AI:lane id `convoai`,落 `api-reference` tab
- Signaling REST:lane id `signaling-rest`,落 `realtime-media/rtm/rest-api/`,5 端点,英文 only
