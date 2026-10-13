# OpenAPI `params` schema rendering design

## Goal

修复对话式 AI REST API 请求体中 `params` schema 的展示：同名的字段名和类型别名只显示一次，同时保留 `Minimax`、`Tencent` 等 `oneOf` 供应商分支名称及其完整 description（包括代码块、链接和提示），不再显示 `[key: string] unknown` 这一内部占位文本。

## Root cause

`OpenApiSchemaFieldRow` 当前无条件同时渲染 `node.name` 和 `node.schema.aliasName`。`params` 字段引用的 schema 也使用 `title: params`，因此页面显示两个 `params`。

供应商 schema 使用 `additionalProperties: {}` 表示允许任意配置键。Fumadocs 将空 schema 推断为 `unknown`，并以 `[key: string] unknown` 作为分支承载行；当前组件没有把这个占位行转换成可读的供应商分支标题。

## Design

### Field identity rendering

- 当 `node.schema.aliasName` 与字段名相同时，不渲染重复的类型别名。
- 当节点是带 `variant` 的 `[key: string]` 空 map 占位节点时，使用 `variant` 作为字段展示名，并隐藏 map key、`unknown` 类型和重复的括号分支标签。
- 对只包含任意键值 map 的 `oneOf` 分支，创建一个供应商分支容器节点；该节点默认折叠，展开后显示分支 schema 自身的完整 description，使供应商说明和其中的 Markdown 内容不会平铺占满页面。
- 非占位节点的现有类型别名和 union 分支展示保持不变。

### Data flow and compatibility

只调整 OpenAPI schema view 和行的展示逻辑，不修改 YAML、字段名、schema ref、链接路径或请求语义。供应商分支仍然来自现有 `oneOf` 数据，因此 `params` 下的供应商内容不会被删除。分支容器复用现有子参数折叠交互，并默认保持收起。

## Testing

- 在 `OpenApiSchemaFieldRow.test.tsx` 增加同名字段/类型别名只渲染一次的回归测试。
- 增加带 `variant` 的 `[key: string] unknown` 节点展示为供应商名称、且不展示占位文本的回归测试。
- 增加供应商分支容器默认折叠、展开后显示完整 description 的回归测试。
- 运行 OpenAPI 相关组件和 schema-view 测试；再运行类型检查与 lint。
