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
    site: {
      label: 'Site',
      description: 'Product coverage differs between the two sites.',
      global: 'International site',
      china: 'China site',
    },
  },
  docs: {
    search: 'Search docs',
    searchDescription: 'Search tabs and pages in the current docs portal.',
    searchPlaceholder: 'Search docs, APIs, guides...',
    searchEmpty: 'No matching pages found.',
    searchRecent: 'Recent',
    searchPrompt: 'Search docs, APIs, and guides.',
    searchUnavailable: 'Search index unavailable.',
    searchLoading: 'Searching...',
    searchAllPlatforms: 'All platforms',
    searchAllProducts: 'All products',
    searchFilterNoResults: 'No results',
    searchFilterPlatforms: 'Filter platforms…',
    searchFilterProducts: 'Filter products…',
    searchHintClose: 'close',
    searchHintNavigate: 'navigate',
    searchHintSelect: 'select',
    tabsLabel: 'Tabs',
    sectionPickerLabel: 'Section',
    pagesLabel: 'Pages',
    toc: 'On this page',
    tocEmpty: 'No headings on this page.',
    returnToSource: 'Back to {{title}}',
    next: 'Next',
    previous: 'Previous',
    copyPage: 'Copy Page',
    viewAsMarkdown: 'View as Markdown',
    openInChatGpt: 'Open in ChatGPT',
    openInClaude: 'Open in Claude',
    connectToCursor: 'Connect to Cursor',
    connectToVsCode: 'Connect to VS Code',
    copyMcpConfig: 'Copy MCP Config',
    copyMcpCommand: 'Copy MCP Command',
    copyMenuAiTools: 'AI tools',
    copyMenuMcp: 'MCP',
    copyMenuOther: 'Other',
    copied: 'Copied',
    editPage: 'Edit this page',
    viewGithub: 'View on GitHub',
    feedback: 'Was this page helpful?',
    feedbackYes: 'Yes',
    feedbackNo: 'No',
    feedbackOpen: 'Send feedback',
    feedbackDialogTitle: 'Send documentation feedback',
    feedbackDialogDescription:
      'Share a documentation issue, content suggestion, or usability problem for this page.',
    feedbackIssueTitle: 'Docs feedback',
    feedbackKindLabel: 'Feedback type',
    feedbackKind: {
      issue: 'Issue',
      suggestion: 'Suggestion',
      usability: 'Usability',
    },
    feedbackDetailsLabel: 'Details',
    feedbackDetailsPlaceholder:
      'Describe what is wrong, missing, confusing, or hard to use.',
    feedbackCancel: 'Cancel',
    feedbackSubmit: 'Open issue',
    openMenu: 'Open navigation',
    legacyDocsBanner:
      'Looking for the previous docs site? Visit the legacy docs homepage.',
    opensInNewTab: 'opens in a new tab',
  },
  home: {
    eyebrow: 'Agora developer documentation',
    title: 'Agora Docs',
    description:
      'Conversational AI / Voice Calling / Video Calling / Interactive Live Streaming / Real-time Messaging',
    shellLabel: 'Overview',
    askAi: 'Ask AI',
    search: 'Search',
    nav: {
      products: 'Overview',
      solutions: 'Solutions',
      agent: 'AI',
    },
    tabs: {
      overview: 'Overview',
      ai: 'AI Agent',
      rtc: 'RTC',
      messaging: 'Messaging',
      media: 'Media Services',
      solutions: 'Solutions',
      reference: 'Reference',
    },
    portalTabs: {
      overview: 'Docs Overview',
      quickstart: 'Quickstart',
      mcp: 'MCP Integrations',
      skills: 'Skills Integrations',
      resources: 'Resources',
    },
    sidebar: {
      getStarted: {
        title: 'Get started',
        items: {
          overview: 'Overview',
          videoCourse: 'AI quickstart',
          community: 'Community',
        },
      },
      understanding: {
        title: 'Agora capabilities',
        items: {
          platformOverview: 'Platform overview',
          ai: 'Conversational AI',
          rtc: 'Realtime audio-video',
          messaging: 'Realtime messaging',
          media: 'Media services',
          solutions: 'Solutions',
        },
      },
      reference: {
        title: 'Reference',
        items: {
          recipes: 'Glossary',
          roomApi: 'API reference',
          security: 'Security & compliance',
        },
      },
    },
    quickstart: {
      title: 'Get started',
      body: 'Start with the three most important entry paths into Agora.',
    },
    featureCards: {
      aiQuickstart: {
        title: 'Conversational AI quickstart',
        body: 'Start with realtime conversation, voice models, and agent integration to build your first AI interaction flow.',
      },
      rtcQuickstart: {
        title: 'RTC quickstart',
        body: 'Integrate the core audio-video stack and ship your first real-time calling or live interaction workflow.',
      },
      rtmQuickstart: {
        title: 'Realtime messaging quickstart',
        body: 'Build messaging, state sync, and room collaboration as the communication layer beside RTC.',
      },
    },
    capabilities: {
      eyebrow: 'Capabilities',
      title: 'Navigate by capability domain',
      body: 'Group Agora into stable top-level domains instead of exposing every product directory as first-class navigation.',
      items: {
        ai: {
          title: 'AI',
          body: 'ConvoAI, Device Kit, voice interaction, and agent integration.',
        },
        rtc: {
          title: 'RTC',
          body: 'Client SDKs, server SDKs, and core realtime audio-video capabilities.',
        },
        messaging: {
          title: 'Messaging',
          body: 'RTM, state sync, and messaging workflows for collaboration layers.',
        },
        media: {
          title: 'Media Services',
          body: 'Recording, push, pull, transcoding, transcription, and live delivery.',
        },
        solutions: {
          title: 'Solutions',
          body: 'Meetings, classrooms, KTV, showroom, chatroom, and device scenarios.',
        },
        manage: {
          title: 'Manage & Deploy',
          body: 'Console, analytics, status, auth, and operational entry points.',
        },
      },
    },
    references: {
      eyebrow: 'Reference',
      title: 'Reference and agent surfaces',
      body: 'Expose stable export formats for both developers and coding agents so search, indexing, and raw markdown stay easy to consume.',
      items: {
        llms: {
          title: 'llms.txt',
          body: 'A lightweight index for agent discovery across the docs surface.',
        },
        full: {
          title: 'llms-full.txt',
          body: 'A larger aggregated context export for richer agent pulls.',
        },
        search: {
          title: 'Search endpoint',
          body: 'Narrow the scope through search before opening full documents.',
        },
        markdown: {
          title: 'Raw markdown',
          body: 'Read published canonical markdown directly from the docs tree.',
        },
      },
    },
    pages: {
      aiQuickstart: {
        description:
          'Start from the ConvoAI integration path: project setup, auth, voice model decisions, callbacks, and then move into client or agent workflows.',
        section1: {
          title: 'Read this first',
          body: 'Start with the product overview and quickstart to build a shared mental model before diving into realtime conversation, voice agents, or tool calling.',
          link1: 'Open ConvoAI overview',
          link2: 'Open ConvoAI quickstart',
        },
        section2: {
          title: 'Use with agents',
          body: 'If you want coding agents to consume the docs directly, start from llms indexes and search endpoints, then load page markdown into context.',
          link1: 'Open llms.txt',
          link2: 'Open search endpoint',
        },
      },
      community: {
        title: 'Community and collaboration',
        description:
          'Group search, doc entry points, and collaboration-oriented resources so teams can move across products and roles without losing context.',
        section1: {
          title: 'Find the right content',
          body: 'Use site search to narrow down APIs, quickstarts, and solution pages before diving into a specific capability domain.',
          link1: 'Open search endpoint',
          link2: 'Open docs entry',
        },
        section2: {
          title: 'Team enablement',
          body: 'This layer can grow into a shared entry for community resources, FAQ, migration notes, and release-oriented collaboration.',
        },
      },
      platformOverview: {
        title: 'Agora platform overview',
        description:
          'The docs should organize Agora around capability domains first: AI, RTC, messaging, media services, and solutions, instead of mirroring raw repo folders.',
        section1: {
          title: 'Capability structure',
          body: 'The lower layer is built from RTC, RTM, and media services; the upper layer adds conversational AI, meetings, classrooms, and industry solutions.',
        },
        section2: {
          title: 'Recommended reading path',
          body: 'Enter through the capability domain closest to your task, then continue into quickstarts, product overviews, API references, and operational docs.',
        },
      },
      aiDomain: {
        title: 'Conversational AI',
        description:
          'Organize AI docs around ConvoAI, Device Kit, and agent workflows so teams can move from realtime voice interaction to production AI experiences.',
        section1: {
          title: 'Primary products',
          body: 'Today the AI surface is centered on ConvoAI and Device Kit. ConvoAI covers the realtime engine, while Device Kit supports hardware-oriented and kit-based integrations.',
          link1: 'View ConvoAI overview',
          link2: 'View Device Kit overview',
        },
        section2: {
          title: 'Suggested structure',
          body: 'Over time this domain should contain quickstarts, model and voice guidance, tool calling, client integration, agent integration, and references.',
        },
      },
      rtcDomain: {
        title: 'Realtime audio-video',
        description:
          'RTC remains one of Agora’s core foundations, spanning client SDKs, server SDKs, live streaming, and realtime calling flows.',
        section1: {
          title: 'Primary entry points',
          body: 'Prioritize stable access to client quickstarts, server SDK docs, auth, screen share, audio scenarios, and extension capabilities.',
          link1: 'View RTC docs',
          link2: 'View RTC Server SDK docs',
        },
        section2: {
          title: 'Typical use cases',
          body: 'This domain backs voice calling, video calling, interactive live streaming, and the media layer used in some AI products.',
        },
      },
      messagingDomain: {
        title: 'Realtime messaging',
        description:
          'Messaging powers state sync, room collaboration, and business control flows, complementing RTC in many engagement experiences.',
        section1: {
          title: 'Primary entry point',
          body: 'The current surface can focus on RTM 2 product overview, quickstarts, and key flows around state synchronization and messaging.',
          link1: 'View RTM docs',
        },
        section2: {
          title: 'How it relates to RTC',
          body: 'RTC handles media streams, while RTM handles signaling, state, and application messages. The new docs should make that boundary obvious.',
        },
      },
      mediaDomain: {
        title: 'Media services',
        description:
          'Media services cover recording, push, pull, transcoding, transcription, and delivery paths that extend the RTC foundation.',
        section1: {
          title: 'Primary products',
          body: 'This area is best grouped into recording, media IO, processing, and transcription, with Cloud Recording, Media Push, Media Pull, Cloud Transcoder, and Speech to Text as anchors.',
          link1: 'View Cloud Recording docs',
          link2: 'View Media Push docs',
          link3: 'View Cloud Transcoder docs',
        },
        section2: {
          title: 'Suggested organization',
          body: 'This should remain a dedicated domain instead of being flattened into many top-level product entries.',
        },
      },
      solutionsDomain: {
        title: 'Solutions',
        description:
          'Solution pages should start from business scenarios rather than infrastructure primitives: meetings, classrooms, KTV, showroom, chatroom, and smart devices.',
        section1: {
          title: 'Recommended entry points',
          body: 'Lead with flagship solutions such as Meeting, Online KTV, and Showroom, then expand into classroom and device-specific paths.',
          link1: 'View Meeting docs',
          link2: 'View Online KTV docs',
          link3: 'View Showroom docs',
        },
        section2: {
          title: 'How this maps to capability domains',
          body: 'Solution docs should help readers discover the RTC, messaging, media, and AI services behind each use case.',
        },
      },
      glossary: {
        title: 'Glossary',
        description:
          'The glossary should normalize terms like channel, room, track, token, signaling, transcoding, and recording across product lines.',
        section1: {
          title: 'What to include',
          body: 'Start with the concepts that repeat across RTC, RTM, media services, and AI docs, then maintain bilingual definitions over time.',
        },
      },
      apiReference: {
        title: 'API reference',
        description:
          'This page explains how API reference is organized today, where to find it, and how it should be migrated into the new doc experience.',
        section1: {
          title: 'Current entry points',
          body: 'During the migration period, readers can still use the legacy API reference surface and site search to locate endpoints.',
          link1: 'Open API reference',
          link2: 'Search for endpoints',
        },
      },
      security: {
        title: 'Security & compliance',
        description:
          'Security should remain a shared reference domain covering auth, tokens, privacy, compliance notes, and whitepaper-style guidance.',
        section1: {
          title: 'Suggested scope',
          body: 'The new docs can gradually consolidate token generation, platform security explanations, SDK compliance notes, and regional requirements here.',
        },
      },
    },
  },
} as const;

export default enCommon;
