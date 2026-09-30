import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { IntroductionSdkDemoActions } from './IntroductionSdkDemoActions';

describe('IntroductionSdkDemoActions', () => {
  it('renders the approved primary Demo and secondary SDK links', () => {
    render(<IntroductionSdkDemoActions />);

    expect(screen.getByRole('link', { name: /体验 Demo/ })).toHaveAttribute(
      'href',
      '/zh-CN/reference/demo',
    );
    expect(screen.getByRole('link', { name: /下载 SDK/ })).toHaveAttribute(
      'href',
      '/zh-CN/reference/sdks?product=video',
    );
  });
});
