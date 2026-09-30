import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DownloadResourceCards } from './DownloadResourceCards';

describe('DownloadResourceCards', () => {
  it('uses the RTC card layout without inventing metadata for link-only resources', () => {
    render(
      <DownloadResourceCards
        items={[
          {
            href: 'https://download.agora.io/example.zip',
            platform: 'android',
            title: 'Android 插件',
            version: '2.2.0',
          },
          {
            href: '/zh-CN/realtime-media/rtc/reference/downloads',
            title: 'RTC SDK',
          },
        ]}
      />,
    );

    const android = screen.getByRole('article', { name: 'Android 插件' });
    expect(android).toHaveClass('bg-background');
    expect(within(android).getByText('v2.2.0')).toBeVisible();
    expect(
      within(android).getByRole('link', { name: '下载 Android 插件' }),
    ).toHaveAttribute('href', 'https://download.agora.io/example.zip');
    const rtc = screen.getByRole('article', { name: 'RTC SDK' });
    expect(within(rtc).queryByText(/最新版本/)).not.toBeInTheDocument();
    expect(
      within(rtc).getByRole('link', { name: '获取 RTC SDK' }),
    ).not.toHaveAttribute('target');
  });

  it('retains QR codes when a demo has no verified download link', () => {
    render(
      <DownloadResourceCards
        items={[
          {
            platform: 'ios',
            qrAlt: 'KTV iOS 下载二维码',
            qrSrc: 'https://example.com/qr.png',
            title: 'KTV iOS Demo',
          },
        ]}
      />,
    );
    const card = screen.getByRole('article', { name: 'KTV iOS Demo' });
    expect(within(card).getByAltText('KTV iOS 下载二维码')).toHaveAttribute(
      'src',
      'https://example.com/qr.png',
    );
    expect(within(card).queryByRole('link')).not.toBeInTheDocument();
    fireEvent.error(within(card).getByAltText('KTV iOS 下载二维码'));
    expect(
      within(card).getByRole('link', { name: '查看下载二维码' }),
    ).toHaveAttribute('href', 'https://example.com/qr.png');
  });

  it('shows the original demo cover and expands its QR code on demand', () => {
    render(
      <DownloadResourceCards
        items={[
          {
            coverSrc:
              'https://web-cdn.agora.io/docs-portal/img/landing-page/demo/showroom-demo.png',
            description: '体验秀场直播',
            href: 'https://example.com/demo',
            qrSrc:
              'https://web-cdn.agora.io/docs-portal/img/showroom/demo-android-solo.png',
            title: '纯秀场场景',
          },
        ]}
      />,
    );

    const card = screen.getByRole('article', { name: '纯秀场场景' });
    expect(within(card).getByAltText('纯秀场场景 Demo 封面')).toHaveAttribute(
      'src',
      'https://web-cdn.agora.io/docs-portal/img/landing-page/demo/showroom-demo.png',
    );
    expect(within(card).getByAltText('纯秀场场景 Demo 封面')).toHaveAttribute(
      'referrerpolicy',
      'no-referrer',
    );
    expect(within(card).getByText('体验秀场直播')).toBeVisible();
    expect(
      within(card).getByRole('link', { name: 'Demo 体验' }),
    ).toHaveAttribute('href', 'https://example.com/demo');
    const qrToggle = within(card).getByLabelText('查看纯秀场场景二维码');
    fireEvent.click(qrToggle);
    expect(qrToggle.closest('details')).toHaveAttribute('open');
    expect(within(card).getByAltText('纯秀场场景 下载二维码')).toHaveAttribute(
      'src',
      'https://web-cdn.agora.io/docs-portal/img/showroom/demo-android-solo.png',
    );
    expect(within(card).getByAltText('纯秀场场景 下载二维码')).toHaveAttribute(
      'referrerpolicy',
      'no-referrer',
    );
  });

  it('shows QR-only demos and both desktop experience links', () => {
    render(
      <DownloadResourceCards
        items={[
          {
            coverSrc: '/img/landing-page/demo/online-ktv-demo.png',
            qrSrc: '/img/ktv-demo.png',
            title: 'AUIKaraoke',
          },
          {
            coverSrc: '/img/rtc/landing-page/agoralab.jpg',
            demoLinks: [
              { href: 'https://example.com/mac', label: 'macOS Demo 体验' },
              {
                href: 'https://example.com/windows',
                label: 'Windows Demo 体验',
              },
            ],
            title: '桌面端 Demo',
          },
        ]}
      />,
    );

    const karaoke = screen.getByRole('article', { name: 'AUIKaraoke' });
    expect(
      within(karaoke).getByAltText('AUIKaraoke 下载二维码'),
    ).toHaveAttribute('src', '/img/ktv-demo.png');
    expect(within(karaoke).queryByRole('link')).not.toBeInTheDocument();
    const desktop = screen.getByRole('article', { name: '桌面端 Demo' });
    expect(
      within(desktop).getByRole('link', { name: 'macOS Demo 体验' }),
    ).toHaveAttribute('href', 'https://example.com/mac');
    expect(
      within(desktop).getByRole('link', { name: 'Windows Demo 体验' }),
    ).toHaveAttribute('href', 'https://example.com/windows');
  });
});
