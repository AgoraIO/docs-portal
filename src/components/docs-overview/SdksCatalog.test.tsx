import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { beforeEach, describe, expect, it } from 'vitest';
import { SdksCatalog } from './SdksCatalog';

beforeEach(() => {
  window.history.replaceState(null, '', '/en/api-reference/sdks');
});

describe('SdksCatalog', () => {
  it('lists each product once with platform tabs and a default install command', () => {
    render(<SdksCatalog />);

    // Product appears exactly once even though it spans many platforms.
    const videoCard = screen.getByRole('article', { name: 'RTC SDK' });

    // Default platform (Android, first in canonical order) → Gradle command.
    expect(
      within(videoCard).getByText(
        "implementation 'io.agora.rtc:full-sdk:4.6.4'",
      ),
    ).toBeVisible();
    expect(
      within(videoCard).getByText(/Add the Agora Maven CDN repository/),
    ).toBeVisible();
    expect(
      within(
        screen.getByRole('article', { name: 'Signaling SDK' }),
      ).queryByText(/Add the Agora Maven CDN repository/),
    ).not.toBeInTheDocument();
    expect(
      within(videoCard).getByRole('tab', { name: 'Android' }),
    ).toHaveAttribute('aria-selected', 'true');
    // Tabs list other platforms this product supports.
    expect(
      within(videoCard).getByRole('tab', { name: 'Web' }),
    ).toBeInTheDocument();

    // No global platform picker remains.
    expect(
      screen.queryByRole('heading', { name: 'Platforms' }),
    ).not.toBeInTheDocument();
  });

  it('lists Android and iOS voice SDKs as separate platform-specific cards', () => {
    render(<SdksCatalog />);

    const videoCard = screen.getByRole('article', { name: 'RTC SDK' });

    fireEvent.click(within(videoCard).getByRole('tab', { name: 'Web' }));

    expect(
      within(videoCard).getByText('npm i agora-rtc-sdk-ng@4.24.8'),
    ).toBeVisible();
    expect(within(videoCard).getByRole('tab', { name: 'Web' })).toHaveAttribute(
      'aria-selected',
      'true',
    );

    const androidVoiceCard = screen.getByRole('article', {
      name: 'RTC (Voice Only) SDK for Android',
    });
    const iosVoiceCard = screen.getByRole('article', {
      name: 'RTC (Voice Only) SDK for iOS',
    });

    expect(
      within(androidVoiceCard).getByText(
        "implementation 'io.agora.rtc:voice-sdk:4.6.4'",
      ),
    ).toBeVisible();
    expect(
      within(iosVoiceCard).getByText(
        'https://github.com/AgoraIO/AgoraAudio_iOS',
      ),
    ).toBeVisible();
    expect(screen.getAllByRole('article')).toContain(androidVoiceCard);
    expect(screen.getAllByRole('article')).toContain(iosVoiceCard);
    expect(
      within(androidVoiceCard).queryByRole('tablist'),
    ).not.toBeInTheDocument();
    expect(within(iosVoiceCard).queryByRole('tablist')).not.toBeInTheDocument();
  });

  it('updates the command when the version changes', () => {
    render(<SdksCatalog />);

    const voiceCard = screen.getByRole('article', {
      name: 'RTC (Voice Only) SDK for Android',
    });
    const select = within(voiceCard).getByRole('combobox', {
      name: 'RTC (Voice Only) SDK for Android version',
    });

    fireEvent.change(select, { target: { value: '1' } });

    expect(
      within(voiceCard).getByText(
        "implementation 'io.agora.rtc:voice-sdk:4.6.3'",
      ),
    ).toBeVisible();
  });

  it('does not append Previous to older SDK version options', () => {
    render(<SdksCatalog />);

    const voiceCard = screen.getByRole('article', {
      name: 'RTC (Voice Only) SDK for Android',
    });
    const select = within(voiceCard).getByRole('combobox', {
      name: 'RTC (Voice Only) SDK for Android version',
    }) as HTMLSelectElement;
    const optionLabels = Array.from(select.options).map(
      (option) => option.textContent,
    );

    expect(optionLabels).toContain('v4.6.2');
    expect(optionLabels).not.toContain('v4.6.2 - Previous');
  });

  it('falls back to a download button when the platform has no derivable command', () => {
    render(<SdksCatalog />);

    const chatCard = screen.getByRole('article', { name: 'Chat SDK' });

    fireEvent.click(within(chatCard).getByRole('tab', { name: 'iOS' }));

    expect(
      within(chatCard).queryByRole('button', { name: /copy/i }),
    ).not.toBeInTheDocument();
    expect(
      within(chatCard).getByRole('link', { name: /download sdk/i }),
    ).toHaveAttribute(
      'href',
      'https://download.agora.io/sdk/release/AgoraChat1_4_0.zip',
    );
  });

  it('renders a product icon in each card', () => {
    render(<SdksCatalog />);

    const videoCard = screen.getByRole('article', { name: 'RTC SDK' });
    expect(videoCard.querySelector('svg')).toBeTruthy();
  });

  it('omits obsolete Media Player Kit downloads', () => {
    render(<SdksCatalog />);

    expect(
      screen.queryAllByRole('article', { name: /mediaplayer kit sdk/i }),
    ).toHaveLength(0);
  });

  it('lists the Agora Agents SDK with TypeScript, Python, and Go tabs', () => {
    render(<SdksCatalog />);

    const agentsCard = screen.getByRole('article', {
      name: 'Agora Agents SDK',
    });

    // Default tab is Python → pip install command.
    expect(
      within(agentsCard).getByRole('tab', { name: 'Python' }),
    ).toHaveAttribute('aria-selected', 'true');
    expect(
      within(agentsCard).getByText('pip install agora-agents'),
    ).toBeVisible();

    // TypeScript and Go tabs are present.
    expect(
      within(agentsCard).getByRole('tab', { name: 'TypeScript' }),
    ).toBeInTheDocument();
    expect(
      within(agentsCard).getByRole('tab', { name: 'Go' }),
    ).toBeInTheDocument();

    // Switching to TypeScript shows the npm command.
    fireEvent.click(
      within(agentsCard).getByRole('tab', { name: 'TypeScript' }),
    );
    expect(
      within(agentsCard).getByText('npm i agora-agents@2.3.1'),
    ).toBeVisible();

    // Switching to Go shows the go get command.
    fireEvent.click(within(agentsCard).getByRole('tab', { name: 'Go' }));
    expect(
      within(agentsCard).getByText(
        'go get github.com/AgoraIO/agora-agents-go/v2@v2.3.1',
      ),
    ).toBeVisible();
  });

  it('filters to the product requested by the query string', () => {
    window.history.replaceState(
      null,
      '',
      '/en/api-reference/sdks?product=voice',
    );

    render(<SdksCatalog />);

    expect(
      screen.getByText('Showing SDKs for RTC (Voice Only) SDK'),
    ).toBeVisible();
    expect(
      screen.getByRole('link', { name: /show all sdks/i }),
    ).toHaveAttribute('href', '/en/api-reference/sdks');
    expect(
      screen.getByRole('article', {
        name: 'RTC (Voice Only) SDK for Android',
      }),
    ).toBeVisible();
    expect(
      screen.getByRole('article', {
        name: 'RTC (Voice Only) SDK for iOS',
      }),
    ).toBeVisible();
    expect(
      screen.queryByRole('article', { name: 'RTC SDK' }),
    ).not.toBeInTheDocument();
  });

  it('includes both platform-specific voice cards in the RTC product filter', () => {
    window.history.replaceState(null, '', '/en/api-reference/sdks?product=rtc');

    render(<SdksCatalog />);

    expect(
      screen.getByRole('article', { name: 'RTC (Voice Only) SDK for Android' }),
    ).toBeVisible();
    expect(
      screen.getByRole('article', { name: 'RTC (Voice Only) SDK for iOS' }),
    ).toBeVisible();
  });

  it('filters to the requested platform for a product-specific SDK link', () => {
    window.history.replaceState(
      null,
      '',
      '/en/api-reference/sdks?product=voice&platform=ios',
    );

    render(<SdksCatalog />);

    const iosVoiceCard = screen.getByRole('article', {
      name: 'RTC (Voice Only) SDK for iOS',
    });
    expect(iosVoiceCard).toBeVisible();
    expect(
      screen.queryByRole('article', {
        name: 'RTC (Voice Only) SDK for Android',
      }),
    ).not.toBeInTheDocument();
  });

  it('uses a platform-only query to show SDKs available on that platform', () => {
    window.history.replaceState(
      null,
      '',
      '/en/api-reference/sdks?platform=unity',
    );

    render(<SdksCatalog />);

    // Voice has no Unity SDK, so a Unity-only filter should surface RTC SDK
    // (which does ship on Unity) and exclude the voice-only card entirely.
    const videoCard = screen.getByRole('article', { name: 'RTC SDK' });
    expect(screen.getByText('Showing SDKs for Unity')).toBeVisible();
    expect(
      within(videoCard).getByRole('tab', { name: 'Unity' }),
    ).toHaveAttribute('aria-selected', 'true');
    expect(
      screen.queryByRole('article', { name: 'Agora Agents SDK' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('article', {
        name: 'RTC (Voice Only) SDK for Android',
      }),
    ).not.toBeInTheDocument();
  });

  it('updates product and platform filters when search params change after mount', async () => {
    render(<SdksCatalog />);

    expect(screen.getByRole('article', { name: 'RTC SDK' })).toBeVisible();

    act(() => {
      window.history.pushState(
        null,
        '',
        '/en/api-reference/sdks?product=voice&platform=ios',
      );
    });

    await waitFor(() => {
      expect(
        screen.getByText('Showing SDKs for RTC (Voice Only) SDK'),
      ).toBeVisible();
    });

    const voiceCard = screen.getByRole('article', {
      name: 'RTC (Voice Only) SDK for iOS',
    });
    expect(
      screen.queryByRole('article', { name: 'RTC SDK' }),
    ).not.toBeInTheDocument();
    expect(voiceCard).toBeVisible();
    expect(
      screen.queryByRole('article', {
        name: 'RTC (Voice Only) SDK for Android',
      }),
    ).not.toBeInTheDocument();
  });

  it('renders the unfiltered static catalog on the server', () => {
    window.history.replaceState(
      null,
      '',
      '/en/api-reference/sdks?product=voice&platform=unity',
    );

    const html = renderToString(<SdksCatalog />);

    expect(html).not.toContain('Showing SDKs for RTC (Voice Only) SDK');
    expect(html).toContain('RTC (Voice Only) SDK for Android');
    expect(html).toContain('RTC (Voice Only) SDK for iOS');
    expect(html).toContain('RTC SDK');
  });

  it('groups whiteboard and fastboard SDKs for the whiteboard product query', () => {
    window.history.replaceState(
      null,
      '',
      '/en/api-reference/sdks?product=whiteboard',
    );

    render(<SdksCatalog />);

    expect(screen.getByText('Showing SDKs for Whiteboard SDKs')).toBeVisible();
    expect(
      screen.getByRole('article', { name: 'Interactive Whiteboard SDK' }),
    ).toBeVisible();
    expect(
      screen.getByRole('article', { name: 'Interactive Whiteboard Fastboard' }),
    ).toBeVisible();
    expect(
      screen.queryByRole('article', {
        name: 'RTC (Voice Only) SDK for Android',
      }),
    ).not.toBeInTheDocument();
  });

  it('ignores invalid product and platform query values', () => {
    window.history.replaceState(
      null,
      '',
      '/en/api-reference/sdks?product=unknown&platform=not-a-platform',
    );

    render(<SdksCatalog />);

    const videoCard = screen.getByRole('article', { name: 'RTC SDK' });
    expect(screen.queryByText(/showing sdks for/i)).not.toBeInTheDocument();
    expect(
      within(videoCard).getByRole('tab', { name: 'Android' }),
    ).toHaveAttribute('aria-selected', 'true');
  });
});
