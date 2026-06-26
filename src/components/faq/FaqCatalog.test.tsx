import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { FaqCatalog } from './FaqCatalog';

describe('FaqCatalog', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/en/api-reference/faq');
  });

  it('renders the required categories and online Integration Issues links by default', () => {
    render(<FaqCatalog />);

    expect(
      screen.getAllByRole('button', { name: 'Integration Issues' }).length,
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByRole('button', { name: 'Quality Issues' }).length,
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByRole('button', { name: 'General Product Inquiry' }).length,
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByRole('button', { name: 'Account and Billing' }).length,
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByRole('button', { name: 'Other Issues' }).length,
    ).toBeGreaterThan(0);
    expect(
      screen.getByRole('link', {
        name: /Why can't I get the device ID on Chrome 81\?/,
      }),
    ).toHaveAttribute(
      'href',
      '/en/api-reference/faq/integration/empty_deviceId',
    );
  });

  it('switches categories and filters by platform', () => {
    render(<FaqCatalog />);

    fireEvent.click(
      screen.getAllByRole('button', { name: 'Integration Issues' })[0],
    );

    expect(
      screen.getByRole('link', {
        name: /Why can't I get the device ID on Chrome 81\?/,
      }),
    ).toBeVisible();

    fireEvent.click(screen.getAllByRole('button', { name: 'Web' })[0]);

    expect(
      screen.getByRole('link', {
        name: /Why is the camera light still on after I disable my video on the Web\?/,
      }),
    ).toBeVisible();
    expect(
      screen.queryByRole('link', {
        name: /Why don't music files automatically resume playing after hanging up a system call on an Android device\?/,
      }),
    ).not.toBeInTheDocument();
  });

  it('shows migrated online articles from every FAQ category', () => {
    render(<FaqCatalog />);

    fireEvent.click(
      screen.getAllByRole('button', { name: 'Quality Issues' })[0],
    );
    expect(
      screen.getByRole('link', {
        name: /How to solve SEI-related issues\?/,
      }),
    ).toHaveAttribute('href', '/en/api-reference/faq/quality/sei');

    fireEvent.click(
      screen.getAllByRole('button', { name: 'General Product Inquiry' })[0],
    );
    expect(
      screen.getByRole('link', {
        name: /What's the difference between on-premise recording and cloud recording\?/,
      }),
    ).toHaveAttribute('href', '/en/api-reference/faq/product/onpremise_cloud');

    fireEvent.click(
      screen.getAllByRole('button', { name: 'Account and Billing' })[0],
    );
    expect(
      screen.getByRole('link', {
        name: /Agora's free-of-charge policy for the first 10,000 minutes\?/,
      }),
    ).toHaveAttribute('href', '/en/api-reference/faq/account/billing_free');

    fireEvent.click(screen.getAllByRole('button', { name: 'Other Issues' })[0]);
    expect(
      screen.getByRole('link', {
        name: /How can I add a privacy manifest to my iOS app\?/,
      }),
    ).toHaveAttribute(
      'href',
      '/en/api-reference/faq/other/ios_privacy_manifest',
    );
  });

  it('filters against multi-value product and platform tags', async () => {
    render(<FaqCatalog />);

    fireEvent.click(
      screen.getAllByRole('button', { name: 'General Product Inquiry' })[0],
    );
    fireEvent.pointerDown(
      screen.getByRole('button', {
        name: /All Products/,
      }),
      { button: 0 },
    );
    fireEvent.click(
      await screen.findByRole('menuitem', { name: /Cloud Recording/ }),
    );

    expect(
      screen.getByRole('link', {
        name: /What's the difference between on-premise recording and cloud recording\?/,
      }),
    ).toBeVisible();

    fireEvent.click(screen.getAllByRole('button', { name: 'Web' })[0]);

    expect(
      screen.queryByRole('link', {
        name: /What's the difference between on-premise recording and cloud recording\?/,
      }),
    ).not.toBeInTheDocument();
  });
});
