const zhCnCommon = {
  app: {
    name: 'Agora Docs',
    tagline: '像产品界面一样工作的文档系统',
    endorsement: 'Developer Surface',
  },
  controls: {
    theme: {
      label: '主题',
      light: '浅色',
      dark: '深色',
      system: '跟随系统',
    },
    language: {
      label: '语言',
      english: 'English',
      chinese: '简体中文',
    },
  },
  home: {
    eyebrow: 'Agora 开发者知识库',
    title: '像知识工作区一样组织的开发文档',
    description:
      '把快速开始、API 参考、Recipes 和 AI 可消费的 Markdown 组织到同一个工作界面里，让接入路径更清楚，下一步更容易判断。',
    primaryCta: '进入文档',
    secondaryCta: 'API 参考',
    workspace: {
      eyebrow: '工作区导览',
      title: '把文档、参考、Recipes 和 AI 可读内容放进同一个壳层。',
      body: '首页负责告诉你下一步应该打开什么，进入正文后继续在同一个壳层里阅读指南、检查接口、复制示例代码。',
      points: {
        one: '更温和、低噪音的界面适合长时间查阅文档。',
        two: '文档、API 检索和给 LLM 的内容保持同源。',
        three: '任务导向的区块让“下一步做什么”更明确。',
      },
    },
    guide: {
      eyebrow: '从这里开始',
      title: '先选最短路径，再进入正文。',
      body: '需要带路时打开快速开始，要核对接口行为时进入 API 参考，要继续在 Agent 里使用时再打开 AI 可读的文档表面。',
      links: {
        docs: {
          label: '进入文档',
          description: '沿着从服务开通到第一条请求的路径开始阅读。',
        },
        api: {
          label: '查看 API',
          description: '在一个地方确认接口、限制和响应行为。',
        },
        tools: {
          label: '打开 MCP 指南',
          description: '继续使用面向 AI 的 Markdown 文档表面。',
        },
      },
    },
    workflow: {
      eyebrow: '主要流程',
      title: '从开通服务走到第一条成功请求。',
      steps: {
        enable: '开通服务并准备项目所需的调用凭证。',
        auth: '先确认鉴权方式，再写第一条请求。',
        quickstart: '沿着快速开始走最短实现路径。',
        request: '调用核心接口并确认响应结构。',
        debug: '用最佳实践和操作指南排查接入问题。',
        expand: '把 API 参考和 AI 可读文档放在手边继续推进下一步。',
      },
    },
    cards: {
      docs: {
        eyebrow: '路径',
        title: '沿着快速开始进入',
        body: '把前提条件、步骤和排查节点放在一条清晰路径里，而不是分散在不同页面中。',
        cta: '打开快速开始',
      },
      api: {
        eyebrow: '参考',
        title: '查看 API 参考',
        body: '从产品说明直接进入响应码、调用限制和接口行为，减少在不同页面之间来回确认。',
        cta: '查看 API',
      },
      tools: {
        eyebrow: 'AI',
        title: '给 AI 使用 Markdown',
        body: '给 LLM 的导出内容和给人的文档页面保持同源，方便在 Coding Agent 里继续使用。',
        cta: '打开 MCP 指南',
      },
    },
    next: {
      eyebrow: '下一步打开什么',
      title: '让界面始终可继续推进。',
      body: '首页负责回答下一步应该去哪，正文壳层负责长文阅读、代码复制、窄而稳的导航，以及更连续的阅读节奏。',
    },
  },
  docs: {
    guide: {
      title: '本文导读',
      description: '先看目录，再进入正文。',
    },
    actions: {
      copyMarkdown: '复制 Markdown',
      open: '打开',
      openMarkdown: '打开 Markdown',
      openGithub: '在 GitHub 打开',
      openChatGPT: '用 ChatGPT 打开',
      openClaude: '用 Claude 打开',
      chatPrompt: '阅读 {{url}} 并帮我理解这篇文档。',
    },
  },
} as const;

export default zhCnCommon;
