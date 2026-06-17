import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DocsRtcAndroidApiReferenceContentBody } from './DocsRtcAndroidApiReferenceContentBody';

const useRtcAndroidApiReferenceContentMock = vi.fn();

vi.mock('@/lib/source.api-reference.rtc-android.browser', () => ({
  useRtcAndroidApiReferenceContent: (...args: unknown[]) =>
    useRtcAndroidApiReferenceContentMock(...args),
}));

describe('DocsRtcAndroidApiReferenceContentBody', () => {
  beforeEach(() => {
    useRtcAndroidApiReferenceContentMock.mockReset();
  });

  it('wraps rtc android API reference MDX content with the docs body styling hook', () => {
    useRtcAndroidApiReferenceContentMock.mockReturnValueOnce(
      <p>RTC Android</p>,
    );

    const { container } = render(
      <DocsRtcAndroidApiReferenceContentBody contentPath="en/api-reference/rtc/android/overview/index.mdx" />,
    );

    expect(container.querySelector('.docs-body')).toContainElement(
      screen.getByText('RTC Android'),
    );
  });
});
