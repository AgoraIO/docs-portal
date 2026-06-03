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

    expect(screen.getByRole('link', { name: /Python Quickstart/i })).toBeVisible();
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
