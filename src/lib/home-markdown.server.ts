import { load as parseYaml } from 'js-yaml';
import aiAgentLifecycleEnImport from '../../content/home/en/ai-agent-lifecycle.md?raw';
import aiAgentsAndRealtimeChannelsEnImport from '../../content/home/en/ai-agents-and-realtime-channels.md?raw';
import aiClientComponentApiEnImport from '../../content/home/en/ai-client-component-api.md?raw';
import aiHomeEnImport from '../../content/home/en/ai-home.md?raw';
import aiChooseYourIntegrationPathEnImport from '../../content/home/en/ai-choose-your-integration-path.md?raw';
import aiConfigureAsrAndTtsEnImport from '../../content/home/en/ai-configure-asr-and-tts.md?raw';
import aiConfigurePresetsEnImport from '../../content/home/en/ai-configure-presets.md?raw';
import aiDeviceAiEnImport from '../../content/home/en/ai-device-ai.md?raw';
import aiMobileClientEnImport from '../../content/home/en/ai-mobile-client.md?raw';
import aiModelsVoiceAndContextEnImport from '../../content/home/en/ai-models-voice-and-context.md?raw';
import aiOverviewEnImport from '../../content/home/en/ai-overview.md?raw';
import aiProductionChecklistEnImport from '../../content/home/en/ai-production-checklist.md?raw';
import aiStartWithAgentStudioEnImport from '../../content/home/en/ai-start-with-agent-studio.md?raw';
import aiTestAnAgentEnImport from '../../content/home/en/ai-test-an-agent.md?raw';
import aiWebClientEnImport from '../../content/home/en/ai-web-client.md?raw';
import overviewAiAgentsEnImport from '../../content/home/en/overview-ai-agents.md?raw';
import overviewBrowseByCapabilityEnImport from '../../content/home/en/overview-browse-by-capability.md?raw';
import overviewChooseYourPathEnImport from '../../content/home/en/overview-choose-your-path.md?raw';
import overviewHomeEnImport from '../../content/home/en/overview-home.md?raw';
import overviewMediaServicesEnImport from '../../content/home/en/overview-media-services.md?raw';
import overviewMessagingEnImport from '../../content/home/en/overview-messaging.md?raw';
import overviewPricingAccessEnImport from '../../content/home/en/overview-pricing-access.md?raw';
import overviewProductMatrixEnImport from '../../content/home/en/overview-product-matrix.md?raw';
import overviewRealtimeAudioVideoEnImport from '../../content/home/en/overview-realtime-audio-video.md?raw';
import overviewReleaseNotesEnImport from '../../content/home/en/overview-release-notes.md?raw';
import overviewSecurityComplianceEnImport from '../../content/home/en/overview-security-compliance.md?raw';
import overviewGeneralAccountEnImport from '../../content/home/en/overview-general-account.md?raw';
import overviewGeneralSecurityPrivacyEnImport from '../../content/home/en/overview-general-security-privacy.md?raw';
import overviewGeneralSupportEnImport from '../../content/home/en/overview-general-support.md?raw';
import overviewGeneralProjectsEnImport from '../../content/home/en/overview-general-projects.md?raw';
import overviewGeneralMembersRolesEnImport from '../../content/home/en/overview-general-members-roles.md?raw';
import overviewGeneralUsageAnalyticsEnImport from '../../content/home/en/overview-general-usage-analytics.md?raw';
import overviewAboutAgoraEnImport from '../../content/home/en/overview-about-agora.md?raw';
import overviewStartWithAiEnImport from '../../content/home/en/overview-start-with-ai.md?raw';
import overviewCommunityResourcesEnImport from '../../content/home/en/overview-community-resources.md?raw';
import aiAgentLifecycleZhImport from '../../content/home/zh-CN/ai-agent-lifecycle.md?raw';
import aiAgentsAndRealtimeChannelsZhImport from '../../content/home/zh-CN/ai-agents-and-realtime-channels.md?raw';
import aiClientComponentApiZhImport from '../../content/home/zh-CN/ai-client-component-api.md?raw';
import aiHomeZhImport from '../../content/home/zh-CN/ai-home.md?raw';
import aiChooseYourIntegrationPathZhImport from '../../content/home/zh-CN/ai-choose-your-integration-path.md?raw';
import aiConfigureAsrAndTtsZhImport from '../../content/home/zh-CN/ai-configure-asr-and-tts.md?raw';
import aiConfigurePresetsZhImport from '../../content/home/zh-CN/ai-configure-presets.md?raw';
import aiDeviceAiZhImport from '../../content/home/zh-CN/ai-device-ai.md?raw';
import aiMobileClientZhImport from '../../content/home/zh-CN/ai-mobile-client.md?raw';
import aiModelsVoiceAndContextZhImport from '../../content/home/zh-CN/ai-models-voice-and-context.md?raw';
import aiOverviewZhImport from '../../content/home/zh-CN/ai-overview.md?raw';
import aiProductionChecklistZhImport from '../../content/home/zh-CN/ai-production-checklist.md?raw';
import aiStartWithAgentStudioZhImport from '../../content/home/zh-CN/ai-start-with-agent-studio.md?raw';
import aiTestAnAgentZhImport from '../../content/home/zh-CN/ai-test-an-agent.md?raw';
import aiWebClientZhImport from '../../content/home/zh-CN/ai-web-client.md?raw';
import overviewAiAgentsZhImport from '../../content/home/zh-CN/overview-ai-agents.md?raw';
import overviewBrowseByCapabilityZhImport from '../../content/home/zh-CN/overview-browse-by-capability.md?raw';
import overviewChooseYourPathZhImport from '../../content/home/zh-CN/overview-choose-your-path.md?raw';
import overviewHomeZhImport from '../../content/home/zh-CN/overview-home.md?raw';
import overviewMediaServicesZhImport from '../../content/home/zh-CN/overview-media-services.md?raw';
import overviewMessagingZhImport from '../../content/home/zh-CN/overview-messaging.md?raw';
import overviewPricingAccessZhImport from '../../content/home/zh-CN/overview-pricing-access.md?raw';
import overviewProductMatrixZhImport from '../../content/home/zh-CN/overview-product-matrix.md?raw';
import overviewRealtimeAudioVideoZhImport from '../../content/home/zh-CN/overview-realtime-audio-video.md?raw';
import overviewReleaseNotesZhImport from '../../content/home/zh-CN/overview-release-notes.md?raw';
import overviewSecurityComplianceZhImport from '../../content/home/zh-CN/overview-security-compliance.md?raw';
import overviewGeneralAccountZhImport from '../../content/home/zh-CN/overview-general-account.md?raw';
import overviewGeneralSecurityPrivacyZhImport from '../../content/home/zh-CN/overview-general-security-privacy.md?raw';
import overviewGeneralSupportZhImport from '../../content/home/zh-CN/overview-general-support.md?raw';
import overviewGeneralProjectsZhImport from '../../content/home/zh-CN/overview-general-projects.md?raw';
import overviewGeneralMembersRolesZhImport from '../../content/home/zh-CN/overview-general-members-roles.md?raw';
import overviewGeneralUsageAnalyticsZhImport from '../../content/home/zh-CN/overview-general-usage-analytics.md?raw';
import overviewAboutAgoraZhImport from '../../content/home/zh-CN/overview-about-agora.md?raw';
import overviewStartWithAiZhImport from '../../content/home/zh-CN/overview-start-with-ai.md?raw';
import overviewCommunityResourcesZhImport from '../../content/home/zh-CN/overview-community-resources.md?raw';

export type MarkdownCard = {
  body: string;
  href: string;
  icon: string;
  title: string;
};

export type MarkdownLink = {
  href: string;
  label: string;
};

export type MarkdownSection = {
  body: string;
  links?: MarkdownLink[];
  title: string;
};

export type MarkdownPage = {
  cards?: MarkdownCard[];
  description: string;
  eyebrow?: string;
  quickstartBody?: string;
  quickstartTitle?: string;
  sections?: MarkdownSection[];
  title: string;
};

export type HomeMarkdownPages = Record<string, Record<string, MarkdownPage>>;

type RawPage = Omit<MarkdownPage, 'sections'> & {
  sections: MarkdownSection[];
};

const pagesByLocale: HomeMarkdownPages = {
  en: {
    'ai-agent-lifecycle': parseMarkdownPage(normalizeRaw(aiAgentLifecycleEnImport)),
    'ai-agents-and-realtime-channels': parseMarkdownPage(
      normalizeRaw(aiAgentsAndRealtimeChannelsEnImport),
    ),
    'ai-choose-your-integration-path': parseMarkdownPage(
      normalizeRaw(aiChooseYourIntegrationPathEnImport),
    ),
    'ai-client-component-api': parseMarkdownPage(
      normalizeRaw(aiClientComponentApiEnImport),
    ),
    'ai-configure-asr-and-tts': parseMarkdownPage(
      normalizeRaw(aiConfigureAsrAndTtsEnImport),
    ),
    'ai-configure-presets': parseMarkdownPage(
      normalizeRaw(aiConfigurePresetsEnImport),
    ),
    'ai-device-ai': parseMarkdownPage(normalizeRaw(aiDeviceAiEnImport)),
    'ai-home': parseMarkdownPage(normalizeRaw(aiHomeEnImport)),
    'ai-mobile-client': parseMarkdownPage(normalizeRaw(aiMobileClientEnImport)),
    'ai-models-voice-and-context': parseMarkdownPage(
      normalizeRaw(aiModelsVoiceAndContextEnImport),
    ),
    'ai-overview': parseMarkdownPage(normalizeRaw(aiOverviewEnImport)),
    'ai-production-checklist': parseMarkdownPage(
      normalizeRaw(aiProductionChecklistEnImport),
    ),
    'ai-start-with-agent-studio': parseMarkdownPage(
      normalizeRaw(aiStartWithAgentStudioEnImport),
    ),
    'ai-test-an-agent': parseMarkdownPage(normalizeRaw(aiTestAnAgentEnImport)),
    'ai-web-client': parseMarkdownPage(normalizeRaw(aiWebClientEnImport)),
    'overview-ai-agents': parseMarkdownPage(normalizeRaw(overviewAiAgentsEnImport)),
    'overview-about-agora': parseMarkdownPage(normalizeRaw(overviewAboutAgoraEnImport)),
    'overview-browse-by-capability': parseMarkdownPage(
      normalizeRaw(overviewBrowseByCapabilityEnImport),
    ),
    'overview-community-resources': parseMarkdownPage(
      normalizeRaw(overviewCommunityResourcesEnImport),
    ),
    'overview-choose-your-path': parseMarkdownPage(
      normalizeRaw(overviewChooseYourPathEnImport),
    ),
    'overview-general-account': parseMarkdownPage(
      normalizeRaw(overviewGeneralAccountEnImport),
    ),
    'overview-general-members-roles': parseMarkdownPage(
      normalizeRaw(overviewGeneralMembersRolesEnImport),
    ),
    'overview-general-projects': parseMarkdownPage(
      normalizeRaw(overviewGeneralProjectsEnImport),
    ),
    'overview-general-security-privacy': parseMarkdownPage(
      normalizeRaw(overviewGeneralSecurityPrivacyEnImport),
    ),
    'overview-general-support': parseMarkdownPage(
      normalizeRaw(overviewGeneralSupportEnImport),
    ),
    'overview-general-usage-analytics': parseMarkdownPage(
      normalizeRaw(overviewGeneralUsageAnalyticsEnImport),
    ),
    'overview-home': parseMarkdownPage(normalizeRaw(overviewHomeEnImport)),
    'overview-media-services': parseMarkdownPage(
      normalizeRaw(overviewMediaServicesEnImport),
    ),
    'overview-messaging': parseMarkdownPage(
      normalizeRaw(overviewMessagingEnImport),
    ),
    'overview-pricing-access': parseMarkdownPage(
      normalizeRaw(overviewPricingAccessEnImport),
    ),
    'overview-product-matrix': parseMarkdownPage(
      normalizeRaw(overviewProductMatrixEnImport),
    ),
    'overview-realtime-audio-video': parseMarkdownPage(
      normalizeRaw(overviewRealtimeAudioVideoEnImport),
    ),
    'overview-release-notes': parseMarkdownPage(
      normalizeRaw(overviewReleaseNotesEnImport),
    ),
    'overview-security-compliance': parseMarkdownPage(
      normalizeRaw(overviewSecurityComplianceEnImport),
    ),
    'overview-start-with-ai': parseMarkdownPage(
      normalizeRaw(overviewStartWithAiEnImport),
    ),
  },
  'zh-CN': {
    'ai-agent-lifecycle': parseMarkdownPage(normalizeRaw(aiAgentLifecycleZhImport)),
    'ai-agents-and-realtime-channels': parseMarkdownPage(
      normalizeRaw(aiAgentsAndRealtimeChannelsZhImport),
    ),
    'ai-choose-your-integration-path': parseMarkdownPage(
      normalizeRaw(aiChooseYourIntegrationPathZhImport),
    ),
    'ai-client-component-api': parseMarkdownPage(
      normalizeRaw(aiClientComponentApiZhImport),
    ),
    'ai-configure-asr-and-tts': parseMarkdownPage(
      normalizeRaw(aiConfigureAsrAndTtsZhImport),
    ),
    'ai-configure-presets': parseMarkdownPage(
      normalizeRaw(aiConfigurePresetsZhImport),
    ),
    'ai-device-ai': parseMarkdownPage(normalizeRaw(aiDeviceAiZhImport)),
    'ai-home': parseMarkdownPage(normalizeRaw(aiHomeZhImport)),
    'ai-mobile-client': parseMarkdownPage(normalizeRaw(aiMobileClientZhImport)),
    'ai-models-voice-and-context': parseMarkdownPage(
      normalizeRaw(aiModelsVoiceAndContextZhImport),
    ),
    'ai-overview': parseMarkdownPage(normalizeRaw(aiOverviewZhImport)),
    'ai-production-checklist': parseMarkdownPage(
      normalizeRaw(aiProductionChecklistZhImport),
    ),
    'ai-start-with-agent-studio': parseMarkdownPage(
      normalizeRaw(aiStartWithAgentStudioZhImport),
    ),
    'ai-test-an-agent': parseMarkdownPage(normalizeRaw(aiTestAnAgentZhImport)),
    'ai-web-client': parseMarkdownPage(normalizeRaw(aiWebClientZhImport)),
    'overview-ai-agents': parseMarkdownPage(normalizeRaw(overviewAiAgentsZhImport)),
    'overview-about-agora': parseMarkdownPage(normalizeRaw(overviewAboutAgoraZhImport)),
    'overview-browse-by-capability': parseMarkdownPage(
      normalizeRaw(overviewBrowseByCapabilityZhImport),
    ),
    'overview-community-resources': parseMarkdownPage(
      normalizeRaw(overviewCommunityResourcesZhImport),
    ),
    'overview-choose-your-path': parseMarkdownPage(
      normalizeRaw(overviewChooseYourPathZhImport),
    ),
    'overview-general-account': parseMarkdownPage(
      normalizeRaw(overviewGeneralAccountZhImport),
    ),
    'overview-general-members-roles': parseMarkdownPage(
      normalizeRaw(overviewGeneralMembersRolesZhImport),
    ),
    'overview-general-projects': parseMarkdownPage(
      normalizeRaw(overviewGeneralProjectsZhImport),
    ),
    'overview-general-security-privacy': parseMarkdownPage(
      normalizeRaw(overviewGeneralSecurityPrivacyZhImport),
    ),
    'overview-general-support': parseMarkdownPage(
      normalizeRaw(overviewGeneralSupportZhImport),
    ),
    'overview-general-usage-analytics': parseMarkdownPage(
      normalizeRaw(overviewGeneralUsageAnalyticsZhImport),
    ),
    'overview-home': parseMarkdownPage(normalizeRaw(overviewHomeZhImport)),
    'overview-media-services': parseMarkdownPage(
      normalizeRaw(overviewMediaServicesZhImport),
    ),
    'overview-messaging': parseMarkdownPage(
      normalizeRaw(overviewMessagingZhImport),
    ),
    'overview-pricing-access': parseMarkdownPage(
      normalizeRaw(overviewPricingAccessZhImport),
    ),
    'overview-product-matrix': parseMarkdownPage(
      normalizeRaw(overviewProductMatrixZhImport),
    ),
    'overview-realtime-audio-video': parseMarkdownPage(
      normalizeRaw(overviewRealtimeAudioVideoZhImport),
    ),
    'overview-release-notes': parseMarkdownPage(
      normalizeRaw(overviewReleaseNotesZhImport),
    ),
    'overview-security-compliance': parseMarkdownPage(
      normalizeRaw(overviewSecurityComplianceZhImport),
    ),
    'overview-start-with-ai': parseMarkdownPage(
      normalizeRaw(overviewStartWithAiZhImport),
    ),
  },
};

export function loadHomeMarkdownPages(): HomeMarkdownPages {
  return pagesByLocale;
}

function normalizeRaw(raw: unknown): string {
  if (typeof raw === 'string') {
    return raw;
  }

  if (raw && typeof raw === 'object' && 'default' in raw) {
    const value = (raw as { default?: unknown }).default;
    return typeof value === 'string' ? value : '';
  }

  return '';
}

function parseMarkdownPage(raw: string): MarkdownPage {
  const { body, frontmatter } = splitFrontmatter(raw);
  const data = (parseYaml(frontmatter) ?? {}) as Partial<RawPage>;
  const fallbackTitle = inferMarkdownTitle(body);

  return {
    cards: data.cards ?? [],
    description: data.description ?? '',
    eyebrow: data.eyebrow,
    quickstartBody: data.quickstartBody,
    quickstartTitle: data.quickstartTitle,
    sections: parseSections(body),
    title: data.title ?? fallbackTitle ?? 'Untitled',
  };
}

function splitFrontmatter(raw: string) {
  const normalized = raw.trimStart();
  const match = normalized.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) {
    return {
      body: normalized.trim(),
      frontmatter: '',
    };
  }

  return {
    body: match[2].trim(),
    frontmatter: match[1],
  };
}

function inferMarkdownTitle(markdown: string) {
  const match = markdown.match(/^\s{0,3}#{1,2}\s+(.+)$/m);
  return match?.[1]?.trim() || null;
}

function parseSections(markdown: string): MarkdownSection[] {
  if (!markdown.trim()) {
    return [];
  }

  const lines = markdown.split('\n');
  const sections: Array<{
    links: MarkdownLink[];
    paragraphs: string[];
    title: string;
  }> = [];

  let current: (typeof sections)[number] | null = null;
  let paragraphLines: string[] = [];

  const flushParagraph = () => {
    if (!current || paragraphLines.length === 0) {
      return;
    }

    current.paragraphs.push(paragraphLines.join(' ').trim());
    paragraphLines = [];
  };

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith('## ')) {
      flushParagraph();
      current = {
        links: [],
        paragraphs: [],
        title: trimmed.slice(3).trim(),
      };
      sections.push(current);
      continue;
    }

    if (!current) {
      current = {
        links: [],
        paragraphs: [],
        title: '',
      };
      sections.push(current);
    }

    if (!trimmed) {
      flushParagraph();
      continue;
    }

    if (trimmed.startsWith('- ')) {
      flushParagraph();
      const link = parseMarkdownLink(trimmed.slice(2).trim());
      if (link) {
        current.links.push(link);
      } else {
        current.paragraphs.push(trimmed.slice(2).trim());
      }
      continue;
    }

    paragraphLines.push(trimmed);
  }

  flushParagraph();

  return sections
    .filter((section) => section.title || section.paragraphs.length > 0)
    .map((section) => ({
      body: section.paragraphs.join('\n\n'),
      links: section.links.length > 0 ? section.links : undefined,
      title: section.title || 'Section',
    }));
}

function parseMarkdownLink(value: string): MarkdownLink | null {
  const match = value.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
  if (!match) {
    return null;
  }

  return {
    href: match[2],
    label: match[1],
  };
}
