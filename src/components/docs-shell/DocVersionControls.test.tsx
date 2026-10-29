import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { AnchorHTMLAttributes } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DOC_VERSION_STORAGE_KEY } from '@/lib/doc-version-preference';
import { DocVersionNotice, DocVersionSelector } from './DocVersionControls';

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

function openSelector() {
  fireEvent.keyDown(screen.getByRole('button', { name: /^Documentation:/ }), {
    key: 'ArrowDown',
  });
  return screen.findByRole('menu');
}

describe('documentation preview controls', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
    location.searchStr = '';
    location.hash = '';
  });

  it.each([
    ['fresh browser', null, 'v2'],
    ['saved previous docs', 'v1', 'v1'],
  ])('restores %s only at the neutral entry', async (_, saved, expected) => {
    if (saved)
      localStorage.setItem(
        DOC_VERSION_STORAGE_KEY,
        JSON.stringify({ 'convoai-v3': saved }),
      );
    const replace = vi
      .spyOn(window.location, 'replace')
      .mockImplementation(() => {});
    render(<DocVersionNotice activePath={root} />);
    await waitFor(() =>
      expect(replace).toHaveBeenCalledExactlyOnceWith(`${root}/${expected}`),
    );
  });

  it('keeps a shared old URL pinned without overwriting the saved preview choice', async () => {
    localStorage.setItem(DOC_VERSION_STORAGE_KEY, '{"convoai-v3":"v2"}');
    const replace = vi
      .spyOn(window.location, 'replace')
      .mockImplementation(() => {});
    render(
      <>
        <DocVersionSelector activePath={`${root}/v1/widgets`} />
        <DocVersionNotice activePath={`${root}/v1/widgets`} />
      </>,
    );
    expect(replace).not.toHaveBeenCalled();
    expect(
      screen.getByRole('button', { name: 'Documentation: Previous docs' }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('note')).not.toBeInTheDocument();
    await openSelector();
    expect(
      screen.getByRole('menuitem', { name: 'Previous docs' }),
    ).toHaveAttribute('aria-current', 'page');
    const preview = screen.getByRole('menuitem', {
      name: 'New docs · Preview',
    });
    expect(preview).toHaveAttribute('href', `${root}/v2/list-widgets`);
    expect(localStorage.getItem(DOC_VERSION_STORAGE_KEY)).toBe(
      '{"convoai-v3":"v2"}',
    );
    localStorage.clear();
    fireEvent.click(preview, { metaKey: true });
    expect(localStorage.getItem(DOC_VERSION_STORAGE_KEY)).toBeNull();
  });

  it('saves a deliberate selection of preview docs', async () => {
    render(<DocVersionSelector activePath={`${root}/v1/widgets`} />);
    await openSelector();
    fireEvent.click(
      screen.getByRole('menuitem', { name: 'New docs · Preview' }),
    );
    expect(localStorage.getItem(DOC_VERSION_STORAGE_KEY)).toBe(
      '{"convoai-v3":"v2"}',
    );
  });

  it('shows the current preview and maps selection to the matching previous topic', async () => {
    render(<DocVersionSelector activePath={`${root}/v2/list-widgets`} />);
    expect(
      screen.getByRole('button', { name: 'Documentation: New docs · Preview' }),
    ).toBeInTheDocument();
    await openSelector();
    expect(
      screen.getByRole('menuitem', { name: 'New docs · Preview' }),
    ).toHaveAttribute('aria-current', 'page');
    const previous = screen.getByRole('menuitem', { name: 'Previous docs' });
    expect(previous).toHaveAttribute('href', `${root}/v1/widgets`);
    fireEvent.click(previous);
    expect(localStorage.getItem(DOC_VERSION_STORAGE_KEY)).toBe(
      '{"convoai-v3":"v1"}',
    );
  });

  it('makes the notice return link independent of the preview default and saves only a normal click', () => {
    localStorage.setItem(DOC_VERSION_STORAGE_KEY, '{"convoai-v3":"v2"}');
    render(<DocVersionNotice activePath={`${root}/v2/list-widgets`} />);
    expect(
      screen.getByRole('note', { name: 'Preview documentation' }),
    ).toHaveTextContent('You’re reading the new Test API docs.');
    const back = screen.getByRole('link', { name: 'Switch to Previous docs.' });
    expect(back).toHaveAttribute('href', `${root}/v1/widgets`);
    fireEvent.click(back, { ctrlKey: true });
    expect(localStorage.getItem(DOC_VERSION_STORAGE_KEY)).toBe(
      '{"convoai-v3":"v2"}',
    );
    fireEvent.click(back);
    expect(localStorage.getItem(DOC_VERSION_STORAGE_KEY)).toBe(
      '{"convoai-v3":"v1"}',
    );
  });

  it('falls back to the overview for an exclusive topic and explains a missing-topic arrival', () => {
    location.searchStr = '?versionFallback=1';
    render(<DocVersionNotice activePath={`${root}/v2/migration`} />);
    expect(screen.getByRole('link')).toHaveAttribute(
      'href',
      `${root}/v1?versionFallback=1`,
    );
    expect(screen.getByRole('status')).toHaveTextContent(
      'No matching page in New docs. Showing its overview.',
    );
  });

  it('adds no version UI to unregistered documentation', () => {
    const { container } = render(
      <>
        <DocVersionSelector activePath="/en/api-reference/cloud-recording" />
        <DocVersionNotice activePath="/en/api-reference/cloud-recording" />
      </>,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it.each([
    ['/en/ai/documentation-versions', '/en/ai'],
    [
      '/en/api-reference/api-ref/conversational-ai/documentation-versions',
      '/en/api-reference/api-ref/conversational-ai',
    ],
  ])('opens Main by default at %s', async (entry, target) => {
    const replace = vi
      .spyOn(window.location, 'replace')
      .mockImplementation(() => {});
    render(<DocVersionNotice activePath={entry} />);
    await waitFor(() =>
      expect(replace).toHaveBeenCalledExactlyOnceWith(target),
    );
    expect(localStorage.getItem(DOC_VERSION_STORAGE_KEY)).toBeNull();
  });

  it('identifies Platform Preview without repeating its label and remembers Main', async () => {
    const path = '/en/ai/platform/build/managed-mode';
    localStorage.setItem(DOC_VERSION_STORAGE_KEY, '{"convoai":"v1"}');
    render(
      <>
        <DocVersionSelector activePath={path} />
        <DocVersionNotice activePath={path} />
      </>,
    );
    const trigger = screen.getByRole('button', {
      name: 'Documentation: Preview',
    });
    expect(trigger).toHaveTextContent(/^Preview$/);
    expect(screen.getByRole('note')).toHaveTextContent(
      "You're reading the Conversational AI Platform (Preview) docs.",
    );
    expect(localStorage.getItem(DOC_VERSION_STORAGE_KEY)).toBe(
      '{"convoai":"v1"}',
    );
    await openSelector();
    const main = screen.getByRole('menuitem', { name: 'Main' });
    expect(main).toHaveAttribute('href', '/en/ai/build/managed-mode');
    fireEvent.click(main);
    expect(localStorage.getItem(DOC_VERSION_STORAGE_KEY)).toBe(
      '{"convoai":"v1"}',
    );
  });

  it('changes the catalog choice in place and updates every subscribed selector', async () => {
    render(
      <>
        <DocVersionSelector
          activePath="/en/api-reference"
          scopeId="convoai-api"
        />
        <DocVersionSelector
          activePath="/en/api-reference"
          scopeId="convoai-sdk"
        />
      </>,
    );
    const triggers = screen.getAllByRole('button', {
      name: 'Documentation: Main',
    });
    expect(triggers).toHaveLength(2);
    fireEvent.keyDown(triggers[0], { key: 'ArrowDown' });
    await screen.findByRole('menu');
    expect(
      fireEvent.click(screen.getByRole('menuitem', { name: 'Preview' })),
    ).toBe(false);
    await waitFor(() =>
      expect(
        screen.getAllByRole('button', { name: 'Documentation: Preview' }),
      ).toHaveLength(2),
    );
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(
      JSON.parse(localStorage.getItem(DOC_VERSION_STORAGE_KEY) ?? '{}'),
    ).toEqual({ convoai: 'v2' });
  });

  it('switches an explicit SDK page instead of treating its catalog selector as a filter', async () => {
    const onSelect = vi.fn();
    render(
      <DocVersionSelector
        activePath="/en/api-reference/api-ref/server-sdk/platform/go"
        scopeId="convoai-api"
        onSelectPath={onSelect}
      />,
    );
    await openSelector();
    const main = screen.getByRole('menuitem', { name: 'Main' });
    expect(main).toHaveAttribute(
      'href',
      '/en/api-reference/api-ref/server-sdk/go',
    );
    fireEvent.click(main);
    expect(onSelect).toHaveBeenCalledOnce();
    expect(localStorage.getItem(DOC_VERSION_STORAGE_KEY)).toBe(
      '{"convoai":"v1"}',
    );
  });
});
