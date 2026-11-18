# RTC 插件能力 IA 调整设计

## 目标

调整 zh-CN RTC「开发与集成」导航，使插件相关能力归入统一的「集成插件能力」下，并将 Web 插件作为其子分组。同步完成物理文件迁移、规范 URL 更新、旧 URL 永久重定向和站内引用更新。

## 目标结构

在 `content/docs/zh-CN/realtime-media/rtc/build` 下采用以下结构：

```text
extensions/
├── meta.json                  # 集成插件能力
├── face-capture.mdx           # 使用面部捕捉插件
└── web/
    ├── meta.json              # Web 插件
    ├── overview.mdx           # 插件概览
    ├── release.mdx            # 插件发版说明
    ├── image-enhancement.mdx  # 使用美颜插件（Beta）
    └── 其他现有 Web 插件页面
```

`build/meta.json` 将保留 `extensions` 入口；`extensions/meta.json` 的标题改为「集成插件能力」，页面顺序为面部捕捉页面和 `web` 子目录。`extensions/web/meta.json` 保留现有 Web 插件页面顺序并标记为「Web 插件」。

## URL 与重定向

新的规范 URL 为：

- 面部捕捉插件：`/zh-CN/realtime-media/rtc/build/extensions/face-capture`
- Web 插件页面：`/zh-CN/realtime-media/rtc/build/extensions/web/<slug>`

需要维护的旧路径包括：

- `/zh-CN/realtime-media/rtc/build/video/face-capture` → `/zh-CN/realtime-media/rtc/build/extensions/face-capture`
- `/zh-CN/realtime-media/rtc/build/extensions/<web-slug>` → `/zh-CN/realtime-media/rtc/build/extensions/web/<web-slug>`

现有历史 IA 映射中指向 `/build/extensions/<web-slug>` 或 `/build/video/face-capture` 的目标也要改为新的规范 URL，避免出现二次重定向。重定向使用现有 zh-CN 产品 IA 解析机制，并覆盖静态构建路径所需的 301 行为。

## 引用更新

在 `content/docs/zh-CN`、`src` 和维护的迁移/路径清单中，将站内引用统一更新到规范 URL。外部 npm、下载地址、旧版历史文档原始路径等非站内链接不改动。

## 验证

- 增加或调整 IA 测试，验证目录、导航标题、页面顺序和旧路径目标。
- 检查旧路径只出现在明确的重定向规则或历史迁移数据中。
- 运行重定向产物一致性检查。
- 运行相关 Vitest、`bun run types:check` 和 `bun run lint`；若生成文档流程要求，补充运行对应构建检查。
