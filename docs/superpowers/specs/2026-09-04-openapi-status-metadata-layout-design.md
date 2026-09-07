# OpenAPI 参数状态与 Metadata 布局设计

日期：2026-09-04

## 背景

REST API 参考页的参数状态 badge 当前位于参数行右侧，`Optional` 信息占据了视觉空间，deprecated 参数名还带删除线。`Allowed values`、`Default`、`Range` 等 schema metadata 由不同的 Fumadocs tag 结构渲染，导致左边界、间距和视觉样式不一致。

本次调整只针对 schema 参数信息的可读性，不改变 OpenAPI 数据解析、参数树展开、字段链接或示例内容。

## 目标

- 将状态信息放到参数名和类型之后，形成从左到右的阅读顺序。
- 只显示实际有意义的状态：Required 和 Deprecated；可选参数不显示 Optional badge。
- deprecated 参数名保持正常显示，不使用删除线。
- 将所有 schema metadata 统一为纵向 label/value rows，并固定左侧 label 列的起点。
- 按 `Default`、`Range`、`Allowed values`、其他 metadata 的顺序渲染。
- 保证长名称、长值、多行值在 desktop 和 mobile 上都能自然换行。

## 设计

### 参数行

参数行第一行的内容顺序为：

```text
参数名  type  Required  Deprecated                         Copy link
```

- `Required` 仅在字段必填时渲染，使用红色系 badge。
- `Deprecated` 仅在字段已废弃时渲染，使用橙色系 badge。
- 当两者同时存在时，顺序固定为 `Required` → `Deprecated`。
- 可选字段不渲染 `Optional` badge。
- deprecated 不改变参数名、类型、描述或 metadata 的文本装饰。
- 复制链接按钮继续保持在行末，作为独立操作，不参与状态信息的对齐。
- 可展开参数继续使用固定宽度 gutter；叶子字段保留同样的空 gutter，使父字段和同级字段的名称起点一致。

状态 badge 应使用 `inline-flex`，允许在窄屏下随身份信息自然换行，但不应被推到右侧形成第二个对齐轴。

### Metadata

描述之后渲染统一的 metadata stack。每一项使用相同的结构：

```text
Default          "byok"
Range            1 <= value <= 120
Allowed values   managed  byok
Format           slug
```

- label 列具有稳定的最小宽度，所有 metadata 行从同一左边界开始。
- value 列承载 code token、文本、复杂对象或多行代码块；长值只在 value 列换行。
- code token 保留轻量边框和等宽字体，但不使用带阴影的大块 card。
- `Allowed values` 使用与其他 metadata 相同的 label/value row，值可水平排列并在 value 列内换行。
- Fumadocs 生成的 inline tags 和 block tags 在进入 renderer 前转换为统一的 metadata item，避免通过字符串解析或依赖第三方内部 CSS 来重排。
- metadata 顺序由本地 renderer 明确控制：`Default` → `Range` → `Allowed values` → 其他 metadata。其他 metadata 保持其生成顺序。
- 多行默认值、示例和复杂 schema value 继续使用现有的 codeblock renderer，只改变其外层对齐方式。

根 schema 的 metadata 也复用同一 renderer，避免 Request Body、Response Body 和字段级 schema 出现不同的 metadata 视觉规则。

### 响应式行为

- desktop 使用两列 metadata layout，label 列稳定、value 列占据剩余宽度。
- mobile 在必要时将 label 和 value 堆叠，但每一项仍保持统一顺序和间距。
- 参数身份信息和 metadata 都允许断词，不能造成页面横向溢出。
- 不改变已有字段树的父子缩进、展开按钮和锚点滚动行为。

## 实现边界

预计修改：

- `OpenApiSchemaFieldRow`：重排字段身份区和状态区，移除 Optional、deprecated 删除线，并接入 metadata renderer。
- `OpenApiSchema`：将生成的 Fumadocs info tags 转换为结构化 metadata items，并统一根 schema 的 metadata 输出。
- `app.css`：增加状态 inline 布局和 metadata stack 的稳定列布局，保留现有树形缩进规则。
- 相关 OpenAPI 组件测试：更新既有 DOM 断言，并补充顺序、对齐结构、长值和响应式相关覆盖。

不在本次范围：

- 修改 OpenAPI schema 数据或生成逻辑。
- 修改字段搜索、展开/折叠、复制链接或示例代码内容。
- 修改 Response 状态码、Authorization 或右侧 examples rail 的布局。

## 可访问性

- 状态仍以真实文本呈现，颜色不是唯一信息来源。
- 复制链接按钮保留现有 aria-label。
- 展开按钮保留 `aria-expanded` 和现有 label。
- metadata 使用普通文本和 code 内容，不引入需要额外键盘交互的伪控件。

## 验证

单元和组件测试应验证：

1. 必填字段显示 `Required`，可选字段不显示 `Optional`。
2. deprecated 字段显示 `Deprecated`，参数名不含删除线 class。
3. Required + Deprecated 的 DOM 顺序为 Required 在前、Deprecated 在后，且位于 type 之后。
4. Default、Range、Allowed values 和其他 metadata 使用统一 metadata row，并按规定顺序出现。
5. allowed values、重复值、长值、多行 default/example 均完整渲染。
6. 字段展开、复制链接、锚点跳转和父子缩进没有回归。

交付前运行相关 Vitest、`bun run types:check`、`bun run lint`，并在 REST API join 页面上验证宽屏与窄屏截图，确认没有横向溢出或 metadata 重叠。

## 验收标准

在 REST API 参考页中，用户可以从同一条水平阅读路径快速识别参数名、类型和实际状态；随后可以沿统一的左对齐 metadata 列表读取默认值、范围、可选值及其他约束。Optional 不再产生视觉噪音，deprecated 仍然醒目但不通过删除线削弱参数名的可读性。
