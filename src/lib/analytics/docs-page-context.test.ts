import { describe, expect, it } from 'vitest';
import {
  createDocsPageAnalyticsContext,
  type DocsJourneyStage,
  type DocsNavSection,
} from './docs-page-context';
import type { DocsPageType } from './docs-page-type';

type TaxonomyCase = {
  contentId: string;
  journeyStage: DocsJourneyStage;
  navSection: DocsNavSection;
  navSectionTitle: string;
  pageType: DocsPageType;
  product: string;
};

const TARGET_PAGE_TAXONOMY: TaxonomyCase[] = [
  {
    contentId: 'ai/build/start-stop-agent',
    journeyStage: 'build',
    navSection: 'build',
    navSectionTitle: 'Build',
    pageType: 'task-guide',
    product: 'voice-agent',
  },
  {
    contentId: 'ai/get-started/quickstart',
    journeyStage: 'get-started',
    navSection: 'get-started',
    navSectionTitle: 'Get started',
    pageType: 'task-guide',
    product: 'voice-agent',
  },
  {
    contentId: 'ai',
    journeyStage: 'overview',
    navSection: 'overview',
    navSectionTitle: 'Overview',
    pageType: 'navigation-landing',
    product: 'voice-agent',
  },
  {
    contentId: 'api-reference/api-ref/rtc',
    journeyStage: 'reference',
    navSection: 'api-reference',
    navSectionTitle: 'API reference',
    pageType: 'sdk-api-reference',
    product: 'rtc',
  },
  {
    contentId: 'api-reference/faq/integration/mirror_mode',
    journeyStage: 'faq',
    navSection: 'faq',
    navSectionTitle: 'FAQ',
    pageType: 'faq-troubleshooting',
    product: 'api-reference',
  },
  {
    contentId: 'api-reference',
    journeyStage: 'overview',
    navSection: 'overview',
    navSectionTitle: 'Overview',
    pageType: 'navigation-landing',
    product: 'api-reference',
  },
  {
    contentId: 'api-reference/recipes',
    journeyStage: 'build',
    navSection: 'recipes',
    navSectionTitle: 'Recipes',
    pageType: 'navigation-landing',
    product: 'api-reference',
  },
  {
    contentId: 'api-reference/sdks',
    journeyStage: 'reference',
    navSection: 'sdks',
    navSectionTitle: 'SDKs',
    pageType: 'navigation-landing',
    product: 'api-reference',
  },
  {
    contentId: 'introduction/core-concepts',
    journeyStage: 'overview',
    navSection: 'introduction',
    navSectionTitle: 'Introduction',
    pageType: 'concept-explanation',
    product: 'introduction',
  },
  {
    contentId: 'introduction',
    journeyStage: 'overview',
    navSection: 'introduction',
    navSectionTitle: 'Introduction',
    pageType: 'navigation-landing',
    product: 'introduction',
  },
  {
    contentId: 'realtime-media/iot/reference/licensing',
    journeyStage: 'reference',
    navSection: 'reference',
    navSectionTitle: 'Reference',
    pageType: 'concept-explanation',
    product: 'iot',
  },
  {
    contentId: 'realtime-media/overview',
    journeyStage: 'overview',
    navSection: 'overview',
    navSectionTitle: 'Overview',
    pageType: 'navigation-landing',
    product: 'realtime-media',
  },
  {
    contentId:
      'realtime-media/video/build/capture-and-render-video/screen-sharing',
    journeyStage: 'build',
    navSection: 'build',
    navSectionTitle: 'Build',
    pageType: 'task-guide',
    product: 'video',
  },
  {
    contentId: 'realtime-media/video/get-started-sdk',
    journeyStage: 'get-started',
    navSection: 'get-started',
    navSectionTitle: 'Get started',
    pageType: 'task-guide',
    product: 'video',
  },
  {
    contentId: 'realtime-media/video',
    journeyStage: 'overview',
    navSection: 'overview',
    navSectionTitle: 'Overview',
    pageType: 'navigation-landing',
    product: 'video',
  },
  {
    contentId: 'realtime-media/voice',
    journeyStage: 'overview',
    navSection: 'overview',
    navSectionTitle: 'Overview',
    pageType: 'navigation-landing',
    product: 'voice',
  },
  {
    contentId: 'realtime-media/voice/quickstart',
    journeyStage: 'get-started',
    navSection: 'get-started',
    navSectionTitle: 'Get started',
    pageType: 'task-guide',
    product: 'voice',
  },
  {
    contentId: 'realtime-media/voice/reference/pricing-legacy',
    journeyStage: 'pricing',
    navSection: 'reference',
    navSectionTitle: 'Reference',
    pageType: 'concept-explanation',
    product: 'voice',
  },
  {
    contentId: 'realtime-media/voice/reference/release-notes',
    journeyStage: 'release-notes',
    navSection: 'reference',
    navSectionTitle: 'Reference',
    pageType: 'release-download',
    product: 'voice',
  },
];

describe('createDocsPageAnalyticsContext', () => {
  it.each(TARGET_PAGE_TAXONOMY)(
    'returns the canonical taxonomy for $contentId',
    ({ contentId, pageType, ...expected }) => {
      const sourceSuffix = contentId.split('/').length <= 2 ? '/index' : '';
      const context = createDocsPageAnalyticsContext({
        pageType,
        pathname: `/en/${contentId}`,
        sourcePath: `en/${contentId}${sourceSuffix}.mdx`,
        title: 'Test page',
      });

      expect(context).toMatchObject({
        contentId,
        pageType,
        ...expected,
      });
    },
  );

  it('does not infer canonical taxonomy for pages outside the target set', () => {
    expect(
      createDocsPageAnalyticsContext({
        pageType: 'task-guide',
        pathname: '/en/realtime-media/rtm/build/presence',
        sourcePath: 'en/realtime-media/rtm/build/presence.mdx',
        title: 'Presence',
      }),
    ).toMatchObject({
      journeyStage: 'unknown',
      navSection: 'unknown',
      navSectionTitle: 'unknown',
      product: 'unknown',
    });
  });
});
