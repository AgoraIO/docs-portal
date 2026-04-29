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
    eyebrow: 'Agora developer knowledge base',
    title: 'Developer docs, organized like a workspace.',
    description:
      'Quickstarts, API reference, recipes, and AI-readable markdown arranged as one working surface for teams shipping on Agora.',
    primaryCta: 'Open docs',
    secondaryCta: 'API reference',
    workspace: {
      eyebrow: 'Workspace guide',
      title: 'One shell for docs, reference, recipes, and AI-readable content.',
      body: 'Use the landing page to pick the next path, then stay inside the same shell while reading guides, checking endpoints, and copying working examples.',
      points: {
        one: 'Warm, low-noise surfaces keep long-form reading comfortable.',
        two: 'Docs, API lookup, and LLM-facing markdown stay aligned.',
        three: 'Task-oriented blocks answer what to open next.',
      },
    },
    guide: {
      eyebrow: 'Start here',
      title: 'Choose the shortest path to the next task.',
      body: 'Open the quickstart when you need a guided path, jump to API reference for endpoint behavior, or use the AI-readable docs when you want to continue in agents.',
      links: {
        docs: {
          label: 'Open docs',
          description:
            'Read the guided path from service setup to the first request.',
        },
        api: {
          label: 'Browse API',
          description:
            'Inspect endpoints, limits, and response behavior in one place.',
        },
        tools: {
          label: 'Open MCP guide',
          description:
            'Use the markdown-native surface for AI-assisted workflows.',
        },
      },
    },
    workflow: {
      eyebrow: 'Primary workflow',
      title: 'Move from enablement to the first successful request.',
      steps: {
        enable: 'Enable the service and collect the project credentials.',
        auth: 'Confirm the auth method before writing the first request.',
        quickstart:
          'Use the quickstart to follow the shortest implementation path.',
        request: 'Call the core endpoint and inspect the response shape.',
        debug: 'Use guides and best practices to resolve integration issues.',
        expand:
          'Keep API reference and AI-readable docs nearby for the next step.',
      },
    },
    cards: {
      docs: {
        eyebrow: 'Path',
        title: 'Follow the quickstart path',
        body: 'Read a guided route that keeps prerequisites, steps, and debug checkpoints visible instead of scattering them across several pages.',
        cta: 'Open quickstart',
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
    next: {
      eyebrow: 'Open next',
      title: 'Keep the surface actionable.',
      body: 'The landing page should answer what to open next, while the docs shell handles deep reading, code copying, narrow navigation, and steady visual rhythm.',
    },
  },
  docs: {
    guide: {
      title: 'In this guide',
      description: 'A quick outline before you start reading.',
    },
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
