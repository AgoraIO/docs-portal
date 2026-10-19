import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { AnchorHTMLAttributes } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DOC_VERSION_STORAGE_KEY } from '@/lib/doc-version-preference';
import { DocVersionBar } from './DocVersionBar';

const location = vi.hoisted(() => ({ hash: '', searchStr: '' }));
vi.mock('@tanstack/react-router', () => ({
  useLocation: () => location,
  Link: ({
    to,
    ...props
  }: AnchorHTMLAttributes<HTMLAnchorElement> & { to: string }) => (
    <a href={to} {...props} />
  ),
}));

const root = '/en/api-reference/versioning-demo';

describe('documentation version controls', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
    location.searchStr = '';
    location.hash = '';
  });

  it('restores the saved new version when entering through the neutral page', async () => {
    localStorage.setItem(DOC_VERSION_STORAGE_KEY, '{"test-api":"v2"}');
    const replace = vi
      .spyOn(window.location, 'replace')
      .mockImplementation(() => {});
    render(<DocVersionBar activePath={root} />);
    await waitFor(() => expect(replace).toHaveBeenCalledWith(`${root}/v2`));
    expect(
      screen.getByRole('link', { name: 'v1 — Test current version' }),
    ).toHaveAttribute('href', `${root}/v1`);
  });

  it('keeps an explicitly shared old page pinned and saves only an intentional switch', () => {
    localStorage.setItem(DOC_VERSION_STORAGE_KEY, '{"test-api":"v2"}');
    const replace = vi
      .spyOn(window.location, 'replace')
      .mockImplementation(() => {});
    render(<DocVersionBar activePath={`${root}/v1/widgets`} />);
    expect(replace).not.toHaveBeenCalled();
    expect(
      screen.getByRole('link', { name: 'v1 — Test current version' }),
    ).toHaveAttribute('aria-current', 'page');
    expect(localStorage.getItem(DOC_VERSION_STORAGE_KEY)).toBe(
      '{"test-api":"v2"}',
    );
    fireEvent.click(
      screen.getByRole('link', { name: 'v1 — Test current version' }),
    );
    expect(localStorage.getItem(DOC_VERSION_STORAGE_KEY)).toBe(
      '{"test-api":"v1"}',
    );
    const next = screen.getByRole('link', { name: 'v2 — Test new version' });
    expect(next).toHaveAttribute('href', `${root}/v2/list-widgets`);
    fireEvent.click(next);
    expect(localStorage.getItem(DOC_VERSION_STORAGE_KEY)).toBe(
      '{"test-api":"v2"}',
    );
  });

  it('explains a missing topic at the target overview', () => {
    location.searchStr = '?versionFallback=1';
    render(<DocVersionBar activePath={`${root}/v2`} />);
    expect(screen.getByRole('status')).toHaveTextContent(
      'This topic is not available in this version. Showing its overview instead.',
    );
  });
});
