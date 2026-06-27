import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SdksCatalog } from './SdksCatalog';

describe('SdksCatalog', () => {
  it('keeps platform buttons as a pressed-state selector synced to the URL', () => {
    window.history.pushState(null, '', '/en/api-reference/sdks?platform=ios');

    render(<SdksCatalog />);

    expect(screen.getByRole('button', { name: 'iOS' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    fireEvent.click(screen.getByRole('button', { name: 'Android' }));

    expect(window.location.search).toBe('?platform=android');
    expect(screen.getByRole('button', { name: 'Android' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(
      screen.getByRole('heading', { name: 'Core products' }),
    ).toBeVisible();
  });

  it('shows a copyable install command for a product with a derivable registry', () => {
    window.history.pushState(
      null,
      '',
      '/en/api-reference/sdks?platform=android',
    );

    render(<SdksCatalog />);

    const voiceCard = screen.getByRole('article', { name: 'Voice SDK' });

    // Derived Gradle command is the hero.
    expect(
      within(voiceCard).getByText(
        "implementation 'io.agora.rtc:voice-sdk:4.6.3'",
      ),
    ).toBeVisible();
    expect(
      within(voiceCard).getByRole('button', { name: /copy/i }),
    ).toBeVisible();
    // Direct download is a secondary link, not a primary button.
    expect(
      within(voiceCard).getByRole('link', { name: /direct download/i }),
    ).toHaveAttribute(
      'href',
      'https://download.agora.io/sdk/release/Agora_Native_SDK_for_Android_v4.6.3_VOICE.zip',
    );
  });

  it('updates the command when the selected version changes', () => {
    window.history.pushState(
      null,
      '',
      '/en/api-reference/sdks?platform=android',
    );

    render(<SdksCatalog />);

    const voiceCard = screen.getByRole('article', { name: 'Voice SDK' });
    const versionSelect = within(voiceCard).getByRole('combobox', {
      name: 'Voice SDK version',
    });

    fireEvent.change(versionSelect, { target: { value: '1' } });

    expect(
      within(voiceCard).getByText(
        "implementation 'io.agora.rtc:voice-sdk:4.6.2'",
      ),
    ).toBeVisible();
  });

  it('falls back to a download button when no command can be derived', () => {
    window.history.pushState(null, '', '/en/api-reference/sdks?platform=ios');

    render(<SdksCatalog />);

    const chatCard = screen.getByRole('article', { name: 'Chat SDK' });

    // github source → no derived command → primary download, no command box.
    expect(
      within(chatCard).queryByRole('button', { name: /copy/i }),
    ).not.toBeInTheDocument();
    expect(
      within(chatCard).getByRole('link', { name: /download/i }),
    ).toHaveAttribute(
      'href',
      'https://download.agora.io/sdk/release/AgoraChat1_3_1.xcframework.zip',
    );
  });
});
