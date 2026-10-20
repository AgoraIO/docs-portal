import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { AnchorHTMLAttributes } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DOC_VERSION_STORAGE_KEY } from '@/lib/doc-version-preference';
import { DocVersionNotice, DocVersionSwitch } from './DocVersionControls';

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

describe('documentation preview controls', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
    location.searchStr = '';
    location.hash = '';
  });

  it('restores the saved release only at the neutral entry', async () => {
    localStorage.setItem(DOC_VERSION_STORAGE_KEY, '{"test-api":"v2"}');
    const replace = vi
      .spyOn(window.location, 'replace')
      .mockImplementation(() => {});
    render(<DocVersionNotice activePath={root} />);
    await waitFor(() =>
      expect(replace).toHaveBeenCalledExactlyOnceWith(`${root}/v2`),
    );
  });

  it('keeps an explicit old URL pinned until an intentional switch to the matching preview topic', () => {
    localStorage.setItem(DOC_VERSION_STORAGE_KEY, '{"test-api":"v2"}');
    const replace = vi
      .spyOn(window.location, 'replace')
      .mockImplementation(() => {});
    render(
      <>
        <DocVersionSwitch activePath={`${root}/v1/widgets`} />
        <DocVersionNotice activePath={`${root}/v1/widgets`} />
      </>,
    );
    expect(replace).not.toHaveBeenCalled();
    const toggle = screen.getByRole('switch');
    expect(toggle).toHaveAttribute('aria-checked', 'false');
    expect(toggle).toHaveAttribute('href', `${root}/v2/list-widgets`);
    expect(toggle).toHaveTextContent('Try v2');
    expect(screen.queryByRole('note')).not.toBeInTheDocument();
    expect(localStorage.getItem(DOC_VERSION_STORAGE_KEY)).toBe(
      '{"test-api":"v2"}',
    );
    localStorage.clear();
    fireEvent.click(toggle, { metaKey: true });
    expect(localStorage.getItem(DOC_VERSION_STORAGE_KEY)).toBeNull();
    fireEvent.click(toggle);
    expect(localStorage.getItem(DOC_VERSION_STORAGE_KEY)).toBe(
      '{"test-api":"v2"}',
    );
  });

  it('shows the enabled state and lets the switch return to the matching stable topic', () => {
    render(<DocVersionSwitch activePath={`${root}/v2/list-widgets`} />);
    const toggle = screen.getByRole('switch');
    expect(toggle).toHaveAttribute('aria-checked', 'true');
    expect(toggle).toHaveTextContent('v2 docs');
    expect(toggle).toHaveAttribute('href', `${root}/v1/widgets`);
    fireEvent.click(toggle);
    expect(localStorage.getItem(DOC_VERSION_STORAGE_KEY)).toBe(
      '{"test-api":"v1"}',
    );
  });

  it('supports the switch space key without scrolling the page', () => {
    render(<DocVersionSwitch activePath={`${root}/v1`} />);
    const toggle = screen.getByRole('switch');
    const click = vi.fn();
    toggle.addEventListener('click', click);
    expect(fireEvent.keyDown(toggle, { key: ' ' })).toBe(false);
    expect(click).toHaveBeenCalledOnce();
    expect(localStorage.getItem(DOC_VERSION_STORAGE_KEY)).toBe(
      '{"test-api":"v2"}',
    );
  });

  it('makes the callout return hint a real topic link that saves only a normal click', () => {
    localStorage.setItem(DOC_VERSION_STORAGE_KEY, '{"test-api":"v2"}');
    render(<DocVersionNotice activePath={`${root}/v2/list-widgets`} />);
    expect(
      screen.getByRole('note', { name: 'Preview documentation' }),
    ).toHaveTextContent('Preview documentation · v2');
    const back = screen.getByRole('link', {
      name: 'Turn Preview off to return to v1.',
    });
    expect(back).toHaveAttribute('href', `${root}/v1/widgets`);
    fireEvent.click(back, { ctrlKey: true });
    expect(localStorage.getItem(DOC_VERSION_STORAGE_KEY)).toBe(
      '{"test-api":"v2"}',
    );
    fireEvent.click(back);
    expect(localStorage.getItem(DOC_VERSION_STORAGE_KEY)).toBe(
      '{"test-api":"v1"}',
    );
  });

  it('falls back to the overview for a preview-only topic and explains a missing-topic arrival', () => {
    location.searchStr = '?versionFallback=1';
    render(<DocVersionNotice activePath={`${root}/v2/migration`} />);
    expect(screen.getByRole('link')).toHaveAttribute(
      'href',
      `${root}/v1?versionFallback=1`,
    );
    expect(screen.getByRole('status')).toHaveTextContent(
      'This topic is not available in this version. Showing its overview instead.',
    );
  });

  it('adds no version UI to unregistered documentation', () => {
    const { container } = render(
      <>
        <DocVersionSwitch activePath="/en/api-reference/cloud-recording" />
        <DocVersionNotice activePath="/en/api-reference/cloud-recording" />
      </>,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
