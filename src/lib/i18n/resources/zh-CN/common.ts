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
    eyebrow: 'Knowledge System',
    title: 'Agora 下一代知识系统',
    description:
      '先有 Docs，接下来会把 Wiki、Tools 和 Doc MCP 放进同一个系统。',
    primaryCta: '进入文档',
    rail: {
      wiki: {
        title: 'Wiki',
        body: '更长篇、更上下文型的产品知识会进入同一个系统，不再散在外面。',
      },
      tools: {
        title: '工具',
        body: '这里先放 Doc MCP，后面可以继续接更多知识工具。',
      },
    },
    cards: {
      docs: {
        title: 'Docs',
        body: '参考指南、API 文档和产品使用路径。',
        cta: '进入文档',
      },
      wiki: {
        title: 'Wiki',
        body: '更广义的产品知识和上下文内容，后续会接进来。',
        cta: '即将上线',
      },
      tools: {
        title: '工具',
        body: '属于同一套知识系统的工具能力入口。',
        cta: 'Doc MCP',
        badge: 'Doc MCP',
      },
    },
  },
} as const;

export default zhCnCommon;
