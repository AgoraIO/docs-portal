# 为什么新站没有“请求 Header / Authorization”？中英文站点 YAML 处理逻辑差异与架构方案

在对老中文文档仓库 `shengwang-doc-source` 和新文档门户 `docs-portal` 进行深入源码级排查后，我们找到了导致 http://localhost:3000/zh-CN/api-reference/api-ref/conversational-ai/join 页面不显示 Authorization 请求 Header 的根本原因。

以下是两套系统的核心处理逻辑、表现层差异，以及在保留中文站点鉴权直观性的前提下，是否需要维护两套处理逻辑的评估。

---

## 1. 核心现象：为什么新站没有“请求 Header / Authorization”？

在新版 `docs-portal` 渲染的 `conversational-ai/join` (start-agent) 接口页面上，左侧参数区只显示了 `Path Parameters`（如 `appid`），而没有 `Header Parameters`（即 `Authorization`）。

但这**并不是因为中英文的 YAML 缺字段**：
- 在 `content/openapi/conversational-ai/rest-api.zh-CN.yaml` 中，`join` 的 parameters 下确实通过 `$ref` 显式引用了 `#/components/parameters/Authorization`：
  ```yaml
  paths:
    '/v2/projects/{appid}/join':
      post:
        parameters:
          - $ref: '#/components/parameters/Authorization'
          - $ref: '#/components/parameters/appid'
  ```

### 底层组件处理逻辑的差异

* **新站的渲染过滤（Fumadocs 模式）**：
  新站的 `FumadocsOpenApiContent.tsx` 组件在获取接口的参数列表后，会通过 `isDisplayableParameter` 过滤参数，并对其中的 `Authorization` 头参数进行了**强制拦截**：
  ```typescript
  function isDisplayableParameter(parameter: unknown): parameter is OpenApiParameter {
    return (
      ...
      !isAuthenticationHeaderParameter(parameter) && // 拦截 Authorization
      ...
    );
  }

  function isAuthenticationHeaderParameter(parameter: OpenApiRecord) {
    return (
      typeof parameter.name === 'string' &&
      parameter.in === 'header' &&
      parameter.name.toLowerCase() === 'authorization'
    );
  }
  ```
  拦截后，它会把 `Authorization` 解析为 API 安全鉴权标志，并以卡片形式呈现在**右侧 Sidebar 顶部的 Authorization 独立区块**中，提示 “This endpoint requires authentication”。
  * 这样做是现代化 API 站点的通用做法（如 Stripe、ReadMe 等），避免用户在每个接口的参数表里重复看到相同的鉴权 header。

* **老站的渲染逻辑（AntD / Docusaurus 模式）**：
  在老中文站 `shengwang-doc-source` 的 `src/components/restful/OpenapiRender.tsx` 中，它并不原生具有强安全模型的“右侧 Authorization 卡片拦截能力”，而是将解析后的 `parameters` 机械地按 `in` 分为 `header`、`path`、`query` 三组：
  ```typescript
  const headersParams = parametersMapMemo.header || [];
  const pathParams = parametersMapMemo.path || [];
  const queryParams = parametersMapMemo.query || [];
  ```
  因此，只要 YAML parameters 里写了 `Authorization`，它就会雷打不动地在页面正中间渲染一个叫 `请求 Header` 的大段，并在下方展开鉴权方法的详细中文解释（包括 Basic Auth 和 Token 两种长段落）。

---

## 2. 需不需要为中英文 YAML 维护两套渲染处理逻辑？

中英文用户对于 API 鉴权文档的诉求在新站中产生了张力：
- **英文站需求（标准 OpenAPI 风格）**：希望界面非常现代，遵循 OpenAPI 安全定义（`securitySchemes`），鉴权信息作为标准认证框架显示在右侧，请求主体只关注路径参数和 Body 载荷。
- **中文站需求（直观罗列风格）**：由于声网的鉴权方式涉及“RTC Token”与“Basic Auth”两种较为复杂的混合逻辑，中文开发者高度习惯在左侧核心参数表的“请求 Header”列表里直接看详细的说明，甚至需要复制里面大段的配置示例（如 `agora token="xxx"`）。

### 方案对比与评估

### 方案 A：分流处理逻辑（针对中英文执行不同过滤）
在 `isDisplayableParameter` 中加入语言/站点条件，对中文站开放 `Authorization` 显示，对英文站保持过滤。
* **实现机制**：
  ```typescript
  function isDisplayableParameter(parameter: unknown, locale?: string): parameter is OpenApiParameter {
    ...
    const isAuth = isAuthenticationHeaderParameter(parameter);
    if (isAuth) {
      return locale === 'zh-CN'; // 如果是中文，强制返回 true，不隐藏
    }
    ...
  }
  ```
* **优点**：完美满足中文站习惯。中文页面的正中会直接出现带有完整格式的“请求 Header”区域，包含长段中文解释；而英文页面保持干净、现代的右侧卡片。
* **缺点**：稍微增加了渲染层的一点点特判。但好在新站的 `FumadocsOpenApiContent` 已经是我们高度本地化定制的组件（并不是 node_modules 里的黑盒），修改此处的成本极低，且完全可控。

### 方案 B：保持单一渲染逻辑，仅重组 YAML
在两边 YAML 里都把 `Authorization` 删掉，退写到右侧的 `securitySchemes`，并使用 MDX 的全局 callout 补在描述下方。
* **优点**：中英文 YAML 格式高度一致。
* **缺点**：失去了“请求 Header”在列表中的显式结构，中文开发者很难第一眼发现 `Authorization` 是作为一个 `header` 参数与 `appid` 路径参数平级的。

---

## 3. 最终架构推荐

**我们建议采用【方案 A】的变体：提供细粒度的局部渲染控制，而不需要维护两套庞大的 YAML 解析编译器。**

在 `FumadocsOpenApiContent.tsx` 中，我们可以直接通过当前页面的 `locale`（新站路由中天然带有 `zh-CN` 或 `en`）来微调过滤行为。
1. **对于中文版面 (`zh-CN`)**：允许 `Authorization` 头参数渲染在左侧的 `Header Parameters`（显示为“请求 Header”）列表中，以突出极其重要的 RTC Token 传参和 Basic Auth 说明。
2. **对于英文版面 (`en`)**：遵循原有设计，将其折叠隐藏并置于右侧 Sidebar，保持美观。

这样在保留底层 API 数据模型（两者都依赖标准的 `convoai.yaml` 转换）的同时，完美兼容了中英文双端用户不同的文档交互习惯。
