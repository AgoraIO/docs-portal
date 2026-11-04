import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { DOCS_HASH_TARGET_EVENT } from '@/lib/docs-hash';
import {
  PlatformHeaderTabs,
  PlatformPageProvider,
  PlatformPanel,
  PlatformTabsGroup,
} from './mdx/PlatformTabsGroup';

const platforms = '["android","ios","windows"]';
let startingLocation = '';

function Page({
  initialPlatform,
  targetReady = true,
}: {
  initialPlatform?: 'windows';
  targetReady?: boolean;
}) {
  return (
    <PlatformPageProvider
      canonicalPlatform="android"
      initialPlatform={initialPlatform}
      platforms={platforms}
    >
      <PlatformHeaderTabs canonicalPlatform="android" platforms={platforms} />
      <h2 id="shared">Shared heading</h2>
      <PlatformTabsGroup
        canonicalPlatform="android"
        groupMode="structured"
        platforms={platforms}
        tabsPlacement="header"
      >
        <PlatformPanel platform="android">Android instructions</PlatformPanel>
        <PlatformPanel platform="ios">
          {targetReady ? <h3 id="legacy-ios">Legacy iOS details</h3> : null}
        </PlatformPanel>
        <PlatformPanel platform="windows">Windows instructions</PlatformPanel>
      </PlatformTabsGroup>
    </PlatformPageProvider>
  );
}

describe('unscoped legacy platform anchors', () => {
  beforeEach(() => {
    startingLocation = location.pathname + location.search + location.hash;
    localStorage.clear();
    localStorage.setItem('docs-portal:platform:v1', 'windows');
  });
  afterEach(() => {
    cleanup();
    localStorage.clear();
    window.history.replaceState({}, '', startingLocation);
  });

  it('reveals the hash target platform before scrolling despite another saved preference', async () => {
    window.history.replaceState({}, '', '/solutions/example#legacy-ios');
    render(<Page />);
    await waitFor(() =>
      expect(screen.getByRole('tab', { name: 'iOS' })).toHaveAttribute(
        'aria-selected',
        'true',
      ),
    );
    expect(screen.getByText('Legacy iOS details')).toBeVisible();
    expect(location.pathname + location.hash).toBe(
      '/solutions/example#legacy-ios',
    );
  });

  it('waits for a lazily loaded target before recovering its platform', async () => {
    window.history.replaceState({}, '', '/solutions/example#legacy-ios');
    const view = render(<Page targetReady={false} />);
    expect(screen.getByRole('tab', { name: 'Windows' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    view.rerender(<Page />);
    await waitFor(() =>
      expect(screen.getByText('Legacy iOS details')).toBeVisible(),
    );
  });

  it('recovers the platform after a same-page hash change', async () => {
    window.history.replaceState({}, '', '/solutions/example');
    render(<Page />);
    window.history.replaceState({}, '', '/solutions/example#legacy-ios');
    window.dispatchEvent(new HashChangeEvent('hashchange'));
    await waitFor(() =>
      expect(screen.getByText('Legacy iOS details')).toBeVisible(),
    );
  });

  it('preserves an explicit platform URL when its hash belongs to another platform', () => {
    window.history.replaceState(
      {},
      '',
      '/solutions/example/windows#legacy-ios',
    );
    render(<Page initialPlatform="windows" />);
    expect(screen.getByRole('tab', { name: 'Windows' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByText('Legacy iOS details')).not.toBeVisible();
  });

  it('preserves the saved platform for a heading shared by every platform', () => {
    window.history.replaceState({}, '', '/solutions/example#shared');
    render(<Page />);
    expect(screen.getByRole('tab', { name: 'Windows' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByText('Shared heading')).toBeVisible();
  });

  it('preserves an explicit platform when a conflicting hash target loads later', async () => {
    window.history.replaceState(
      {},
      '',
      '/solutions/example/windows#legacy-ios',
    );
    // happy-dom queues hashchange for replaceState, unlike browsers. Drain it
    // before mounting so it cannot masquerade as subsequent user navigation.
    await new Promise<void>((resolve) => window.setTimeout(resolve, 0));
    const view = render(<Page initialPlatform="windows" targetReady={false} />);
    await act(async () => {
      view.rerender(<Page initialPlatform="windows" />);
    });
    expect(screen.getByRole('tab', { name: 'Windows' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByText('Legacy iOS details')).not.toBeVisible();
  });

  it('reveals a lazy cross-platform target after arriving at an explicit platform URL', async () => {
    window.history.replaceState({}, '', '/solutions/example/windows#shared');
    // Flush happy-dom's synthetic replaceState events before the real request.
    await new Promise<void>((resolve) => window.setTimeout(resolve, 0));
    const view = render(<Page initialPlatform="windows" targetReady={false} />);
    await act(async () => {
      window.dispatchEvent(
        new CustomEvent(DOCS_HASH_TARGET_EVENT, { detail: '#legacy-ios' }),
      );
    });
    view.rerender(<Page initialPlatform="windows" />);
    await waitFor(() =>
      expect(screen.getByText('Legacy iOS details')).toBeVisible(),
    );
    expect(screen.getByRole('tab', { name: 'iOS' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(location.pathname + location.hash).toBe(
      '/solutions/example/windows#shared',
    );
  });

  it('does not change the saved platform when content arrives after the page unmounts', async () => {
    window.history.replaceState({}, '', '/solutions/example#legacy-ios');
    const view = render(<Page targetReady={false} />);
    view.unmount();
    await act(async () => {
      render(
        <section data-platform-panel="ios">
          <h3 id="legacy-ios">Later content from another view</h3>
        </section>,
      );
    });
    expect(localStorage.getItem('docs-portal:platform:v1')).toBe('windows');
  });
});
