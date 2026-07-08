import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { FaqLanding } from './FaqLanding';
import { faqItems } from './faq-data';
import { countByCategory } from './faq-filter';

describe('FaqLanding', () => {
  it('shows a card per category with its count by default', () => {
    render(<FaqLanding />);

    const counts = countByCategory(faqItems);
    const integration = screen.getByRole('link', { name: /Integration/ });
    expect(integration).toHaveAttribute(
      'href',
      '/en/api-reference/faq/integration',
    );
    expect(integration).toHaveTextContent(String(counts['integration-issues']));
  });

  it('replaces cards with cross-category results when searching', () => {
    render(<FaqLanding />);

    fireEvent.change(screen.getByRole('searchbox'), {
      target: { value: 'Chrome 81' },
    });

    expect(
      screen.getByRole('link', {
        name: /Why can't I get the device ID on Chrome 81\?/,
      }),
    ).toHaveAttribute(
      'href',
      '/en/api-reference/faq/integration/empty_deviceId',
    );
    expect(
      screen.queryByRole('link', {
        name: /Build, package, permissions/,
      }),
    ).toBeNull();
  });

  it('uses the Chinese dataset when requested', () => {
    render(<FaqLanding locale="zh-CN" />);

    expect(screen.getByPlaceholderText('搜索全部常见问题')).toBeVisible();
    expect(screen.getByRole('link', { name: /集成类/ })).toHaveAttribute(
      'href',
      '/zh-CN/api-reference/faq/integration',
    );
  });
});
