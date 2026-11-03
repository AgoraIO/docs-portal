import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SdkDownloadCard } from './SdkDownloadCard';

describe('SDK download actions', () => {
  it.each([undefined, 'https://example.com/sdk.zip'])(
    'keeps one acquisition action without secondary registry links (downloadLink=%s)',
    (downloadLink) => {
      render(
        <SdkDownloadCard
          iconSrc="/icon.svg"
          title="SDK"
          version={{
            id: '1.0.0',
            label: '版本 1.0.0',
            downloadLink,
            packageManager: 'https://www.npmjs.com/package/example',
          }}
        />,
      );
      expect(screen.getAllByRole('link')).toHaveLength(1);
      expect(
        screen.getByRole('link', {
          name: downloadLink ? '下载 SDK' : '获取 SDK',
        }),
      ).toHaveAttribute(
        'href',
        downloadLink ?? 'https://www.npmjs.com/package/example',
      );
      expect(screen.queryByText('包管理器')).not.toBeInTheDocument();
    },
  );
});
