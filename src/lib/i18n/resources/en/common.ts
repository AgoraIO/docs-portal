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
    eyebrow: 'Knowledge System',
    title: "Agora's next-generation knowledge system",
    description:
      'Docs first. Wiki, tools, and Doc MCP are joining the same system.',
    primaryCta: 'Open docs',
    rail: {
      wiki: {
        title: 'Wiki',
        body: 'Long-form product knowledge will live in the same system, not beside it.',
      },
      tools: {
        title: 'Tools',
        body: 'Doc MCP is the first tool card here. More knowledge tooling can plug in later.',
      },
    },
    cards: {
      docs: {
        title: 'Docs',
        body: 'Reference guides, API docs, and product walkthroughs.',
        cta: 'Open docs',
      },
      wiki: {
        title: 'Wiki',
        body: 'Broader product knowledge and narrative context, coming next.',
        cta: 'Coming soon',
      },
      tools: {
        title: 'Tools',
        body: 'Knowledge utilities that belong in the same surface as docs.',
        cta: 'Doc MCP',
        badge: 'Doc MCP',
      },
    },
  },
} as const;

export default enCommon;
