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
      'Product docs, API reference, and agent workflows arranged with more signal, less ornament, and enough space to think.',
    primaryCta: 'Open docs',
    secondaryCta: 'Browse API',
    panel: {
      eyebrow: 'Shipping surface',
      title: 'One source, several reading modes.',
      body: 'Docs, API lookup, and AI-facing content stay aligned to the same source tree instead of drifting apart.',
      caption: 'Protocol-inspired, adapted for Agora',
    },
    cards: {
      docs: {
        eyebrow: 'Docs',
        title: 'Product docs',
        body: 'Implementation paths and product concepts, edited down to the decisions teams actually need to make.',
        cta: 'Open docs',
      },
      api: {
        eyebrow: 'Reference',
        title: 'API reference',
        body: 'Endpoints, limits, and response behavior kept close to the implementation.',
        cta: 'Browse API',
      },
      tools: {
        eyebrow: 'AI',
        title: 'Agent tools',
        body: 'Doc MCP and AI-assisted workflows connected to the exact same documentation source.',
        cta: 'Doc MCP',
      },
    },
    notes: {
      eyebrow: 'System',
      title: 'Built for quiet navigation.',
      body: 'The new design keeps hierarchy explicit, typography tighter, and surfaces lighter so the content leads. The same tokens apply to home, docs, and future product surfaces.',
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
