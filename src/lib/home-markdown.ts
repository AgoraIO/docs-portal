import { load as parseYaml } from 'js-yaml';
import aiHomeEnImport from '../../content/home/en/ai-home.md?raw';
import overviewBrowseByCapabilityEnImport from '../../content/home/en/overview-browse-by-capability.md?raw';
import overviewChooseYourPathEnImport from '../../content/home/en/overview-choose-your-path.md?raw';
import overviewHomeEnImport from '../../content/home/en/overview-home.md?raw';
import overviewPricingAccessEnImport from '../../content/home/en/overview-pricing-access.md?raw';
import overviewProductMatrixEnImport from '../../content/home/en/overview-product-matrix.md?raw';
import overviewReleaseNotesEnImport from '../../content/home/en/overview-release-notes.md?raw';
import overviewSecurityComplianceEnImport from '../../content/home/en/overview-security-compliance.md?raw';
import overviewGeneralAccountEnImport from '../../content/home/en/overview-general-account.md?raw';
import overviewGeneralProjectsEnImport from '../../content/home/en/overview-general-projects.md?raw';
import overviewGeneralMembersRolesEnImport from '../../content/home/en/overview-general-members-roles.md?raw';
import overviewGeneralSecurityPrivacyEnImport from '../../content/home/en/overview-general-security-privacy.md?raw';
import overviewGeneralSupportEnImport from '../../content/home/en/overview-general-support.md?raw';
import overviewGeneralUsageAnalyticsEnImport from '../../content/home/en/overview-general-usage-analytics.md?raw';
import overviewAboutAgoraEnImport from '../../content/home/en/overview-about-agora.md?raw';
import overviewStartWithAiEnImport from '../../content/home/en/overview-start-with-ai.md?raw';
import overviewCommunityResourcesEnImport from '../../content/home/en/overview-community-resources.md?raw';
import aiHomeZhImport from '../../content/home/zh-CN/ai-home.md?raw';
import overviewBrowseByCapabilityZhImport from '../../content/home/zh-CN/overview-browse-by-capability.md?raw';
import overviewChooseYourPathZhImport from '../../content/home/zh-CN/overview-choose-your-path.md?raw';
import overviewHomeZhImport from '../../content/home/zh-CN/overview-home.md?raw';
import overviewPricingAccessZhImport from '../../content/home/zh-CN/overview-pricing-access.md?raw';
import overviewProductMatrixZhImport from '../../content/home/zh-CN/overview-product-matrix.md?raw';
import overviewReleaseNotesZhImport from '../../content/home/zh-CN/overview-release-notes.md?raw';
import overviewSecurityComplianceZhImport from '../../content/home/zh-CN/overview-security-compliance.md?raw';
import overviewGeneralAccountZhImport from '../../content/home/zh-CN/overview-general-account.md?raw';
import overviewGeneralProjectsZhImport from '../../content/home/zh-CN/overview-general-projects.md?raw';
import overviewGeneralMembersRolesZhImport from '../../content/home/zh-CN/overview-general-members-roles.md?raw';
import overviewGeneralSecurityPrivacyZhImport from '../../content/home/zh-CN/overview-general-security-privacy.md?raw';
import overviewGeneralSupportZhImport from '../../content/home/zh-CN/overview-general-support.md?raw';
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
  rawBody: string;
  sections?: MarkdownSection[];
  title: string;
};

export type HomeMarkdownPages = Record<string, Record<string, MarkdownPage>>;

type RawPage = Omit<MarkdownPage, 'sections'> & {
  sections: MarkdownSection[];
};

const pagesByLocale: HomeMarkdownPages = {
  en: {
    'ai-home': parseMarkdownPage(normalizeRaw(aiHomeEnImport)),
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
    'overview-pricing-access': parseMarkdownPage(
      normalizeRaw(overviewPricingAccessEnImport),
    ),
    'overview-product-matrix': parseMarkdownPage(
      normalizeRaw(overviewProductMatrixEnImport),
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
    'ai-home': parseMarkdownPage(normalizeRaw(aiHomeZhImport)),
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
    'overview-pricing-access': parseMarkdownPage(
      normalizeRaw(overviewPricingAccessZhImport),
    ),
    'overview-product-matrix': parseMarkdownPage(
      normalizeRaw(overviewProductMatrixZhImport),
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

  return {
    cards: data.cards ?? [],
    description: data.description ?? '',
    eyebrow: data.eyebrow,
    quickstartBody: data.quickstartBody,
    quickstartTitle: data.quickstartTitle,
    rawBody: body,
    sections: parseSections(body),
    title: data.title ?? 'Untitled',
  };
}

function splitFrontmatter(raw: string) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) {
    return {
      body: raw.trim(),
      frontmatter: '',
    };
  }

  return {
    body: match[2].trim(),
    frontmatter: match[1],
  };
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
