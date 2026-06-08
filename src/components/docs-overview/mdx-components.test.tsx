import { fireEvent, render, screen } from '@testing-library/react';
import type { ComponentType, ReactNode } from 'react';
import { describe, expect, it } from 'vitest';
import { getOverviewMDXComponents } from './mdx-components';

type SolutionCardGridComponent = ComponentType<{
  children: ReactNode;
  size?: 'large' | 'small';
}>;
type SolutionCardComponent = ComponentType<{
  description: string;
  href: string;
  icon?: 'ai' | 'classroom' | 'device' | 'meeting' | 'messaging' | 'rtc';
  size?: 'large' | 'small';
  tags?: string[];
  title: string;
  tone?: 'blue' | 'green' | 'pink' | 'purple' | 'sand';
}>;
type OverviewToolkitsComponent = ComponentType<{ children: ReactNode }>;
type ToolkitGroupComponent = ComponentType<{
  children: ReactNode;
  title: string;
}>;
type ToolkitItemComponent = ComponentType<{
  href: string;
  icon:
    | 'android'
    | 'cli'
    | 'go'
    | 'ios'
    | 'mcp'
    | 'messaging'
    | 'python'
    | 'rest'
    | 'rtc'
    | 'server'
    | 'skills'
    | 'stt'
    | 'studio'
    | 'typescript'
    | 'web';
  label: string;
}>;
type CardGridComponent = ComponentType<{ children: ReactNode }>;
type FeatureCardComponent = ComponentType<{
  children: ReactNode;
  title: string;
}>;
type CapabilityGroupGridComponent = ComponentType<{ children: ReactNode }>;
type CapabilityGroupCardComponent = ComponentType<{
  description: string;
  items: string[];
  title: string;
}>;
type CapabilityMatrixComponent = ComponentType<{
  rows: Array<{
    description: string;
    items: string[];
    title: string;
  }>;
}>;
type OverviewLinkBannerComponent = ComponentType<{
  description: string;
  href: string;
  title: string;
}>;
type OverviewImageCardGridComponent = ComponentType<{
  children: ReactNode;
  columns?: 'three' | 'two';
}>;
type OverviewImageCardComponent = ComponentType<{
  compact?: boolean;
  description: string;
  href?: string;
  imageAlt: string;
  imageSrc: string;
  title: string;
}>;
type OverviewSpotlightCardComponent = ComponentType<{
  description?: string;
  href: string;
  size?: 'large' | 'small';
  title: string;
  variant?: 'checklist' | 'code' | 'platform';
}>;
type RecipesCatalogComponent = ComponentType<{
  allCategoriesLabel: string;
  allProductsLabel: string;
  allStacksLabel: string;
  categoryFilterLabel: string;
  clearFiltersLabel: string;
  emptyMessage: string;
  items: Array<{
    category: string;
    description: string;
    href: string;
    product: string;
    stack?: string;
    title: string;
    tone?: 'blue' | 'green' | 'pink' | 'purple' | 'sand';
  }>;
  productFilterLabel: string;
  searchPlaceholder: string;
  stackFilterLabel: string;
}>;

describe('overview MDX components', () => {
  it('renders solution cards as overview widgets', () => {
    const components = getOverviewMDXComponents();
    const SolutionCardGrid =
      components.SolutionCardGrid as SolutionCardGridComponent;
    const SolutionCard = components.SolutionCard as SolutionCardComponent;

    render(
      <SolutionCardGrid>
        <SolutionCard
          description="Build realtime voice experiences."
          href="/en/solutions/voice"
          icon="rtc"
          tags={['Voice', 'RTC']}
          title="Voice Calling"
          tone="blue"
        />
      </SolutionCardGrid>,
    );

    expect(
      screen.getByRole('link', { name: /Voice Calling/i }),
    ).toHaveAttribute('href', '/en/solutions/voice');
    expect(screen.getByText('Build realtime voice experiences.')).toBeVisible();
    expect(screen.getByText('Voice')).toBeVisible();
  });

  it('renders toolkit groups for the docs home overview', () => {
    const components = getOverviewMDXComponents();
    const OverviewToolkits =
      components.OverviewToolkits as OverviewToolkitsComponent;
    const ToolkitGroup = components.ToolkitGroup as ToolkitGroupComponent;
    const ToolkitItem = components.ToolkitItem as ToolkitItemComponent;

    render(
      <OverviewToolkits>
        <ToolkitGroup title="Agent frameworks">
          <ToolkitItem
            href="/en/ai/get-started/quickstart"
            icon="python"
            label="Python"
          />
        </ToolkitGroup>
      </OverviewToolkits>,
    );

    expect(screen.getByText('Agent frameworks')).toBeVisible();
    expect(screen.getByRole('link', { name: /Python/i })).toHaveAttribute(
      'href',
      '/en/ai/get-started/quickstart',
    );
  });

  it('renders feature cards for editorial introduction pages', () => {
    const components = getOverviewMDXComponents();
    const CardGrid = components.CardGrid as CardGridComponent;
    const FeatureCard = components.FeatureCard as FeatureCardComponent;

    render(
      <CardGrid>
        <FeatureCard title="Realtime audio and video apps">
          Build calling and classroom products.
        </FeatureCard>
      </CardGrid>,
    );

    expect(
      screen.getByText('Realtime audio and video apps'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Build calling and classroom products.'),
    ).toBeVisible();
  });

  it('renders capability group cards for grouped overview sections', () => {
    const components = getOverviewMDXComponents();
    const CapabilityGroupGrid =
      components.CapabilityGroupGrid as CapabilityGroupGridComponent;
    const CapabilityGroupCard =
      components.CapabilityGroupCard as CapabilityGroupCardComponent;

    render(
      <CapabilityGroupGrid>
        <CapabilityGroupCard
          description="Sessions where users exchange media or state in real time."
          items={['Voice & Video', 'Signaling']}
          title="Build live interaction"
        />
      </CapabilityGroupGrid>,
    );

    expect(screen.getByText('Build live interaction')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Sessions where users exchange media or state in real time.',
      ),
    ).toBeVisible();
    expect(screen.getByText('Voice & Video')).toBeVisible();
    expect(screen.getByText('Signaling')).toBeVisible();
  });

  it('renders capability matrix rows for structured overview sections', () => {
    const components = getOverviewMDXComponents();
    const CapabilityMatrix =
      components.CapabilityMatrix as CapabilityMatrixComponent;

    render(
      <CapabilityMatrix
        rows={[
          {
            description: 'Exchange media and state in real time.',
            items: ['Voice & Video', 'Signaling'],
            title: 'Build live interaction',
          },
        ]}
      />,
    );

    expect(screen.getByText('Capability area')).toBeVisible();
    expect(screen.getByText('What it covers')).toBeVisible();
    expect(screen.getByText('Includes')).toBeVisible();
    expect(screen.getByText('Build live interaction')).toBeVisible();
    expect(
      screen.getByText('Exchange media and state in real time.'),
    ).toBeVisible();
    expect(screen.getByText('Voice & Video')).toBeVisible();
    expect(screen.getByText('Signaling')).toBeVisible();
  });

  it('renders overview link banners for section-level entry points', () => {
    const components = getOverviewMDXComponents();
    const OverviewLinkBanner =
      components.OverviewLinkBanner as OverviewLinkBannerComponent;

    render(
      <OverviewLinkBanner
        description="See the full capability map for live interaction and media delivery."
        href="/en/realtime-media/overview"
        title="Explore Realtime & Media overview"
      />,
    );

    expect(
      screen.getByRole('link', { name: /Explore Realtime & Media overview/i }),
    ).toHaveAttribute('href', '/en/realtime-media/overview');
    expect(
      screen.getByText(
        'See the full capability map for live interaction and media delivery.',
      ),
    ).toBeVisible();
  });

  it('renders overview image cards as non-clickable showcases', () => {
    const components = getOverviewMDXComponents();
    const OverviewImageCardGrid =
      components.OverviewImageCardGrid as OverviewImageCardGridComponent;
    const OverviewImageCard =
      components.OverviewImageCard as OverviewImageCardComponent;

    render(
      <OverviewImageCardGrid>
        <OverviewImageCard
          description="Define how users exchange media inside a live session."
          imageAlt="Video calling overview"
          imageSrc="/images/video-calling/video-calling-overview.png"
          title="Build live interaction"
        />
      </OverviewImageCardGrid>,
    );

    expect(
      screen.queryByRole('link', { name: /Build live interaction/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText(
        'Define how users exchange media inside a live session.',
      ),
    ).toBeVisible();
    expect(screen.getByAltText('Video calling overview')).toHaveAttribute(
      'src',
      '/images/video-calling/video-calling-overview.png',
    );
  });

  it('renders overview spotlight descriptions when provided', () => {
    const components = getOverviewMDXComponents();
    const OverviewSpotlightCard =
      components.OverviewSpotlightCard as OverviewSpotlightCardComponent;

    render(
      <OverviewSpotlightCard
        description="Run a working voice agent in under 15 minutes."
        href="/en/ai/choose-your-path/quickstart-coding"
        size="small"
        title="Voice agent quickstart"
        variant="code"
      />,
    );

    expect(
      screen.getByRole('link', { name: /Voice agent quickstart/i }),
    ).toHaveAttribute('href', '/en/ai/choose-your-path/quickstart-coding');
    expect(
      screen.getByText('Run a working voice agent in under 15 minutes.'),
    ).toBeVisible();
  });

  it('filters recipe catalog cards by selected category and search query', () => {
    const components = getOverviewMDXComponents();
    const RecipesCatalog = components.RecipesCatalog as RecipesCatalogComponent;

    render(
      <RecipesCatalog
        allCategoriesLabel="All recipe types"
        allProductsLabel="All products"
        allStacksLabel="All stacks"
        categoryFilterLabel="Recipe type"
        clearFiltersLabel="Clear filters"
        emptyMessage="No recipes match the current filters."
        items={[
          {
            category: 'Quickstart',
            description: 'Create a voice agent in Python.',
            href: '/en/api-reference/recipes/python-quickstart',
            product: 'Voice AI',
            stack: 'Python',
            title: 'Python Quickstart',
            tone: 'blue',
          },
          {
            category: 'Use case',
            description: 'A wellness-oriented scenario reference.',
            href: '/en/api-reference/recipes/wellness-coach',
            product: 'Voice AI',
            stack: 'Python',
            title: 'Wellness Coach',
            tone: 'pink',
          },
        ]}
        productFilterLabel="Product"
        searchPlaceholder="Search recipes"
        stackFilterLabel="Stack"
      />,
    );

    expect(
      screen.getByRole('link', { name: /Python Quickstart/i }),
    ).toBeVisible();
    expect(screen.getByRole('link', { name: /Wellness Coach/i })).toBeVisible();

    fireEvent.click(screen.getByRole('button', { name: 'Use case' }));

    expect(
      screen.queryByRole('link', { name: /Python Quickstart/i }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Wellness Coach/i })).toBeVisible();

    fireEvent.change(screen.getByPlaceholderText('Search recipes'), {
      target: { value: 'nomatch' },
    });

    expect(
      screen.getByText('No recipes match the current filters.'),
    ).toBeVisible();
  });
});
