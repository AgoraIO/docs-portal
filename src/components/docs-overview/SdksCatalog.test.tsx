import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SdksCatalog } from './SdksCatalog';

describe('SdksCatalog', () => {
  it('renders a compact platform matrix and full-width SDK cards', () => {
    window.history.pushState(
      null,
      '',
      '/en/api-reference/sdks?platform=android',
    );

    render(<SdksCatalog />);

    expect(screen.getByText('Platforms')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Android' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('heading', { name: 'Android SDKs' })).toBeVisible();
    expect(
      screen.getByText('Latest versions are selected by default.'),
    ).toBeVisible();
    expect(
      screen.getByRole('heading', { name: 'Core Products' }),
    ).toBeVisible();

    const voiceCard = screen.getByRole('article', { name: 'Voice SDK' });

    expect(within(voiceCard).getByText('Selected version')).toBeVisible();
    expect(
      within(voiceCard).getByRole('combobox', {
        name: 'Voice SDK version',
      }),
    ).toHaveValue('0');
    expect(within(voiceCard).getByText('Latest')).toBeVisible();
    expect(within(voiceCard).getByText('Download options')).toBeVisible();
  });

  it('keeps latest direct download as the primary card action', () => {
    window.history.pushState(
      null,
      '',
      '/en/api-reference/sdks?platform=android',
    );

    render(<SdksCatalog />);

    const voiceCard = screen.getByRole('article', { name: 'Voice SDK' });

    const links = within(voiceCard).getAllByRole('link');

    expect(links[0]).toHaveAccessibleName('Download SDK');
    expect(links[0]).toHaveAttribute(
      'href',
      'https://download.agora.io/sdk/release/Agora_Native_SDK_for_Android_v4.6.3_VOICE.zip',
    );
    expect(links[1]).toHaveAccessibleName('Package Manager');
    expect(links[1]).toHaveAttribute(
      'href',
      'https://central.sonatype.com/artifact/io.agora.rtc/voice-sdk/4.6.3/aar',
    );
  });

  it('shows release state badges when the selected version changes', () => {
    window.history.pushState(
      null,
      '',
      '/en/api-reference/sdks?platform=android',
    );

    render(<SdksCatalog />);

    const videoCard = screen.getByRole('article', { name: 'Video SDK' });

    const versionSelect = within(videoCard).getByRole('combobox', {
      name: 'Video SDK version',
    });

    expect(
      within(videoCard).getByRole('option', {
        name: 'v4.6.3 Lite - Latest, Lite',
      }),
    ).toBeInTheDocument();

    fireEvent.change(versionSelect, { target: { value: '1' } });

    expect(within(videoCard).getByText('Latest')).toBeVisible();
    expect(within(videoCard).getByText('Lite')).toBeVisible();

    fireEvent.change(versionSelect, { target: { value: '2' } });

    expect(within(videoCard).getByText('Previous')).toBeVisible();
  });

  it('uses the platform query parameter and keeps platform changes in the URL', () => {
    window.history.pushState(null, '', '/en/api-reference/sdks?platform=ios');

    render(<SdksCatalog />);

    expect(screen.getByRole('button', { name: 'iOS' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('heading', { name: 'iOS SDKs' })).toBeVisible();
    expect(
      screen.queryByRole('heading', { level: 3, name: 'IoT SDK' }),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Linux' }));

    expect(window.location.search).toBe('?platform=linux');
    expect(screen.getByRole('button', { name: 'Linux' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('heading', { name: 'Linux SDKs' })).toBeVisible();
    expect(
      screen.getByRole('heading', { name: 'Product Add-ons' }),
    ).toBeVisible();
    expect(
      screen.getByRole('heading', { level: 3, name: 'Server Gateway SDK' }),
    ).toBeVisible();
    expect(
      screen.getByRole('combobox', { name: 'Server Gateway SDK version' }),
    ).toHaveValue('0');
  });
});
