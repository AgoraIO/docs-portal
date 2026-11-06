import { render, screen } from '@testing-library/react';
import type { ComponentType, ReactNode } from 'react';
import { describe, expect, it } from 'vitest';
import { getMDXComponents } from '../mdx';

describe('repository card titles', () => {
  it('keeps the icon and unchanged repository name in one row', () => {
    const components = getMDXComponents();
    expect(components.RepositoryCardTitle).toBeTypeOf('function');
    const Title = components.RepositoryCardTitle as ComponentType<{
      provider: 'gitee' | 'github';
      children: ReactNode;
    }>;
    const Card = components.Card as ComponentType<{
      href: string;
      title: ReactNode;
    }>;

    render(
      <>
        {(['gitee', 'github'] as const).map((provider) => (
          <Card
            key={provider}
            href={`https://${provider}.com/example/API-Examples`}
            title={<Title provider={provider}>API-Examples</Title>}
          />
        ))}
        <Card href="https://example.com" title="Ordinary card" />
      </>,
    );

    for (const provider of ['Gitee', 'GitHub']) {
      const card = screen.getByRole('link', {
        name: new RegExp(`^API-Examples\\s*（${provider}）$`),
      });
      const heading = card.querySelector('h3');
      const title = heading?.firstElementChild;
      expect(title).toHaveClass('inline-flex', 'items-center', 'gap-2');
      const icon = title?.querySelector('svg');
      expect(icon).toHaveAttribute(
        'data-repository-provider',
        provider.toLowerCase(),
      );
      expect(icon).toHaveAttribute('aria-hidden', 'true');
      expect(icon).toHaveClass('size-5', 'shrink-0');
      const label = title?.querySelector('.sr-only');
      expect(label).toHaveTextContent(`（${provider}）`);
      expect(
        Array.from(title?.childNodes ?? [])
          .filter((node) => node.nodeType === Node.TEXT_NODE)
          .map((node) => node.textContent)
          .join(''),
      ).toBe('API-Examples');
      expect(
        card.querySelector(':scope > div > svg[data-repository-provider]'),
      ).toBeNull();
    }

    expect(
      screen
        .getByRole('link', { name: 'Ordinary card' })
        .querySelector('svg[data-repository-provider]'),
    ).toBeNull();
  });
});
