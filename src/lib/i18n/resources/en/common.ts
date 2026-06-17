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
    site: {
      label: 'Site',
      description: 'Product coverage differs between these two sites.',
      current: {
        en: 'Global site',
        'zh-CN': 'China site',
      },
      options: {
        en: 'Global site',
        'zh-CN': 'China site',
      },
    },
  },
  docs: {
    search: 'Search docs',
    searchDescription: 'Search tabs and pages in the current docs portal.',
    searchPlaceholder: 'Search docs, APIs, guides...',
    searchEmpty: 'No matching pages found.',
    tabsLabel: 'Tabs',
    pagesLabel: 'Pages',
    toc: 'On this page',
    tocEmpty: 'No headings on this page.',
    next: 'Next',
    previous: 'Previous',
    viewAsMarkdown: 'View as Markdown',
    editPage: 'Edit this page',
    viewGithub: 'View on GitHub',
    feedback: 'Was this page helpful?',
    feedbackYes: 'Yes',
    feedbackNo: 'No',
    openMenu: 'Open navigation',
  },
} as const;

export default enCommon;
