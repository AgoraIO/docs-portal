# OpenAPI 参数名与描述对齐设计

## 背景

OpenAPI schema tree 中，可展开参数的 chevron 位于参数名左侧，而无子参数的同级字段没有对应占位空间，导致同级参数的文字起始位置不同。当前描述又回到行的左边界，无法与参数名对齐，进一步弱化父子关系。

本设计基于现有隔离 worktree 中的 OpenAPI schema tree，不修改 OpenAPI source，不改变字段路径、状态判定、展开协议或浏览器原生查找行为。

## 目标

- 让有子参数和无子参数的同级字段使用一致的参数名起始位置。
- 让每个参数的描述与该参数名使用同一条左边界。
- 保留 chevron 的现有展开交互、键盘操作和 aria-expanded contract。
- 不影响右侧 Required、Optional、Deprecated 状态区。
- 在桌面、移动端和多层 children guide 下保持无水平溢出。

## 非目标

- 不重新设计 schema tree 或 children guide。
- 不改变字段名称、type、description、allowed values、copy link、hash reveal 或 native find。
- 不把状态 badge 移到其他位置。
- 不增加横向连接线或新的交互入口。

## 视觉方案

采用固定宽度 chevron gutter：

```text
  > properties  object                         Required
    Configuration details of the agent.

    pipeline_id  string                         Optional
    The unique ID of a published agent.
```

- 每个参数行都保留相同宽度的 leading gutter。
- expandable 参数在 gutter 中显示 chevron 按钮。
- leaf 参数在 gutter 中显示不可交互的空占位，不增加 tab stop。
- 参数名和 type 位于 gutter 之后的同一内容列。
- 描述使用同一内容列的起始位置，不再回到整行最左侧。
- 右侧状态区保持 `margin-inline-start: auto`，不参与左侧层级对齐。

## 组件设计

### OpenApiSchemaFieldRow

FieldRow 继续负责参数行的身份和内容。将字段行顶部布局调整为稳定的两侧结构：左侧是固定 gutter + 字段名/type，右侧是状态 badge 和 copy link。

建议使用现有 Tailwind/flex 约定表达固定 gutter：

```tsx
<div className="openapi-schema-field-leading flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-1">
  {expandable ? (
    <Button aria-expanded={expanded} onClick={() => onExpandedChange(!expanded)}>
      <ChevronRight className="size-3 shrink-0" />
      {fieldIdentity}
    </Button>
  ) : (
    <div className="flex min-w-0 items-center gap-1.5">
      <span aria-hidden="true" className="size-3 shrink-0" />
      {fieldIdentity}
    </div>
  )}
</div>
```

为保证描述与字段名对齐，字段行使用一个稳定的 leading offset class 或 CSS variable；该 offset 必须等于 chevron slot 宽度加其间距。description 只增加该 offset，不改变内容文字。

参数名仍使用现有 `font-semibold`；Deprecated 参数名继续使用 `line-through`，type 和描述不继承删除线。

### OpenApiSchemaTree

Tree 不改变递归节点模型或 children wrapper。它继续向 FieldRow 传递 expandable state，并继续在折叠 children 上输出 `hidden="until-found"` 和 `beforematch` listener。Tree 不新增焦点元素；leaf 的 gutter 只能是装饰性占位。

### OpenApiSchema

OpenApiSchema 无需改变 schema 数据处理或状态判定，只需保持现有 FieldRow labels、metadata 和 navigation wiring。

## 响应式设计

- 桌面端 leading gutter 使用约 12px chevron slot 和约 6px 间距。
- 移动端相同 gutter 不扩大；字段名、type、描述继续使用 `min-width: 0` 与 `overflow-wrap: anywhere`。
- children guide 的桌面 16px、移动 8px 缩进保持不变。
- 状态区使用 `shrink-0`，必要时字段名和 type 先换行，不能造成页面级水平滚动。
- 描述中的长 URL、inline code 和 Markdown link 必须允许断行。

## 无障碍

- expandable 字段保留现有 Button、aria-label 和 aria-expanded。
- leaf gutter 占位使用 `aria-hidden="true"`，不进入键盘焦点顺序。
- 不增加新的 tab stop。
- 参数名和描述文本仍完整保留，删除线只提供视觉提示。

## 测试设计

### 组件测试

- 构造一个 expandable 字段和一个相邻 leaf 字段，断言两者字段身份容器使用相同 leading gutter 结构或 class。
- 断言 expandable 字段的 chevron 仍是 Button，并且 `aria-expanded` 可切换。
- 断言 leaf 的 gutter 不包含 Button、链接或其他焦点元素。
- 断言 expandable 和 leaf 的 description 使用相同对齐 class/offset。
- 断言 Deprecated 字段名有删除线，而 type、description 没有删除线。

### 浏览器验收

- 在 join 页面 1440px 下，`pipeline_id`、`properties`、`preset` 等同级字段的参数名对齐，描述与各自参数名对齐。
- 在 390px 下展开/折叠多层参数，确认字段名、type 和描述可换行且无水平滚动。
- 确认父子竖线仍从父描述后开始，并且不被新的 leading gutter 截断。
- 确认键盘可以操作 expandable chevron，leaf 占位不会获得焦点。

## 验收标准

在 REST API 参考页中，所有同级参数的参数名和描述使用一致的左边界；有无子参数不再造成横向错位。现有展开、状态 badge、Deprecated 删除线、native find、父子引导线和响应式布局均不回归。
