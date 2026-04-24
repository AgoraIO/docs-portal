const zhCnCommon = {
  app: {
    name: 'Agora Docs',
    tagline: '下一代知识系统',
    endorsement: 'Knowledge System',
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
    eyebrow: 'Documentation',
    title: '声网文档',
    description: '产品文档、API 参考与智能体工作流，收在同一个安静的工作台。',
    primaryCta: '进入文档',
    cards: {
      docs: {
        title: '产品文档',
        body: '保留必要的接入路径与产品概念，少一点噪音。',
        cta: '进入文档',
      },
      api: {
        title: 'API 参考',
        body: '接口、限制与响应行为，贴近实现查看。',
        cta: '查看 API',
      },
      tools: {
        title: '智能体工具',
        body: 'Doc MCP 与 AI 辅助工作流连接同一份文档源。',
        cta: 'Doc MCP',
      },
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
