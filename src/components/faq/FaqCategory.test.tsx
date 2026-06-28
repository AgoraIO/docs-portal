import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { FaqCategory } from './FaqCategory';

describe('FaqCategory', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/en/api-reference/faq/integration');
  });

  it('renders only the given category and links to articles', () => {
    render(<FaqCategory category="integration-issues" />);

    expect(
      screen.getByRole('link', {
        name: /Why can't I get the device ID on Chrome 81\?/,
      }),
    ).toHaveAttribute(
      'href',
      '/en/api-reference/faq/integration/empty_deviceId',
    );
    expect(
      screen.queryByRole('link', { name: /How to solve SEI-related issues\?/ }),
    ).toBeNull();
  });

  it('filters by query and writes it to the URL', () => {
    render(<FaqCategory category="integration-issues" />);

    fireEvent.change(screen.getByRole('searchbox'), {
      target: { value: 'Chrome 81' },
    });

    expect(
      screen.getByRole('link', {
        name: /Why can't I get the device ID on Chrome 81\?/,
      }),
    ).toBeVisible();
    expect(window.location.search).toContain('q=Chrome+81');
  });

  it('shows an empty state with a working clear control', () => {
    render(<FaqCategory category="integration-issues" />);

    fireEvent.change(screen.getByRole('searchbox'), {
      target: { value: 'zzz-no-such-question' },
    });
    expect(
      screen.getByText('No FAQs match the current filters.'),
    ).toBeVisible();

    fireEvent.click(screen.getByRole('button', { name: 'Clear filters' }));
    expect(
      screen.getByRole('link', {
        name: /Why can't I get the device ID on Chrome 81\?/,
      }),
    ).toBeVisible();
  });
});
