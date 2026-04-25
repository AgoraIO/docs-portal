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
    eyebrow: 'Agora 开发者文档',
    title: '声网开发文档',
    description:
      '从快速开始、API 参考到 AI 可消费的 Markdown，围绕同一份内容源组织，让接入路径更清楚，细节更容易查。',
    primaryCta: '进入文档',
    secondaryCta: 'API 参考',
    panel: {
      eyebrow: '当前系统',
      title: '一份内容源，几种阅读方式。',
      body: '文档、接口检索和 AI 面向的导出内容共用同一棵内容树，避免文案、结构和实现信息逐渐漂移。',
      caption: 'Fumadocs + TanStack + shadcn',
    },
    cards: {
      docs: {
        eyebrow: '路径',
        title: '从快速开始进入',
        body: '按开通服务、鉴权准备和第一条成功请求组织，把容易卡住的步骤放在前面。',
        cta: '快速开始',
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
    notes: {
      eyebrow: '壳层',
      title: '更安静、更适合长文阅读。',
      body: '新的壳层降低界面噪声，收紧正文宽度，保留文档目录、页面操作和关键跳转，让工程团队能从概览平顺进入实现。',
    },
  },
  docs: {
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
