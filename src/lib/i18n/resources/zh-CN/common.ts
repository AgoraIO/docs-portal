const zhCnCommon = {
  app: {
    name: '声网文档',
    tagline: '面向 Agora 与声网开发者的文档入口',
    endorsement: 'Documentation Portal',
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
    eyebrow: '文档站',
    title: '用更克制、更有编辑感的方式阅读声网开发文档',
    description:
      '把参考文档、实践指南和 API 学习路径放进和 new console 一脉相承的 Oatmeal 设计语言中，同时保留稳定的文档结构。',
    primaryCta: '进入文档',
    secondaryCta: '查看 GitHub',
    sections: {
      explore: {
        title: '保留强信息架构，但去掉默认文档站的疲劳感',
        body: '继续使用成熟的导航与目录结构，同时用更柔和的表面层级、留白和排版节奏改善阅读体验。',
      },
      build: {
        title: '继续沿用当前 ConvoAI 内容源',
        body: '这个改版不会打断现有 docs source 和 submodule 工作流，内容团队仍然可以照常推进。',
      },
      adapt: {
        title: '先完成双语壳层，再为正文多语言预留能力',
        body: '当前阶段先支持中英界面切换，正文内容源保持稳定，后续再扩展到完整本地化。',
      },
    },
  },
} as const;

export default zhCnCommon;
