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
    site: {
      label: '站点',
      description: '这两个站点的产品覆盖范围不同。',
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
    search: '搜索文档',
    searchDescription: '搜索当前文档门户中的 tabs 和页面。',
    searchPlaceholder: '搜索文档、API、指南...',
    searchEmpty: '没有找到匹配页面。',
    tabsLabel: 'Tabs',
    pagesLabel: 'Pages',
    toc: '本页目录',
    tocEmpty: '当前页面没有标题。',
    next: '下一页',
    previous: '上一页',
    viewAsMarkdown: '查看 Markdown',
    editPage: '编辑此页',
    viewGithub: '在 GitHub 查看',
    feedback: '这个页面有帮助吗？',
    feedbackYes: '有',
    feedbackNo: '没有',
    openMenu: '打开导航',
  },
} as const;

export default zhCnCommon;
