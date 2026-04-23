const enCommon = {
  app: {
    name: 'Shengwang Docs',
    tagline: 'Developer documentation for Agora and Shengwang builders',
    endorsement: 'Documentation Portal',
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
    eyebrow: 'Documentation Portal',
    title: 'Build with Shengwang through a calmer, editorial docs experience',
    description:
      'Reference guides, walkthroughs, and API learning paths presented with the same Oatmeal design language used by the new console.',
    primaryCta: 'Open documentation',
    secondaryCta: 'Browse GitHub',
    sections: {
      explore: {
        title: 'Read product guides without the default docs chrome fatigue',
        body: 'Keep the strong navigation structure, but shift the visual language toward softer surfaces, better rhythm, and clearer editorial hierarchy.',
      },
      build: {
        title: 'Start with the current ConvoAI content path',
        body: 'The portal still reads from the existing docs source so the redesign does not block content updates or the submodule workflow.',
      },
      adapt: {
        title: 'Ready for bilingual shell and future content localization',
        body: 'The interface layer supports English and Simplified Chinese now, while the content pipeline stays stable for a later full-locale rollout.',
      },
    },
  },
} as const;

export default enCommon;
