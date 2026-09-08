# OpenAPI 参数父子层级与状态标签优化设计

## 背景

REST API 参考页已经使用递归 schema tree 展示嵌套参数，并支持字段搜索、展开/折叠和状态 badge。但当前父子关系主要依赖缩进，层级较深时不够明显；同时 Required、Optional、Deprecated 的状态需要在参数行内形成统一的右侧信息区。

本次设计基于现有 OpenAPI schema tree，不改变 schema 数据模型、搜索语义、hash 定位或 endpoint 结构。

## 目标

- 让父参数与所有后代之间的关系一眼可见。
- 保留现有缩进习惯，并加入参考图风格的连续竖向引导线。
- 让 Required、Optional、Deprecated 在参数名同一行、右侧对齐显示。
- 在多层嵌套、长描述、enum、折叠和移动端宽度下保持稳定。

## 非目标

- 不重新设计 OpenAPI schema 数据模型。
- 不修改字段搜索、命中计数、路径展示、hash 导航或 Expand/Collapse all 的行为。
- 不增加横向树枝连接线。
- 不改变 endpoint method badge 或 examples rail。

## 视觉设计

### 参数行

每个参数行继续使用单行 flex 布局：

```text
parameter_name  type                                      Required  Deprecated
```

- 参数名使用现有的加粗等宽字体。
- type 紧跟参数名，使用弱化颜色。
- 状态区域使用 `margin-left: auto` 靠右对齐。
- Required 与 Optional 互斥；Deprecated 是独立状态，可以和其中任一状态同时出现。
- 状态使用文字与颜色共同表达：
  - Required：红色语义 badge。
  - Optional：灰色语义 badge。
  - Deprecated：橙色语义 badge。
- Deprecated 不再作为参数描述下方的普通 metadata tag 重复显示。

### 父子关系

每个有子节点的父参数，在其参数行和描述之后拥有一个 children wrapper：

- wrapper 左侧绘制 1px、低对比度的连续竖线。
- 竖线从父参数描述区域下方开始，贯穿该父参数的全部子参数、子参数描述、enum/metadata 和更深层后代。
- 不绘制横向连接线。
- 子参数保留当前层级缩进；每深入一层，增加一档固定缩进，并生成一条新的平行竖线。
- 父参数折叠时，children wrapper 与竖线一起隐藏；展开后恢复。
- Hidden descendants 与正常展开内容使用相同的 wrapper 结构和视觉规则，保证原生页面查找与手动展开的一致性。

示意：

```text
properties  object                         Required
  Configuration details...
  │
  ├ channel       string                    Required
  ├ provider      object                    Deprecated
  │   │
  │   ├ name      string                    Optional
  │   └ region    string                    Optional
  └ remote_rtc_uids  string[]               Optional
```

实际 UI 不显示 `├`、`└` 横向连接符；示意中的关系只表示连续竖线和缩进层级。

## 组件与状态处理

### OpenApiSchemaTree

- 在递归渲染每个 expandable node 时统一创建 children wrapper。
- wrapper 的显示/隐藏由现有 expanded state 控制。
- 搜索自动展开、手动展开、Collapse all 和 `hidden="until-found"` 都复用同一套 wrapper 样式。
- 不新增可聚焦元素，不改变现有树节点的 ARIA contract。

### OpenApiSchemaFieldRow

- 继续负责参数名、type、描述、allowed values、copy link 和状态区域。
- 状态区域新增 Deprecated badge 的同一行展示能力。
- `renderRemainingInfoTags` 不再为 Deprecated 产生重复的描述下方 tag。
- 保留字段名和 type 的窄屏换行能力；状态区域优先保持不换行。

### 数据模型

不新增 OpenAPI schema 字段，也不改变 `OpenApiSchemaViewNode` 的路径、id、depth 或 children 语义。层级线完全由递归 DOM wrapper 和 CSS 表达。

## 响应式与可访问性

- 桌面端每层使用约 16px 的固定缩进；竖线与文字间保留约 12–16px 间距。
- 移动端通过 `min-width: 0`、长字段换行和右侧状态区的收缩避免水平溢出。
- 浅色和深色模式使用低对比度但可辨识的引导线颜色。
- badge 保留 Required、Optional、Deprecated 文本，不依赖颜色单独传达状态。
- 展开按钮继续使用 `aria-expanded`；children wrapper 不增加 tab stop。
- `hidden="until-found"` 仍直接输出于 SSR HTML，并保留 `beforematch` 行为。

## 测试与验收标准

### 组件测试

- 多层嵌套中，父级 wrapper 的竖线覆盖全部后代，不因子 wrapper 切换而截断。
- 折叠父参数时，子内容和引导线一起隐藏。
- Required、Optional、Deprecated 都位于参数行右侧；required + deprecated 同时出现时两个 badge 都保留。
- Deprecated 不在描述下方重复渲染。
- 长字段名、长 type、长 enum 值在窄宽度下可换行且不造成水平溢出。
- 搜索、原生 `beforematch`、Expand/Collapse all、hash reveal 不回归。

### 浏览器验收

- 桌面宽度下父级竖线连续，状态 badge 与参数行水平对齐。
- 移动端不产生页面级水平滚动。
- 浅色/深色主题下引导线和三种状态均可辨识。
- 键盘可操作展开按钮，焦点和 `aria-expanded` 正确。

## 预计影响文件

- `src/components/openapi/OpenApiSchemaTree.tsx`
- `src/components/openapi/OpenApiSchemaFieldRow.tsx`
- 对应的 tree、field row、schema integration 测试
- `src/styles/app.css`（仅在现有 utility class 不足时调整）

## 验收结论

当用户阅读 `properties`、`provider` 等多层参数时，可以通过连续竖线和固定缩进准确追踪父子关系；Required、Optional、Deprecated 在同一参数行右侧统一显示，并且不会破坏现有搜索、展开、导航和响应式行为。
