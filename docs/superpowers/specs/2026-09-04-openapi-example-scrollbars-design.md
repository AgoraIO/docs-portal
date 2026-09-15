# OpenAPI 示例滚动条设计

## 背景

REST API 参考页右侧 examples rail 当前可能同时显示多个 scrollbar：页面或 rail 的纵向滚动条、代码块的纵向/横向滚动条，以及由内部内容宽度溢出产生的额外横向 scrollbar。多个 scrollbar 同时出现会增加视觉噪音，也不容易让用户判断哪个区域正在滚动。

本设计基于当前 OpenAPI examples rail 和代码块 viewport，不修改代码示例内容、复制按钮、语言 tab 或右侧栏的布局宽度。

## 已确认决策

- 右侧 rail 本身没有需要横向滚动的内容，应通过内容约束消除横向溢出，而不是把横向滚动作为 rail 的交互能力。
- 代码块可能需要横向滚动，以保留 curl、URL、JSON 等代码的原始格式。
- 代码块 scrollbar 默认隐藏；鼠标 hover、键盘 focus 或滚动中显示，滚动停止后隐藏。
- 触摸设备没有 hover，触摸滚动后 scrollbar 短暂显示，再自动隐藏。

## 目标

- 让用户能明确识别代码块的滚动区域。
- 只在用户接近或操作代码块时显示代码块 scrollbar，降低静态页面噪音。
- 消除 examples rail 自身由内部内容撑宽产生的横向 scrollbar。
- 保留代码块必要的横向滚动，不通过自动换行破坏代码格式。
- 在桌面和移动端保持稳定、无页面级水平溢出。

## 非目标

- 不改变 examples rail 的 400px 桌面宽度和移动端响应式布局。
- 不修改代码字符串、语法高亮、复制行为或 language tab。
- 不将代码块改为强制换行。
- 不隐藏页面主滚动条。
- 不为普通文档内容引入全局 scrollbar 行为。

## 滚动责任分层

滚动责任按容器划分：

```text
页面                  负责页面纵向滚动
  examples rail       负责 rail 内部纵向滚动
    code viewport     负责代码内容自身的横向/纵向滚动
```

- rail 内部内容必须使用 `min-width: 0` 和 `max-width: 100%`，避免其子元素将 rail 撑出横向溢出。
- code viewport 必须位于 rail 的可收缩宽度内，并继续使用自己的 `overflow-x: auto` / `overflow-y: auto`。
- 普通标题、说明、授权信息和 selector 不应产生横向滚动；长 URL 和文本优先换行。
- rail 的样式只处理其纵向滚动；不把 rail 的横向 scrollbar 作为用户需要操作的区域。

## 代码块 scrollbar 交互

### 默认状态

- 代码 viewport 使用细 scrollbar。
- 默认 scrollbar thumb 和 track 透明或接近不可见，但不改变可滚动区域尺寸。
- 代码仍保持原始单行/多行格式，横向滚动能力继续存在。

### 显示状态

代码 viewport 在以下任一状态时显示细 scrollbar：

- 鼠标 hover 在代码 viewport 上。
- viewport 或其内部代码区域处于 focus-within。
- viewport 正在发生 scroll。
- 触摸滚动发生后的短暂时间窗口内。

显示后约 700ms 没有继续滚动时恢复隐藏。新的滚动事件应重新计时，不应创建多个并行 timer。

### 触摸设备

- 不依赖 hover 作为触摸设备的唯一显示入口。
- 通过 viewport 的 `scroll` 事件设置 transient-visible 状态。
- 使用现有组件级 effect 清理 timer 和 event listener，避免卸载后更新状态。
- 不拦截触摸滚动，不改变惯性滚动或 overscroll 行为。

### 鼠标与键盘

- hover/focus-visible 状态由 CSS 直接表达。
- 正在滚动状态可以由 React state 或 data attribute 表达，但应复用现有 `data-openapi-code-viewport` 标记。
- 不新增可聚焦控件；代码 viewport 的现有 focus contract 保持不变。

## CSS 设计

代码 viewport 使用现有 `.openapi-operation figure.shiki > .fd-scroll-container` 作用域，追加滚动条状态样式：

```css
.openapi-operation figure.shiki > .fd-scroll-container {
  scrollbar-width: thin;
  scrollbar-color: transparent transparent;
}

.openapi-operation figure.shiki > .fd-scroll-container:hover,
.openapi-operation figure.shiki > .fd-scroll-container:focus-within,
.openapi-operation figure.shiki > .fd-scroll-container[data-scrollbar-visible] {
  scrollbar-color: color-mix(in srgb, var(--ink-4) 48%, transparent) transparent;
}
```

WebKit scrollbar thumb 使用相同的状态选择器，宽度约 6px；不要使用宽大的默认 thumb。`::-webkit-scrollbar-corner` 保持透明或与代码块背景一致，避免角落形成第四个明显色块。

examples rail 使用：

```css
.openapi-examples-rail,
.openapi-examples-rail-content {
  min-width: 0;
  max-width: 100%;
}

.openapi-examples-rail {
  overflow-y: auto;
  overflow-x: clip;
}
```

`overflow-x: clip` 仅作为防御性布局约束；代码 viewport 必须先通过 `max-width: 100%` 和自身 overflow 接管代码横向滚动，不能依赖 rail 裁剪代码。

## 组件边界

### OpenApiCodePreview

- 继续为动态生成的 code viewport 添加 `data-openapi-code-viewport`。
- 监听 code viewport 的 scroll 事件，并维护 transient-visible 状态。
- effect 清理 observer、scroll listener 和 hide timer。

### OpenApiExamplesRail

- 只负责 rail 的结构和内容宽度约束，不管理代码块 scrollbar 状态。
- 保留现有 sticky、纵向 max-height 和 overscroll 行为。

### 全局样式

- scrollbar 规则必须限制在 OpenAPI examples/code 作用域。
- 不修改 `.docs-scrollbar` 的页面级滚动策略。
- 不新增横向伪元素或装饰性滚动条。

## 可访问性与响应式

- scrollbar 隐藏不能影响键盘、触摸、滚轮或原生滚动。
- focus-within 时显示 scrollbar，帮助键盘用户识别当前代码区域。
- 代码复制按钮保持可见和可操作。
- 390px 下 examples rail 不产生横向滚动条；代码块若内容超宽，只由代码 viewport 提供横向滚动。
- 1440px 下 rail 保持 400px，代码块 scrollbar 细且不会与 rail 横向 scrollbar 同时出现。
- 支持 `prefers-reduced-motion`：滚动条显隐不使用必要的动画；至少取消过渡效果。

## 测试设计

### 组件测试

- OpenApiCodePreview 为动态 code viewport 添加 `data-openapi-code-viewport`。
- scroll 事件设置 `data-scrollbar-visible`，约 700ms 后移除。
- 连续 scroll 只保留一个 hide timer；卸载时清理 listener/timer。
- 新增 code viewport 或切换 tab 后，新的 viewport 仍能绑定行为。
- OpenApiExamplesRail 内容使用 `min-width: 0` / `max-width: 100%` 约束。

### CSS regression

- 代码 viewport 使用 `scrollbar-width: thin` 和透明默认 scrollbar。
- hover/focus/data 状态使用细 scrollbar 颜色。
- WebKit scrollbar 宽度不超过 6px，并且 corner 不产生明显独立滚动条。
- rail 设置纵向滚动和横向内容约束，内部 code viewport 保留横向滚动。
- 不影响 `.docs-scrollbar` 页面级滚动规则。

### 浏览器验收

- 1440px：右侧不再出现 rail 横向 scrollbar；代码块默认 scrollbar 隐藏，hover/focus/滚动时显示且明显变细。
- 390px：无页面级横向溢出；触摸/模拟滚动代码块后 scrollbar 短暂显示，停止后隐藏。
- 代码块横向滚动仍可访问长 URL 和代码行，内容不会被 rail 裁剪。
- Request examples 和 Response examples 的代码 tab 切换后规则一致。

## 验收标准

页面静止时不再同时出现多个高对比度 scrollbar；代码块仅在用户接近或操作时显示细 scrollbar，触摸滚动后短暂显示；examples rail 没有内容级横向滚动需求，因此不产生横向 scrollbar；代码块自身仍可横向查看长代码，桌面和移动端均无不必要的页面水平溢出。
