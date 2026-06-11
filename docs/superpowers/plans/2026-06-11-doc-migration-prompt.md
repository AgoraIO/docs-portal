# Whiteboard Docs Migration Prompt

```md
Superpowers + fumadocs-migration

将对应 https://docs.agora.io/en/interactive-whiteboard/overview/product-overview 的本地文档
`/Users/yangyixuan/Documents/GitHub/Doc-Source-Private/interactive-whiteboard`
迁移到 portal 仓库
`/Users/yangyixuan/Documents/GitHub/docs-portal/content/docs/en/realtime-media/whiteboard`
中，并符合当前 docs-portal 的 Fumadocs 文档组织方式。

数据源要求：
- 以本地已有 MDX/Markdown 文件为主数据源。
- 线上页面只用于核对结构、目录顺序或补缺，不作为优先改写依据。
- 迁移前先检查 portal 仓库中的现有写法，不要发明新的组件、语法或运行时封装。

迁移前必须先参考以下现有样例，以它们为准：
- 语言/代码 tabs 写法参考：
  `content/docs/en/ai/get-started/test-mdx-comps.mdx`
- 同页 Tabs / TabsList / TabsTrigger / TabsContent 写法参考：
  `content/docs/en/realtime-media/im/get-started/get-started-sdk.mdx`
- 平台独立页切换与 `navScope.platformTabs` 写法参考：
  `content/docs/en/realtime-media/whiteboard/build/get-started-sdk/meta.json`
  `content/docs/en/realtime-media/whiteboard/overview/supported-platforms/meta.json`
  `content/docs/en/realtime-media/rtc/meta.json`

执行要求：

1. 每篇迁移后的文档都必须补齐 frontmatter，包含：
   ---
   title: ...
   description: ...
   ---
   - 如果源文没有 description，就根据文档主题提炼一句准确摘要补齐。
   - title 和 description 必须是最终展示文本，不能保留变量标签。

2. 按 Fumadocs 的 `meta.json` 约定更新对应目录，保证迁移内容能被正确收录。

3. 处理文档内链接：
   - 指向站内其他文档的链接，改成仓库内实际可用的相对 Markdown/MDX 链接。
   - 外部链接保持不变。
   - 所有引用、include、跳转都必须改成仓库内实际可用形式。

4. 所有 `.yaml` / `.yml` 文件保持原样，不修改内容和格式。

5. 所有 legacy JSX / Docusaurus 组件都必须转成当前 portal 支持的 Markdown/MDX 原生写法。
   包括但不限于：
   - `Vg`、`Vpd`、`Vpl`
   - `PlatformWrapper`、`ProductWrapper`
   - `Tabs`、`TabItem`
   - `Admonition`
   - `CodeBlock`
   - 其他 legacy 自定义 JSX
   禁止把 legacy JSX 原样保留在迁移结果中。

6. 语言代码切换必须转换成当前 portal 支持的 Tabs 写法，不能摊平成顺序堆叠的多个代码块。
   这是硬规则。

   6.1 如果源内容是“纯代码语言切换”，例如：
   `<Tabs><TabItem value="go" label="Golang"> ...code... </TabItem></Tabs>`
   优先转成当前 portal 已支持的简洁写法：

   ```mdx
   <Tabs items={["Python", "TypeScript", "Go"]}>
     <Tab>

   ```python
   ...
   ```

     </Tab>
     <Tab>

   ```ts
   ...
   ```

     </Tab>
     <Tab>

   ```go
   ...
   ```

     </Tab>
   </Tabs>
   ```

   6.2 如果 tab 内不仅有代码，还有段落、列表、图片、提示块等混合内容，则必须转成：
   - `<Tabs>`
   - `<TabsList>`
   - `<TabsTrigger>`
   - `<TabsContent>`

   6.3 严禁把原本的语言切换内容摊平成：
   - 一段 Python 代码
   - 一段 Go 代码
   - 一段 Java 代码
   这种平铺写法。

7. 解析 `Vg`、`Vpd`、`Vpl` 变量时，必须在源仓库中查到其实际映射值，并展开为最终展示文本。
   不得猜测，不得原样保留，不得留下未解析标签。

   变量文件路径固定为：
   - `/Users/yangyixuan/Documents/GitHub/Doc-Source-Private/shared/variables/global.js`
   - `/Users/yangyixuan/Documents/GitHub/Doc-Source-Private/shared/variables/product.js`
   - `/Users/yangyixuan/Documents/GitHub/Doc-Source-Private/shared/variables/platform.js`

   解析规则：
   - `<Vg k="KEY" />` / `<Vg k="KEY"/>`
     - 到 `shared/variables/global.js` 中查找 `KEY` 对应值。
     - 如果该值继续引用其他变量，必须递归解析，直到得到最终纯文本。
   - `<Vpd k="KEY" />` / `<Vpd k="KEY"/>`
     - 到 `shared/variables/product.js` 中查找。
     - 必须先确定当前文档所属的 product，再读取该 product 下的 `KEY` 值。
   - `<Vpl k="KEY" />` / `<Vpl k="KEY"/>`
     - 到 `shared/variables/platform.js` 中查找。
     - 必须先确定当前文档所属的 platform，再读取该 platform 下的 `KEY` 值。

   product / platform 判定规则：
   - 先根据当前文档所在产品目录判断。
   - 再结合源文路径、同目录文档、导入关系、页面主题交叉确认。
   - 如果仍无法确定，停止猜测，列为“需人工确认”，不要输出错误替换结果。

   示例：
   - `Total <Vg k="CHAT_GROUP_LOWER"/>s` -> `Total group chats`
   - `<Vg k="COMPANY" /> <Vg k="CHAT" />` -> `Agora Chat`

   验收要求：
   - 迁移结果中不得残留 `<Vg`
   - 不得残留 `<Vpd`
   - 不得残留 `<Vpl`
   - 不得残留“推测值”或占位值

8. 如果源页面右上角有平台代码切换，或者源文语义上是“同一主题下的多平台页面”，必须做成当前 portal 的“真实平台页 + 页头平台切换”模式，而不是把所有平台内容摊平成一张超长页。
   这是硬规则。

   具体要求：
   - 不保留运行时 `PlatformWrapper` / `ProductWrapper`
   - 不保留 legacy 平台筛选逻辑
   - 为每个平台生成真实页面文件或真实平台目录
   - 在该层目录下创建或更新 `meta.json`
   - 使用 `navScope.platformTabs: true`
   - 使用 `versions` 声明平台切换
   - `pages` 中列出各平台真实页面

   参考结构示例：

   ```json
   {
     "title": "SDK quickstart",
     "navScope": {
       "defaultVersion": "web",
       "platformTabs": true,
       "sharedSidebar": true,
       "versions": [
         { "id": "android", "label": "Android", "path": "android" },
         { "id": "ios", "label": "iOS", "path": "ios" },
         { "id": "web", "label": "Web", "path": "web" }
       ]
     },
     "pages": ["android", "ios", "web"]
   }
   ```

   规则补充：
   - 平台切换应改变 URL。
   - 每个平台必须是可单独访问的真实页面。
   - 共享内容可以复制或抽成仓库允许的 include，但不能退回成运行时平台过滤。

9. 所有 admonition / callout 必须转成当前 portal 支持的 directive 写法。
   例如：
   - `Admonition type="info"` -> `:::info[...]`
   - `caution` / `warning` -> `:::warning[...]`
   - `danger` -> `:::error[...]`

10. 特别处理列表下面的 admonition 缩进问题，避免 MDX 解析报错。
   这是硬规则。

   规则如下：
   - `:::note`、`:::tip`、`:::info`、`:::warning`、`:::caution`、`:::error` 默认必须顶格或与所在块的合法缩进严格对齐。
   - 不要输出这种高风险写法：
     `   :::caution`
   - 如果 admonition 出现在列表后，默认做法是：
     - 先结束列表
     - 空一行
     - 再把 admonition 顶格写出
   - opening `:::` 和 closing `:::` 必须处于同一缩进层级。
   - 如果确实必须属于某个 list item，必须使用合法的列表块级缩进；拿不准时，优先改成列表后顶格 admonition，不要保留歧义缩进。

   错误示例：
   ```md
   - xxxx
      :::caution
      xxxx
   :::
   ```

   正确示例：
   ```md
   - xxxx

   :::caution
   xxxx
   :::
   ```

11. 所有与页面内代码相关的切换，都改为当前分支已存在并可工作的 Tabs 写法，不要自创组件名，不要保留 `TabItem`。

12. 迁移时不要擅自改变信息架构和正文含义。
   - 保持原始内容结构、章节层级和技术语义。
   - 允许为适配 Fumadocs 做必要的静态拆页、链接修正、变量展开、组件转写。
   - 不要随意删减内容。
   - 不要为了“更好看”重写文案。

执行流程要求：
1. 先给出迁移计划和目录映射。
2. 明确列出哪些页面会拆成平台独立页，哪些只做同页代码语言 Tabs。
3. 明确列出会读取哪些变量文件，以及 product/platform 的判定依据。
4. 然后再执行修改。
5. 修改完成后，必须做一轮自检，再汇报结果。

自检清单：
- 不得残留 legacy 组件：
  - `<Vg`
  - `<Vpd`
  - `<Vpl`
  - `<TabItem`
  - `<Admonition`
  - `<PlatformWrapper`
  - `<ProductWrapper`
- 不得把语言切换平铺成多个连续代码块
- 源页面存在平台切换时，不得产出单页超长平台混排结果
- 所有 frontmatter 完整
- 所有 `meta.json` 已更新
- 站内链接为仓库内实际可用链接
- `.yaml` / `.yml` 未改动
- 不得出现缩进错误的 `:::note` / `:::warning` / `:::caution` 等 directive
- 如有任何变量无法确认真实值，必须明确列入“需人工确认”，不得猜测

输出要求：
- 先输出迁移计划
- 再输出目录映射
- 再执行修改
- 完成后汇报：
  - 新增/修改文件
  - 更新过的 `meta.json`
  - 拆出的平台页面
  - 处理过的链接
  - 已解析并展开的关键变量
  - 仍需人工确认的问题
```
