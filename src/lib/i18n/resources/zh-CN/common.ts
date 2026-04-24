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
    title: '像产品界面一样工作的文档系统。',
    description:
      '把快速开始、API 参考与 AI 可消费的 Markdown 收进同一份内容源，让声网接入文档从概览到实现都保持一致。',
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
        body: '把开通服务、鉴权准备和第一条成功请求串成一条最短路径，让高摩擦步骤保持可见。',
        cta: '快速开始',
      },
      api: {
        eyebrow: '参考',
        title: '查看接口表面',
        body: '从产品文档直接过渡到响应码、限额和接口行为，不再跳出另一套阅读外壳。',
        cta: '查看 API',
      },
      tools: {
        eyebrow: 'AI',
        title: '直接消费 Markdown',
        body: '给 LLM 的导出内容和给人的文档页面保持同源，不再变成另一条滞后的信息旁路。',
        cta: '打开 MCP 指南',
      },
    },
    notes: {
      eyebrow: '壳层',
      title: '更安静、更窄、更适合阅读。',
      body: '新的壳层压低界面噪声，收紧正文宽度，只把真正帮助工程团队完成接入决策的结构和动作留在视线里。',
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
