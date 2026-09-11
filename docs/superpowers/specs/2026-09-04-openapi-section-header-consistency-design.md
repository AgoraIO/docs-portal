# OpenAPI 参数 Section Header 统一设计

## 背景

当前 REST API 参考页中，Request Body 使用较醒目的 section header，而 Path Parameters、Query Parameters、Header Parameters 和 Cookie Parameters 的标题更接近普通正文大小。不同参数区域的标题 chrome 不一致，会削弱页面层级，也让用户误以为这些区域的重要性不同。

本设计基于现有 OpenAPI operation 页面，不修改 OpenAPI source，不改变参数或 schema 的数据结构，也不改变已确认的 schema tree、状态 badge、父子引导线和 scrollbar 行为。

## 已确认决策

- Path Parameters、Query Parameters、Header Parameters、Cookie Parameters、Request Body、Response Body 统一采用当前 Request Body 的 section header 样式基准。
- 六类标题语义上继续使用 `h2`。
- 参数类 section 保持平铺列表，不增加 Filter、全局展开或其他无意义工具栏。
- Request Body 和 Response Body 继续使用现有 schema tree 交互。
- Required、Optional、Deprecated 继续在参数名同一行右侧对齐。
- 连续父级竖线保持现状：从父级描述下方开始贯穿完整子树，不添加横向连接线。

## 目标

- 统一六类 API section 的字号、字重、行高、上下间距和 anchor link 样式。
- 保持每个 section 的语义 h2 和稳定 anchor id。
- 让 Path/Header/Query/Cookie 参数继续以平铺 FieldRow 展示。
- 让 Request/Response schema tree 的展开、折叠、native find、父子竖线、状态 badge 和响应式行为不回归。
- 在桌面和移动端保持标题与内容无水平溢出。

## 非目标

- 不修改 OpenAPI YAML 或 API 参数内容。
- 不重新设计 Request/Response schema tree。
- 不恢复 `Filter Properties`、Expand all 或 Collapse all。
- 不改变 Required/Optional/Deprecated 的判定、颜色或删除线。
- 不改变 examples rail、代码块 scrollbar 或 endpoint method badge。
- 不增加新的横向装饰线或 section 卡片。

## 视觉设计

六类 section 使用同一个 header contract：

```text
Request Body                                      application/json  [anchor]

Path Parameters                                                  [anchor]

Query Parameters                                                 [anchor]
```

统一规则：

- 仍使用 h2。
- 复用当前 Request Body 的标题字号、字重、行高和上下间距。
- 标题文字与 anchor link 使用同一横向布局和 hover/focus 样式。
- Request/Response 的 media type 继续位于标题右侧，不改变其信息位置。
- 标题下方到参数列表或 schema tree 的间距统一。
- 移动端标题可以自然换行，anchor 不应造成页面级水平滚动。
- 不增加额外分隔线、背景色或折叠 affordance。

## 组件设计

### 共享 section header

在 `FumadocsOpenApiContent.tsx` 中提取共享的 OpenAPI section header 渲染结构或 class contract，避免六个 section 各自维护样式。共享结构应保持现有 anchor link 复制能力：

```tsx
<h2 className="openapi-section-heading" id={sectionId}>
  <OpenApiAnchorLink anchorId={sectionId}>{title}</OpenApiAnchorLink>
</h2>
```

如果当前 Request/Response 标题由 Fumadocs 生成，优先通过统一 class selector 或现有标题渲染入口覆盖样式，而不是复制一套标题 DOM。最终必须保证所有六类标题都能被相同的样式 contract 命中。

### 参数 section

- Path、Query、Header、Cookie 的字段保持当前平铺渲染。
- 不添加 schema tree filter 或全局展开控件。
- FieldRow 继续渲染参数名、type、描述、Allowed values、Default/metadata、Required/Optional/Deprecated 和 copy link。

### Schema section

- Request Body 和 Response Body 继续使用现有 schema tree。
- children wrapper 继续使用连续 logical border。
- 折叠后代继续保留 `hidden="until-found"` 和原生查找能力。
- 不改变 schema path、hash reveal、copy link 或代码示例布局。

## 样式设计

统一样式可以使用现有的 `OPENAPI_MAJOR_SECTION_HEADING_CLASS` 或提取为明确 class，例如：

```css
.openapi-section-heading {
  margin-top: 2.5rem;
  margin-bottom: 0.75rem;
  font-size: 1.5rem;
  font-weight: 600;
  line-height: 1.25;
}
```

实际实现必须以当前 Request Body 的计算样式为准，不重复定义互相冲突的 h2 selector。anchor link 应继续使用现有 icon、复制反馈、hover、focus-visible 和无障碍 label。

## 响应式与无障碍

- 六类标题在桌面和移动端都保持同一视觉层级。
- 移动端标题文本允许换行，不能造成页面水平滚动。
- 标题仍使用 h2，不能降级为 div 或普通段落。
- anchor link 可通过键盘聚焦，保留可读 label 和复制行为。
- 平铺参数不新增 tab stop；schema tree 的 expandable button 保持现有 `aria-expanded`。
- Required、Optional、Deprecated 继续显示文字，不依赖颜色单独表达状态。
- 连续父级竖线继续使用逻辑属性，不添加 `::before`/`::after` 横向连接线。

## 测试设计

### 组件测试

- 六类标题均渲染为 h2。
- 六类标题均命中统一 section header class/contract。
- 六类标题的 anchor link 结构、href、accessible label 和复制操作一致。
- Path/Header/Query/Cookie 参数继续平铺，且没有 Filter、Expand all 或 Collapse all。
- Request/Response schema tree 继续渲染 children wrapper、hidden until-found 和局部展开按钮。
- Required、Optional、Deprecated badge 仍在参数行右侧；Deprecated 字段名删除线保留。
- Allowed values、Default 和 metadata 继续位于字段 details 对齐容器中。

### CSS regression

- 统一 section header 的字号、字重、行高、margin 和 anchor 样式有明确断言。
- Request Body 与其他五类标题使用同一 selector/class contract。
- children guide 继续有 logical border、桌面/移动缩进和 hidden 边框行为。
- CSS selector 中不出现 children guide 的横向 `::before`/`::after`。
- 现有代码块 scrollbar、examples rail 和页面级 `.docs-scrollbar` 规则不受影响。

### 浏览器验收

- 在 1440px 下对比 Path、Query、Header、Cookie、Request Body、Response Body 的字号、字重、间距和 anchor 位置。
- 确认参数 section 没有新增 filter 或全局展开按钮。
- 确认 Request/Response schema tree 的父子竖线从父级描述下方连续贯穿，不出现横向连接线。
- 确认 Required/Optional/Deprecated 右对齐，Allowed values/Default 与 description 对齐。
- 在 390px 下确认标题可换行、schema 可展开、页面无水平滚动。
- 键盘聚焦标题 anchor 和 schema expandable button，确认焦点与 aria contract 正常。

## 验收标准

REST API 参考页的六类 section header 具有一致的 Request Body 级别视觉层级，同时保留各自 h2 语义和 anchor 行为。参数类 section 仍是平铺列表，Request/Response 仍保留 schema tree、连续父子竖线和状态 badge；桌面与移动端均无不必要的水平溢出。
