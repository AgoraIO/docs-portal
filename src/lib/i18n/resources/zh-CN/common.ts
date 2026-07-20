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
    site: {
      label: '站点',
      description: '两个站点覆盖的产品范围并不完全相同。',
      global: '国际站',
      china: '中国站',
    },
  },
  docs: {
    search: '搜索文档',
    searchDescription: '搜索当前文档门户中的 tabs 和页面。',
    searchPlaceholder: '搜索文档、API、指南...',
    searchEmpty: '没有找到匹配页面。',
    searchRecent: '最近浏览',
    searchPrompt: '搜索文档、API 和指南。',
    searchUnavailable: '搜索索引不可用。',
    searchLoading: '正在搜索...',
    searchAllPlatforms: '全部平台',
    searchAllProducts: '全部产品',
    searchFilterNoResults: '无匹配结果',
    searchFilterPlatforms: '筛选平台…',
    searchFilterProducts: '筛选产品…',
    searchHintClose: '关闭',
    searchHintNavigate: '导航',
    searchHintSelect: '选择',
    tabsLabel: 'Tabs',
    sectionPickerLabel: '分区',
    pagesLabel: 'Pages',
    toc: '本页目录',
    tocEmpty: '当前页面没有标题。',
    lastUpdated: '更新时间',
    lastUpdatedUnavailable: '更新时间不可用',
    returnToSource: '返回 {{title}}',
    next: '下一页',
    previous: '上一页',
    copyPage: '复制页面',
    viewAsMarkdown: '查看 Markdown',
    openInChatGpt: '在 ChatGPT 中打开',
    openInClaude: '在 Claude 中打开',
    connectToCursor: '连接到 Cursor',
    connectToVsCode: '连接到 VS Code',
    copyMcpConfig: '复制 MCP 配置',
    copyMcpCommand: '复制 MCP 命令',
    copyMenuAiTools: 'AI 工具',
    copyMenuMcp: 'MCP',
    copyMenuOther: '其他',
    copied: '已复制',
    editPage: '编辑此页',
    viewGithub: '在 GitHub 查看',
    feedback: '这个页面有帮助吗？',
    feedbackYes: '有',
    feedbackNo: '没有',
    feedbackOpen: '提交反馈',
    feedbackDialogTitle: '提交文档反馈',
    feedbackDialogDescription: '反馈此页面的文档错误、内容建议或使用体验问题。',
    feedbackIssueTitle: '文档反馈',
    feedbackKindLabel: '反馈类型',
    feedbackKind: {
      issue: '问题',
      suggestion: '建议',
      usability: '体验',
    },
    feedbackDetailsLabel: '详情',
    feedbackDetailsPlaceholder: '描述错误、缺失、困惑或不好用的地方。',
    feedbackCancel: '取消',
    feedbackSubmit: '打开 issue',
    openMenu: '打开导航',
    legacyDocsBanner: '需要访问旧版文档站？前往旧版文档官网首页。',
    opensInNewTab: '在新标签页打开',
  },
  home: {
    eyebrow: 'Agora 开发者文档',
    title: 'Agora 文档',
    description: '对话式 AI / 语音通话 / 视频通话 / 互动直播 / 实时消息',
    shellLabel: 'Overview',
    askAi: 'AI 入口',
    search: '搜索',
    nav: {
      products: '总览',
      solutions: '方案',
      agent: 'AI',
    },
    tabs: {
      overview: '总览',
      ai: 'AI Agent',
      rtc: 'RTC',
      messaging: '实时消息',
      media: '媒体服务',
      solutions: '解决方案',
      reference: '参考',
    },
    portalTabs: {
      overview: '文档总览',
      quickstart: '快速开始',
      mcp: 'MCP 集成',
      skills: 'Skills 集成',
      resources: '资源与参考',
    },
    sidebar: {
      getStarted: {
        title: '快速开始',
        items: {
          overview: 'Overview',
          videoCourse: 'AI 快速开始',
          community: '社区',
        },
      },
      understanding: {
        title: '声网能力域',
        items: {
          platformOverview: '平台总览',
          ai: '对话式 AI',
          rtc: '实时音视频',
          messaging: '实时消息',
          media: '媒体服务',
          solutions: '场景方案',
        },
      },
      reference: {
        title: '参考',
        items: {
          recipes: '术语库',
          roomApi: 'API 参考',
          security: '安全合规',
        },
      },
    },
    quickstart: {
      title: 'Get started',
      body: '从最重要的三条路径开始接入声网。',
    },
    featureCards: {
      aiQuickstart: {
        title: '对话式 AI 快速开始',
        body: '从实时对话、语音模型和 Agent 集成开始，建立第一条 AI 交互链路。',
      },
      rtcQuickstart: {
        title: 'RTC 快速开始',
        body: '接入实时音视频核心能力，完成通话、直播或互动场景的第一条音视频链路。',
      },
      rtmQuickstart: {
        title: '实时消息快速开始',
        body: '构建消息、状态同步与房间协作能力，补齐互动场景中的通信层。',
      },
    },
    capabilities: {
      eyebrow: '能力域',
      title: '按能力域进入文档',
      body: '把声网最重要的产品和方案能力归并为稳定的一级阅读入口，而不是直接暴露所有产品目录。',
      items: {
        ai: {
          title: 'AI',
          body: 'ConvoAI、Device Kit、语音交互、Agent 接入。',
        },
        rtc: {
          title: 'RTC',
          body: '客户端 SDK、服务端 SDK、实时音视频核心能力。',
        },
        messaging: {
          title: '实时消息',
          body: 'RTM、状态同步、消息与房间协作链路。',
        },
        media: {
          title: '媒体服务',
          body: '录制、推流、拉流、转码、转录与直播分发。',
        },
        solutions: {
          title: '场景方案',
          body: '会议、课堂、KTV、秀场、语聊和智能硬件场景。',
        },
        manage: {
          title: '管理与部署',
          body: 'Console、Analytics、Status、鉴权与运维入口。',
        },
      },
    },
    references: {
      eyebrow: 'Reference',
      title: '参考与 Agent Surface',
      body: '保留给开发者和 Coding Agent 的稳定导出能力，让搜索、索引和原始 Markdown 都有清晰入口。',
      items: {
        llms: {
          title: 'llms.txt',
          body: '用于 Agent 发现文档范围的轻量索引。',
        },
        full: {
          title: 'llms-full.txt',
          body: '用于离线索引和批量处理，不建议作为交互式 Agent 的默认上下文。',
        },
        search: {
          title: '搜索接口',
          body: '通过搜索缩小范围，再深入具体页面。',
        },
        markdown: {
          title: '原始 Markdown',
          body: '在文档 URL 后添加 .md，直接读取已发布的 Markdown 内容。',
        },
      },
    },
    pages: {
      aiQuickstart: {
        description:
          '从 ConvoAI 的整体接入链路开始：准备项目、鉴权、语音模型和回调，再逐步连接到客户端或 Agent 工作流。',
        section1: {
          title: '推荐先读',
          body: '先从产品概览和快速开始建立整体认知，再进入实时对话、语音代理和工具调用等更细的能力页。',
          link1: '打开 ConvoAI 产品概览',
          link2: '打开 ConvoAI 快速开始',
        },
        section2: {
          title: '与 Agent 一起使用',
          body: '如果你希望让 Coding Agent 直接消费文档，可以优先使用 llms 索引和搜索接口，再把页面 Markdown 拉入上下文。',
          link1: '查看 llms.txt',
          link2: '打开搜索接口',
        },
      },
      community: {
        title: '社区与协作入口',
        description:
          '把搜索、文档入口和协作资源集中到一起，方便团队在不同产品、不同角色之间快速切换。',
        section1: {
          title: '查找内容',
          body: '优先使用站内搜索定位 API、快速开始和场景方案，再进入对应的能力域页面继续阅读。',
          link1: '打开搜索接口',
          link2: '打开文档主入口',
        },
        section2: {
          title: '团队协作',
          body: '这一层未来可以继续接入社区、FAQ、变更日志和内部迁移指南，形成统一的知识入口。',
        },
      },
      platformOverview: {
        title: '声网平台总览',
        description:
          '声网文档以能力域优先组织，把 AI、RTC、消息、媒体服务和解决方案收敛成稳定的阅读入口，降低首次接入和长期维护的成本。。。',
        section1: {
          title: '平台能力结构',
          body: '底层是 RTC、RTM、媒体服务等通用能力，上层是对话式 AI、会议、课堂和行业方案。文档应该反映这种分层关系，而不是直接暴露原始仓库目录。',
        },
        section2: {
          title: '建议阅读路径',
          body: '先进入与你当前目标最接近的能力域，再逐步进入快速开始、产品概览、API 参考和运维文档。',
        },
      },
      aiDomain: {
        title: '对话式 AI',
        description:
          '围绕 ConvoAI、Device Kit 和 Agent 集成组织文档，帮助开发者从实时语音对话走到完整的 AI 交互产品实现。',
        section1: {
          title: '主要产品',
          body: '当前 AI 相关内容主要来自 ConvoAI 和 Device Kit。ConvoAI 负责对话式 AI 引擎，Device Kit 更偏智能硬件和套件化接入路径。',
          link1: '查看 ConvoAI 产品概览',
          link2: '查看 Device Kit 概览',
        },
        section2: {
          title: '推荐内容结构',
          body: '建议在该能力域下继续补齐快速开始、模型与语音、工具调用、客户端集成、Agent 接入和参考文档。',
        },
      },
      rtcDomain: {
        title: '实时音视频',
        description:
          'RTC 是声网最核心的基础能力之一，对应客户端 SDK、服务端 SDK、互动直播和实时通话的主链路。',
        section1: {
          title: '主要入口',
          body: '新文档站应优先把客户端快速开始、服务端 SDK、鉴权、屏幕共享、音频场景和扩展能力组织成稳定入口。',
          link1: '查看 RTC 文档入口',
          link2: '查看 RTC Server SDK 文档入口',
        },
        section2: {
          title: '适用场景',
          body: '该能力域承接语音通话、视频通话、互动直播和部分 AI 场景下的实时媒体底座能力。',
        },
      },
      messagingDomain: {
        title: '实时消息',
        description:
          '实时消息能力用于状态同步、房间协作和业务控制流，是许多 RTC 或 AI 场景的通信层补充。',
        section1: {
          title: '主要入口',
          body: '当前可先围绕 RTM 2 的产品概览、快速开始和消息/状态同步等核心主题组织内容。',
          link1: '查看 RTM 文档入口',
        },
        section2: {
          title: '与 RTC 的关系',
          body: 'RTC 解决实时媒体流，RTM 解决信令、状态和业务消息。新站应帮助用户明确二者分工。',
        },
      },
      mediaDomain: {
        title: '媒体服务',
        description:
          '媒体服务覆盖录制、推流、拉流、转码、转录和直播分发，适合在 RTC 之外补齐媒体处理与交付链路。',
        section1: {
          title: '主要产品',
          body: '当前媒体服务可按录制、媒体输入输出、转码和实时转录四个方向组织，分别挂接到 Cloud Recording、Media Push、Media Pull、Cloud Transcoder 和 Speech to Text。',
          link1: '查看云端录制文档',
          link2: '查看旁路推流文档',
          link3: '查看云端转码文档',
        },
        section2: {
          title: '推荐编排方式',
          body: '建议新站把媒体服务做成单独能力域，而不是拆成许多一级产品入口，这样更符合用户任务心智。',
        },
      },
      solutionsDomain: {
        title: '解决方案',
        description:
          '解决方案层按场景而不是底层能力组织内容，适合让用户从会议、课堂、语聊房、KTV、秀场和智能硬件等业务目标出发。',
        section1: {
          title: '推荐入口',
          body: '可以优先展示会议、在线 K 歌房和秀场直播等最具代表性的方案，再逐步扩展到课堂和硬件。',
          link1: '查看灵动会议文档',
          link2: '查看在线 K 歌房文档',
          link3: '查看秀场直播文档',
        },
        section2: {
          title: '与能力域的关系',
          body: '解决方案页应该帮助用户识别它背后依赖的 RTC、消息、媒体服务与 AI 能力，形成跨域跳转。',
        },
      },
      glossary: {
        title: '术语库',
        description:
          '术语库用于统一频道、房间、轨道、鉴权、信令、转码、录制等跨产品的核心定义，减少文档之间术语漂移。',
        section1: {
          title: '建议收录内容',
          body: '优先补齐 RTC、RTM、媒体服务和 AI 中重复出现的概念，并维护中英文术语对照。',
        },
      },
      apiReference: {
        title: 'API 参考',
        description:
          'API 参考页用于统一说明当前 API 的组织方式、入口和迁移状态。在新站过渡期，这一页尤其重要。',
        section1: {
          title: '当前入口',
          body: '现阶段仍可通过旧 API 参考入口和站内搜索找到目标接口。后续应逐步把 API 参考按能力域和产品族并入新站。',
          link1: '打开 API 参考',
          link2: '通过搜索定位接口',
        },
      },
      security: {
        title: '安全合规',
        description:
          '安全与合规应作为统一参考能力存在，承接鉴权、Token、隐私、合规说明和白皮书类内容。',
        section1: {
          title: '建议内容',
          body: '新站可逐步汇总项目鉴权、Token 生成、平台安全说明、SDK 合规与地区化合规要求。',
        },
      },
    },
  },
} as const;

export default zhCnCommon;
