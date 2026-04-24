const enCommon = {
  app: {
    name: 'Agora Docs',
    tagline: 'Documentation that behaves like a product surface',
    endorsement: 'Developer Surface',
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
    eyebrow: 'Agora developer documentation',
    title: 'Documentation that behaves like a product surface.',
    description:
      'Quickstarts, API reference, and AI-readable markdown aligned to one source of truth for teams shipping on Agora.',
    primaryCta: 'Open docs',
    secondaryCta: 'API reference',
    panel: {
      eyebrow: 'Current system',
      title: 'One content source, several reading modes.',
      body: 'Docs, API lookup, and AI-facing content stay aligned to the same source tree instead of drifting apart.',
      caption: 'Fumadocs + TanStack + shadcn',
    },
    cards: {
      docs: {
        eyebrow: 'Path',
        title: 'Start with quickstart',
        body: 'Follow the shortest route from service enablement to the first successful request and keep the high-friction steps visible.',
        cta: 'Quickstart',
      },
      api: {
        eyebrow: 'Reference',
        title: 'Inspect the API surface',
        body: 'Move from product guidance into response codes, limits, and endpoint behavior without leaving the same shell.',
        cta: 'Browse API',
      },
      tools: {
        eyebrow: 'AI',
        title: 'Use the markdown directly',
        body: 'LLM-friendly exports and Doc MCP stay aligned with the human-readable docs instead of becoming a stale side channel.',
        cta: 'Open MCP guide',
      },
    },
    notes: {
      eyebrow: 'Shell',
      title: 'Quiet, narrow, and built for reading.',
      body: 'The new shell keeps the page width disciplined, the chrome low-contrast, and the callouts deliberate so engineering teams can move from overview to implementation without fighting the interface.',
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
