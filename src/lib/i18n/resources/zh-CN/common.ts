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
    description:
      '把产品文档、API 参考与智能体工作流收进同一套安静的界面，层级更清楚，阅读更克制。',
    primaryCta: '进入文档',
    secondaryCta: '查看 API',
    panel: {
      eyebrow: '交付界面',
      title: '一份内容源，几种阅读方式。',
      body: '文档、接口检索和 AI 可读内容共用同一棵内容树，避免样式和信息逐渐失真。',
      caption: '借鉴 Protocol，适配 Agora',
    },
    cards: {
      docs: {
        eyebrow: '文档',
        title: '产品文档',
        body: '只保留接入路径和关键概念，把真正影响决策的信息放在前面。',
        cta: '进入文档',
      },
      api: {
        eyebrow: '参考',
        title: 'API 参考',
        body: '接口、限制与响应行为更贴近实现，查阅路径保持稳定。',
        cta: '查看 API',
      },
      tools: {
        eyebrow: 'AI',
        title: '智能体工具',
        body: 'Doc MCP 与 AI 辅助工作流直接连接同一份文档源。',
        cta: 'Doc MCP',
      },
    },
    notes: {
      eyebrow: '系统',
      title: '为安静浏览而设计。',
      body: '新的设计让层级更明确、字体更统一、界面更轻，内容本身成为主角。这套 token 会同时服务首页、文档页以及后续更多产品界面。',
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
