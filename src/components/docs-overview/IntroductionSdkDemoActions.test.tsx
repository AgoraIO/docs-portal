import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { IntroductionSdkDemoActions } from './IntroductionSdkDemoActions';

describe('IntroductionSdkDemoActions', () => {
  it('renders the approved primary Demo and secondary SDK links', () => {
    render(<IntroductionSdkDemoActions />);

    const nav = screen.getByRole('navigation', {
      name: 'SDK 与 Demo 快捷入口',
    });
    const links = within(nav).getAllByRole('link');

    expect(links.map((link) => link.textContent)).toEqual([
      '体验 Demo',
      '下载 SDK',
    ]);
    expect(links[0]).toHaveAttribute('href', '/zh-CN/reference/demo');
    expect(links[0]).toHaveClass('bg-primary', 'rounded-lg');
    expect(links[1]).toHaveAttribute('href', '/zh-CN/reference/sdks');
    expect(links[1]).toHaveClass('border', 'rounded-lg');
    expect(nav).not.toHaveClass('mb-16');
  });
});
