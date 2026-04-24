const enCommon = {
  app: {
    name: 'Agora Docs',
    tagline: 'Next-generation knowledge system',
    endorsement: 'Knowledge System',
  },
  controls: {
    theme: {
      label: 'Theme',
      light: 'Light',
      dark: 'Dark',
      system: 'System',
    },
    language: {
      label: 'Language',
      english: 'English',
      chinese: '简体中文',
    },
  },
  home: {
    eyebrow: 'Documentation',
    title: 'Agora Docs',
    description:
      'Product docs, API reference, and agent workflows in one quiet workspace.',
    primaryCta: 'Open docs',
    cards: {
      docs: {
        title: 'Product docs',
        body: 'Implementation paths and product concepts, trimmed for focus.',
        cta: 'Open docs',
      },
      api: {
        title: 'API reference',
        body: 'Endpoints, limits, and response behavior close to the code.',
        cta: 'Browse API',
      },
      tools: {
        title: 'Agent tools',
        body: 'Doc MCP and AI-assisted workflows connected to the same source.',
        cta: 'Doc MCP',
      },
    },
  },
  docs: {
    actions: {
      copyMarkdown: 'Copy Markdown',
      open: 'Open',
      openMarkdown: 'Open Markdown',
      openGithub: 'Open in GitHub',
      openChatGPT: 'Open in ChatGPT',
      openClaude: 'Open in Claude',
      chatPrompt: 'Read {{url}} and help me understand this document.',
    },
  },
} as const;

export default enCommon;
