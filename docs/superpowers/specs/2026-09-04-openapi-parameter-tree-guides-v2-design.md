# OpenAPI 参数状态与查找交互优化设计

## 背景

当前 OpenAPI schema tree 已提供递归参数展示、父子引导线和字段状态 badge。根据实际页面反馈，需要进一步调整三处体验：

- `Filter Properties` 自定义搜索框在 Request Body 和 Response Body 中价值有限，增加了工具栏噪音。
- Required 当前的灰色视觉不够醒目，需要一组更容易扫描的状态颜色。
- Deprecated 参数需要在字段名本身使用删除线，而不是只依赖状态 badge。

本设计基于当前隔离 worktree 中的 OpenAPI schema tree，不修改 OpenAPI source 数据，也不改变字段路径、复制链接或 hash 定位协议。

## 已确认决策

- 状态颜色采用方案 A：
  - Required：低饱和红色语义。
  - Optional：中性灰色语义。
  - Deprecated：橙色语义。
- Deprecated 字段名使用删除线；字段 type 保持正常显示，不使用删除线。
- Request Body 和 Response Body 都移除 `Filter Properties`，统一使用浏览器原生查找。

## 目标

- 让 Required、Optional、Deprecated 在参数行右侧快速可辨认，并保留文字标签作为状态的主要表达。
- 让 Deprecated 字段在阅读参数列表时立即呈现为历史/不推荐字段。
- 移除低价值的自定义 filter，减少 schema toolbar 的视觉负担。
- 保留原生浏览器查找对折叠后代字段的可用性。
- 保持桌面和移动端父子引导线、长字段换行和无水平溢出的行为。

## 非目标

- 不修改 OpenAPI YAML 或字段定义。
- 不引入新的搜索入口、搜索菜单或隐藏式 filter。
- 不改变 schema 字段的 `path`、`id`、copy link、hash reveal 或导航兼容逻辑。
- 不改变 endpoint method badge、examples rail 或响应数据展示。
- 不改变 Required/Optional/Deprecated 的业务判定规则。

## 交互设计

### 参数行状态区

字段行保持现有结构：字段名、type、描述和字段内容在左侧；状态区使用 `margin-left: auto` 固定在右侧。

状态区按以下规则渲染：

- Required 和 Optional 互斥，只显示其中一个。
- Deprecated 独立显示，可以与 Required 或 Optional 同时出现。
- 三个 badge 都保留文字，不依赖颜色单独表达语义。
- Required 使用浅红背景、较深红文字和边框，强调“调用时必须提供”。
- Optional 使用浅灰背景、灰色文字和边框，降低视觉权重。
- Deprecated 使用浅橙背景、橙色文字和边框，表达需要迁移或避免继续使用。
- badge 保持不换行，字段名和 type 在窄屏下优先换行。

### Deprecated 字段名

当字段 schema 标记为 deprecated 时：

- 仅字段名使用 `text-decoration: line-through`。
- type、状态 badge、描述和 allowed values 不使用删除线。
- 删除线与字段名颜色保持足够对比度，不能只通过低透明度隐藏字段。
- Deprecated badge 仍保留，确保屏幕阅读和快速扫描都能识别状态。

### Schema toolbar

Request Body 和 Response Body 的 schema tree 不再渲染：

- `Filter Properties` 输入框。
- 搜索命中数量和无匹配提示。
- 搜索专用的 Expand all / Collapse all toolbar 操作。

字段树本身继续保留每个 expandable field 的手动展开/折叠按钮。这样不会在每个 schema 中重复展示一个低价值的全局工具栏，同时保留阅读嵌套对象所需的局部控制。

### 浏览器原生查找

- 折叠后代继续保留在 DOM 中，并使用 SSR 直接输出的 `hidden="until-found"`。
- 浏览器执行 `Ctrl+F` / `Cmd+F` 搜索字段名、描述或代码文本时，由浏览器原生查找触发 `beforematch`，对应祖先自动展开。
- 不再为原生查找显示额外路径或命中计数 UI。
- schema path 仍保留在 DOM metadata、复制链接和 hash 定位逻辑中，但不作为可见搜索控件呈现。

## 组件边界

### OpenApiSchemaFieldRow

继续负责：

- 字段名、type、variant、描述、allowed values 和剩余 metadata。
- Required/Optional/Deprecated 状态区。
- copy-link 操作。
- Deprecated 字段名的视觉修饰。

该组件不负责搜索状态，也不新增键盘焦点目标。

### OpenApiSchemaTree

继续负责：

- 递归节点渲染和父子 children wrapper。
- 手动展开/折叠与 `aria-expanded`。
- `hidden="until-found"` 和 `beforematch`。
- hash reveal、原生查找触发后的 ancestor 展开和焦点处理。

需要移除与自定义 filter 绑定的 query state、命中计数、搜索专用展开集合和全局展开/折叠 toolbar；不能移除折叠后代 DOM 或 beforematch 支持。

### OpenApiSchema

- 继续向 FieldRow 传递状态 labels 和 schema metadata。
- 删除 filter 相关 labels、回调和只服务于自定义搜索的渲染分支。
- 保留 Request Body 和 Response Body 对同一个 tree 组件的调用方式，确保两处行为一致。

## 样式与响应式

- 方案 A 的状态颜色使用仓库已有的语义颜色 token/class，避免新增一套不一致的颜色变量。
- Deprecated 删除线使用字段名专属 class，不影响 type 或描述。
- 桌面端父子引导线继续使用每层 16px 的 margin/padding 和逻辑 border。
- 移动端继续使用每层 8px 的 margin/padding，避免多层 schema 在 390px 下产生水平滚动。
- 字段名、type、描述、链接和 allowed values 保持 `min-width: 0` 与 `overflow-wrap: anywhere`。
- 不为移除 filter 添加新的空白占位区域；Request Body 标题之后直接进入参数行。
- 不新增横向连接线或伪元素。

## 可访问性

- Required、Optional、Deprecated 的文字标签始终渲染，颜色不是唯一信息来源。
- 手动展开按钮继续使用既有 `aria-expanded` 和可读的 aria-label。
- 移除 filter 后不引入新的 tab stop；浏览器原生查找仍由浏览器处理。
- 折叠 wrapper 不设置 tabindex，且 `hidden="until-found"` 的后代仍可被原生查找发现。
- 删除线只作为视觉辅助，不删除或替换字段文本。
- 需要验证浅色、深色和窄屏下 badge 与删除线均有足够可辨识度。

## 测试设计

### 组件测试

- FieldRow：Required/Optional/Deprecated badge 组合、颜色 class、右侧状态区和 Deprecated 字段名删除线。
- FieldRow：Deprecated 字段的描述和 type 不继承删除线。
- Tree：不再渲染 filter input、match count、无匹配提示或全局 Expand/Collapse all。
- Tree：手动展开按钮、嵌套 children wrapper、折叠 `hidden="until-found"`、后代 DOM 和 beforematch 保持有效。
- OpenApiSchema：Request Body 和 Response Body 都不出现自定义 filter，schema path/hash/copy link 不回归。

### 浏览器验收

- 1440px：Required 红色、Optional 灰色、Deprecated 橙色在同一参数行右侧对齐；Deprecated 字段名有删除线。
- 390px：页面无水平滚动，长字段可换行，深层折叠/展开不破坏布局。
- 使用 `Ctrl+F` / `Cmd+F` 搜索 `properties.channel` 或 `remote_rtc_uids` 的字段名，浏览器能定位隐藏后代并展开祖先。
- Request Body 和 Response Body 均没有 `Filter Properties`。
- 浅色和深色主题下状态文字、边框、背景和删除线保持可辨识。

## 验收标准

当用户阅读 join API 的 schema 时，参数行右侧可以快速区分 Required、Optional 和 Deprecated；deprecated 字段名有明确删除线。Request Body 和 Response Body 不再显示自定义 filter，但浏览器原生查找仍能定位折叠字段，页面在桌面和 390px 移动端均无水平溢出。
